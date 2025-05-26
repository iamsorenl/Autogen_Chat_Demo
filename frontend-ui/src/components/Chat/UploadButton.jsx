import React from 'react';
import { Button } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';

export default function UploadButton({ onFileUpload }) {
  const handleFileChange = async (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      const file = files[0]; // Get the first file
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        // Upload to your backend API
        const response = await fetch('http://127.0.0.1:5001/upload-media', {
          method: 'POST',
          body: formData,
        });
        
        const result = await response.json();
        
        if (response.ok) {
          // Call the parent component's handler with success info
          onFileUpload({
            success: true,
            filename: result.filename,
            message: result.message,
            fileType: result.file_type
          });
        } else {
          onFileUpload({
            success: false,
            error: result.error
          });
        }
      } catch (error) {
        onFileUpload({
          success: false,
          error: 'Upload failed: ' + error.message
        });
      }
    }
  };

  return (
    <Button
      variant="contained"
      color="secondary"
      startIcon={<UploadFileIcon />}
      component="label"
      sx={{ marginLeft: 1 }}
    >
      Upload
      <input
        type="file"
        hidden
        onChange={handleFileChange}
        accept="image/*,video/*"
      />
    </Button>
  );
}