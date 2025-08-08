const API_URL = 'https://api.assemblyai.com/v2';
const API_KEY = 'c7c992ba5f084c6b8a265b2d42b7cd9a';  // Replace or load from env var

async function uploadAudio(file) {
  // AssemblyAI requires raw audio bytes POSTed
  const response = await fetch(`${API_URL}/upload`, {
    method: 'POST',
    headers: {
      authorization: API_KEY,
      'content-type': 'application/octet-stream',
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error('Audio upload failed');
  }

  const data = await response.json();
  return data.upload_url;
}

async function requestTranscription(uploadUrl) {
  const response = await fetch(`${API_URL}/transcript`, {
    method: 'POST',
    headers: {
      authorization: API_KEY,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      audio_url: uploadUrl,
      speaker_labels: false,
    }),
  });

  if (!response.ok) {
    throw new Error('Transcription request failed');
  }

  const data = await response.json();
  return data.id;
}

async function getTranscriptionResult(transcriptId) {
  const response = await fetch(`${API_URL}/transcript/${transcriptId}`, {
    method: 'GET',
    headers: {
      authorization: API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch transcription result');
  }

  return await response.json();
}

export { uploadAudio, requestTranscription, getTranscriptionResult };
