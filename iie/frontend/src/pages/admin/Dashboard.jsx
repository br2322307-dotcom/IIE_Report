import { useState, useEffect } from 'react';
import StatCard from '../../components/admin/StatCard';
import IssuesTable from '../../components/admin/IssuesTable';
import IssueDetailsPanel from '../../components/admin/IssueDetailsPanel';

export default function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchIssues = () => {
    fetch('/api/admin/dashboard', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setIssues(data.issues || []);
      });
  };

  const fetchPendingUsers = () => {
    fetch('/api/admin/pending_users', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setPendingUsers(data.pending_users || []);
      });
  };

  useEffect(() => {
    fetchIssues();
    fetchPendingUsers();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    await fetch(`/api/issues/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: newStatus })
    });
    fetchIssues();
    if (selectedIssue && selectedIssue.id === id) {
       setSelectedIssue({...selectedIssue, status: newStatus});
    }
  };

  const handleApproval = async (id, action) => {
    await fetch(`/api/admin/approve_user/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action })
    });
    fetchPendingUsers();
  };

  const pendingCount = issues.filter(issue => issue.status === 'Pending' || !issue.status).length;
  const inProgressCount = issues.filter(issue => issue.status === 'In Progress').length;
  const resolvedCount = issues.filter(issue => issue.status === 'Resolved').length;

  return (
    <>
      <div className="dashboard-content">
        <div className="stats-grid">
          <StatCard title="Total Issues" value={issues.length} subtitle="↑ 12% from last week" type="total" />
          <StatCard title="Pending Review" value={pendingCount} subtitle="↑ 3 new today" type="pending" />
          <StatCard title="In Progress" value={inProgressCount} subtitle="~ 2 updated" type="progress" />
          <StatCard title="Resolved" value={resolvedCount} subtitle="↑ 5 this week" type="resolved" />
        </div>

        {/* If there are pending users, we can just show them here for now */}
        {pendingUsers.length > 0 && (
          <div className="issues-container" style={{marginBottom: '1rem', padding: '1rem'}}>
            <h3 style={{marginBottom: '1rem'}}>Pending User Approvals</h3>
            <div style={{display:'flex', gap:'1rem', flexWrap: 'wrap'}}>
               {pendingUsers.map(u => (
                 <div key={u.id} style={{border: '1px solid #e2e8f0', padding: '1rem', borderRadius: '8px'}}>
                    <strong>{u.first_name} {u.last_name}</strong> - {u.role}
                    <div style={{marginTop:'0.5rem'}}>
                       <button onClick={() => handleApproval(u.id, 'approve')} style={{background:'#10b981', color:'white', padding:'4px 8px', borderRadius:'4px', marginRight:'4px', border:'none', cursor:'pointer'}}>Approve</button>
                       <button onClick={() => handleApproval(u.id, 'reject')} style={{background:'#ef4444', color:'white', padding:'4px 8px', borderRadius:'4px', border:'none', cursor:'pointer'}}>Reject</button>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        )}

        <IssuesTable 
          issues={issues} 
          onSelectIssue={setSelectedIssue} 
          selectedIssueId={selectedIssue?.id}
          onStatusChange={handleStatusChange}
        />
      </div>

      {selectedIssue && (
        <IssueDetailsPanel 
          issue={selectedIssue} 
          onClose={() => setSelectedIssue(null)} 
          isMobile={isMobile}
          onUpdate={() => {
            fetchIssues();
            setSelectedIssue(null);
          }}
        />
      )}
    </>
  );
}
