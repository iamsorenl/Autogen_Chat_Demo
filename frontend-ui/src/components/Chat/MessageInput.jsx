import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';
import UploadButton from './UploadButton';

export default function MessageInput({ onSendMessage }) {
  const [inputValue, setInputValue] = useState('');

  const handleSend = () => {
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = (uploadResult) => {
    if (uploadResult.success) {
      // Send a message to AutoGen about the uploaded media
      const mediaType = uploadResult.fileType === 'video' ? 'Video' : 'Image';
      const message = `I just uploaded a ${mediaType.toLowerCase()}: ${uploadResult.filename}. Can you help me with this ${mediaType.toLowerCase()}?`;
      onSendMessage(message);
    } else {
      console.error('Upload error:', uploadResult.error);
      alert(`Upload failed: ${uploadResult.error}`);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: 2,
        borderTop: '1px solid #ddd',
        backgroundColor: 'white',
      }}
    >
      <TextField
        fullWidth
        placeholder="Type a message or upload media..."
        variant="outlined"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        sx={{ marginRight: 1 }}
      />
      <UploadButton onFileUpload={handleFileUpload} />
      <Button
        variant="contained"
        color="primary"
        onClick={handleSend}
        sx={{ marginLeft: 1 }}
      >
        Send
      </Button>
    </Box>
  );
}