import { useState, useEffect } from 'react';
import { Info, Bell } from 'lucide-react';

export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/announcements', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setAnnouncements(data.announcements || []);
      })
      .catch(() => setAnnouncements([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="dashboard-scroll-area">
      <div style={{background: 'white', borderRadius: '12px', border: '1px solid var(--border-light)', padding: '1.5rem', minHeight: 'calc(100vh - 120px)'}}>
        
        <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem'}}>
          <button style={{padding: '6px 16px', background: '#3b82f6', color: 'white', borderRadius: '20px', border: 'none', fontSize: '13px', fontWeight: 500}}>All</button>
          <button style={{padding: '6px 16px', background: '#f8fafc', color: '#64748b', borderRadius: '20px', border: '1px solid var(--border-light)', fontSize: '13px', fontWeight: 500}}>General</button>
          <button style={{padding: '6px 16px', background: '#f8fafc', color: '#64748b', borderRadius: '20px', border: '1px solid var(--border-light)', fontSize: '13px', fontWeight: 500}}>Maintenance</button>
          <button style={{padding: '6px 16px', background: '#f8fafc', color: '#64748b', borderRadius: '20px', border: '1px solid var(--border-light)', fontSize: '13px', fontWeight: 500}}>Academic</button>
        </div>

        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          {loading ? (
             <p style={{color: '#64748b', textAlign: 'center', padding: '2rem'}}>Loading announcements...</p>
          ) : announcements.length === 0 ? (
             <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', color: '#94a3b8'}}>
                <Bell size={48} style={{marginBottom: '1rem', opacity: 0.3}} />
                <h3>No New Announcements</h3>
                <p style={{fontSize: '13px', marginTop: '8px'}}>You're all caught up. Check back later!</p>
             </div>
          ) : (
             announcements.map((ann, idx) => (
                <div key={idx} style={{border: '1px solid var(--border-light)', borderRadius: '12px', padding: '1.5rem', display: 'flex', gap: '1.5rem'}}>
                   <div style={{width: '48px', height: '48px', background: '#eff6ff', color: '#3b82f6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <Info size={24} />
                   </div>
                   <div style={{flex: 1}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '8px'}}>
                         <h4 style={{fontSize: '16px', fontWeight: 600}}>{ann.title}</h4>
                         <span style={{fontSize: '12px', color: '#64748b'}}>{ann.date}</span>
                      </div>
                      <p style={{fontSize: '13px', color: '#475569', marginBottom: '12px', lineHeight: '1.5'}}>{ann.message}</p>
                      <span style={{background: '#eff6ff', color: '#3b82f6', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 500}}>{ann.category || 'General'}</span>
                   </div>
                </div>
             ))
          )}
        </div>
      </div>
    </div>
  );
}
