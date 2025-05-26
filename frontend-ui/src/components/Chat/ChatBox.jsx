import React, { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

export default function ChatBox() {
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hello! How can I assist you today?', sender: 'System' },
  ]);
  const [isConnected, setIsConnected] = useState(false);
  const websocket = useRef(null);
  const messageIdCounter = useRef(2);

  useEffect(() => {
    // Connect to AutoGen WebSocket server
    const connectWebSocket = () => {
      websocket.current = new WebSocket('ws://localhost:8765');
      
      websocket.current.onopen = () => {
        setIsConnected(true);
        console.log('Connected to AutoGen');
        addMessage('Connected to AutoGen AI!', 'WebSocket Connection', 'success');
      };
      
      websocket.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        // Skip UserProxy messages - they're just input prompts
        if (data.sender === 'UserProxy') {
          return;
        }
        
        if (data.requires_input) {
          // Special handling for UserProxy input requests
          addMessage(data.text, data.sender, 'warning');
        } else {
          addMessage(data.text, data.sender);
        }
      };
      
      websocket.current.onclose = () => {
        setIsConnected(false);
        console.log('Disconnected from AutoGen');
        addMessage('Disconnected from AutoGen AI', 'WebSocket Connection', 'error');
        
        // Attempt to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };
      
      websocket.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        addMessage('Connection error with AutoGen AI', 'WebSocket Connection', 'error');
      };
    };

    connectWebSocket();

    // Cleanup on unmount
    return () => {
      if (websocket.current) {
        websocket.current.close();
      }
    };
  }, []);

  const addMessage = (text, sender, messageType = 'normal') => {
    const newMessage = {
      id: messageIdCounter.current++,
      text,
      sender,
      messageType, // 'normal', 'success', 'error', 'warning'
      timestamp: Date.now(),
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  const handleSendMessage = (text) => {
    // Add user message to chat
    addMessage(text, 'User');
    
    // Send to AutoGen via WebSocket
    if (websocket.current && isConnected) {
      websocket.current.send(JSON.stringify({ text }));
    } else {
      addMessage('Not connected to AutoGen AI. Please wait for reconnection.', 'WebSocket Connection', 'error');
    }
  };

  return (
    <Box
      sx={{
        height: '600px', // Fixed height for the entire chat box
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'white',
        borderRadius: 2,
        boxShadow: 3,
        margin: 2,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          padding: 1,
          backgroundColor: isConnected ? '#4caf50' : '#f44336',
          color: 'white',
          textAlign: 'center',
          fontSize: '0.8rem',
          flexShrink: 0, // Prevent this from shrinking
        }}
      >
        {isConnected ? '🟢 Connected to AutoGen AI' : '🔴 Disconnected from AutoGen AI'}
      </Box>
      <MessageList messages={messages} />
      <MessageInput onSendMessage={handleSendMessage} />
    </Box>
  );
}