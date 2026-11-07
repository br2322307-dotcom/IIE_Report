import { useState, useEffect } from 'react';
import { Mail, Settings, Trash2, Plus } from 'lucide-react';

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Add Worker State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', user_id: '', password: '', category: '' });

  const fetchWorkers = () => {
    setLoading(true);
    fetch('/api/workers')
      .then(res => res.json())
      .then(data => {
        if (data.workers) setWorkers(data.workers);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWorkers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this worker?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) fetchWorkers();
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/admin/add_worker', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      setShowAddForm(false);
      setFormData({ name: '', user_id: '', password: '', category: '' });
      fetchWorkers();
    } else {
      const error = await res.json();
      alert(error.error || "Failed to add worker");
    }
  };

  return (
    <div className="dashboard-content">
      <div className="issues-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Workers Directory</h2>
          <p className="text-muted">List of all available workers in the system.</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}>
          <Plus size={18} /> Add Worker
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddSubmit} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Name</label>
            <input required placeholder="Worker Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>User ID</label>
            <input required placeholder="worker123" value={formData.user_id} onChange={e => setFormData({...formData, user_id: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Password</label>
            <input required type="password" placeholder="***" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Category</label>
            <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <option value="">Select Dept</option>
              <option value="Electrical">Electrical</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Furniture">Furniture</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', height: '37px' }}>Save Worker</button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {loading ? (
          <div style={{ color: '#94a3b8' }}>Loading workers...</div>
        ) : workers.length > 0 ? (
          workers.map((worker) => (
            <div key={worker.id || worker._id} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
              <button onClick={() => handleDelete(worker.id || worker._id)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                <Trash2 size={18} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '20px', fontWeight: 'bold' }}>
                  {worker.name ? worker.name.charAt(0).toUpperCase() : 'W'}
                </div>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px 0' }}>{worker.name}</h4>
                  <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: '#e0e7ff', color: '#4f46e5', fontWeight: 500 }}>
                    {worker.role || 'Worker'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                  <Mail size={14} color="#94a3b8" />
                  {worker.student_id || worker.user_id || 'N/A'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#475569' }}>
                  <Settings size={14} color="#94a3b8" />
                  {worker.category || 'General'} Department
                </div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ color: '#94a3b8' }}>No workers found.</div>
        )}
      </div>
    </div>
  );
}
