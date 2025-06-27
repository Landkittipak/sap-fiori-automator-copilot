#!/usr/bin/env python3
"""
SAP Fiori Automator Backend
Comprehensive integration with C/ua agents supporting both HTTP API and SDK approaches
"""

import asyncio
import json
import os
import uuid
import logging
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict

from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import httpx
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
print("DEBUG: OPENAI_API_KEY:", os.getenv("OPENAI_API_KEY"))

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Environment variables
CUA_API_KEY = os.getenv("CUA_API_KEY", "")
CUA_BASE_URL = os.getenv("CUA_BASE_URL", "https://api.trycua.com/v1")
SAP_FIORI_URL = os.getenv("SAP_FIORI_URL", "http://localhost:8080")

app = FastAPI(title="SAP Fiori Automator Backend", version="2.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class WorkflowStep(BaseModel):
    id: str
    step_type: str
    step_order: int
    config: Dict[str, Any]

class AutomationRequest(BaseModel):
    workflow_steps: List[WorkflowStep]
    template_inputs: Dict[str, str] = {}
    sap_fiori_url: Optional[str] = None

class ExecutionStatus(BaseModel):
    run_id: str
    status: str  # "queued", "running", "completed", "failed", "cancelled"
    current_step: Optional[int] = None
    total_steps: int
    results: Dict[str, Any] = {}
    error: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None

class CuaTask(BaseModel):
    task: str
    agent_id: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None

class TaskResult(BaseModel):
    task_id: str
    status: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: datetime

# Global state
executions: Dict[str, ExecutionStatus] = {}
active_agents: Dict[str, Any] = {}
active_tasks: Dict[str, Dict[str, Any]] = {}
websocket_connections: List[WebSocket] = []

@dataclass
class CuaAgent:
    """Represents a CUA agent for browser automation"""
    agent_id: str
    status: str
    browser_type: str = "chrome"

class CuaAutomationService:
    """Service for HTTP API-based CUA integration"""
    
    def __init__(self):
        self.api_key = CUA_API_KEY
        self.base_url = CUA_BASE_URL
        
    async def create_agent(self) -> str:
        """Create a new CUA agent in the cloud via HTTP API"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/agents",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "browser": "chrome",
                    "viewport": {"width": 1920, "height": 1080},
                    "timeout": 30000
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail=f"Failed to create CUA agent: {response.text}")
                
            data = response.json()
            return data["agent_id"]
    
    async def execute_browser_action(self, agent_id: str, action: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a browser action on the CUA agent via HTTP API"""
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/agents/{agent_id}/actions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json=action
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail=f"Action failed: {response.text}")
                
            return response.json()
    
    async def get_agent_screenshot(self, agent_id: str) -> Dict[str, Any]:
        """Get a screenshot from the CUA agent"""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/agents/{agent_id}/screenshot",
                headers={"Authorization": f"Bearer {self.api_key}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail="Failed to get screenshot")
                
            return response.json()
    
    async def destroy_agent(self, agent_id: str):
        """Destroy the CUA agent"""
        async with httpx.AsyncClient() as client:
            await client.delete(
                f"{self.base_url}/agents/{agent_id}",
                headers={"Authorization": f"Bearer {self.api_key}"}
            )

class CuaSDKService:
    """Service for SDK-based CUA integration"""
    
    def __init__(self):
        self.agents = {}
        self.task_queue = asyncio.Queue()
        
    async def create_agent(self, agent_type: str = "macos", agent_id: str = None):
        """Create a CUA agent using SDK, fallback to HTTP API if SDK unavailable"""
        try:
            try:
                from computer import Computer
                from agent import ComputerAgent, AgentLoop, LLMProvider, LLM
                # Create computer instance
                computer = Computer(os_type=agent_type)
                # Create agent
                agent = ComputerAgent(
                    computer=computer,
                    loop=AgentLoop.OPENAI,
                    model=LLM(provider=LLMProvider.OPENAI),
                    save_trajectory=True,
                    only_n_most_recent_images=3,
                    verbosity=logging.INFO
                )
                agent_id = agent_id or f"{agent_type}-{len(self.agents)}"
                self.agents[agent_id] = {
                    "agent": agent,
                    "computer": computer,
                    "status": "idle",
                    "current_task": None,
                    "created_at": datetime.now()
                }
                logger.info(f"Created CUA SDK agent: {agent_id}")
                return agent_id
            except ImportError:
                logger.warning("CUA SDK not available, falling back to HTTP API")
                http_service = CuaAutomationService()
                return await http_service.create_agent()
        except Exception as e:
            logger.error(f"Error creating CUA agent: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to create agent: {str(e)}")
    
    async def execute_task(self, task: str, agent_id: str = None) -> str:
        """Execute a CUA task using SDK"""
        try:
            # Get or create agent
            if not agent_id or agent_id not in self.agents:
                agent_id = await self.create_agent()
            agent_info = self.agents[agent_id]
            computer = agent_info["computer"]
            
            # Generate task ID
            task_id = f"task-{datetime.now().strftime('%Y%m%d-%H%M%S')}-{len(active_tasks)}"
            
            # Update agent status
            agent_info["status"] = "running"
            agent_info["current_task"] = task
            
            # Store task info
            active_tasks[task_id] = {
                "task": task,
                "agent_id": agent_id,
                "status": "running",
                "start_time": datetime.now(),
                "result": None,
                "error": None
            }
            
            # Execute task asynchronously
            asyncio.create_task(self._execute_task_async(task_id, computer, task))
            
            return task_id
            
        except Exception as e:
            logger.error(f"Error executing task: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to execute task: {str(e)}")
    
    async def _execute_task_async(self, task_id: str, agent: Any, task: str):
        """Execute task asynchronously"""
        try:
            result = await agent.execute(task)
            
            # Update task status
            active_tasks[task_id]["status"] = "completed"
            active_tasks[task_id]["result"] = result
            active_tasks[task_id]["end_time"] = datetime.now()
            
            # Update agent status
            agent_info = next((info for info in self.agents.values() if info["agent"] == agent), None)
            if agent_info:
                agent_info["status"] = "idle"
                agent_info["current_task"] = None
            
            # Notify WebSocket clients
            await self._notify_websocket_clients(task_id, "completed", result)
            
        except Exception as e:
            logger.error(f"Task execution failed: {e}")
            active_tasks[task_id]["status"] = "failed"
            active_tasks[task_id]["error"] = str(e)
            active_tasks[task_id]["end_time"] = datetime.now()
            
            # Notify WebSocket clients
            await self._notify_websocket_clients(task_id, "failed", None, str(e))
    
    async def _notify_websocket_clients(self, task_id: str, status: str, result: Any = None, error: str = None):
        """Notify all connected WebSocket clients"""
        message = {
            "type": "task_update",
            "task_id": task_id,
            "status": status,
            "result": result,
            "error": error,
            "timestamp": datetime.now().isoformat()
        }
        
        disconnected_clients = []
        for websocket in websocket_connections:
            try:
                await websocket.send_text(json.dumps(message))
            except:
                disconnected_clients.append(websocket)
        
        # Remove disconnected clients
        for websocket in disconnected_clients:
            websocket_connections.remove(websocket)

class WorkflowExecutor:
    """Executes workflows using CUA agents (HTTP API approach)"""
    
    def __init__(self):
        self.cua_service = CuaAutomationService()
        self.cua_sdk_service = CuaSDKService()
    
    async def execute_workflow(self, run_id: str, request: AutomationRequest):
        """Execute a complete workflow"""
        execution = executions[run_id]
        agent_id = None
        
        try:
            # Create CUA agent
            agent_id = await self.cua_service.create_agent()
            execution.results["agent_id"] = agent_id
            
            # Navigate to SAP Fiori
            sap_url = request.sap_fiori_url or SAP_FIORI_URL
            await self._navigate_to_sap(agent_id, sap_url)
            
            # Execute each workflow step
            for i, step in enumerate(request.workflow_steps):
                execution.current_step = i + 1
                execution.status = "running"
                
                step_result = await self._execute_step(agent_id, step, request.template_inputs)
                execution.results[f"step_{i+1}"] = step_result
                
                # Notify WebSocket clients of progress
                await self._notify_workflow_progress(run_id, execution)
                
            execution.status = "completed"
            execution.completed_at = datetime.now()
            
        except Exception as e:
            execution.status = "failed"
            execution.error = str(e)
            execution.completed_at = datetime.now()
            
        finally:
            # Clean up agent
            if agent_id:
                try:
                    await self.cua_service.destroy_agent(agent_id)
                except:
                    pass  # Best effort cleanup
            
            # Final WebSocket notification
            await self._notify_workflow_progress(run_id, execution)
    
    async def _notify_workflow_progress(self, run_id: str, execution: ExecutionStatus):
        """Notify WebSocket clients of workflow progress"""
        message = {
            "type": "workflow_update",
            "run_id": run_id,
            "status": execution.status,
            "current_step": execution.current_step,
            "total_steps": execution.total_steps,
            "results": execution.results,
            "error": execution.error,
            "timestamp": datetime.now().isoformat()
        }
        
        disconnected_clients = []
        for websocket in websocket_connections:
            try:
                await websocket.send_text(json.dumps(message))
            except:
                disconnected_clients.append(websocket)
        
        # Remove disconnected clients
        for websocket in disconnected_clients:
            websocket_connections.remove(websocket)
    
    async def _navigate_to_sap(self, agent_id: str, sap_url: str):
        """Navigate to SAP Fiori URL"""
        action = {
            "type": "navigate",
            "url": sap_url
        }
        await self.cua_service.execute_browser_action(agent_id, action)
        
        # Wait for page to load
        await asyncio.sleep(3)
    
    async def _execute_step(self, agent_id: str, step: WorkflowStep, template_inputs: Dict[str, str]) -> Dict[str, Any]:
        """Execute a single workflow step"""
        config = step.config
        
        if step.step_type == "action":
            return await self._execute_action_step(agent_id, config, template_inputs)
        elif step.step_type == "validation":
            return await self._execute_validation_step(agent_id, config)
        elif step.step_type == "screenshot":
            return await self._execute_screenshot_step(agent_id)
        elif step.step_type == "delay":
            return await self._execute_delay_step(config)
        elif step.step_type == "cua_automation":
            return await self._execute_cua_automation_step(agent_id, config, template_inputs)
        else:
            raise ValueError(f"Unknown step type: {step.step_type}")
    
    async def _execute_action_step(self, agent_id: str, config: Dict[str, Any], template_inputs: Dict[str, str]) -> Dict[str, Any]:
        """Execute a browser action (click, type, etc.)"""
        action_type = config.get("action", "click")
        selector = config.get("selector", "")
        value = config.get("value", "")
        
        # Replace template variables
        value = self._replace_template_variables(value, template_inputs)
        
        if action_type == "click":
            action = {
                "type": "click",
                "selector": selector
            }
        elif action_type == "type":
            action = {
                "type": "type",
                "selector": selector,
                "text": value
            }
        elif action_type == "select":
            action = {
                "type": "select",
                "selector": selector,
                "value": value
            }
        elif action_type == "wait":
            await asyncio.sleep(float(value) if value else 1.0)
            return {"action": "wait", "duration": value}
        else:
            raise ValueError(f"Unknown action type: {action_type}")
        
        result = await self.cua_service.execute_browser_action(agent_id, action)
        return {"action": action_type, "selector": selector, "result": result}
    
    async def _execute_validation_step(self, agent_id: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a validation step"""
        selector = config.get("selector", "")
        validation_rule = config.get("validation", {}).get("rule", "toBeVisible")
        
        action = {
            "type": "wait_for_element",
            "selector": selector,
            "condition": validation_rule
        }
        
        result = await self.cua_service.execute_browser_action(agent_id, action)
        return {"validation": validation_rule, "selector": selector, "result": result}
    
    async def _execute_screenshot_step(self, agent_id: str) -> Dict[str, Any]:
        """Take a screenshot"""
        result = await self.cua_service.get_agent_screenshot(agent_id)
        return {"screenshot": result}
    
    async def _execute_delay_step(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a delay/wait step"""
        duration = float(config.get("duration", "1000")) / 1000.0  # Convert ms to seconds
        await asyncio.sleep(duration)
        return {"delay": duration}
    
    async def _execute_cua_automation_step(self, agent_id: str, config: Dict[str, Any], template_inputs: Dict[str, str]) -> Dict[str, Any]:
        """Execute a predefined CUA automation"""
        automation_id = config.get("automationId", "")
        inputs = config.get("inputs", {})
        
        # Replace template variables in inputs
        processed_inputs = {}
        for key, value in inputs.items():
            processed_inputs[key] = self._replace_template_variables(str(value), template_inputs)
        
        # This would integrate with CUA's automation library
        # For now, we'll simulate with a complex action sequence
        action = {
            "type": "automation",
            "automation_id": automation_id,
            "inputs": processed_inputs
        }
        
        result = await self.cua_service.execute_browser_action(agent_id, action)
        return {"automation": automation_id, "inputs": processed_inputs, "result": result}
    
    def _replace_template_variables(self, text: str, template_inputs: Dict[str, str]) -> str:
        """Replace template variables like {variable_name} with actual values"""
        for key, value in template_inputs.items():
            text = text.replace(f"{{{key}}}", value)
        return text

# Initialize services
workflow_executor = WorkflowExecutor()
cua_sdk_service = CuaSDKService()

# HTTP API endpoints
@app.get("/")
async def root():
    return {"message": "SAP Fiori Automator Backend", "status": "running", "version": "2.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

@app.post("/execute")
async def execute_workflow(request: AutomationRequest, background_tasks: BackgroundTasks):
    """Start workflow execution using HTTP API approach"""
    if not CUA_API_KEY:
        raise HTTPException(status_code=500, detail="CUA_API_KEY not configured")
    
    run_id = str(uuid.uuid4())
    
    execution = ExecutionStatus(
        run_id=run_id,
        status="queued",
        total_steps=len(request.workflow_steps),
        results={},
        started_at=datetime.now()
    )
    
    executions[run_id] = execution
    
    # Start execution in background
    background_tasks.add_task(workflow_executor.execute_workflow, run_id, request)
    
    return {"run_id": run_id, "status": "queued"}

@app.get("/status/{run_id}")
async def get_execution_status(run_id: str):
    """Get execution status"""
    if run_id not in executions:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    execution = executions[run_id]
    return asdict(execution)

@app.get("/executions")
async def list_executions():
    """List all executions"""
    return [asdict(execution) for execution in executions.values()]

@app.delete("/executions/{run_id}")
async def cancel_execution(run_id: str):
    """Cancel an execution"""
    if run_id not in executions:
        raise HTTPException(status_code=404, detail="Execution not found")
    
    execution = executions[run_id]
    if execution.status == "running":
        execution.status = "cancelled"
        execution.completed_at = datetime.now()
    
    return {"message": "Execution cancelled"}

@app.post("/test-connection")
async def test_cua_connection():
    """Test connection to CUA API"""
    try:
        service = CuaAutomationService()
        agent_id = await service.create_agent()
        await service.destroy_agent(agent_id)
        return {"status": "success", "message": "CUA connection successful"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# SDK-based endpoints
@app.post("/cua/task")
async def execute_cua_task(task: CuaTask):
    """Execute a CUA task using SDK approach"""
    try:
        task_id = await cua_sdk_service.execute_task(task.task, task.agent_id)
        return {"task_id": task_id, "status": "queued"}
    except Exception as e:
        logger.error(f"Error executing CUA task: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cua/task/{task_id}")
async def get_task_status(task_id: str):
    """Get CUA task status"""
    if task_id not in active_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task_info = active_tasks[task_id]
    return TaskResult(
        task_id=task_id,
        status=task_info["status"],
        result=task_info.get("result"),
        error=task_info.get("error"),
        timestamp=task_info["start_time"]
    )

@app.get("/cua/agents")
async def list_agents():
    """List active CUA agents"""
    agents_info = {}
    for agent_id, info in cua_sdk_service.agents.items():
        agents_info[agent_id] = {
            "status": info["status"],
            "current_task": info["current_task"],
            "created_at": info["created_at"].isoformat()
        }
    return {"agents": agents_info}

# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time updates"""
    await websocket.accept()
    websocket_connections.append(websocket)
    
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "ping":
                await websocket.send_text(json.dumps({"type": "pong"}))
            elif message.get("type") == "subscribe":
                # Client wants to subscribe to specific updates
                await websocket.send_text(json.dumps({
                    "type": "subscribed",
                    "message": "Connected to real-time updates"
                }))
                
    except WebSocketDisconnect:
        websocket_connections.remove(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        if websocket in websocket_connections:
            websocket_connections.remove(websocket)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
