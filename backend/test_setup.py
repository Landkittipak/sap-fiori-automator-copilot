#!/usr/bin/env python3
"""
Simple test script to verify backend setup
"""

import os
import sys
import asyncio
from main import app, CuaAutomationService

async def test_setup():
    """Test basic setup and configuration"""
    print("🧪 Testing SAP Fiori Automator Backend Setup")
    print("=" * 50)
    
    # Test 1: Environment variables
    print("\n1. Testing Environment Configuration...")
    cua_api_key = os.getenv("CUA_API_KEY", "")
    if cua_api_key:
        print(f"   ✅ CUA_API_KEY configured (length: {len(cua_api_key)})")
    else:
        print("   ⚠️  CUA_API_KEY not configured")
    
    sap_url = os.getenv("SAP_FIORI_URL", "http://localhost:8080")
    print(f"   ✅ SAP_FIORI_URL: {sap_url}")
    
    # Test 2: FastAPI app
    print("\n2. Testing FastAPI Application...")
    try:
        print("   ✅ FastAPI app created successfully")
        print(f"   ✅ App title: {app.title}")
        print(f"   ✅ App version: {app.version}")
    except Exception as e:
        print(f"   ❌ FastAPI app error: {e}")
        return False
    
    # Test 3: CUA Service (only if API key is configured)
    print("\n3. Testing CUA Service...")
    if cua_api_key:
        try:
            service = CuaAutomationService()
            print("   ✅ CUA service initialized")
            print("   ⚠️  Note: Actual connection test requires internet and valid API key")
        except Exception as e:
            print(f"   ❌ CUA service error: {e}")
    else:
        print("   ⚠️  Skipping CUA test (no API key configured)")
    
    # Test 4: Dependencies
    print("\n4. Testing Dependencies...")
    try:
        import fastapi
        import uvicorn
        import httpx
        import pydantic
        print("   ✅ All required packages imported successfully")
        print(f"   ✅ FastAPI version: {fastapi.__version__}")
        print(f"   ✅ Uvicorn version: {uvicorn.__version__}")
    except ImportError as e:
        print(f"   ❌ Missing dependency: {e}")
        return False
    
    print("\n" + "=" * 50)
    if cua_api_key:
        print("🎉 Setup test completed! Backend appears ready for automation.")
        print("\nNext steps:")
        print("1. Start the backend: python main.py")
        print("2. Start the frontend: npm run dev")
        print("3. Test the connection in the frontend")
    else:
        print("⚠️  Setup partially complete. Please configure CUA_API_KEY in .env")
        print("\nTo complete setup:")
        print("1. Edit backend/.env and add your CUA_API_KEY")
        print("2. Start the backend: python main.py")
        print("3. Start the frontend: npm run dev")
    
    return True

if __name__ == "__main__":
    asyncio.run(test_setup())