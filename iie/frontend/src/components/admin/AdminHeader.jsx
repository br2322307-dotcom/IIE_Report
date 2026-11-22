import { Bell, Search, Menu, Landmark } from 'lucide-react';

export default function AdminHeader({ user }) {
  return (
    <header className="admin-header">
      <div className="header-left">
        {/* Mobile menu toggle and brand, visible only on mobile */}
        <div className="mobile-brand md:hidden">
          <Landmark size={24} />
          <h2>IIE</h2>
        </div>
        <div className="header-title hidden md:block">
          <h1>Admin Dashboard</h1>
          <p>Monitor, manage and resolve campus issues</p>
        </div>
      </div>
      
      <div className="header-right">
        <div className="search-bar hidden md:flex">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search issues, users, locations..." />
        </div>
        
        <div className="header-actions">
          <button className="notification-btn relative">
            <Bell size={20} />
            <span className="notification-dot"></span>
          </button>
          
          <div className="profile-menu hidden md:flex">
            <div className="avatar">A</div>
            <span className="profile-name">{user?.name || 'Admin User'}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
          
          <button className="mobile-menu-btn md:hidden">
            <Menu size={24} />
          </button>
        </div>
      </div>

      <div className="header-title mobile-title md:hidden">
        <h1>Admin Dashboard</h1>
        <p>Monitor and manage campus issues</p>
      </div>
    </header>
  );
}
