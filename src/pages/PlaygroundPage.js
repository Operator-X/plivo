import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function PlaygroundPage() {
  const { user, logout } = useAuth();
  const [selectedSkill, setSelectedSkill] = useState('');

  // Placeholder components for each skill
  const renderSkillSection = () => {
    switch (selectedSkill) {
      case 'Conversation Analysis':
        return (
          <div>
            <h3>Conversation Analysis</h3>
            <p>Upload audio file here.</p>
            {/* Later: input for audio upload and transcript display */}
          </div>
        );
      case 'Image Analysis':
        return (
          <div>
            <h3>Image Analysis</h3>
            <p>Upload image here.</p>
            {/* Later: image upload and description */}
          </div>
        );
      case 'Document Summarization':
        return (
          <div>
            <h3>Document / URL Summarization</h3>
            <p>Upload document (PDF/DOC) or enter URL here.</p>
            {/* Later: file/URL input and summary output */}
          </div>
        );
      default:
        return <p>Please select a skill from the dropdown above.</p>;
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <header style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Welcome, {user.name}!</h1>
        <button onClick={logout}>Logout</button>
      </header>

      {/* Skill Dropdown */}
      <select
        value={selectedSkill}
        onChange={(e) => setSelectedSkill(e.target.value)}
        style={{ padding: '8px', fontSize: '16px' }}
      >
        <option value="">-- Select Skill --</option>
        <option value="Conversation Analysis">Conversation Analysis</option>
        <option value="Image Analysis">Image Analysis</option>
        <option value="Document Summarization">Document Summarization</option>
      </select>

      {/* Skill Section */}
      <div style={{ marginTop: 30 }}>
        {renderSkillSection()}
      </div>
    </div>
  );
}

export default PlaygroundPage;
