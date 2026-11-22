import { useState, useEffect } from 'react';
import { PieChart, Activity, FileText } from 'lucide-react';

export default function Reports() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.issues) setIssues(data.issues);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalSubmitted = issues.length;
  const totalResolved = issues.filter(i => i.status === 'Resolved').length;
  const totalPending = issues.filter(i => i.status === 'Pending' || !i.status).length;
  const totalInProgress = issues.filter(i => i.status === 'In Progress').length;
  const totalReview = issues.filter(i => i.status === 'Review Pending').length;

  return (
    <div className="dashboard-content">
      <div className="issues-header" style={{ marginBottom: '2rem' }}>
        <h2>Reports & Analytics</h2>
        <p className="text-muted">Overview of all system statistics and math.</p>
      </div>

      {loading ? (
        <p style={{ color: '#94a3b8' }}>Calculating stats...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#eff6ff', color: '#3b82f6', padding: '12px', borderRadius: '12px' }}>
              <FileText size={24} />
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, margin: 0 }}>Total Submitted</p>
              <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0 0 0', color: '#0f172a' }}>{totalSubmitted}</h3>
            </div>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#dcfce7', color: '#16a34a', padding: '12px', borderRadius: '12px' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, margin: 0 }}>Total Resolved</p>
              <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0 0 0', color: '#0f172a' }}>{totalResolved}</h3>
            </div>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#fef3c7', color: '#d97706', padding: '12px', borderRadius: '12px' }}>
              <Activity size={24} />
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, margin: 0 }}>Pending</p>
              <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0 0 0', color: '#0f172a' }}>{totalPending}</h3>
            </div>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ background: '#ede9fe', color: '#8b5cf6', padding: '12px', borderRadius: '12px' }}>
              <PieChart size={24} />
            </div>
            <div>
              <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 600, margin: 0 }}>In Progress</p>
              <h3 style={{ fontSize: '24px', fontWeight: 700, margin: '4px 0 0 0', color: '#0f172a' }}>{totalInProgress + totalReview}</h3>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}

const CheckCircle = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);
