import { useState, useEffect } from 'react';
import { Megaphone, Send, Image as ImageIcon } from 'lucide-react';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAnnouncements = () => {
    fetch('/api/announcements')
      .then(res => res.json())
      .then(data => {
        if (data.announcements) setAnnouncements(data.announcements);
      });
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('message', message);
    if (image) formData.append('image', image);

    const res = await fetch('/api/announcements', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (res.ok) {
      setTitle('');
      setMessage('');
      setImage(null);
      fetchAnnouncements();
      alert('Announcement sent successfully!');
    } else {
      alert('Failed to send announcement');
    }
    setLoading(false);
  };

  return (
    <div className="dashboard-content">
      <div className="issues-header" style={{ marginBottom: '2rem' }}>
        <h2>Announcements</h2>
        <p className="text-muted">Broadcast messages to all students and faculty.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Left Side: Create Announcement */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', alignSelf: 'start' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', color: '#0f172a' }}>
            <Megaphone size={20} color="#3b82f6" /> New Announcement
          </h3>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Title</label>
              <input required placeholder="e.g. College Holiday Tomorrow" value={title} onChange={e => setTitle(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Message</label>
              <textarea required rows="4" placeholder="Type your announcement details here..." value={message} onChange={e => setMessage(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', resize: 'vertical' }} />
            </div>
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Attach Image (Optional)</label>
              <div style={{ position: 'relative' }}>
                <input type="file" accept="image/*" onChange={e => setImage(e.target.files[0])} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', border: '1px dashed #94a3b8', borderRadius: '8px', color: '#64748b' }}>
                  <ImageIcon size={18} /> {image ? image.name : 'Click to select image'}
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 600, cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '0.5rem' }}>
              <Send size={18} /> {loading ? 'Sending...' : 'Send Announcement'}
            </button>
          </form>
        </div>

        {/* Right Side: Previous Announcements */}
        <div>
          <h3 style={{ marginBottom: '1.5rem', color: '#0f172a' }}>Recent Announcements</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {announcements.length > 0 ? announcements.map(a => (
              <div key={a.id || a._id} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>{a.title}</h4>
                  <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {a.created_at ? new Date(a.created_at).toLocaleDateString() : ''}
                  </span>
                </div>
                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5, margin: '0 0 1rem 0' }}>{a.message}</p>
                {a.image_url && (
                  <img src={a.image_url} alt="Announcement" style={{ width: '100%', maxHeight: '300px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                )}
              </div>
            )) : (
              <p style={{ color: '#94a3b8' }}>No announcements sent yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
