import { useNavigate, Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import '../../pages/AdminDashboard.css';

export default function AdminLayout({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    navigate('/'); 
    setTimeout(() => {
      setUser(null); 
    }, 100);
  };

  return (
    <div className="admin-dashboard-layout">
      <AdminSidebar user={user} handleLogout={handleLogout} />
      
      <div className="admin-main-content">
        <AdminHeader user={user} />
        
        <div className="dashboard-body">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
