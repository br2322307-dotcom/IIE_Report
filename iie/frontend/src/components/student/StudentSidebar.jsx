import { LayoutDashboard, FileText, BarChart3, Bell, User, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function StudentSidebar({ user, handleLogout }) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/student/dashboard' },
    { icon: FileText, label: 'My Reports', path: '/student/reports' },
    { icon: BarChart3, label: 'Graphs', path: '/student/graphs' },
    { icon: Bell, label: 'Announcements', path: '/student/announcements' },
    { icon: User, label: 'Profile', path: '/student/profile' },
  ];

  return (
    <>
      <aside className="student-sidebar hidden md:flex">
        <div className="brand-logo">
          <div className="logo-circle">IIE</div>
          <div className="brand-text">
            <h2>IIE CAMPUS</h2>
            <p>ISSUE TRACKER</p>
          </div>
        </div>

        <nav>
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info-sidebar">
            <div className="avatar">{user?.name ? user.name.charAt(0).toUpperCase() : 'B'}</div>
            <div className="details">
              <h4>{user?.name || 'Biman Roy'}</h4>
              <p>{user?.user_id || 'cse73'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile nav could be added here */}
    </>
  );
}
