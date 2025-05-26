import React from 'react';
import { Box, Typography } from '@mui/material';

export default function Message({ text, sender, messageType = 'normal' }) {
  const isUser = sender === 'User';
  const isSystem = sender === 'System';
  const isWebSocket = sender === 'WebSocket Connection';
  
  // Default colors
  let bgColor = '#fce4ec'; // Default AI color
  let textColor = '#000';
  let borderColor = 'transparent';
  
  if (isUser) {
    bgColor = '#e0f7fa';
  } else if (isSystem) {
    bgColor = '#f5f5f5';
  } else if (isWebSocket) {
    // WebSocket connection messages
    if (messageType === 'success') {
      bgColor = '#e8f5e8'; // Light green
      borderColor = '#4caf50'; // Green border
      textColor = '#2e7d32'; // Dark green text
    } else if (messageType === 'error') {
      bgColor = '#ffebee'; // Light red
      borderColor = '#f44336'; // Red border
      textColor = '#c62828'; // Dark red text
    } else if (messageType === 'warning') {
      bgColor = '#fff3e0'; // Light orange
      borderColor = '#ff9800'; // Orange border
      textColor = '#e65100'; // Dark orange text
    }
  }
  
  return (
    <Box
      sx={{
        marginBottom: 1,
        padding: 1.5,
        backgroundColor: bgColor,
        borderRadius: 2,
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '70%',
        border: `2px solid ${borderColor}`,
        color: textColor,
      }}
    >
      {!isUser && (
        <Typography 
          variant="caption" 
          sx={{ 
            fontWeight: 'bold', 
            color: textColor,
            display: 'block',
            marginBottom: 0.5
          }}
        >
          {sender}
          {isWebSocket && (
            <Typography 
              component="span" 
              variant="caption" 
              sx={{ 
                marginLeft: 1, 
                fontStyle: 'italic',
                opacity: 0.8
              }}
            >
              • {messageType === 'success' ? 'Connected' : messageType === 'error' ? 'Disconnected' : 'Status'}
            </Typography>
          )}
        </Typography>
      )}
      <Typography variant="body1" sx={{ color: textColor }}>
        {text}
      </Typography>
    </Box>
  );
}