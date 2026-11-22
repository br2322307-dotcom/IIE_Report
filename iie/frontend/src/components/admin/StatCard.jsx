import { FileText, Clock, Settings, CheckCircle2 } from 'lucide-react';

export default function StatCard({ title, value, subtitle, trend, type }) {
  const getIcon = () => {
    switch (type) {
      case 'total': return <div className="stat-icon-wrapper bg-blue-100 text-blue-600"><FileText size={24} /></div>;
      case 'pending': return <div className="stat-icon-wrapper bg-orange-100 text-orange-500"><Clock size={24} /></div>;
      case 'progress': return <div className="stat-icon-wrapper bg-purple-100 text-purple-500"><Settings size={24} /></div>;
      case 'resolved': return <div className="stat-icon-wrapper bg-green-100 text-green-500"><CheckCircle2 size={24} /></div>;
      default: return null;
    }
  };

  return (
    <div className={`admin-stat-card border-${type}`}>
      <div className="stat-card-header">
        {getIcon()}
        <div className="stat-card-content">
          <p className="stat-value">{value}</p>
          <h3 className="stat-title">{title}</h3>
        </div>
      </div>
      <div className={`stat-card-footer text-${type}`}>
        <span className="trend">{trend}</span>
        {subtitle && <span className="subtitle">{subtitle}</span>}
      </div>
    </div>
  );
}
