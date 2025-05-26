#!/usr/bin/env python3
"""
LLM Orchestrator using MagenticOneGroupChat with WebSocket
"""

import os
import asyncio
import json
import websockets
import sys
from dotenv import load_dotenv
from autogen_agentchat.ui import Console
from autogen_agentchat.conditions import TextMentionTermination
from autogen_agentchat.teams import MagenticOneGroupChat
from autogen_agentchat.agents import UserProxyAgent, AssistantAgent
from autogen_ext.models.openai import OpenAIChatCompletionClient
from autogen_core import CancellationToken

# Global variables for WebSocket communication
websocket_connections = set()
message_queue = asyncio.Queue()
user_input_queue = asyncio.Queue()  # Separate queue for user proxy input
waiting_for_user_input = False

class WebSocketConsole:
    """Custom console that sends messages to WebSocket clients"""
    
    async def __call__(self, stream):
        async for message in stream:
            # More robust message formatting - handle different message types
            sender = 'System'
            text = str(message)
            
            # Try different attribute names that AutoGen might use
            if hasattr(message, 'source'):
                sender = str(message.source)
            elif hasattr(message, 'sender'):
                sender = str(message.sender)
            elif hasattr(message, 'name'):
                sender = str(message.name)
            elif hasattr(message, 'agent'):
                sender = str(message.agent)
            
            if hasattr(message, 'content'):
                text = str(message.content)
            elif hasattr(message, 'text'):
                text = str(message.text)
            elif hasattr(message, 'message'):
                text = str(message.message)
            
            # Skip UserProxy messages - they're filtered on frontend anyway
            if sender == 'UserProxy':
                print(f"[{sender}]: {text} (filtered from frontend)")
                continue
            
            formatted_message = {
                'sender': sender,
                'text': text,
                'timestamp': asyncio.get_event_loop().time()
            }
            
            # Send to all connected WebSocket clients
            if websocket_connections:
                await asyncio.gather(
                    *[ws.send(json.dumps(formatted_message)) for ws in websocket_connections],
                    return_exceptions=True
                )
            
            print(f"[{formatted_message['sender']}]: {formatted_message['text']}")

async def websocket_input_func(prompt: str, cancellation_token: CancellationToken = None) -> str:
    """Custom input function that gets input from WebSocket instead of terminal"""
    global waiting_for_user_input
    waiting_for_user_input = True
    
    print(f"[WEBSOCKET INPUT]: Called with prompt: {prompt}")
    print(f"[WEBSOCKET INPUT]: Waiting for user input...")
    
    # No need to send prompt to React - user can just type naturally
    # The filtering in ChatBox.jsx already handles this
    
    # Clear any stale messages from the queue
    while not user_input_queue.empty():
        try:
            user_input_queue.get_nowait()
        except asyncio.QueueEmpty:
            break
    
    # Wait for user response from React
    try:
        if cancellation_token:
            # Create a task that can be cancelled
            input_task = asyncio.create_task(user_input_queue.get())
            cancellation_token.link_future(input_task)
            user_response = await input_task
        else:
            user_response = await asyncio.wait_for(user_input_queue.get(), timeout=300.0)
        
        print(f"[WEBSOCKET INPUT]: Received response - {user_response}")
        waiting_for_user_input = False
        return user_response
    except asyncio.TimeoutError:
        print("[WEBSOCKET INPUT]: Timeout waiting for user input")
        waiting_for_user_input = False
        return "TERMINATE"
    except asyncio.CancelledError:
        print("[WEBSOCKET INPUT]: Input cancelled")
        waiting_for_user_input = False
        raise

async def handle_websocket(websocket):
    """Handle WebSocket connections from React frontend"""
    global waiting_for_user_input
    websocket_connections.add(websocket)
    print(f"New WebSocket connection. Total: {len(websocket_connections)}")
    
    try:
        async for message in websocket:
            # Receive message from React and add to appropriate queue
            data = json.loads(message)
            message_text = data['text']
            
            #print(f"Received from React: {message_text}")
            
            if waiting_for_user_input:
                # If we're waiting for user input, only add to user input queue
                print(f"Adding React message to user input queue: {message_text}")
                await user_input_queue.put(message_text)
            else:
                # Otherwise, add to regular message queue for new conversations
                print(f"Adding React message to message queue: {message_text}")
                await message_queue.put(message_text)
            
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        websocket_connections.discard(websocket)
        print(f"WebSocket disconnected. Total: {len(websocket_connections)}")

async def autogen_worker():
    """Run AutoGen conversation"""
    load_dotenv()

    model_client = OpenAIChatCompletionClient(
        model="gpt-4o",
        api_key=os.getenv("OPENAI_API_KEY"),
    )

    # Initialize the agents with custom input function
    user_proxy = UserProxyAgent(
        name="UserProxy",
        description="Human user who provides additional information and feedback via web interface",
        input_func=websocket_input_func
    )

    agent_scientist = AssistantAgent(
        name="ScientistAgent",
        model_client=model_client,
        description="A scientist who provides detailed and logical explanations about scientific topics.",
        system_message="""You are a scientist who provides detailed and logical explanations about scientific topics. 
        Always approach questions with scientific rigor and include relevant concepts, theories, and evidence in your responses.
        Use clear explanations that are both accurate and accessible. When you need clarification from the user, ask specific questions."""
    )

    agent_artist = AssistantAgent(
        name="ArtistAgent", 
        model_client=model_client,
        description="An artist who provides creative and imaginative responses to questions.",
        system_message="""You are an artist who provides creative and imaginative responses to questions.
        Approach topics with creativity, metaphor, and artistic perspective. 
        Use vivid descriptions and creative analogies to make your responses engaging and thought-provoking.
        When you need more details from the user, ask creative questions to inspire them."""
    )

    agent_media_handler = AssistantAgent(
        name="MediaHandlerAgent",
        model_client=model_client,
        description="An agent that can receive and acknowledge image and video uploads from users.",
        system_message="""You are a media handler agent. When users upload images or videos (including MP4 files), acknowledge that you've received them.
        For now, simply confirm receipt and describe what type of assistance you could provide with media files in the future.
        Be helpful and encouraging about media-based interactions. When you need clarification about media, ask the user specific questions."""
    )

    # Create the team with UserProxy
    team = MagenticOneGroupChat(
        participants=[user_proxy, agent_scientist, agent_artist, agent_media_handler],
        model_client=model_client,
        termination_condition=TextMentionTermination("TERMINATE"),
    )

    # Wait for messages from React and process them
    while True:
        try:
            # Wait for message from React frontend
            user_message = await asyncio.wait_for(message_queue.get(), timeout=1.0)
            
            # Skip if it's just a user proxy response (already handled)
            if user_message in ["TERMINATE"]:
                continue
                
            print(f"Starting AutoGen conversation with: {user_message}")
            
            # Run AutoGen with the user message
            stream = team.run_stream(task=user_message)
            await WebSocketConsole()(stream)
            
        except asyncio.TimeoutError:
            # No messages, continue waiting
            continue
        except Exception as e:
            print(f"Error processing message: {e}")

async def main():
    """Start WebSocket server and AutoGen worker"""
    # Start WebSocket server
    websocket_server = websockets.serve(handle_websocket, "localhost", 8765)
    print("WebSocket server started on ws://localhost:8765")
    
    # Start AutoGen worker
    autogen_task = asyncio.create_task(autogen_worker())
    
    # Run both concurrently
    await asyncio.gather(websocket_server, autogen_task)

if __name__ == "__main__":
    asyncio.run(main())