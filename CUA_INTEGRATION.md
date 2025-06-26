# CUA Integration for SAP Fiori Automator

This document describes the complete integration of C/ua (Computer-Use Agents) into the SAP Fiori Automator project.

## 🚀 Quick Start

### Prerequisites

1. **Python 3.12+** installed on your system
2. **Bun** package manager (already configured)
3. **C/ua API Key** (configured in `.env` file)

### Installation & Setup

1. **Clone and setup the project:**
   ```bash
   git clone <your-repo>
   cd sap-fiori-automator-copilot
   bun install
   ```

2. **Configure environment variables:**
   ```bash
   # Edit .env file with your C/ua API key
   VITE_CUA_API_KEY=your_cua_api_key
   VITE_CUA_BACKEND_URL=http://localhost:8000
   ```

3. **Start all services:**
   ```bash
   ./scripts/start-all.sh
   ```

   Or start them separately:
   ```bash
   # Terminal 1: Start backend
   ./scripts/start-cua-backend.sh
   
   # Terminal 2: Start frontend
   bun run dev
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## 🏗️ Architecture

### Backend (Python FastAPI)

The backend service provides:

- **CUA Agent Management**: Create, monitor, and manage CUA agents
- **Task Execution**: Execute CUA tasks with real-time progress updates
- **Workflow Support**: Run complex workflows combining CUA and API steps
- **WebSocket Integration**: Real-time status updates to frontend
- **Health Monitoring**: Agent and task status monitoring

**Key Files:**
- `backend/main.py` - Main FastAPI application
- `backend/start.py` - Startup script
- `backend/requirements.txt` - Python dependencies

### Frontend (React + TypeScript)

The frontend provides:

- **Dashboard Integration**: CUA status and quick actions
- **Agent Management**: Create and monitor CUA agents
- **Quick Tasks**: Pre-configured SAP automation tasks
- **Real-time Monitoring**: Live status updates via WebSocket
- **Task History**: View and analyze task execution history

**Key Components:**
- `src/services/CuaWorkflowService.ts` - CUA service integration
- `src/components/cua/CuaAgentManager.tsx` - Agent management UI
- `src/components/cua/CuaQuickTasks.tsx` - Quick task execution
- `src/components/cua/CuaStatusMonitor.tsx` - Real-time monitoring

## 🎯 Features

### 1. Quick Tasks

Pre-configured tasks for common SAP operations:

- **SAP Login**: Automated login to SAP Fiori systems
- **Data Entry**: Fill SAP forms with data
- **Report Generation**: Generate and download SAP reports
- **Navigation**: Navigate to specific SAP screens
- **File Operations**: Perform file system operations
- **Browser Automation**: Automate web browser actions

### 2. Custom Tasks

Execute any custom task using natural language:

```
"Open SAP Fiori, login with my credentials, navigate to transaction MM60, 
and fill in the material master data form"
```

### 3. Agent Management

- Create multiple CUA agents
- Monitor agent status (idle/running/error)
- View current tasks being executed
- Agent health monitoring

### 4. Real-time Monitoring

- Live status updates via WebSocket
- Task execution progress
- Agent status changes
- Error reporting and handling

### 5. Workflow Support

Create complex workflows combining:
- CUA automation steps
- API calls
- Conditional logic
- Error handling

## 🔧 Configuration

### Environment Variables

```bash
# C/ua API Configuration
VITE_CUA_API_KEY=your_cua_api_key
VITE_CUA_API_URL=https://api.trycua.com

# Backend Configuration
VITE_CUA_BACKEND_URL=http://localhost:8000

# Agent Configuration
VITE_CUA_AGENT_ID=your_agent_id
VITE_CUA_WORKSPACE_ID=your_workspace_id
```

### Backend Configuration

The backend can be configured in `backend/main.py`:

```python
# Agent configuration
agent = ComputerAgent(
    computer=computer,
    loop=AgentLoop.OPENAI,  # or ANTHROPIC, OMNI, UITARS
    model=LLM(provider=LLMProvider.OPENAI),
    save_trajectory=True,
    only_n_most_recent_images=3,
    verbosity=logging.INFO
)
```

## 📊 Usage Examples

### 1. SAP Login Automation

```typescript
// Execute SAP login task
const taskId = await cuaWorkflowService.executeQuickTask('sap-login', {
  sapUrl: 'https://your-sap-system.com',
  username: 'your_username'
});
```

### 2. Data Entry Task

```typescript
// Execute data entry task
const taskId = await cuaWorkflowService.executeQuickTask('sap-data-entry', {
  transaction: 'MM60',
  formData: {
    material: 'MAT001',
    plant: '1000',
    storageLocation: '0001'
  }
});
```

### 3. Custom Task

```typescript
// Execute custom task
const taskId = await cuaWorkflowService.executeTask(
  "Open Chrome, navigate to SAP Fiori, login, and create a new purchase order"
);
```

### 4. Workflow Execution

```typescript
// Execute complex workflow
const workflow: Workflow = {
  name: "SAP Purchase Order Process",
  steps: [
    {
      type: "cua",
      task: "Login to SAP Fiori system"
    },
    {
      type: "cua", 
      task: "Navigate to purchase order creation"
    },
    {
      type: "cua",
      task: "Fill purchase order form with provided data"
    },
    {
      type: "api",
      endpoint: "/api/sap/submit-order",
      data: { orderData: "..." }
    }
  ]
};

const result = await cuaWorkflowService.executeWorkflow(workflow);
```

## 🔍 Monitoring & Debugging

### Backend Logs

Monitor backend logs for debugging:

```bash
# View backend logs
tail -f backend/logs/cua-backend.log

# Start backend with debug logging
cd backend
python -m uvicorn main:app --reload --log-level debug
```

### Frontend Debugging

Enable debug logging in browser console:

```typescript
// Enable debug mode
localStorage.setItem('cua-debug', 'true');
```

### Health Checks

Check service health:

```bash
# Backend health
curl http://localhost:8000/health

# Frontend health (if implemented)
curl http://localhost:3000/api/health
```

## 🚨 Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   - Check if Python 3.12+ is installed
   - Verify virtual environment is activated
   - Check if port 8000 is available

2. **CUA Agent Creation Failed**
   - Verify CUA API key is correct
   - Check network connectivity to CUA API
   - Ensure sufficient system resources

3. **Task Execution Failed**
   - Check agent status
   - Verify task description is clear
   - Review error logs for specific issues

4. **WebSocket Connection Issues**
   - Check if backend is running
   - Verify CORS configuration
   - Check browser console for errors

### Debug Commands

```bash
# Check Python version
python3 --version

# Check installed packages
pip list | grep cua

# Test CUA installation
python3 -c "import cua; print('CUA installed successfully')"

# Check backend status
curl -s http://localhost:8000/health | jq

# Monitor WebSocket connection
websocat ws://localhost:8000/ws
```

## 🔒 Security Considerations

1. **API Key Management**
   - Store API keys in environment variables
   - Never commit API keys to version control
   - Use different keys for development/production

2. **Network Security**
   - Use HTTPS in production
   - Implement proper CORS policies
   - Consider VPN for enterprise deployments

3. **Access Control**
   - Implement user authentication
   - Role-based access control
   - Audit logging for all operations

## 📈 Performance Optimization

1. **Agent Pooling**
   - Reuse agents for multiple tasks
   - Implement agent lifecycle management
   - Monitor agent resource usage

2. **Task Optimization**
   - Batch similar tasks
   - Implement task queuing
   - Use appropriate task timeouts

3. **Monitoring**
   - Track task execution times
   - Monitor success rates
   - Alert on failures

## 🔄 Updates & Maintenance

### Updating CUA Dependencies

```bash
# Update CUA packages
cd backend
source venv/bin/activate
pip install --upgrade cua-computer[all] cua-agent[all]
```

### Backing Up Configuration

```bash
# Backup environment configuration
cp .env .env.backup

# Backup backend configuration
cp backend/main.py backend/main.py.backup
```

## 📞 Support

For issues and questions:

1. Check the troubleshooting section above
2. Review CUA documentation: https://github.com/trycua/cua
3. Check application logs for error details
4. Contact the development team

## 🎉 What's Next?

Future enhancements planned:

- [ ] Advanced workflow designer
- [ ] Task scheduling and automation
- [ ] Integration with more SAP modules
- [ ] Machine learning for task optimization
- [ ] Enterprise deployment support
- [ ] Mobile application support 