import { LayoutDashboard, Users, UserCog, BarChart3, Bell, Settings, LogOut, MoreHorizontal, Landmark } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export default function AdminSidebar({ user, handleLogout }) {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: UserCog, label: 'Agent Workers', path: '/admin/assign' },
    { icon: Users, label: 'Workers', path: '/admin/workers' },
    { icon: Users, label: 'Students & Faculty', path: '/admin/users' },
    { icon: BarChart3, label: 'Reports & Analytics', path: '/admin/reports' },
    { icon: Bell, label: 'Announcements', path: '/admin/announcements', badge: 3 },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="admin-sidebar hidden md:flex flex-col">
        <div className="sidebar-brand">
          <div className="admin-brand-logo">
            <Landmark size={32} />
          </div>
          <div className="brand-text">
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>IIE</h2>
            <p style={{ fontSize: '0.75rem' }}>Campus Issue Management</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item, index) => (
            <NavLink
              key={index}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="avatar">A</div>
            <div className="user-details">
              <h4>{user?.name || 'Admin User'}</h4>
              <p>Administrator</p>
            </div>
          </div>
          <button onClick={handleLogout} className="nav-item logout-link" style={{marginBottom: '1rem'}}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
          <div style={{color: '#64748b', fontSize: '0.75rem', fontWeight: 600}}>
            Admin mode
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav md:hidden">
        <NavLink to="/admin/dashboard" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={24} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/admin/workers" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}>
          <UserCog size={24} />
          <span>Workers</span>
        </NavLink>
        <NavLink to="/admin/announcements" className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''} relative`}>
          <Bell size={24} />
          <span className="mobile-badge">3</span>
          <span>Announcements</span>
        </NavLink>
        <button className="mobile-nav-item">
          <MoreHorizontal size={24} />
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
