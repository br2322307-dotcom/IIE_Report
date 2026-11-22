import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

export default function MyReports() {
  const [myIssues, setMyIssues] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [filterPriority, setFilterPriority] = useState('All Priorities');

  const fetchIssues = () => {
    fetch('/api/student/dashboard', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setMyIssues(data.my_issues || []))
      .catch(err => {
        console.error(err);
        setMyIssues([]);
      });
  };

  useEffect(() => { fetchIssues(); }, []);

  const handleDelete = async (id) => {
    if(window.confirm('Delete?')) {
      await fetch(`/api/issues/${id}`, { method: 'DELETE', credentials: 'include' });
      fetchIssues();
    }
  };

  const handleVerify = async (id, action) => {
    await fetch(`/api/issues/${id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action })
    });
    fetchIssues();
  };

  const getStatusClass = (status) => {
    const s = status ? status.toLowerCase() : 'pending';
    if(s.includes('pending')) return 'status-pending';
    if(s.includes('progress')) return 'status-in-progress';
    if(s.includes('review')) return 'status-review';
    if(s.includes('resolve')) return 'status-resolved';
    return 'status-pending';
  };

  const issuesList = Array.isArray(myIssues) ? myIssues : [];
  const filteredIssues = issuesList.filter(issue => {
    const matchesSearch = !searchQuery || 
      (issue.title && issue.title.toLowerCase().includes(searchQuery.toLowerCase())) || 
      (issue.description && issue.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = filterCategory === 'All Categories' || (issue.category || '').toLowerCase() === filterCategory.toLowerCase();
    const matchesStatus = filterStatus === 'All Status' || (issue.status || 'Pending').toLowerCase() === filterStatus.toLowerCase();
    const matchesPriority = filterPriority === 'All Priorities' || (issue.priority || 'Medium').toLowerCase() === filterPriority.toLowerCase();
    
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  return (
    <div className="dashboard-scroll-area">
      <div style={{background: 'white', borderRadius: '12px', border: '1px solid var(--border-light)', padding: '1.5rem', minHeight: 'calc(100vh - 120px)'}}>
         
         <div className="filters-row">
             <select className="filter-dropdown" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                <option>All Categories</option>
                <option value="electrical">Electrical</option>
                <option value="plumbing">Plumbing</option>
                <option value="furniture">Furniture</option>
                <option value="cleaning">Cleaning</option>
                <option value="other">Other</option>
             </select>
             <select className="filter-dropdown" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                <option>All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
             </select>
             <select className="filter-dropdown" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option>All Status</option>
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="resolved">Resolved</option>
             </select>
            
            <div style={{marginLeft: 'auto', position: 'relative'}}>
               <Search size={16} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8'}} />
               <input type="text" placeholder="Search your reports..." style={{padding: '8px 16px 8px 36px', border: '1px solid var(--border-light)', borderRadius: '8px', fontSize: '13px', width: '250px'}} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
         </div>

         <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            {filteredIssues.map(issue => (
               <div key={issue._id || issue.id} style={{border: '1px solid var(--border-light)', borderRadius: '12px', padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
                  <div>
                    {issue.image_url ? 
                      <img src={issue.image_url} alt="Issue" style={{width: '90px', height: '90px', borderRadius: '8px', objectFit: 'cover'}} /> :
                      <div style={{width: '90px', height: '90px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '12px'}}>No Img</div>
                    }
                  </div>
                  <div style={{flex: 1}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem'}}>
                       <div>
                          <span style={{fontSize: '12px', color: '#94a3b8'}}>#REP-{(issue.id || '').slice(-6).toUpperCase()}</span>
                          <h4 style={{fontSize: '18px', fontWeight: 600, marginTop: '4px'}}>{issue.title}</h4>
                       </div>
                       <span className={`badge-modern ${getStatusClass(issue.status)}`}>{issue.status || 'Pending'}</span>
                    </div>
                    
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                       <div style={{display: 'flex', gap: '2rem', fontSize: '13px', color: '#64748b'}}>
                          <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><span style={{color: '#f59e0b'}}>●</span> {issue.category}</span>
                          <span>📍 {issue.location || 'Not recorded'}</span>
                          <span>📅 {issue.created_at ? new Date(issue.created_at).toISOString().split('T')[0] : ''}</span>
                       </div>
                       <div style={{display: 'flex', gap: '8px'}}>
                          {issue.status === 'Review Pending' && (
                             <>
                               <button onClick={() => handleVerify(issue.id, 'confirm')} style={{background: '#16a34a', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer'}}>Confirm</button>
                               <button onClick={() => handleVerify(issue.id, 'reject')} style={{background: '#ef4444', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer'}}>Reject</button>
                             </>
                          )}
                          
                          <button onClick={() => handleDelete(issue.id || issue._id)} style={{background: '#fff1f2', color: '#e11d48', border: '1px solid #fda4af', padding: '6px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer'}}>Delete</button>
                       </div>
                    </div>
                  </div>
               </div>
            ))}
            {filteredIssues.length === 0 && <p style={{color: '#64748b', textAlign: 'center', padding: '2rem'}}>No reports found.</p>}
         </div>
      </div>
    </div>
  );
}
