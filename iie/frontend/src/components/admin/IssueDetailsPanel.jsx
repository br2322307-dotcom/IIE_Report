import { useState, useEffect, useRef } from 'react';
import { X, MapPin, Tag, User, Mic, Square } from 'lucide-react';

export default function IssueDetailsPanel({ issue, onClose, isMobile, onUpdate }) {
  const [workers, setWorkers] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState('');
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [selectedWorker, setSelectedWorker] = useState('');

  useEffect(() => {
    fetch('/api/workers')
      .then(res => res.json())
      .then(data => {
        if (data.workers) setWorkers(data.workers);
      })
      .catch(console.error);
  }, []);

  if (!issue) return null;
  const issueId = issue._id || issue.id;

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    try {
      const res = await fetch(`/api/issues/${issueId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok && onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        setAudioURL(URL.createObjectURL(audioBlob));
      };
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone', err);
      alert('Could not access microphone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleAssign = async () => {
    if (!selectedWorker) return alert('Please select a worker first');
    setUploadingAudio(true);
    try {
      let voiceUrl = '';
      if (audioBlob) {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'voice_message.webm');
        const uploadRes = await fetch('/api/upload_voice', { method: 'POST', body: formData });
        const uploadData = await uploadRes.json();
        if (uploadData.success) voiceUrl = uploadData.url;
        else console.error('Audio upload failed', uploadData);
      }

      const res = await fetch(`/api/issues/${issueId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ worker_id: selectedWorker, voice_note_url: voiceUrl })
      });
      setUploadingAudio(false);
      if (res.ok && onUpdate) {
        onUpdate();
      }
    } catch (e) { console.error(e); }
  };

  if (!isMobile) {
    // Desktop View: Minimal as requested
    return (
      <div className="issue-details-panel">
        <div className="panel-header">
          <h3>Issue Preview</h3>
          <button className="btn-close" onClick={onClose}><X size={20}/></button>
        </div>
        <div className="panel-content">
          {issue.image_url ? (
            <div className="issue-image-container" style={{marginBottom: '1rem'}}>
              <img src={issue.image_url} alt="Issue Attachment" className="issue-image" style={{width: '100%', maxHeight: '400px', borderRadius: '12px', objectFit: 'contain'}} />
            </div>
          ) : (
            <div style={{width: '100%', height: '200px', background: '#f1f5f9', borderRadius: '12px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8'}}>
              No Image Available
            </div>
          )}
          
          <div className="issue-header-info" style={{marginBottom: '1.5rem'}}>
            <h2>{issue.title}</h2>
            <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem'}}>
              <Tag size={16} className="text-muted"/>
              <span className="text-muted text-sm">{issue.category}</span>
            </div>
          </div>
          
          <div className="form-group" style={{marginTop: '1rem'}}>
            <label>Change Status</label>
            <select className="form-control" value={issue.status || 'Pending'} onChange={handleStatusChange}>
              <option value="Pending">Pending</option>
              <option value="Review Pending">Review Pending</option>
              <option value="In Progress">In Progress</option>
              
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>
    );
  }

  // Mobile View: Full details (without priority)
  return (
    <div className="issue-details-panel mobile-panel">
      <div className="panel-header">
        <h3>Issue Details</h3>
        <button className="btn-close" onClick={onClose}><X size={20}/></button>
      </div>

      <div className="panel-content">
        {issue.image_url && (
          <div className="issue-image-container" style={{marginBottom: '1rem'}}>
            <img src={issue.image_url} alt="Issue Attachment" className="issue-image" style={{width: '100%', maxHeight: '300px', borderRadius: '12px', objectFit: 'cover'}} />
          </div>
        )}

        <div className="issue-header-info">
          <h2>{issue.title}</h2>
          <div className="issue-meta-row">
            <span className="text-muted text-sm">{issueId || 'ISS-2026-0041'}</span>
            <span className={`status-badge status-${(issue.status || 'Pending').toLowerCase().replace(/\s+/g, '-')}`}>{issue.status || 'Pending'}</span>
          </div>
        </div>

        <div className="info-grid">
          <div className="info-item">
            <MapPin size={18} className="text-muted"/>
            <div>
              <p className="info-label">Location</p>
              <p className="info-value">{issue.location}</p>
            </div>
          </div>
          <div className="info-item">
            <Tag size={18} className="text-muted"/>
            <div>
              <p className="info-label">Category</p>
              <p className="info-value">{issue.category}</p>
            </div>
          </div>
          <div className="info-item">
            <User size={18} className="text-muted"/>
            <div>
              <p className="info-label">Reported By</p>
              <p className="info-value">{issue.reporter_name || 'Anonymous'} <span className="text-muted">({issue.reporter_role || 'Student'})</span></p>
            </div>
          </div>
        </div>

        <div className="description-section">
          <h4>Description</h4>
          <p className="text-muted text-sm">{issue.description || 'No description provided.'}</p>
        </div>
        
        <div className="form-group" style={{marginTop: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e2e8f0'}}>
          <label>Change Status</label>
          <select className="form-control" value={issue.status || 'Pending'} onChange={handleStatusChange}>
            <option value="Pending">Pending</option>
            <option value="Review Pending">Review Pending</option>
            <option value="In Progress">In Progress</option>
            
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div className="review-section">
          <h4>Assign Worker</h4>
          <div className="form-group">
            <select className="form-control" value={selectedWorker} onChange={(e) => setSelectedWorker(e.target.value)}>
              <option value="">Select Worker...</option>
              {workers.map(w => (
                <option key={w._id || w.id} value={w._id || w.id}>{w.name} ({w.role || 'Worker'})</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Add Voice Note (Optional)</label>
            <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
              {!isRecording ? (
                <button onClick={startRecording} className="btn-action bg-blue" style={{flex: 1, display:'flex', justifyContent:'center', alignItems:'center', gap:'0.5rem'}}>
                  <Mic size={16} /> Record
                </button>
              ) : (
                <button onClick={stopRecording} className="btn-action bg-red" style={{flex: 1, display:'flex', justifyContent:'center', alignItems:'center', gap:'0.5rem'}}>
                  <Square size={16} /> Stop
                </button>
              )}
            </div>
            {audioURL && (
              <div style={{marginTop:'0.5rem'}}>
                <audio src={audioURL} controls style={{width:'100%', height:'36px'}} />
              </div>
            )}
          </div>

          <div className="action-buttons" style={{marginTop: '1rem'}}>
            <button className="btn-action bg-blue" onClick={handleAssign} style={{width: '100%'}}>{uploadingAudio ? 'Assigning...' : 'Assign Worker'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
