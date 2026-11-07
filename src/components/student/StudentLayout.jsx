import { Outlet, useNavigate } from 'react-router-dom';
import StudentSidebar from './StudentSidebar';
import StudentHeader from './StudentHeader';

export default function StudentLayout({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    fetch('/api/logout', { method: 'POST', credentials: 'include' }).then(() => {
      setUser(null);
      navigate('/login');
    });
  };

  return (
    <div className="student-dashboard-layout">
      <StudentSidebar user={user} handleLogout={handleLogout} />
      <main className="student-main-content">
        <StudentHeader user={user} />
        <Outlet />
      </main>
    </div>
  );
}
