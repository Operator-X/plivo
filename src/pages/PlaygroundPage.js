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

  // Image Analysis states for Step 4.1 and 4.2
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [imageDescription, setImageDescription] = useState('');
  const [imageProcessing, setImageProcessing] = useState(false);
  const [imageError, setImageError] = useState(null);

  // Diarized transcript array: [{speaker:1 or 2, text: string}]
  const [diarizedTranscript, setDiarizedTranscript] = useState([]);

  const pollingInterval = useRef(null);

  const handleAudioChange = (e) => {
    if (e.target.files.length > 0) {
      setAudioFile(e.target.files[0]);
      setTranscript('');
      setDiarizedTranscript([]);
      setError(null);
    }
  };

  const handleProcessAudio = async () => {
    if (!audioFile) return;

    setProcessing(true);
    setTranscript('');
    setDiarizedTranscript([]);
    setError(null);

    try {
      const uploadUrl = await uploadAudio(audioFile);
      const transcriptId = await requestTranscription(uploadUrl);

      pollingInterval.current = setInterval(async () => {
        try {
          const result = await getTranscriptionResult(transcriptId);

          if (result.status === 'completed') {
            clearInterval(pollingInterval.current);
            const fullText = result.text || '';
            setTranscript(fullText);
            const diarized = performSimpleDiarization(fullText);
            setDiarizedTranscript(diarized);
            setProcessing(false);
          } else if (result.status === 'error') {
            clearInterval(pollingInterval.current);
            setError('Transcription failed: ' + result.error);
            setProcessing(false);
          }
        } catch (pollError) {
          clearInterval(pollingInterval.current);
          setError('Error polling transcription result: ' + pollError.message);
          setProcessing(false);
        }
      }, 3000);
    } catch (e) {
      setError('Error during transcription process: ' + e.message);
      setProcessing(false);
    }
  };
  // Image Analysis Step 4.1: Handler for image file upload and preview generation
  const handleImageChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreviewUrl(null);
    }
  };

  // Simple Diarization Logic: Split transcript into sentences, alternate speakers
  const performSimpleDiarization = (text) => {
    if (!text) return [];

    // Split text into sentences using period, exclamation, question marks as delimiters
    const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];

    // Alternate speakers between sentences
    let speaker = 1;
    const diarized = sentences.map(sentence => {
      const entry = { speaker, text: sentence.trim() };
      speaker = speaker === 1 ? 2 : 1; // alternate speaker
      return entry;
    });

    return diarized;
  };

  useEffect(() => {
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, []);

  const renderDiarizedTranscript = () => {
    if (diarizedTranscript.length === 0) return <p>No diarized transcript yet.</p>;

    return (
      <div style={{ marginTop: 20 }}>
        <h4>Diarized Transcript</h4>
        {diarizedTranscript.map((segment, idx) => (
          <p key={idx} style={{ marginBottom: '12px' }}>
            <strong style={{ color: segment.speaker === 1 ? 'blue' : 'green' }}>
              Speaker {segment.speaker}:
            </strong> {segment.text}
          </p>
        ))}
      </div>
    );
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
            {error && (
              <p style={{ color: 'red', marginTop: '20px' }}>
                Error: {error}
              </p>
            )}
            {transcript && (
              <div style={{ marginTop: '20px' }}>
                <h4>Full Transcript</h4>
                <p style={{ whiteSpace: 'pre-wrap' }}>{transcript}</p>
              </div>
            )}
            {renderDiarizedTranscript()}
          </div>
        );
      case 'Image Analysis':
        return (
          <div>
            <h3>Image Analysis</h3>
            <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={imageProcessing}
            />
            {imageFile && (
                <div style={{ marginTop: '10px' }}>
                <img
                    src={imagePreviewUrl}
                    alt="Uploaded preview"
                    style={{ maxWidth: '300px', maxHeight: '300px', display: 'block', marginBottom: '10px' }}
                />
                <p><strong>Filename:</strong> {imageFile.name}</p>
                <p><strong>Size:</strong> {(imageFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
            )}
            {imageError && (
                <p style={{ color: 'red', marginTop: '20px' }}>
                {imageError}
                </p>
            )}
            {imageDescription && (
                <div style={{ marginTop: '20px' }}>
                <h4>Image Description</h4>
                <p>{imageDescription}</p>
                </div>
            )}
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

  const handleSkillChange = (e) => {
    setSelectedSkill(e.target.value);
    setAudioFile(null);
    setTranscript('');
    setDiarizedTranscript([]);
    setError(null);
    setProcessing(false);
    if (pollingInterval.current) clearInterval(pollingInterval.current);

    setImageFile(null);
    setImagePreviewUrl(null);
    setImageDescription('');
    setImageError(null);
    setImageProcessing(false);
    

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
