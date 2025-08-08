import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

import { 
  uploadAudio, 
  requestTranscription, 
  getTranscriptionResult 
} from '../services/sttService';

function PlaygroundPage() {
  const { user, logout } = useAuth();
  const [selectedSkill, setSelectedSkill] = useState('');

  // States for Conversation Analysis audio processing
  const [audioFile, setAudioFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);

  // Polling interval reference so we can clear it later
  const pollingInterval = useRef(null);

  const handleAudioChange = (e) => {
    if (e.target.files.length > 0) {
      setAudioFile(e.target.files[0]);
      setTranscript('');
      setError(null);
    }
  };

  // Function to process audio: upload -> request transcription -> poll results
  const handleProcessAudio = async () => {
    if (!audioFile) return;

    setProcessing(true);
    setTranscript('');
    setError(null);

    try {
      // Step 1: Upload audio
      const uploadUrl = await uploadAudio(audioFile);

      // Step 2: Request transcription
      const transcriptId = await requestTranscription(uploadUrl);

      // Step 3: Poll transcription result until complete or failed
      pollingInterval.current = setInterval(async () => {
        try {
          const result = await getTranscriptionResult(transcriptId);

          if (result.status === 'completed') {
            clearInterval(pollingInterval.current);
            setTranscript(result.text || 'No transcript available.');
            setProcessing(false);
          } else if (result.status === 'error') {
            clearInterval(pollingInterval.current);
            setError('Transcription failed: ' + result.error);
            setProcessing(false);
          }
          // else status == queued or processing, do nothing and keep polling
        } catch (pollError) {
          clearInterval(pollingInterval.current);
          setError('Error polling transcription result: ' + pollError.message);
          setProcessing(false);
        }
      }, 3000); // Poll every 3 seconds

    } catch (e) {
      setError('Error during transcription process: ' + e.message);
      setProcessing(false);
    }
  };

  // Clear polling when skill changes or component unmounts
  useEffect(() => {
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, []);

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
            {error && (
              <p style={{ color: 'red', marginTop: '20px' }}>
                Error: {error}
              </p>
            )}
            {transcript && (
              <div style={{ marginTop: '20px' }}>
                <h4>Transcript</h4>
                <p style={{ whiteSpace: 'pre-wrap' }}>{transcript}</p>
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

  // Reset audio & transcript state when changing skill
  const handleSkillChange = (e) => {
    setSelectedSkill(e.target.value);
    setAudioFile(null);
    setTranscript('');
    setError(null);
    setProcessing(false);
    if (pollingInterval.current) clearInterval(pollingInterval.current);
  };

  return (
    <div style={{ padding: 20 }}>
      <header style={{
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h1>Welcome, {user.name}!</h1>
        <button onClick={logout}>Logout</button>
      </header>

      <select
        value={selectedSkill}
        onChange={handleSkillChange}
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
