import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function PlaygroundPage() {
  const { user, logout } = useAuth();
  const [selectedSkill, setSelectedSkill] = useState('');

  // State for audio file in Conversation Analysis
  const [audioFile, setAudioFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');

  const handleAudioChange = (e) => {
    if (e.target.files.length > 0) {
      setAudioFile(e.target.files[0]);
      setTranscript(''); // clear old transcript on new file select
    }
  };

  const handleProcessAudio = () => {
    if (!audioFile) return;

    setProcessing(true);
    setTranscript('');

    // Simulate API call delay
    setTimeout(() => {
      setTranscript('This is a simulated transcription of the uploaded audio.');
      setProcessing(false);
    }, 3000);
  };

  const renderSkillSection = () => {
    switch (selectedSkill) {
      case 'Conversation Analysis':
        return (
          <div>
            <h3>Conversation Analysis</h3>
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
              disabled={processing}
            />
            {audioFile && (
              <div style={{ marginTop: '10px' }}>
                <p><strong>Selected File:</strong> {audioFile.name}</p>
                <p><strong>Size:</strong> {(audioFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                <button
                  onClick={handleProcessAudio}
                  disabled={processing}
                  style={{ marginTop: '10px', padding: '8px 16px' }}
                >
                  {processing ? 'Processing...' : 'Process Audio'}
                </button>
              </div>
            )}
            {transcript && (
              <div style={{ marginTop: '20px' }}>
                <h4>Transcript</h4>
                <p>{transcript}</p>
              </div>
            )}
          </div>
        );
      case 'Image Analysis':
        return (
          <div>
            <h3>Image Analysis</h3>
            <p>Upload image here.</p>
          </div>
        );
      case 'Document Summarization':
        return (
          <div>
            <h3>Document / URL Summarization</h3>
            <p>Upload document (PDF/DOC) or enter URL here.</p>
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

      <select
        value={selectedSkill}
        onChange={(e) => {
          setSelectedSkill(e.target.value);
          // Clear selected files and transcript when skill changes
          setAudioFile(null);
          setTranscript('');
          setProcessing(false);
        }}
        style={{ padding: '8px', fontSize: '16px' }}
      >
        <option value="">-- Select Skill --</option>
        <option value="Conversation Analysis">Conversation Analysis</option>
        <option value="Image Analysis">Image Analysis</option>
        <option value="Document Summarization">Document Summarization</option>
      </select>

      <div style={{ marginTop: 30 }}>
        {renderSkillSection()}
      </div>
    </div>
  );
}

export default PlaygroundPage;
