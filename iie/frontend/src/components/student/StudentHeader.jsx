import { Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function StudentHeader({ user }) {
  const location = useLocation();

  let title = "IIE Reports";
  let subtitle = "Track campus issues and follow your reports";

  if (location.pathname === '/student/reports') {
    title = "My Reports";
    subtitle = "Track and manage your submitted issues";
  } else if (location.pathname === '/student/graphs') {
    title = "Analytics & Graphs";
    subtitle = "Campus issue statistics for this month";
  } else if (location.pathname === '/student/announcements') {
    title = "Announcements";
    subtitle = "Important notices from administration";
  } else if (location.pathname === '/student/profile') {
    title = "My Profile";
    subtitle = "Manage your personal information";
  }

  return (
    <header className="student-header">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      <div className="header-right">
        <button style={{ background: 'transparent', border: 'none', position: 'relative', cursor: 'pointer' }}>
          <Bell size={20} color="#64748b" />
          <span style={{ position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%' }}></span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <div style={{ width: '32px', height: '32px', background: '#3b82f6', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'B'}
          </div>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>{user?.name || 'Biman Roy'}</span>
        </div>
      </div>
    </header>
  );
}
