import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  LayoutDashboard, 
  Kanban, 
  ListFilter, 
  Bell, 
  Plus, 
  LogOut, 
  User as UserIcon,
  CheckCircle2
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenAddLead, reminderCount, totalLeads }) {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <div className="brand" onClick={() => setActiveTab('pipeline')}>
          <div className="brand-icon">
            <Building2 size={22} className="text-primary" />
          </div>
          <div className="brand-text">
            <span className="brand-name">LeadPulse</span>
            <span className="brand-badge">CRM</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-links">
          <button 
            className={`nav-btn ${activeTab === 'pipeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('pipeline')}
            title="Pipeline Board"
          >
            <Kanban size={18} />
            <span>Pipeline</span>
          </button>

          <button 
            className={`nav-btn ${activeTab === 'list' ? 'active' : ''}`}
            onClick={() => setActiveTab('list')}
            title="All Leads List"
          >
            <ListFilter size={18} />
            <span>Leads</span>
            {totalLeads > 0 && <span className="counter-pill">{totalLeads}</span>}
          </button>

          <button 
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            title="Dashboard & Analytics"
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          <button 
            className={`nav-btn ${activeTab === 'reminders' ? 'active' : ''}`}
            onClick={() => setActiveTab('reminders')}
            title="Follow-up Reminders"
          >
            <Bell size={18} />
            <span>Reminders</span>
            {reminderCount > 0 && (
              <span className="reminder-pill" title={`${reminderCount} active follow-ups due`}>
                {reminderCount}
              </span>
            )}
          </button>
        </nav>

        {/* Actions & User */}
        <div className="nav-actions">
          <button 
            className="btn btn-primary btn-add"
            onClick={onOpenAddLead}
            id="add-lead-btn"
          >
            <Plus size={18} />
            <span>Add Lead</span>
          </button>

          <div className="user-profile">
            <div className="user-avatar" title={user?.name || user?.email}>
              <UserIcon size={16} />
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name || 'User'}</span>
            </div>
            <button 
              className="btn-icon btn-logout" 
              onClick={logout} 
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
