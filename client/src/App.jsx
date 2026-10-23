import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { leadsApi } from './services/api';
import AuthPage from './components/AuthPage';
import LeadModal from './components/LeadModal';
import PipelineBoard from './components/PipelineBoard';
import LeadList from './components/LeadList';

const STAGES = ['New', 'Contacted', 'Replied', 'Meeting', 'Won', 'Lost'];

export default function App() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // UI state
  const [viewMode, setViewMode] = useState('board'); // 'board' | 'list'
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [reminderFilter, setReminderFilter] = useState('all'); // 'all' | 'due'

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [modalStage, setModalStage] = useState('New');

  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayString();

  const fetchLeads = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      setError('');
      const data = await leadsApi.getLeads();
      setLeads(data.leads || []);
    } catch (err) {
      setError(err.message || 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeads();
    }
  }, [isAuthenticated, fetchLeads]);

  // Stage counts for dashboard
  const stageCounts = useMemo(() => {
    const counts = { All: leads.length };
    STAGES.forEach((s) => {
      counts[s] = leads.filter((l) => l.stage === s).length;
    });
    return counts;
  }, [leads]);

  // Reminders calculation
  const dueReminders = useMemo(() => {
    return leads.filter(
      (l) =>
        l.follow_up_date &&
        l.follow_up_date <= todayStr &&
        l.stage !== 'Won' &&
        l.stage !== 'Lost'
    );
  }, [leads, todayStr]);

  // Filtered leads for display
  const displayedLeads = useMemo(() => {
    return leads.filter((lead) => {
      // Stage filter
      if (stageFilter !== 'All' && lead.stage !== stageFilter) {
        return false;
      }

      // Reminder filter
      if (reminderFilter === 'due') {
        const isDue =
          lead.follow_up_date &&
          lead.follow_up_date <= todayStr &&
          lead.stage !== 'Won' &&
          lead.stage !== 'Lost';
        if (!isDue) return false;
      }

      // Text search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = lead.business_name?.toLowerCase().includes(q);
        const matchWeb = lead.website?.toLowerCase().includes(q);
        const matchContact = lead.contact_name?.toLowerCase().includes(q);
        const matchEmail = lead.contact_email?.toLowerCase().includes(q);
        const matchPhone = lead.contact_phone?.toLowerCase().includes(q);
        const matchNotes = lead.notes?.toLowerCase().includes(q);
        return matchName || matchWeb || matchContact || matchEmail || matchPhone || matchNotes;
      }

      return true;
    });
  }, [leads, stageFilter, reminderFilter, search, todayStr]);

  // Lead CRUD handlers
  const handleOpenAdd = (stage = 'New') => {
    setEditingLead(null);
    setModalStage(stage);
    setIsModalOpen(true);
  };

  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  const handleSaveLead = async (formData, id) => {
    if (id) {
      await leadsApi.updateLead(id, formData);
    } else {
      await leadsApi.createLead(formData);
    }
    await fetchLeads();
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return;
    try {
      await leadsApi.deleteLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete lead');
    }
  };

  const handleUpdateStage = async (id, stage) => {
    try {
      await leadsApi.updateStage(id, stage);
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, stage } : l))
      );
    } catch (err) {
      alert(err.message || 'Failed to update stage');
    }
  };

  if (authLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#64748b' }}>
        Loading CRM...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <div className="app-container">
      {/* Navbar */}
      <header className="navbar">
        <div className="navbar-brand">
          <span>LeadPulse</span>
          <span className="brand-badge">CRM</span>
        </div>

        <div className="navbar-actions">
          <button className="btn btn-primary" onClick={() => handleOpenAdd('New')}>
            + Add Lead
          </button>
          <span className="user-email">{user?.name || user?.email}</span>
          <button className="btn btn-secondary btn-sm" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {error && <div className="alert-error" style={{ marginBottom: '16px' }}>{error}</div>}

        {/* Stage Counts Dashboard Bar */}
        <div className="dashboard-bar">
          <div
            className={`stage-card ${stageFilter === 'All' && reminderFilter === 'all' ? 'active' : ''}`}
            onClick={() => { setStageFilter('All'); setReminderFilter('all'); }}
          >
            <span className="stage-card-title">All Leads</span>
            <span className="stage-card-count">{stageCounts.All || 0}</span>
          </div>

          {STAGES.map((s) => (
            <div
              key={s}
              className={`stage-card ${stageFilter === s && reminderFilter === 'all' ? 'active' : ''}`}
              onClick={() => { setStageFilter(s); setReminderFilter('all'); }}
            >
              <span className="stage-card-title">{s}</span>
              <span className="stage-card-count">{stageCounts[s] || 0}</span>
            </div>
          ))}
        </div>

        {/* Due Reminders Banner */}
        {dueReminders.length > 0 && (
          <div className="reminder-banner">
            <div className="reminder-banner-content">
              <span>🔔</span>
              <span>
                You have <strong>{dueReminders.length}</strong> follow-up{dueReminders.length > 1 ? 's' : ''} due or overdue.
              </span>
            </div>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => {
                setReminderFilter(reminderFilter === 'due' ? 'all' : 'due');
                setStageFilter('All');
              }}
            >
              {reminderFilter === 'due' ? 'Show All Leads' : 'Filter Due Leads'}
            </button>
          </div>
        )}

        {/* Toolbar & Filters */}
        <div className="toolbar">
          <div className="toolbar-left">
            <input
              type="text"
              className="search-input"
              placeholder="Search leads, contacts, notes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="select-input"
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              aria-label="Filter by stage"
            >
              <option value="All">All Stages</option>
              {STAGES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              className="select-input"
              value={reminderFilter}
              onChange={(e) => setReminderFilter(e.target.value)}
              aria-label="Filter by reminder"
            >
              <option value="all">All Reminders</option>
              <option value="due">Follow-ups Due</option>
            </select>

            {(search || stageFilter !== 'All' || reminderFilter !== 'all') && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearch('');
                  setStageFilter('All');
                  setReminderFilter('all');
                }}
              >
                Clear
              </button>
            )}
          </div>

          <div className="toolbar-right">
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'board' ? 'active' : ''}`}
                onClick={() => setViewMode('board')}
              >
                Board
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Leads Board or Table View */}
        {loading && leads.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            Loading leads...
          </div>
        ) : viewMode === 'board' ? (
          <PipelineBoard
            leads={displayedLeads}
            todayStr={todayStr}
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
            onUpdateStage={handleUpdateStage}
            onOpenAdd={handleOpenAdd}
          />
        ) : (
          <LeadList
            leads={displayedLeads}
            todayStr={todayStr}
            onEditLead={handleEditLead}
            onDeleteLead={handleDeleteLead}
            onUpdateStage={handleUpdateStage}
          />
        )}
      </main>

      {/* Add / Edit Lead Modal */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLead}
        initialData={editingLead}
        defaultStage={modalStage}
      />
    </div>
  );
}
