import { useState, useEffect } from 'react';
import { FileText, Clock, Settings, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function Graphs() {
  const [allIssues, setAllIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/student/dashboard', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setAllIssues(data.all_issues || []);
      })
      .catch(err => {
        console.error(err);
        setAllIssues([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const issuesList = Array.isArray(allIssues) ? allIssues : [];
  const pendingCount = issuesList.filter(i => i.status === 'Pending' || !i.status).length;
  const inProgressCount = issuesList.filter(i => i.status === 'In Progress').length;
  const reviewCount = issuesList.filter(i => i.status === 'Review Pending').length;
  const resolvedCount = issuesList.filter(i => i.status === 'Resolved').length;

  const categories = issuesList.reduce((acc, issue) => {
    const cat = issue.category || 'Other';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});
  
  if (loading) return <div className="dashboard-scroll-area">Loading...</div>;

  return (
    <div className="dashboard-scroll-area">
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.5rem', marginBottom: '2.5rem'}}>
         <div className="stat-card-modern">
            <div className="stat-icon" style={{background: '#eff6ff', color: '#3b82f6'}}><FileText size={24} /></div>
            <div><p style={{color: 'var(--text-muted)', fontSize: '13px'}}>Total Issues</p><h3 style={{fontSize: '24px', fontWeight: 700}}>{allIssues.length}</h3></div>
         </div>
         <div className="stat-card-modern">
            <div className="stat-icon" style={{background: '#fff7ed', color: '#ea580c'}}><Clock size={24} /></div>
            <div><p style={{color: 'var(--text-muted)', fontSize: '13px'}}>Pending</p><h3 style={{fontSize: '24px', fontWeight: 700}}>{pendingCount}</h3></div>
         </div>
         <div className="stat-card-modern">
            <div className="stat-icon" style={{background: '#eff6ff', color: '#2563eb'}}><Settings size={24} /></div>
            <div><p style={{color: 'var(--text-muted)', fontSize: '13px'}}>In Progress</p><h3 style={{fontSize: '24px', fontWeight: 700}}>{inProgressCount}</h3></div>
         </div>
         <div className="stat-card-modern">
            <div className="stat-icon" style={{background: '#faf5ff', color: '#9333ea'}}><ShieldCheck size={24} /></div>
            <div><p style={{color: 'var(--text-muted)', fontSize: '13px'}}>Review</p><h3 style={{fontSize: '24px', fontWeight: 700}}>{reviewCount}</h3></div>
         </div>
         <div className="stat-card-modern">
            <div className="stat-icon" style={{background: '#f0fdf4', color: '#16a34a'}}><CheckCircle2 size={24} /></div>
            <div><p style={{color: 'var(--text-muted)', fontSize: '13px'}}>Resolved</p><h3 style={{fontSize: '24px', fontWeight: 700}}>{resolvedCount}</h3></div>
         </div>
      </div>

      <div style={{display: 'flex', gap: '2rem'}}>
        
        {/* Real Dynamic Categories Bar Chart */}
        <div style={{flex: 1, background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border-light)'}}>
          <h3 style={{fontSize: '16px', fontWeight: 600, marginBottom: '2rem'}}>Reports by Category (Campus Wide)</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
             {Object.entries(categories).map(([cat, count]) => {
                const percentage = allIssues.length ? Math.round((count / allIssues.length) * 100) : 0;
                return (
                  <div key={cat}>
                     <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px'}}>
                        <span style={{textTransform: 'capitalize', fontWeight: 500}}>{cat}</span>
                        <span style={{color: '#64748b'}}>{count} ({percentage}%)</span>
                     </div>
                     <div style={{width: '100%', background: '#f1f5f9', height: '8px', borderRadius: '4px', overflow: 'hidden'}}>
                        <div style={{width: `${percentage}%`, background: 'var(--brand-accent)', height: '100%', borderRadius: '4px'}}></div>
                     </div>
                  </div>
                );
             })}
             {Object.keys(categories).length === 0 && <p style={{fontSize: '13px', color: '#64748b'}}>No categories available yet.</p>}
          </div>
        </div>
        
        <div style={{width: '350px', background: 'white', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--border-light)'}}>
          <h3 style={{fontSize: '16px', fontWeight: 600, marginBottom: '1.5rem'}}>Status Breakdown</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
             {[
               { label: 'Pending', count: pendingCount, color: '#ea580c' },
               { label: 'In Progress', count: inProgressCount, color: '#3b82f6' },
               { label: 'Review Pending', count: reviewCount, color: '#9333ea' },
               { label: 'Resolved', count: resolvedCount, color: '#16a34a' }
             ].map((status, idx) => {
                const percentage = allIssues.length ? Math.round((status.count / allIssues.length) * 100) : 0;
                return (
                  <div key={idx}>
                     <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px'}}>
                        <span style={{fontWeight: 500}}>{status.label}</span>
                        <span style={{color: '#64748b'}}>{status.count}</span>
                     </div>
                     <div style={{width: '100%', background: '#f1f5f9', height: '8px', borderRadius: '4px', overflow: 'hidden'}}>
                        <div style={{width: `${percentage}%`, background: status.color, height: '100%', borderRadius: '4px'}}></div>
                     </div>
                  </div>
                );
             })}
          </div>
        </div>

      </div>
    </div>
  );
}
