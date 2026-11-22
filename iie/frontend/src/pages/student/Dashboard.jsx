import { useState, useEffect } from 'react';
import { Search, FileText, Clock, Settings, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function Dashboard({ user }) {
  const [allIssues, setAllIssues] = useState([]);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [filterStatus, setFilterStatus] = useState('All Status');
  const [filterPriority, setFilterPriority] = useState('All Priorities');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('electrical');
  const [priority, setPriority] = useState('Medium');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  
  const fetchIssues = () => {
    fetch('/api/student/dashboard', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setAllIssues(data.all_issues || []))
      .catch(console.error);
  };

  useEffect(() => { fetchIssues(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);
    
    try {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('category', category);
        formData.append('priority', priority);
        formData.append('description', description);
        formData.append('location', location);
        if (imageFile) {
            formData.append('image', imageFile);
        }

        const res = await fetch('/api/issues', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });
        
        if (!res.ok) {
            let errorMsg = 'Failed to submit issue.';
            try {
                const errData = await res.json();
                if (errData && errData.error) {
                    errorMsg = errData.error;
                }
            } catch (e) {
                console.error("Error parsing response", e);
            }
            setFormError(errorMsg);
        } else {
            setIsIssueModalOpen(false);
            setTitle(''); setDescription(''); setLocation(''); setImageFile(null);
            fetchIssues();
        }
    } finally {
        setIsSubmitting(false);
    }
  };

  const getStatusClass = (status) => {
    const s = status ? status.toLowerCase() : 'pending';
    if(s.includes('pending')) return 'status-pending';
    if(s.includes('progress')) return 'status-in-progress';
    if(s.includes('review')) return 'status-review';
    if(s.includes('resolve')) return 'status-resolved';
    return 'status-pending';
  };

  const issuesList = Array.isArray(allIssues) ? allIssues : [];
  const pendingCount = issuesList.filter(i => i.status === 'Pending' || !i.status).length;
  const inProgressCount = issuesList.filter(i => i.status === 'In Progress').length;
  const reviewCount = issuesList.filter(i => i.status === 'Review Pending').length;
  const resolvedCount = issuesList.filter(i => i.status === 'Resolved').length;

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
      {/* Welcome Banner */}
      <div style={{background: 'white', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <div>
          <h2 style={{fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem'}}>Welcome back, {user?.name || 'Biman Roy'} 👋</h2>
          <p style={{color: 'var(--text-muted)'}}>Help us keep the campus better. Report any issue you notice.</p>
        </div>
        <div style={{display: 'flex', gap: '2rem', alignItems: 'center'}}>
          {/* A placeholder for the building illustration */}
          <div style={{fontSize: '3rem'}}>🏫</div>
          <button onClick={() => setIsIssueModalOpen(true)} style={{background: 'var(--brand-accent)', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s'}}>
             + Report Issue
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1.5rem', marginBottom: '2.5rem'}}>
         <div className="stat-card-modern">
            <div className="stat-icon" style={{background: '#eff6ff', color: '#3b82f6'}}><FileText size={24} /></div>
            <div>
               <p style={{color: 'var(--text-muted)', fontSize: '13px'}}>Campus Total</p>
               <h3 style={{fontSize: '24px', fontWeight: 700}}>{allIssues.length}</h3>
            </div>
         </div>
         <div className="stat-card-modern">
            <div className="stat-icon" style={{background: '#fff7ed', color: '#ea580c'}}><Clock size={24} /></div>
            <div>
               <p style={{color: 'var(--text-muted)', fontSize: '13px'}}>Pending</p>
               <h3 style={{fontSize: '24px', fontWeight: 700}}>{pendingCount}</h3>
            </div>
         </div>
         <div className="stat-card-modern">
            <div className="stat-icon" style={{background: '#eff6ff', color: '#2563eb'}}><Settings size={24} /></div>
            <div>
               <p style={{color: 'var(--text-muted)', fontSize: '13px'}}>In Progress</p>
               <h3 style={{fontSize: '24px', fontWeight: 700}}>{inProgressCount}</h3>
            </div>
         </div>
         <div className="stat-card-modern">
            <div className="stat-icon" style={{background: '#faf5ff', color: '#9333ea'}}><ShieldCheck size={24} /></div>
            <div>
               <p style={{color: 'var(--text-muted)', fontSize: '13px'}}>Review</p>
               <h3 style={{fontSize: '24px', fontWeight: 700}}>{reviewCount}</h3>
            </div>
         </div>
         <div className="stat-card-modern">
            <div className="stat-icon" style={{background: '#f0fdf4', color: '#16a34a'}}><CheckCircle2 size={24} /></div>
            <div>
               <p style={{color: 'var(--text-muted)', fontSize: '13px'}}>Resolved</p>
               <h3 style={{fontSize: '24px', fontWeight: 700}}>{resolvedCount}</h3>
            </div>
         </div>
      </div>

      {/* Recent Campus Issues Table */}
      <div style={{background: 'white', borderRadius: '12px', border: '1px solid var(--border-light)', padding: '1.5rem'}}>
         <h3 style={{fontSize: '16px', fontWeight: 600, marginBottom: '1.5rem'}}>Recent Campus Issues</h3>
         <div className="filters-row">
            <select className="filter-dropdown" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
               <option value="All Categories">All Categories</option>
               <option value="electrical">Electrical</option>
               <option value="plumbing">Plumbing</option>
               <option value="furniture">Furniture</option>
               <option value="cleaning">Cleaning</option>
               <option value="other">Other</option>
            </select>
            <select className="filter-dropdown" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
               <option value="All Priorities">All Priorities</option>
               <option value="High">High</option>
               <option value="Medium">Medium</option>
               <option value="Low">Low</option>
            </select>
            <select className="filter-dropdown" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
               <option value="All Status">All Status</option>
               <option value="Pending">Pending</option>
               <option value="In Progress">In Progress</option>
               <option value="Review Pending">Review Pending</option>
               <option value="Resolved">Resolved</option>
            </select>
            
            <div style={{marginLeft: 'auto', position: 'relative'}}>
               <Search size={16} style={{position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8'}} />
               <input type="text" placeholder="Search issues..." style={{padding: '8px 16px 8px 36px', border: '1px solid var(--border-light)', borderRadius: '8px', fontSize: '13px', width: '250px'}} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
         </div>

         <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px'}}>
            <thead>
               <tr style={{borderBottom: '1px solid var(--border-light)', color: '#64748b'}}>
                  <th style={{padding: '12px', textAlign: 'left', fontWeight: 500}}>Image</th>
                  <th style={{padding: '12px', textAlign: 'left', fontWeight: 500}}>Issue</th>
                  <th style={{padding: '12px', textAlign: 'left', fontWeight: 500}}>Category</th>
                  <th style={{padding: '12px', textAlign: 'left', fontWeight: 500}}>Priority</th>
                  <th style={{padding: '12px', textAlign: 'left', fontWeight: 500}}>Status</th>
                  <th style={{padding: '12px', textAlign: 'left', fontWeight: 500}}>Date</th>
                  <th style={{padding: '12px', textAlign: 'left', fontWeight: 500}}>Location</th>
               </tr>
            </thead>
            <tbody>
               {filteredIssues.slice(0, 10).map((issue) => (
                  <tr key={issue.id} style={{borderBottom: '1px solid #f1f5f9'}}>
                     <td style={{padding: '16px 12px'}}>
                        {issue.image_url ? 
                          <img src={issue.image_url} alt="Issue" style={{width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', cursor: 'pointer'}} onClick={() => setPreviewImage(issue.image_url)} /> :
                          <div style={{width: '50px', height: '50px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '10px'}}>No Img</div>
                        }
                     </td>
                     <td style={{padding: '16px 12px', fontWeight: 500}}>
                        <div style={{minWidth: 0, maxWidth: '250px', overflow: 'hidden'}}>
                           <div style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '14px', color: '#1e293b'}}>{issue.title}</div>
                           <div style={{whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '12px', color: '#64748b', fontWeight: 400}}>{issue.description}</div>
                        </div>
                     </td>
                     <td style={{padding: '16px 12px', color: '#64748b'}}>{issue.category}</td>
                     <td style={{padding: '16px 12px', color: '#ef4444', fontWeight: 500}}>{issue.priority}</td>
                     <td style={{padding: '16px 12px'}}>
                        <span className={`badge-modern ${getStatusClass(issue.status)}`}>{issue.status || 'Pending'}</span>
                     </td>
                     <td style={{padding: '16px 12px', color: '#64748b'}}>{issue.created_at ? new Date(issue.created_at).toISOString().split('T')[0] : ''}</td>
                     <td style={{padding: '16px 12px', color: '#64748b'}}>{issue.location}</td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
      
      {/* Enhanced Animated Modal with Image Upload UI */}
      <div className={`modal-overlay ${isIssueModalOpen ? 'active' : ''}`} onClick={(e) => { if (e.target.classList.contains('modal-overlay')) setIsIssueModalOpen(false); }}>
          <div className="modal-container">
              <div className="modal-header-dash">
                  <h3>Report an Issue</h3>
                  <button type="button" className="close-btn-dash" onClick={() => setIsIssueModalOpen(false)}>&times;</button>
              </div>
              <form onSubmit={handleSubmit}>
                  <div className="form-group-dash">
                      <label>Issue Title</label>
                      <input type="text" className="form-input-dash" placeholder="E.g. Broken projector in Lab 3" value={title} onChange={e=>setTitle(e.target.value)} required />
                  </div>
                  
                  <div className="form-row-dash">
                      <div className="form-group-dash">
                          <label>Category</label>
                          <select className="form-input-dash" value={category} onChange={e=>setCategory(e.target.value)} required>
                              <option value="electrical">Electrical</option>
                              <option value="plumbing">Plumbing</option>
                              <option value="furniture">Furniture</option>
                              <option value="cleaning">Cleaning</option>
                              <option value="other">Other</option>
                          </select>
                      </div>
                      <div className="form-group-dash">
                          <label>Priority</label>
                          <select className="form-input-dash" value={priority} onChange={e=>setPriority(e.target.value)} required>
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                          </select>
                      </div>
                      <div className="form-group-dash">
                          <label>Location</label>
                          <input type="text" className="form-input-dash" placeholder="E.g. Academic Block, 2nd Floor" value={location} onChange={e=>setLocation(e.target.value)} required />
                      </div>
                  </div>

                  <div className="form-group-dash">
                      <label>Description</label>
                      <textarea className="form-input-dash" rows="3" placeholder="Provide more details about the issue..." value={description} onChange={e=>setDescription(e.target.value)} required></textarea>
                  </div>
                  
                  <div className="form-group-dash">
                      <label>Attach Image (Optional)</label>
                      <label className="file-upload-dash">
                          <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
                          {imageFile && <p style={{color: '#16a34a', fontWeight: 600}}>Selected: {imageFile.name}</p>}
                          <span>Click to browse</span> or drag and drop
                          <p>PNG, JPG up to 5MB</p>
                      </label>
                  </div>

                  {formError && <p style={{color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '1rem'}}>{formError}</p>}
                  
                  <div style={{display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem'}}>
                      <button type="button" className="btn-cancel-dash" onClick={()=>setIsIssueModalOpen(false)}>Cancel</button>
                      <button type="submit" className="btn-submit-dash" disabled={isSubmitting}>
                          {isSubmitting ? 'Submitting...' : 'Submit Report'}
                      </button>
                  </div>
              </form>
          </div>
      </div>

      {previewImage && (
         <div className="modal-overlay active" onClick={() => setPreviewImage(null)} style={{zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)'}}>
             <div style={{maxWidth: '90%', maxHeight: '90%', position: 'relative'}} onClick={e => e.stopPropagation()}>
                 <button onClick={() => setPreviewImage(null)} style={{position: 'absolute', top: '-40px', right: '0', background: 'transparent', border: 'none', color: 'white', fontSize: '30px', cursor: 'pointer'}}>&times;</button>
                 <img src={previewImage} alt="Preview" style={{maxWidth: '100%', maxHeight: '80vh', borderRadius: '8px', objectFit: 'contain'}} />
             </div>
         </div>
      )}
    </div>
  );
}
