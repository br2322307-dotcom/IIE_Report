import { Search, Filter, Plus } from 'lucide-react';

export default function IssuesTable({ issues, onSelectIssue, selectedIssueId, onStatusChange }) {
  
  const getPriorityBadge = (priority) => {
    if (!priority) return <span className="badge priority-medium">Medium</span>;
    return <span className={`badge priority-${priority.toLowerCase()}`}>{priority}</span>;
  };
  
  const getStatusBadge = (status) => {
    const s = status || 'Pending';
    const cleanStatus = s.toLowerCase().replace(/\s+/g, '-');
    return <span className={`status-badge status-${cleanStatus}`}>{s}</span>;
  };

  return (
    <div className="issues-container">
      <div className="issues-header">
        <h2>Recent Issues</h2>
        <button className="btn-primary hidden md:flex"><Plus size={16}/> Add Issue</button>
        <button className="btn-primary-icon md:hidden"><Plus size={20}/></button>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <Search size={16} className="text-gray-400" />
          <input type="text" placeholder="Search issues..." />
        </div>
        
        <div className="select-filters hidden md:flex">
          <select><option>All Categories</option></select>
          <select><option>All Status</option></select>
          <select><option>All Priority</option></select>
        </div>

        <button className="filter-btn md:hidden">
          <Filter size={18} />
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="table-responsive hidden md:block">
        <table className="admin-table">
          <thead>
            <tr>
                            <th>Title & Description</th>
              <th>Category</th>
              <th>Location</th>
              <th>Reporter</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {issues.length > 0 ? issues.map((issue) => (
              <tr 
                key={issue.id} 
                className={selectedIssueId === issue.id ? 'selected-row' : ''}
                onClick={() => onSelectIssue(issue)}
                style={{cursor: 'pointer'}}
              >
                                <td>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0}}>
                    {issue.image_url ? 
                      <img src={issue.image_url} style={{width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0}} alt="thumb"/> : 
                      <div style={{width: '40px', height: '40px', borderRadius: '8px', background: '#f1f5f9', flexShrink: 0}} />
                    }
                    <div style={{overflow: 'hidden', minWidth: 0, maxWidth: '250px'}}>
                      <div className="fw-600" style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{issue.title}</div>
                      <div className="text-xs text-muted" style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>{issue.description}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="category-pill">
                    {issue.category?.replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </td>
                <td>{issue.location}</td>
                <td>
                  <div>{issue.reporter_name || 'Anonymous'}</div>
                  <div className="text-xs text-muted">({issue.reporter_role || 'Student'})</div>
                </td>
                <td>{getPriorityBadge(issue.priority)}</td>
                <td onClick={(e) => e.stopPropagation()}>
                  {onStatusChange ? (
                    <select 
                      value={issue.status || 'Pending'} 
                      onChange={(e) => onStatusChange(issue.id || issue._id, e.target.value)}
                      style={{padding: '4px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '13px'}}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Review Pending">Review Pending</option>
                      <option value="In Progress">In Progress</option>
                      
                      <option value="Rejected">Rejected</option>
                    </select>
                  ) : (
                    getStatusBadge(issue.status)
                  )}
                </td>
                <td className="text-muted">{issue.assigned_to || '-'}</td>
                <td className="text-muted text-sm">{(issue.created_at || '').substring(0, 10) || '-'}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="8" className="text-center py-8 text-muted">No issues found.</td>
              </tr>
            )}
          </tbody>
        </table>
        
        <div className="pagination">
          <span className="text-sm text-muted">Showing 1 to {Math.min(8, issues.length)} of {issues.length} issues</span>
          <div className="page-controls">
            <button>&laquo;</button>
            <button>&lt;</button>
            <button className="active">1</button>
            <button>2</button>
            <button>3</button>
            <button>&gt;</button>
            <button>&raquo;</button>
          </div>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="mobile-cards-view md:hidden">
        {issues.length > 0 ? issues.map((issue) => (
          <div key={issue.id} className="mobile-issue-card" onClick={() => onSelectIssue(issue)}>
            <div className="card-image-placeholder">
              {issue.image_url ? 
                 <img src={issue.image_url} alt="Issue" style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px'}} /> :
                 <div style={{width: '60px', height: '60px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#94a3b8'}}>No Img</div>
              }
            </div>
            <div className="card-content">
              <h4 className="card-title">{issue.title}</h4>
                            <p className="card-meta"><span className="pin-icon">📍</span> {issue.location}</p>
              <div className="card-badges">
                {getPriorityBadge(issue.priority)}
                {getStatusBadge(issue.status)}
              </div>
            </div>
            <div className="card-arrow">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
            </div>
          </div>
        )) : (
          <div className="text-center py-8 text-muted">No issues found.</div>
        )}
      </div>
    </div>
  );
}
