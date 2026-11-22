import { useState, useEffect, useRef } from 'react';
import { Mic, Square, Check, X } from 'lucide-react';

export default function AgentWorkers() {
  const [issues, setIssues] = useState([]);
  const [workers, setWorkers] = useState([]);
  
  // States for assignment
  const [selectedWorker, setSelectedWorker] = useState({});
  const [isRecording, setIsRecording] = useState({});
  const [audioBlobs, setAudioBlobs] = useState({});
  const [audioURLs, setAudioURLs] = useState({});
  const mediaRecorders = useRef({});
  const audioChunks = useRef({});

  const fetchData = () => {
    fetch('/api/admin/dashboard', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setIssues(data.issues || []));
      
    fetch('/api/workers')
      .then(res => res.json())
      .then(data => setWorkers(data.workers || []));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWorkerChange = (issueId, workerId) => {
    setSelectedWorker(prev => ({...prev, [issueId]: workerId}));
  };

  const startRecording = async (issueId) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorders.current[issueId] = recorder;
      audioChunks.current[issueId] = [];
      
      recorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunks.current[issueId].push(e.data);
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks.current[issueId], { type: 'audio/webm' });
        setAudioBlobs(prev => ({...prev, [issueId]: audioBlob}));
        setAudioURLs(prev => ({...prev, [issueId]: URL.createObjectURL(audioBlob)}));
      };
      
      recorder.start();
      setIsRecording(prev => ({...prev, [issueId]: true}));
    } catch (err) {
      console.error('Error accessing microphone', err);
      alert('Could not access microphone.');
    }
  };

  const stopRecording = (issueId) => {
    const recorder = mediaRecorders.current[issueId];
    if (recorder) {
      recorder.stop();
      setIsRecording(prev => ({...prev, [issueId]: false}));
      recorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleSend = async (issueId) => {
    const workerId = selectedWorker[issueId];
    if (!workerId) return alert('Please select a worker to send to.');
    
    let voiceUrl = '';
    const blob = audioBlobs[issueId];
    if (blob) {
      const formData = new FormData();
      formData.append('audio', blob, 'voice_message.webm');
      const uploadRes = await fetch('/api/upload_voice', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      if (uploadData.success) voiceUrl = uploadData.url;
    }

    const res = await fetch(`/api/issues/${issueId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ worker_id: workerId, voice_note_url: voiceUrl })
    });
    
    if (res.ok) {
      alert('Sent to worker successfully!');
      fetchData(); // Refresh the list
    }
  };

  const handleReviewWorkerWork = async (issueId, isApproved) => {
    const newStatus = isApproved ? 'Review Pending' : 'In Progress';
    await fetch(`/api/issues/${issueId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    fetchData();
  };

  return (
    <div className="dashboard-content">
      <div className="issues-header" style={{marginBottom: '2rem'}}>
        <h2>Agent Workers Management</h2>
        <p className="text-muted">Assign tasks, send voice notes, and review worker submissions.</p>
      </div>

      <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
        {issues.length > 0 ? issues.map(issue => {
          const status = issue.status || 'Pending';
          const isPending = status === 'Pending' || status === 'Rejected' || !issue.assigned_worker_id;
          const isAssigned = status === 'Assigned';
          const isInProgress = status === 'In Progress';
          const isWorkerDone = status === 'Worker Done';
          const isReviewPending = status === 'Review Pending';
          const isResolved = status === 'Resolved';

          return (
            <div key={issue.id || issue._id} style={{background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap'}}>
              
              {/* Left Side: Issue Details */}
              <div style={{flex: '1 1 300px', minWidth: '300px'}}>
                <div style={{display: 'flex', gap: '1rem'}}>
                  {issue.image_url ? 
                    <img src={issue.image_url} alt="Issue" style={{width: '80px', height: '80px', borderRadius: '8px', objectFit: 'cover'}} /> :
                    <div style={{width: '80px', height: '80px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px'}}>No Img</div>
                  }
                  <div>
                    <span className="text-xs text-muted" style={{textTransform: 'uppercase'}}>{issue.category}</span>
                    <h4 style={{fontSize: '16px', fontWeight: 600, margin: '4px 0'}}>{issue.title}</h4>
                    <p className="text-sm text-muted" style={{display: 'flex', alignItems: 'center', gap: '4px'}}>
                      <span className="status-badge" style={{padding: '2px 8px', fontSize: '11px', background: '#f1f5f9', color: '#64748b'}}>{status}</span>
                      <span style={{marginLeft: '8px'}}>{issue.location}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side: Agent Controls */}
              <div style={{flex: '1 1 300px', minWidth: '300px', borderLeft: '1px solid #f1f5f9', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                
                {isPending && (
                  <div>
                    <label style={{fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px'}}>Who to send it to?</label>
                    <select 
                      style={{width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e2e8f0', marginBottom: '12px'}}
                      value={selectedWorker[issue.id || issue._id] || ''}
                      onChange={(e) => handleWorkerChange(issue.id || issue._id, e.target.value)}
                    >
                      <option value="">Select Worker...</option>
                      {workers.map(w => <option key={w.id || w._id} value={w.id || w._id}>{w.name} ({w.role})</option>)}
                    </select>

                    <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                      {!isRecording[issue.id || issue._id] ? (
                        <button onClick={() => startRecording(issue.id || issue._id)} style={{background: '#f1f5f9', color: '#334155', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'}}>
                          <Mic size={16} /> Record
                        </button>
                      ) : (
                        <button onClick={() => stopRecording(issue.id || issue._id)} style={{background: '#fee2e2', color: '#ef4444', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'}}>
                          <Square size={16} /> Stop
                        </button>
                      )}
                      
                      <button onClick={() => handleSend(issue.id || issue._id)} style={{background: '#3b82f6', color: 'white', border: 'none', padding: '8px 24px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', marginLeft: 'auto'}}>
                        Send
                      </button>
                    </div>
                    {audioURLs[issue.id || issue._id] && (
                      <audio src={audioURLs[issue.id || issue._id]} controls style={{width: '100%', height: '32px', marginTop: '12px'}} />
                    )}
                  </div>
                )}

                {isAssigned && (
                  <div style={{textAlign: 'center', color: '#64748b'}}>
                    <p style={{fontSize: '14px'}}>Sent to <strong>{issue.assigned_to}</strong>.</p>
                    <p style={{fontSize: '13px', marginTop: '4px'}}>Waiting for them to accept...</p>
                  </div>
                )}

                {isInProgress && (
                  <div style={{textAlign: 'center', color: '#3b82f6'}}>
                    <p style={{fontSize: '14px', fontWeight: 500}}>Worker: {issue.assigned_to}</p>
                    <p style={{fontSize: '13px', marginTop: '4px'}}>Currently working on this issue.</p>
                  </div>
                )}

                {isWorkerDone && (
                  <div style={{textAlign: 'center'}}>
                    <p style={{fontSize: '14px', fontWeight: 500, color: '#16a34a', marginBottom: '12px'}}>Worker ({issue.assigned_to}) marked this as Done!</p>
                    <p style={{fontSize: '13px', marginBottom: '12px', color: '#64748b'}}>Is the work satisfactory?</p>
                    <div style={{display: 'flex', justifyContent: 'center', gap: '12px'}}>
                      <button onClick={() => handleReviewWorkerWork(issue.id || issue._id, true)} style={{background: '#16a34a', color: 'white', border: 'none', padding: '8px 24px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'}}><Check size={16}/> Yes</button>
                      <button onClick={() => handleReviewWorkerWork(issue.id || issue._id, false)} style={{background: '#ef4444', color: 'white', border: 'none', padding: '8px 24px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'}}><X size={16}/> No</button>
                    </div>
                  </div>
                )}

                {(isReviewPending || isResolved) && (
                  <div style={{textAlign: 'center', color: '#16a34a'}}>
                    <p style={{fontSize: '14px', fontWeight: 500}}>Work Approved</p>
                    <p style={{fontSize: '13px', marginTop: '4px'}}>
                      {isResolved ? "Student has confirmed the resolution." : "Sent to Student for final confirmation."}
                    </p>
                  </div>
                )}

              </div>
            </div>
          );
        }) : (
          <div style={{textAlign: 'center', padding: '4rem', color: '#94a3b8'}}>No issues found.</div>
        )}
      </div>
    </div>
  );
}
