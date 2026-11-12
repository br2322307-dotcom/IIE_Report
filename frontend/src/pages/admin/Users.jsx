import { useState, useEffect } from 'react';
import { User, Users as UsersIcon, BookOpen, Trash2, Plus } from 'lucide-react';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Add User State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', user_id: '', password: '', role: 'student' });

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/admin/users', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.users) setUsers(data.users);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this user?")) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE', credentials: 'include' });
    if (res.ok) fetchUsers();
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/admin/add_user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      setShowAddForm(false);
      setFormData({ name: '', user_id: '', password: '', role: 'student' });
      fetchUsers();
    } else {
      const error = await res.json();
      alert(error.error || "Failed to add user");
    }
  };

  // Case insensitive filter just in case
  const students = users.filter(u => u.role?.toLowerCase() === 'student');
  const faculties = users.filter(u => u.role?.toLowerCase() === 'faculty');

  const UserCard = ({ user }) => (
    <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center', position: 'relative' }}>
      <button onClick={() => handleDelete(user.id || user._id)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' }}>
        <Trash2 size={16} />
      </button>
      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '16px', fontWeight: 'bold' }}>
        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
      </div>
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '15px', fontWeight: 600, margin: '0 0 4px 0' }}>{user.name}</h4>
        <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <User size={12} /> {user.student_id || user.user_id || 'ID not provided'}
        </div>
      </div>
      <div style={{ marginRight: '24px' }}>
        <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: user.role?.toLowerCase() === 'student' ? '#dcfce7' : '#e0e7ff', color: user.role?.toLowerCase() === 'student' ? '#16a34a' : '#4f46e5', fontWeight: 600, textTransform: 'uppercase' }}>
          {user.role}
        </span>
      </div>
    </div>
  );

  return (
    <div className="dashboard-content">
      <div className="issues-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Students & Faculty</h2>
          <p className="text-muted">Manage all academic users in the system.</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}>
          <Plus size={18} /> Add User
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddSubmit} style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Name</label>
            <input required placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>User ID</label>
            <input required placeholder="ID / Email" value={formData.user_id} onChange={e => setFormData({...formData, user_id: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Password</label>
            <input required type="password" placeholder="***" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Role</label>
            <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} style={{ width: '100%', padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>
          </div>
          <button type="submit" style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', height: '37px' }}>Save User</button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Left Side: Students */}
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', color: '#0f172a' }}>
            <UsersIcon size={20} color="#3b82f6" /> Students ({students.length})
          </h3>
          {loading ? (
            <p style={{ color: '#94a3b8' }}>Loading...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {students.length > 0 ? students.map(student => (
                <UserCard key={student.id || student._id} user={student} />
              )) : <p style={{ color: '#94a3b8' }}>No students found.</p>}
            </div>
          )}
        </div>

        {/* Right Side: Faculties */}
        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', color: '#0f172a' }}>
            <BookOpen size={20} color="#8b5cf6" /> Faculties ({faculties.length})
          </h3>
          {loading ? (
            <p style={{ color: '#94a3b8' }}>Loading...</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {faculties.length > 0 ? faculties.map(faculty => (
                <UserCard key={faculty.id || faculty._id} user={faculty} />
              )) : <p style={{ color: '#94a3b8' }}>No faculties found.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
