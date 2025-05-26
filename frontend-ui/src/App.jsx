import React from 'react';
import { Box } from '@mui/material';
import Layout from './components/Layout/Layout';
import ChatBox from './components/Chat/ChatBox';

function App() {
  return (
    <Layout>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ChatBox />
      </Box>
    </Layout>
  );
}

export default App;
