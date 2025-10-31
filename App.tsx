import React from 'react';
import ChatWindow from './components/ChatWindow';

function App() {
  return (
    // Set a transparent background for seamless embedding
    <div className="min-h-screen w-full h-full bg-transparent flex items-center justify-center p-0 font-sans">
      <div className="w-full h-full max-w-2xl max-h-screen">
        <ChatWindow />
      </div>
    </div>
  );
}

export default App;