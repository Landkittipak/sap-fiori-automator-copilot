# SAP Fiori Automator - Complete Setup Guide

## 🎯 Overview

This guide will help you set up a complete SAP Fiori automation system that actually moves cursors and controls browsers using CUA (C/ua) agents.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │────│  Python Backend │────│  CUA Cloud VM   │
│   (localhost)    │    │  (FastAPI)      │    │  (Browser Bot)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                  │
                         ┌─────────────────┐
                         │   SAP Fiori     │
                         │  (via ngrok)    │
                         └─────────────────┘
```

## 📋 Prerequisites

1. **Node.js** (18+) or **Bun**
2. **Python** (3.8+)
3. **CUA Account** and API Key
4. **ngrok** (for exposing local SAP Fiori)
5. **SAP Fiori** system (local or remote)

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Make scripts executable
chmod +x scripts/*.sh

# Run the master setup script
./scripts/start-automation.sh
```

This script will:
- Check dependencies
- Start the Python backend
- Start the React frontend  
- Optionally expose SAP Fiori via ngrok
- Guide you through configuration

### Option 2: Manual Setup

#### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your CUA API key
```

#### 2. Frontend Setup

```bash
# Install dependencies
npm install  # or: bun install

# Start development server
npm run dev  # or: bun dev
```

#### 3. CUA Configuration

Edit `backend/.env`:
```bash
CUA_API_KEY=your_cua_api_key_here
CUA_BASE_URL=https://api.trycua.com/v1
SAP_FIORI_URL=http://localhost:8080
```

#### 4. Expose SAP Fiori (if local)

```bash
# Install ngrok (if not already installed)
# Visit: https://ngrok.com/

# Expose your local SAP Fiori
ngrok http 8080

# Copy the public URL (e.g., https://abc123.ngrok.io)
# Use this URL in your workflow configurations
```

## 🔧 Configuration

### 1. CUA API Key

1. Sign up at [C/ua](https://trycua.com/)
2. Get your API key from the dashboard
3. Add it to `backend/.env`:
   ```
   CUA_API_KEY=your_actual_api_key_here
   ```

### 2. SAP Fiori Access

**For Local SAP Fiori:**
- Use ngrok to expose it: `ngrok http 8080`
- Use the public URL in workflows: `https://abc123.ngrok.io`

**For Remote SAP Fiori:**
- Use the direct URL: `https://your-sap-server.com`
- Ensure it's accessible from the internet

### 3. Backend Configuration

The backend runs on `http://localhost:8000` by default.

Key endpoints:
- `GET /health` - Health check
- `POST /execute` - Start workflow execution
- `GET /status/{run_id}` - Get execution status
- `POST /test-connection` - Test CUA connection

## 🎮 Using the System

### 1. Test Connection

1. Open the frontend at `http://localhost:5173`
2. Navigate to the CUA test section
3. Click "Test CUA Connection" to verify setup

### 2. Create a Workflow

1. Go to "Workflow Builder"
2. Add workflow steps:
   - **Action**: Click, type, select elements
   - **Validation**: Check if elements exist
   - **Screenshot**: Capture current state
   - **CUA Automation**: Use predefined automations

### 3. Execute Workflow

1. Configure SAP Fiori URL (use ngrok URL if local)
2. Set template variables
3. Click "Execute Workflow"
4. Monitor real-time progress

### 4. Monitor Execution

The live monitor shows:
- Current step progress
- CUA agent status
- Browser screenshots (optional)
- Step-by-step results
- Any errors or failures

## 🔍 Troubleshooting

### Backend Won't Start

```bash
# Check Python version
python3 --version

# Recreate virtual environment
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### CUA Connection Failed

1. **Check API Key**: Verify in `backend/.env`
2. **Check Internet**: CUA needs internet access
3. **Check Quota**: Ensure you have CUA credits

### SAP Fiori Not Accessible

1. **Local SAP**: Use ngrok to expose it
2. **Remote SAP**: Check if it's publicly accessible
3. **CORS Issues**: Configure SAP server for cross-origin requests

### Workflow Execution Fails

1. **Check Selectors**: Ensure CSS selectors are correct
2. **Check Timing**: Add delays for slow-loading elements
3. **Check URL**: Verify SAP Fiori URL is accessible

## 📊 Example Workflows

### Simple Login Flow

```json
[
  {
    "step_type": "action",
    "config": {
      "action": "type",
      "selector": "input[name='username']",
      "value": "{username}"
    }
  },
  {
    "step_type": "action", 
    "config": {
      "action": "type",
      "selector": "input[name='password']",
      "value": "{password}"
    }
  },
  {
    "step_type": "action",
    "config": {
      "action": "click",
      "selector": "button[type='submit']"
    }
  }
]
```

### Data Entry Flow

```json
[
  {
    "step_type": "action",
    "config": {
      "action": "click",
      "selector": ".create-new-button"
    }
  },
  {
    "step_type": "validation",
    "config": {
      "selector": ".form-container",
      "validation": { "rule": "toBeVisible" }
    }
  },
  {
    "step_type": "action",
    "config": {
      "action": "type",
      "selector": "#customer-name",
      "value": "{customerName}"
    }
  },
  {
    "step_type": "action",
    "config": {
      "action": "select",
      "selector": "#country-dropdown",
      "value": "{country}"
    }
  },
  {
    "step_type": "action",
    "config": {
      "action": "click",
      "selector": ".save-button"
    }
  },
  {
    "step_type": "screenshot",
    "config": {
      "description": "Final result"
    }
  }
]
```

## 🔒 Security Considerations

1. **API Keys**: Keep CUA API keys secure
2. **Local Exposure**: Only expose SAP Fiori temporarily
3. **Network**: Use VPN for production SAP systems
4. **Authentication**: Don't hardcode credentials

## 📈 Performance Tips

1. **Minimize Steps**: Combine actions where possible
2. **Add Delays**: For slow-loading pages
3. **Use Validations**: Ensure elements exist before actions
4. **Error Handling**: Plan for failures

## 🆘 Support

If you encounter issues:

1. **Check Logs**: Backend logs show detailed errors
2. **Test Connection**: Use the built-in connection test
3. **Verify Setup**: Ensure all components are running
4. **Check Documentation**: CUA and SAP Fiori docs

## 🔄 Updates and Maintenance

- **Keep Dependencies Updated**: Regularly update Python packages
- **Monitor CUA Usage**: Track your API quota
- **Backup Workflows**: Export important automation templates
- **Test Regularly**: Verify automations still work after updates

---

🎉 **You're now ready to automate SAP Fiori with real browser control!**