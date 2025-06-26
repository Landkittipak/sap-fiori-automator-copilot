#!/usr/bin/env python3
"""
SAP Fiori Automator Backend
Integrates with C/ua agents for real browser automation
"""

import asyncio
import json
import os
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
import uvicorn

# Environment variables
CUA_API_KEY = os.getenv("CUA_API_KEY", "")
CUA_BASE_URL = os.getenv("CUA_BASE_URL", "https://api.trycua.com/v1")
SAP_FIORI_URL = os.getenv("SAP_FIORI_URL", "http://localhost:8080")

app = FastAPI(title="SAP Fiori Automator Backend", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
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
    status: str  # "running", "completed", "failed"
    current_step: Optional[int] = None
    total_steps: int
    results: Dict[str, Any] = {}
    error: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None

# In-memory storage (in production, use a proper database)
executions: Dict[str, ExecutionStatus] = {}

@dataclass
class CuaAgent:
    """Represents a CUA agent for browser automation"""
    agent_id: str
    status: str
    browser_type: str = "chrome"
    
class CuaAutomationService:
    """Service for interacting with CUA agents"""
    
    def __init__(self):
        self.api_key = CUA_API_KEY
        self.base_url = CUA_BASE_URL
        
    async def create_agent(self) -> str:
        """Create a new CUA agent in the cloud"""
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
        """Execute a browser action on the CUA agent"""
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

class WorkflowExecutor:
    """Executes workflows using CUA agents"""
    
    def __init__(self):
        self.cua_service = CuaAutomationService()
    
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

# API endpoints
@app.get("/")
async def root():
    return {"message": "SAP Fiori Automator Backend", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

@app.post("/execute")
async def execute_workflow(request: AutomationRequest, background_tasks: BackgroundTasks):
    """Start workflow execution"""
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

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)