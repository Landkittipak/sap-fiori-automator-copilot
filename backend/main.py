from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import asyncio
import logging
import os
from dotenv import load_dotenv
import json
from datetime import datetime

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="SAP Fiori Automator CUA Backend", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class CuaTask(BaseModel):
    task: str
    agent_id: Optional[str] = None
    parameters: Optional[Dict[str, Any]] = None

class WorkflowStep(BaseModel):
    type: str  # "cua" or "api"
    task: Optional[str] = None
    agent_id: Optional[str] = None
    endpoint: Optional[str] = None
    data: Optional[Dict[str, Any]] = None

class Workflow(BaseModel):
    name: str
    description: Optional[str] = None
    steps: List[WorkflowStep]

class TaskResult(BaseModel):
    task_id: str
    status: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    timestamp: datetime

# Global state
active_agents: Dict[str, Any] = {}
active_tasks: Dict[str, Dict[str, Any]] = {}
websocket_connections: List[WebSocket] = []

# CUA Service class
class CuaService:
    def __init__(self):
        self.agents = {}
        self.task_queue = asyncio.Queue()
        
    async def create_agent(self, agent_type: str = "macos", agent_id: str = None):
        """Create a CUA agent"""
        try:
            # Import CUA modules
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
            
            logger.info(f"Created CUA agent: {agent_id}")
            return agent_id
            
        except Exception as e:
            logger.error(f"Error creating CUA agent: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to create agent: {str(e)}")
    
    async def execute_task(self, task: str, agent_id: str = None) -> str:
        """Execute a CUA task"""
        try:
            # Get or create agent
            if not agent_id or agent_id not in self.agents:
                agent_id = await self.create_agent()
            
            agent_info = self.agents[agent_id]
            agent = agent_info["agent"]
            
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
            asyncio.create_task(self._execute_task_async(task_id, agent, task))
            
            return task_id
            
        except Exception as e:
            logger.error(f"Error executing task: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to execute task: {str(e)}")
    
    async def _execute_task_async(self, task_id: str, agent: Any, task: str):
        """Execute task asynchronously"""
        try:
            results = []
            async for result in agent.run(task):
                results.append(result)
                # Send progress update via WebSocket
                await self._broadcast_status_update({
                    "type": "task_progress",
                    "task_id": task_id,
                    "result": result
                })
            
            # Update task status
            active_tasks[task_id]["status"] = "completed"
            active_tasks[task_id]["result"] = results
            active_tasks[task_id]["end_time"] = datetime.now()
            
            # Update agent status
            agent_id = active_tasks[task_id]["agent_id"]
            if agent_id in self.agents:
                self.agents[agent_id]["status"] = "idle"
                self.agents[agent_id]["current_task"] = None
            
            # Send completion update
            await self._broadcast_status_update({
                "type": "task_completed",
                "task_id": task_id,
                "result": results
            })
            
        except Exception as e:
            logger.error(f"Error in task execution: {e}")
            active_tasks[task_id]["status"] = "failed"
            active_tasks[task_id]["error"] = str(e)
            active_tasks[task_id]["end_time"] = datetime.now()
            
            # Update agent status
            agent_id = active_tasks[task_id]["agent_id"]
            if agent_id in self.agents:
                self.agents[agent_id]["status"] = "idle"
                self.agents[agent_id]["current_task"] = None
            
            # Send error update
            await self._broadcast_status_update({
                "type": "task_error",
                "task_id": task_id,
                "error": str(e)
            })
    
    async def _broadcast_status_update(self, message: Dict[str, Any]):
        """Broadcast status update to all WebSocket connections"""
        if websocket_connections:
            message_str = json.dumps(message, default=str)
            await asyncio.gather(
                *[ws.send_text(message_str) for ws in websocket_connections],
                return_exceptions=True
            )

# Initialize CUA service
cua_service = CuaService()

# API Routes
@app.get("/")
async def root():
    return {"message": "SAP Fiori Automator CUA Backend", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "agents": len(cua_service.agents), "active_tasks": len(active_tasks)}

@app.post("/agents/create")
async def create_agent(agent_type: str = "macos"):
    """Create a new CUA agent"""
    agent_id = await cua_service.create_agent(agent_type)
    return {"agent_id": agent_id, "status": "created"}

@app.get("/agents")
async def list_agents():
    """List all agents and their status"""
    agents_info = []
    for agent_id, agent_info in cua_service.agents.items():
        agents_info.append({
            "id": agent_id,
            "status": agent_info["status"],
            "current_task": agent_info["current_task"],
            "created_at": agent_info["created_at"]
        })
    return {"agents": agents_info}

@app.post("/tasks/execute")
async def execute_task(task_data: CuaTask):
    """Execute a CUA task"""
    task_id = await cua_service.execute_task(task_data.task, task_data.agent_id)
    return {"task_id": task_id, "status": "started"}

@app.get("/tasks/{task_id}")
async def get_task_status(task_id: str):
    """Get task status and result"""
    if task_id not in active_tasks:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task_info = active_tasks[task_id]
    return {
        "task_id": task_id,
        "task": task_info["task"],
        "status": task_info["status"],
        "result": task_info["result"],
        "error": task_info["error"],
        "start_time": task_info["start_time"],
        "end_time": task_info.get("end_time")
    }

@app.get("/tasks")
async def list_tasks():
    """List all tasks"""
    tasks_info = []
    for task_id, task_info in active_tasks.items():
        tasks_info.append({
            "task_id": task_id,
            "task": task_info["task"],
            "status": task_info["status"],
            "start_time": task_info["start_time"],
            "end_time": task_info.get("end_time")
        })
    return {"tasks": tasks_info}

@app.post("/workflows/execute")
async def execute_workflow(workflow: Workflow):
    """Execute a workflow with CUA steps"""
    workflow_id = f"workflow-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    workflow_results = []
    
    for i, step in enumerate(workflow.steps):
        if step.type == "cua":
            # Execute CUA step
            task_id = await cua_service.execute_task(step.task, step.agent_id)
            workflow_results.append({
                "step": i + 1,
                "type": "cua",
                "task_id": task_id,
                "status": "started"
            })
        elif step.type == "api":
            # Handle API step (placeholder for now)
            workflow_results.append({
                "step": i + 1,
                "type": "api",
                "endpoint": step.endpoint,
                "status": "pending"
            })
    
    return {
        "workflow_id": workflow_id,
        "name": workflow.name,
        "steps": workflow_results,
        "status": "started"
    }

# WebSocket endpoint for real-time updates
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    websocket_connections.append(websocket)
    
    try:
        # Send initial status
        await websocket.send_text(json.dumps({
            "type": "status_update",
            "agents": len(cua_service.agents),
            "active_tasks": len(active_tasks)
        }))
        
        # Keep connection alive
        while True:
            await websocket.receive_text()
            
    except WebSocketDisconnect:
        websocket_connections.remove(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        if websocket in websocket_connections:
            websocket_connections.remove(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 