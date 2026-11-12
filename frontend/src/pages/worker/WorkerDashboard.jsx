import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, CheckCircle, Clock, MapPin, AlertCircle, FileText, Mic } from 'lucide-react';

export default function WorkerDashboard({ user, setUser }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchTasks = () => {
    setLoading(true);
    fetch('/api/worker/tasks', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.tasks) setTasks(data.tasks);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      // Optimistic UI update
      setTasks(prev => prev.map(t => t._id === taskId || t.id === taskId ? { ...t, status: newStatus } : t));
      
      const res = await fetch(`/api/worker/tasks/${taskId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });
      if (!res.ok) {
        // Revert on failure
        fetchTasks();
      }
    } catch (e) {
      console.error(e);
      fetchTasks();
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    navigate('/');
    setTimeout(() => setUser(null), 100);
  };

  const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;

  return (
    <div className="worker-layout">
      {/* Mobile Header with gradient/dark style */}
      <div className="worker-header">
        <div>
          <h2>Hi, {user?.name?.split(' ')[0] || 'Worker'}! 👋</h2>
          <p>{user?.category} Department</p>
        </div>
        <button className="worker-logout-btn" onClick={handleLogout}>
          <LogOut size={16} /> Exit
        </button>
      </div>

      <div className="worker-content">
        {/* Floating Stats Card */}
        <div className="worker-stats-card">
          <div className="stat-item">
            <div className="stat-value">{pendingTasks}</div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-value">{completedTasks}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <div className="stat-value">{tasks.length}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b' }}>Your Tasks</h3>
          {loading && <span style={{ fontSize: '12px', color: '#94a3b8' }}>Refreshing...</span>}
        </div>
        
        {tasks.length === 0 && !loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8', background: 'white', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
            <CheckCircle size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.3, color: '#10b981' }} />
            <h4 style={{ color: '#475569', marginBottom: '8px' }}>All caught up!</h4>
            <p style={{ fontSize: '14px' }}>You have no assigned tasks right now.</p>
          </div>
        ) : (
          <div className="worker-tasks-list">
            {tasks.map((task, index) => (
              <div 
                key={task._id || task.id} 
                className="worker-task-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="worker-task-header">
                  <h4 className="worker-task-title">{task.title}</h4>
                  <span style={{ 
                    fontSize: '11px', padding: '4px 10px', borderRadius: '12px', fontWeight: 600, whiteSpace: 'nowrap',
                    backgroundColor: task.status === 'Completed' ? '#dcfce7' : (task.status === 'In Progress' ? '#dbeafe' : '#fef9c3'), 
                    color: task.status === 'Completed' ? '#16a34a' : (task.status === 'In Progress' ? '#2563eb' : '#ca8a04') 
                  }}>
                    {task.status || 'Assigned'}
                  </span>
                </div>
                
                {task.image_url && (
                  <img src={task.image_url} alt="Task Issue" className="worker-task-image" />
                )}
                
                <p className="worker-task-desc">{task.description}</p>
                
                {task.voice_note_url && (
                  <div style={{ marginBottom: '16px', padding: '12px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mic size={14} color="#ef4444" /> Voice Message from Admin
                    </p>
                    <audio src={task.voice_note_url} controls style={{ width: '100%', height: '36px' }} />
                  </div>
                )}
                
                <div className="worker-task-meta">
                  <span className="worker-meta-tag"><MapPin size={14} /> {task.location}</span>
                  <span className="worker-meta-tag priority"><AlertCircle size={14} /> {task.priority || 'Medium'}</span>
                  {task.created_at && (
                    <span className="worker-meta-tag"><FileText size={14} /> {new Date(task.created_at).toLocaleDateString()}</span>
                  )}
                </div>
                
                <div className="worker-task-actions">
                  {(task.status === 'Assigned' || task.status === 'Pending') && (
                    <button className="worker-btn worker-btn-primary" onClick={() => handleUpdateStatus(task._id || task.id, 'In Progress')}>
                      <Clock size={18} /> Start Task
                    </button>
                  )}
                  {task.status === 'In Progress' && (
                    <button className="worker-btn worker-btn-success" onClick={() => handleUpdateStatus(task._id || task.id, 'Completed')}>
                      <CheckCircle size={18} /> Mark Done
                    </button>
                  )}
                  {task.status === 'Completed' && (
                    <button className="worker-btn worker-btn-disabled" disabled>
                      <CheckCircle size={18} /> Completed
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
