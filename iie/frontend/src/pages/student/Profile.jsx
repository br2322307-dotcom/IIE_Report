import { Lock, User as UserIcon } from 'lucide-react';

export default function Profile({ user }) {
  return (
    <div className="dashboard-scroll-area">
      <div style={{display: 'flex', gap: '2rem', flexWrap: 'wrap'}}>
        
        {/* Profile Info */}
        <div style={{flex: '1 1 500px', background: 'white', borderRadius: '12px', padding: '2rem', border: '1px solid var(--border-light)'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem'}}>
             <div style={{display: 'flex', gap: '1.5rem', alignItems: 'center'}}>
                <div style={{width: '80px', height: '80px', borderRadius: '50%', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', fontWeight: 700}}>
                   {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                   <h2 style={{fontSize: '20px', fontWeight: 700, marginBottom: '4px'}}>{user?.name || 'Student Name'}</h2>
                   <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                      <span style={{color: '#64748b', fontSize: '13px'}}>User ID: {user?.user_id || 'Unknown ID'}</span>
                      <span style={{background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 500}}>Student (Self)</span>
                   </div>
                </div>
             </div>
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-light)'}}>
             <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                <UserIcon size={24} color="#94a3b8" />
                <div>
                  <p style={{color: '#64748b', fontSize: '12px', marginBottom: '4px'}}>Full Name</p>
                  <p style={{fontSize: '14px', fontWeight: 500}}>{user?.name || 'Not provided'}</p>
                </div>
             </div>
             <div style={{display: 'flex', gap: '1rem', alignItems: 'center'}}>
                <Lock size={24} color="#94a3b8" />
                <div>
                  <p style={{color: '#64748b', fontSize: '12px', marginBottom: '4px'}}>Authentication</p>
                  <p style={{fontSize: '14px', fontWeight: 500}}>Managed by internal secure system</p>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
