#!/usr/bin/env python3
"""
Test script to verify C/ua cloud connection
"""
import asyncio
import os
from dotenv import load_dotenv
from computer import Computer
from agent import ComputerAgent, AgentLoop, LLMProvider, LLM
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_cua_cloud():
    """Test C/ua cloud connection"""
    try:
        # Get API key from environment
        api_key = os.getenv("CUA_API_KEY")
        if not api_key:
            print("❌ CUA_API_KEY not found in environment variables")
            return False
        
        print(f"✅ Found CUA API key: {api_key[:20]}...")
        
        # Create cloud computer instance
        print("🔄 Creating cloud computer instance...")
        computer = Computer(
            os_type="linux",
            api_key=api_key,
            name="test-container"
        )
        
        print("🔄 Starting computer...")
        await computer.run()
        
        print("✅ Cloud computer started successfully!")
        
        # Test basic interface operations
        print("🔄 Testing interface operations...")
        
        # Take a screenshot
        screenshot = await computer.interface.screenshot()
        print(f"✅ Screenshot captured: {len(screenshot)} bytes")
        
        # Get screen info
        screen_info = await computer.interface.get_screen_info()
        print(f"✅ Screen info: {screen_info}")
        
        # Test typing
        await computer.interface.type_text("Hello from SAP Fiori Automator!")
        print("✅ Text typing test completed")
        
        print("\n🎉 C/ua cloud connection test successful!")
        return True
        
    except Exception as e:
        print(f"❌ Error testing C/ua cloud: {e}")
        logger.error(f"Error testing C/ua cloud: {e}")
        return False

async def test_agent_creation():
    """Test creating a C/ua agent"""
    try:
        api_key = os.getenv("CUA_API_KEY")
        if not api_key:
            print("❌ CUA_API_KEY not found")
            return False
        
        print("🔄 Creating C/ua agent...")
        
        # Create computer instance
        computer = Computer(
            os_type="linux",
            api_key=api_key,
            name="test-agent-container"
        )
        
        # Create agent
        agent = ComputerAgent(
            computer=computer,
            loop=AgentLoop.OPENAI,
            model=LLM(provider=LLMProvider.OPENAI),
            save_trajectory=True,
            only_n_most_recent_images=3,
            verbosity=logging.INFO
        )
        
        print("✅ C/ua agent created successfully!")
        
        # Test simple task
        print("🔄 Testing simple task execution...")
        task = "Open a terminal and type 'echo Hello from C/ua!'"
        
        results = []
        async for result in agent.run(task):
            results.append(result)
            print(f"📝 Task result: {result.get('id', 'unknown')}")
        
        print(f"✅ Task completed with {len(results)} results")
        return True
        
    except Exception as e:
        print(f"❌ Error testing agent creation: {e}")
        logger.error(f"Error testing agent creation: {e}")
        return False

async def main():
    """Main test function"""
    print("🚀 Testing C/ua Cloud Integration")
    print("=" * 50)
    
    # Test 1: Basic cloud connection
    print("\n📋 Test 1: Basic Cloud Connection")
    cloud_success = await test_cua_cloud()
    
    # Test 2: Agent creation
    print("\n📋 Test 2: Agent Creation")
    agent_success = await test_agent_creation()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Results Summary:")
    print(f"   Cloud Connection: {'✅ PASS' if cloud_success else '❌ FAIL'}")
    print(f"   Agent Creation:   {'✅ PASS' if agent_success else '❌ FAIL'}")
    
    if cloud_success and agent_success:
        print("\n🎉 All tests passed! Your C/ua cloud integration is working.")
        print("💡 You can now use C/ua in your SAP Fiori Automator backend.")
    else:
        print("\n⚠️  Some tests failed. Check the error messages above.")
        print("💡 Make sure your CUA_API_KEY is correct and you have cloud credits.")

if __name__ == "__main__":
    asyncio.run(main()) 