import React from 'react';
import { useAuth } from '../context/AuthContext';

function PlaygroundPage() {
  const { user, logout } = useAuth();

  return (
    <div style={{ padding: 20 }}>
      <header style={{ marginBottom: 20 }}>
        <h1>Welcome, {user.name}!</h1>
        <button onClick={logout}>Logout</button>
      </header>

      {/* For now, simple placeholder for dropdown */}
      <select>
        <option>Conversation Analysis</option>
        <option>Image Analysis</option>
        <option>Document Summarization</option>
      </select>

      <div style={{ marginTop: 20 }}>
        <p>Select a skill to start...</p>
      </div>
    </div>
  );
}

export default PlaygroundPage;
