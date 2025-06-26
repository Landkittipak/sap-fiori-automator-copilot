# SAP Fiori Automator - Quick Start 🚀

Get your SAP Fiori automation running in 5 minutes!

## 🎯 What You'll Get

✅ **Real browser automation** with cursor movement  
✅ **Cloud-based CUA agents** running in VMs  
✅ **Live monitoring** of automation execution  
✅ **SAP Fiori integration** via ngrok exposure  

## ⚡ 1-Minute Setup

```bash
# 1. Make scripts executable
chmod +x scripts/*.sh

# 2. Run the magic setup script
./scripts/start-automation.sh
```

That's it! The script will:
- ✅ Check all dependencies
- ✅ Start Python backend (http://localhost:8000)
- ✅ Start React frontend (http://localhost:5173)
- ✅ Guide you through SAP Fiori exposure

## 🔧 Manual Setup (If Needed)

### Backend (Terminal 1)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your CUA API key
python main.py
```

### Frontend (Terminal 2)
```bash
npm install
npm run dev
```

### SAP Fiori Exposure (Terminal 3)
```bash
# If SAP Fiori is on localhost:8080
ngrok http 8080
# Copy the https:// URL for workflows
```

## 🧪 Test Your Setup

1. **Open frontend**: http://localhost:5173
2. **Test connection**: Use the CUA connection test
3. **Create workflow**: Build your first automation
4. **Execute**: Watch the browser move automatically!

## 📝 Get Your CUA API Key

1. Go to [C/ua](https://trycua.com/)
2. Sign up for free account
3. Get API key from dashboard
4. Add to `backend/.env`:
   ```
   CUA_API_KEY=your_key_here
   ```

## 🎮 Try These Example Workflows

### Simple SAP Login
1. **Action**: Type username in `input[name="username"]`
2. **Action**: Type password in `input[name="password"]`  
3. **Action**: Click `button[type="submit"]`
4. **Screenshot**: Capture result

### Data Entry
1. **Action**: Click `.create-button`
2. **Validation**: Wait for `.form-container` to be visible
3. **Action**: Type customer name in `#customer-field`
4. **Action**: Select country from dropdown
5. **Action**: Click save button

## 🔍 Troubleshooting

### Backend won't start?
```bash
# Check Python version (need 3.8+)
python3 --version

# Reinstall dependencies
cd backend && rm -rf venv
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
```

### Can't connect to CUA?
- ✅ Check your API key in `backend/.env`
- ✅ Ensure internet connection
- ✅ Verify CUA account has credits

### SAP Fiori not accessible?
- ✅ Use ngrok: `ngrok http 8080`
- ✅ Use the https URL in workflows
- ✅ Ensure SAP allows external connections

## 🎯 Next Steps

1. **Learn the workflow builder** - Create complex automations
2. **Use template variables** - Make workflows reusable
3. **Monitor executions** - Watch real-time progress
4. **Export/import** - Share workflows with team

---

## 💡 How It Works

```
Your Frontend → Python Backend → CUA Cloud VM → Your SAP (via ngrok)
     ↑                                           ↓
     └─────────── Real-time Status ←────────────┘
```

The CUA agent runs in a cloud VM with a real browser, controlled by your workflows. It can see and interact with your SAP Fiori just like a human would!

---

🎉 **Ready to automate? Start with `./scripts/start-automation.sh`**