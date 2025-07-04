# SAP Fiori Automator Copilot

A comprehensive automation platform for SAP Fiori systems with integrated C/ua (Computer-Use Agents) for intelligent desktop automation.

## 🚀 Features

- **SAP Fiori Automation**: Automated login, navigation, and data entry
- **C/ua Integration**: AI-powered desktop automation agents
- **Real-time Monitoring**: Live status updates and progress tracking
- **Quick Tasks**: Pre-configured automation templates
- **Custom Workflows**: Build complex automation sequences
- **Agent Management**: Create and monitor multiple CUA agents
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS

## 🎯 Quick Start

### Prerequisites

- **Node.js 18+** and **Bun** package manager
- **Python 3.12+** for CUA backend
- **C/ua API Key** (get one at [trycua.com](https://trycua.com))

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd sap-fiori-automator-copilot
   ```

2. **Install dependencies:**
   ```bash
   bun run setup
   ```

3. **Configure environment:**
```bash
   # Edit .env file with your C/ua API key
   cp .env.example .env
   # Add your VITE_CUA_API_KEY
   ```

4. **Start all services:**
```bash
   bun run start:all
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## 🏗️ Architecture

### Frontend (React + TypeScript)
- Modern UI with shadcn/ui components
- Real-time WebSocket updates
- Responsive design for all devices
- TypeScript for type safety

### Backend (Python FastAPI)
- CUA agent management
- Task execution and monitoring
- WebSocket support for real-time updates
- RESTful API with automatic documentation

### C/ua Integration
- AI-powered desktop automation
- Natural language task execution
- Multi-agent support
- Real-time progress tracking

## 📊 Usage Examples

### Quick Tasks
Execute common SAP operations with one click:
- SAP Login automation
- Data entry and form filling
- Report generation and download
- Navigation to specific screens

### Custom Tasks
Use natural language to describe automation tasks:
```
"Open SAP Fiori, login with my credentials, navigate to transaction MM60, 
and fill in the material master data form"
```

### Workflow Builder
Create complex automation sequences:
1. Login to SAP system
2. Navigate to specific transaction
3. Fill forms with data
4. Submit and capture results
5. Generate reports

## 🔧 Configuration

### Environment Variables
```bash
# C/ua Configuration
VITE_CUA_API_KEY=your_cua_api_key
VITE_CUA_BACKEND_URL=http://localhost:8000

# SAP Configuration
VITE_SAP_URL=your_sap_system_url
VITE_SAP_USERNAME=your_username

# Database Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### Backend Configuration
The CUA backend can be configured in `backend/main.py`:
- Agent types and models
- Task execution parameters
- Logging and monitoring settings

## 📈 Monitoring

### Real-time Dashboard
- Agent status and health
- Task execution progress
- Success rates and performance metrics
- Live WebSocket updates

### Logs and Debugging
- Backend logs: `backend/logs/`
- Frontend console logs
- WebSocket connection status
- Task execution history

## 🚨 Troubleshooting

### Common Issues

1. **Backend Connection Failed**
   ```bash
   # Check Python installation
   python3 --version
   
   # Check backend status
   curl http://localhost:8000/health
   ```

2. **CUA Agent Issues**
   ```bash
   # Verify API key
   echo $VITE_CUA_API_KEY
   
   # Check agent status
   curl http://localhost:8000/agents
   ```

3. **Frontend Issues**
   ```bash
   # Check dependencies
   bun install
   
   # Clear cache
   rm -rf node_modules/.vite
   ```

## 🔒 Security

- API keys stored in environment variables
- CORS configuration for secure communication
- Input validation and sanitization
- Audit logging for all operations

## 📚 Documentation

- [CUA Integration Guide](CUA_INTEGRATION.md) - Detailed CUA setup and usage
- [API Documentation](http://localhost:8000/docs) - Interactive API docs
- [Component Library](src/components/ui/) - UI component documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- Check the [troubleshooting guide](#troubleshooting)
- Review [CUA documentation](https://github.com/trycua/cua)
- Open an issue on GitHub
- Contact the development team

## 🎉 What's Next?

- [ ] Advanced workflow designer
- [ ] Task scheduling and automation
- [ ] Integration with more SAP modules
- [ ] Machine learning for task optimization
- [ ] Enterprise deployment support
- [ ] Mobile application support

---

**Built with ❤️ using React, TypeScript, Python, and C/ua**
