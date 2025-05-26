import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import Message from './Message';

export default function MessageList({ messages }) {
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <Box
      sx={{
        flex: 1, // Takes up remaining space
        overflowY: 'auto',
        padding: 2,
        backgroundColor: '#f9f9f9',
      }}
    >
      {messages.map((message) => (
        <Message 
          key={message.id} 
          text={message.text} 
          sender={message.sender}
          messageType={message.messageType}
        />
      ))}
      {/* Invisible element to scroll to */}
      <div ref={messagesEndRef} />
    </Box>
  );
}