import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard({ user, setUser }) {
  // --- STATE VARIABLES ---
  // Stores all issues fetched from the database for the public board
  const [allIssues, setAllIssues] = useState([]);
  // Stores only the issues created by this logged-in student
  const [myIssues, setMyIssues] = useState([]);
  
  // Controls whether the "Report New Issue" popup modal is visible
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  // Controls whether the "My Issues" popup modal is visible
  const [isMyIssuesModalOpen, setIsMyIssuesModalOpen] = useState(false);
  
  const navigate = useNavigate();

  // --- FORM STATE ---
  // These variables store what the student types when reporting a new issue
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('electrical');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState(null);

  // No dynamic CSS loading needed as we are using a global index.css

  // --- DATA FETCHING ---
  // This function requests the latest issue data from the Flask API
  const fetchIssues = () => {
    fetch('/api/student/dashboard', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        // Update the React state with the fresh data from the database.
        // React will automatically re-render the tables below instantly!
        setAllIssues(data.all_issues || []);
        setMyIssues(data.my_issues || []);
      });
  };

  // Run fetchIssues() exactly once when the dashboard first loads
  useEffect(() => {
    fetchIssues();
  }, []);

  // --- EVENT HANDLERS ---

  // Called when the user clicks "Sign out"
  const handleLogout = async (e) => {
    e.preventDefault();
    // Tell the backend to clear the session cookie
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    
    // First, navigate back to the Home page
    navigate('/'); 
    
    // Defer clearing the user state slightly to ensure the router 
    // has already transitioned to the Home page. This prevents 
    // the protected route from redirecting us to the Login page.
    setTimeout(() => {
      setUser(null); 
    }, 100);
  };

  // Called when the student submits the "Report New Issue" form
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page refresh
    
    // Send the form data to the Flask backend
    await fetch('/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ title, category, priority, description, location })
    });
    
    // Clear the form fields after successful submission
    setTitle('');
    setDescription('');
    setLocation('');
    setImage(null);
    
    // Close the popup modal
    setIsIssueModalOpen(false);
    
    // Refetch the data so the new issue instantly appears in the table!
    fetchIssues();
  };

  // Called when a student deletes their own issue
  const handleDelete = async (id) => {
    // Show a browser confirmation popup first
    if(window.confirm('Are you sure you want to delete this issue?')) {
      // Send a DELETE request to the API
      await fetch(`/api/issues/${id}`, { method: 'DELETE', credentials: 'include' });
      // Refresh the table
      fetchIssues();
    }
  };

  // Called when a student clicks "Yes, Fixed" or "Not Fixed"
  const handleVerify = async (id, action) => {
    await fetch(`/api/issues/${id}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action }) // Action will be either 'confirm' or 'reject'
    });
    // Refresh the table to see the updated status
    fetchIssues();
  };

  // Helper function to figure out the correct CSS class for a status badge
  const getStatusClass = (status) => {
    if (!status) return 'status-open';
    // Replaces spaces with hyphens (e.g. "In Progress" becomes "status-in-progress")
    return `status-${status.toLowerCase().replace(' ', '-')}`;
  };
  
  // Helper function to figure out the correct CSS class for a priority badge
  const getPriorityClass = (priority) => {
    if (!priority) return 'priority-medium';
    return `priority-${priority.toLowerCase()}`;
  };

  return (
    <div className="dashboard-page-container">
      {/* Exact HTML Structure from templates/student/dashboard.html */}
      <header className="app-header">
          <div className="header-content">
              <h2>Student Workspace</h2>
              <p>Welcome back, {user.name} • ID: {user.user_id}</p>
          </div>
          {/* We use an onClick handler here for the logout action */}
          <a href="#" onClick={handleLogout} className="logout-btn">Sign out</a>
      </header>

      <main className="workspace-main">
          
          <div className="stats-grid">
              <div className="stat-card">
                  <h4>Campus Total Reports</h4>
                  {/* Instantly updates based on the length of the allIssues array */}
                  <p>{allIssues.length}</p>
              </div>
              <div className="stat-card">
                  <h4>My Total Reports</h4>
                  <p>{myIssues.length}</p>
              </div>
          </div>

          <div className="action-bar">
              <h3>Campus Public Board</h3>
              <div className="btn-group">
                  {/* Clicking this changes the state to true, which unhides the modal below */}
                  <button className="secondary-btn" onClick={() => setIsMyIssuesModalOpen(true)}>My Issues</button>
                  <button className="primary-btn" onClick={() => setIsIssueModalOpen(true)}>+ Report Issue</button>
              </div>
          </div>

          <div className="data-card">
              <table>
                  <thead>
                      <tr>
                          <th>Sl No.</th>
                          <th>Title & Description</th>
                          <th>Category</th>
                          <th>Priority</th>
                          <th>Status</th>
                          <th>Date</th>
                      </tr>
                  </thead>
                  <tbody>
                      {/* We use a ternary operator here. 
                          If allIssues has data, we map over it and create a <tr> for each issue. 
                          If it's empty, we show the "No Issues Yet" message block. */}
                      {allIssues.length > 0 ? allIssues.map((issue, index) => (
                      // Every dynamically rendered list item in React needs a unique 'key'
                      <tr key={issue.id}>
                          <td data-label="Sl No." style={{fontWeight: 600}}>{index + 1}</td>
                          <td data-label="Title & Description">
                              <div className="issue-title">{issue.title}</div>
                              <div style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px'}}>{issue.description}</div>
                          </td>
                          <td data-label="Category" className="category-text">
                              {issue.category?.replace(/\b\w/g, l => l.toUpperCase())}
                          </td>
                          <td data-label="Priority">
                              <span className={`badge ${getPriorityClass(issue.priority)}`}>{issue.priority}</span>
                          </td>
                          <td data-label="Status">
                              <span className={`status-badge ${getStatusClass(issue.status)}`}>{issue.status || 'Open'}</span>
                          </td>
                          <td data-label="Date" className="date-text">{(issue.created_at || '').substring(0,10)}</td>
                      </tr>
                      )) : (
                      // Empty state when there are no issues
                      <tr>
                          <td colSpan="6" style={{textAlign: 'center', padding: '3rem', color: 'var(--text-muted)', display: 'block'}}>
                              <svg style={{marginBottom: '12px', color: '#cbd5e1'}} width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                              <div style={{fontWeight: 500, fontSize: '0.95rem', color: '#64748b'}}>No Issues Yet</div>
                              <div style={{fontSize: '0.8125rem', marginTop: '4px'}}>The campus board is currently clear.</div>
                          </td>
                      </tr>
                      )}
                  </tbody>
              </table>
          </div>
      </main>

      {/* --- MODAL 1: Report New Issue --- */}
      {/* We apply the 'active' class if isIssueModalOpen is true. We also allow closing it by clicking the background overlay. */}
      <div className={`modal-overlay ${isIssueModalOpen ? 'active' : ''}`} id="issueModal" onClick={(e) => { if(e.target.id === 'issueModal') setIsIssueModalOpen(false) }}>
          <div className="modal-content">
              <div className="modal-header">
                  <h3>Submit New Issue</h3>
                  {/* Button to manually close the modal */}
                  <button type="button" className="close-btn" onClick={() => setIsIssueModalOpen(false)}>&times;</button>
              </div>
              <form onSubmit={handleSubmit}>
                  <div className="form-group">
                      <label>Issue Title</label>
                      {/* React Controlled Input: We bind value={title} to the state, and update the state when the user types */}
                      <input type="text" name="title" className="form-control" placeholder="Brief summary of the issue..." required value={title} onChange={e=>setTitle(e.target.value)} />
                  </div>

                  <div className="form-group">
                      <label>Location</label>
                      <input type="text" name="location" className="form-control" placeholder="E.g. Room 101, Main Building..." required value={location} onChange={e=>setLocation(e.target.value)} />
                  </div>
                  
                  <div className="form-group" style={{display: 'flex', gap: '12px'}}>
                      <div style={{flex: 1}}>
                          <label>Category</label>
                          <select name="category" className="form-control" required value={category} onChange={e=>setCategory(e.target.value)}>
                              <option value="electrical">Electrical Issue</option>
                              <option value="plumbing">Plumbing/Water</option>
                              <option value="cleaning">Cleaning/Hygiene</option>
                              <option value="wifi">Wi-Fi/Network</option>
                              <option value="furniture">Classroom Furniture</option>
                              <option value="lab">Lab Equipment</option>
                              <option value="sports">Sports Equipment</option>
                              <option value="students">Internal Student Issue</option>
                              <option value="other">Other</option>
                          </select>
                      </div>
                      <div style={{flex: 1}}>
                          <label>Priority</label>
                          <select name="priority" className="form-control" required value={priority} onChange={e=>setPriority(e.target.value)}>
                              <option value="High">High (Urgent)</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                          </select>
                      </div>
                  </div>

                  <div className="form-group">
                      <label>Detailed Description</label>
                      <textarea name="description" className="form-control" rows="4" placeholder="Explain the problem in detail..." required value={description} onChange={e=>setDescription(e.target.value)}></textarea>
                  </div>
                  
                  <div className="form-group">
                      <label>Image Upload (Optional)</label>
                      <input type="file" name="image" className="form-control" accept="image/*" onChange={e=>setImage(e.target.files[0])} style={{padding: '8px'}} />
                  </div>
                  
                  <button type="submit" className="submit-btn">Submit Report</button>
              </form>
          </div>
      </div>

      {/* --- MODAL 2: My Issues Management --- */}
      <div className={`modal-overlay ${isMyIssuesModalOpen ? 'active' : ''}`} id="myIssuesModal" onClick={(e) => { if(e.target.id === 'myIssuesModal') setIsMyIssuesModalOpen(false) }}>
          <div className="modal-content modal-wide">
              <div className="modal-header">
                  <h3>My Reported Issues</h3>
                  <button type="button" className="close-btn" onClick={() => setIsMyIssuesModalOpen(false)}>&times;</button>
              </div>
              
              <div style={{borderRadius: '8px', border: '1px solid var(--border-light)', overflow: 'hidden'}}>
                  <table style={{margin: 0, width: '100%'}}>
                      <thead>
                          <tr>
                              <th>Sl No.</th>
                              <th>Issue Title</th>
                              <th>Priority</th>
                              <th>Status</th>
                              <th>Action</th>
                          </tr>
                      </thead>
                      <tbody>
                          {/* Loop through the 'myIssues' array to build this table */}
                          {myIssues.length > 0 ? myIssues.map((issue, index) => (
                          <tr key={issue.id}>
                              <td data-label="Sl No." style={{fontWeight: 600}}>{index + 1}</td>
                              <td data-label="Issue Title" className="issue-title">
                                  {issue.title}
                                  <div className="token-id" style={{marginTop: '4px', display: 'block', width: 'fit-content'}}>Token: #{issue.id}</div>
                              </td>
                              <td data-label="Priority">
                                  <span className={`badge ${getPriorityClass(issue.priority)}`}>{issue.priority}</span>
                              </td>
                              <td data-label="Status">
                                  <span className={`status-badge ${getStatusClass(issue.status)}`}>{issue.status || 'Open'}</span>
                              </td>
                              <td data-label="Action">
                                  <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                                      {/* Only show the Verify buttons if the status is exactly 'Review Pending' */}
                                      {issue.status === 'Review Pending' && (
                                        <>
                                          <button onClick={() => handleVerify(issue.id, 'confirm')} className="action-btn-sm btn-yes">Yes, Fixed</button>
                                          <button onClick={() => handleVerify(issue.id, 'reject')} className="action-btn-sm btn-no">Not Fixed</button>
                                        </>
                                      )}
                                      <button onClick={() => handleDelete(issue.id)} className="action-btn-sm btn-del">Delete</button>
                                  </div>
                              </td>
                          </tr>
                          )) : (
                          // Empty state if the student hasn't reported anything
                          <tr>
                              <td colSpan="5" style={{textAlign: 'center', padding: '2rem', color: 'var(--text-muted)'}}>
                                  You haven't reported any issues yet.
                              </td>
                          </tr>
                          )}
                      </tbody>
                  </table>
              </div>
          </div>
      </div>
    </div>
  );
}
