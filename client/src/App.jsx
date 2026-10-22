import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import { leadsApi } from './services/api';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import PipelineBoard from './components/PipelineBoard';
import LeadList from './components/LeadList';
import RemindersPanel from './components/RemindersPanel';
import LeadModal from './components/LeadModal';
import AuthPage from './components/AuthPage';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState('pipeline');
  const [leads, setLeads] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [remindersData, setRemindersData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [defaultModalStage, setDefaultModalStage] = useState('New');

  // Filter state for cross-navigation
  const [selectedStageFilter, setSelectedStageFilter] = useState('All');

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 4000);
  };

  // Fetch all leads & metrics
  const refreshData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const [leadsRes, statsRes, remindersRes] = await Promise.all([
        leadsApi.getLeads(),
        leadsApi.getDashboard(),
        leadsApi.getReminders()
      ]);

      setLeads(leadsRes.leads || []);
      setDashboardStats(statsRes);
      setRemindersData(remindersRes);
    } catch (err) {
      console.error('Error fetching data:', err);
      showToast(err.message || 'Failed to sync CRM data', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated, refreshData]);

  // Seed sample leads if the account is completely fresh
  useEffect(() => {
    async function seedInitialDataIfEmpty() {
      if (isAuthenticated && leads.length === 0 && !isLoading && dashboardStats?.totalLeads === 0) {
        try {
          const sampleLeads = [
            {
              business_name: 'Apex Digital Solutions',
              website: 'https://apexdigital.example.com',
              contact_name: 'Marcus Vance',
              contact_email: 'marcus@apexdigital.example.com',
              contact_phone: '+1 (555) 412-8821',
              stage: 'New',
              notes: 'Found via industry directory. Needs enterprise workflow automation.',
              follow_up_date: new Date(Date.now() + 86400000).toISOString().split('T')[0] // Tomorrow
            },
            {
              business_name: 'BlueWave Logistics',
              website: 'https://bluewavelogistics.io',
              contact_name: 'Elena Rostova',
              contact_email: 'elena@bluewave.io',
              contact_phone: '+1 (555) 301-9442',
              stage: 'Contacted',
              notes: 'Sent initial product brief and capability deck.',
              follow_up_date: new Date().toISOString().split('T')[0] // Today
            },
            {
              business_name: 'Starlight Retailers',
              website: 'https://starlightretail.com',
              contact_name: 'David Chen',
              contact_email: 'david.c@starlightretail.com',
              contact_phone: '+1 (555) 890-1234',
              stage: 'Replied',
              notes: 'Requested custom pricing breakdown for 5 branch locations.',
              follow_up_date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0] // Overdue
            },
            {
              business_name: 'Quantum Analytics',
              website: 'https://quantum-data.tech',
              contact_name: 'Sophia Patel',
              contact_email: 'sophia@quantum-data.tech',
              contact_phone: '+1 (555) 777-6210',
              stage: 'Meeting',
              notes: 'Discovery demo call confirmed for Friday 2 PM.',
              follow_up_date: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
            },
            {
              business_name: 'Horizon Health Partners',
              website: 'https://horizonhealth.org',
              contact_name: 'Dr. Gregory House',
              contact_email: 'contact@horizonhealth.org',
              contact_phone: '+1 (555) 432-1100',
              stage: 'Won',
              notes: 'Signed standard 12-month pilot agreement.',
              follow_up_date: ''
            }
          ];

          for (const sample of sampleLeads) {
            await leadsApi.createLead(sample);
          }
          refreshData();
        } catch (e) {
          console.error('Seeding sample leads skipped:', e);
        }
      }
    }

    if (dashboardStats && dashboardStats.totalLeads === 0) {
      seedInitialDataIfEmpty();
    }
  }, [dashboardStats, isAuthenticated, leads.length, isLoading, refreshData]);

  // Open Add Lead Modal
  const handleOpenAddLead = (stage = 'New') => {
    setEditingLead(null);
    setDefaultModalStage(stage);
    setIsModalOpen(true);
  };

  // Open Edit Lead Modal
  const handleOpenEditLead = (lead) => {
    setEditingLead(lead);
    setIsModalOpen(true);
  };

  // Save Lead (Create or Update)
  const handleSaveLead = async (formData, leadId) => {
    if (leadId) {
      const res = await leadsApi.updateLead(leadId, formData);
      showToast(`Updated "${res.lead.business_name}"`);
    } else {
      const res = await leadsApi.createLead(formData);
      showToast(`Added "${res.lead.business_name}" to ${res.lead.stage}`);
    }
    await refreshData();
  };

  // Quick Stage Update
  const handleUpdateStage = async (leadId, newStage) => {
    try {
      // Optimistic update
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, stage: newStage } : l));
      const res = await leadsApi.updateStage(leadId, newStage);
      showToast(`Moved "${res.lead.business_name}" to ${newStage}`);
      await refreshData();
    } catch (err) {
      showToast(err.message || 'Failed to update stage', 'error');
      await refreshData();
    }
  };

  // Delete Lead
  const handleDeleteLead = async (leadId, businessName) => {
    if (window.confirm(`Are you sure you want to delete "${businessName}"? This action cannot be undone.`)) {
      try {
        await leadsApi.deleteLead(leadId);
        showToast(`Deleted "${businessName}"`);
        await refreshData();
      } catch (err) {
        showToast(err.message || 'Failed to delete lead', 'error');
      }
    }
  };

  // Select Stage Filter from Dashboard
  const handleSelectStageFilterFromDashboard = (stage) => {
    setSelectedStageFilter(stage);
    setActiveTab('list');
  };

  if (authLoading) {
    return (
      <div className="app-loading-screen">
        <div className="spinner"></div>
        <p>Initializing LeadPulse CRM...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const activeRemindersCount = (remindersData?.overdue?.length || 0) + (remindersData?.today?.length || 0);

  return (
    <div className="app-layout">
      {/* Toast Notification */}
      {toast && (
        <div className={`toast-notification toast-${toast.type}`}>
          {toast.type === 'success' && <CheckCircle2 size={18} />}
          {toast.type === 'error' && <AlertCircle size={18} />}
          {toast.type === 'info' && <Info size={18} />}
          <span>{toast.message}</span>
          <button className="btn-close-toast" onClick={() => setToast(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddLead={() => handleOpenAddLead('New')}
        reminderCount={activeRemindersCount}
        totalLeads={leads.length}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {activeTab === 'pipeline' && (
          <PipelineBoard
            leads={leads}
            onEditLead={handleOpenEditLead}
            onDeleteLead={handleDeleteLead}
            onUpdateStage={handleUpdateStage}
            onOpenAddLead={handleOpenAddLead}
          />
        )}

        {activeTab === 'list' && (
          <LeadList
            leads={leads}
            selectedStageFilter={selectedStageFilter}
            setSelectedStageFilter={setSelectedStageFilter}
            onEditLead={handleOpenEditLead}
            onDeleteLead={handleDeleteLead}
            onUpdateStage={handleUpdateStage}
            onOpenAddLead={handleOpenAddLead}
          />
        )}

        {activeTab === 'dashboard' && (
          <Dashboard
            stats={dashboardStats}
            onSelectStageFilter={handleSelectStageFilterFromDashboard}
            onNavigateReminders={() => setActiveTab('reminders')}
            onOpenAddLead={() => handleOpenAddLead('New')}
          />
        )}

        {activeTab === 'reminders' && (
          <RemindersPanel
            remindersData={remindersData}
            onEditLead={handleOpenEditLead}
            onUpdateStage={handleUpdateStage}
            onOpenAddLead={() => handleOpenAddLead('New')}
          />
        )}
      </main>

      {/* Lead Create / Edit Modal */}
      <LeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLead}
        initialData={editingLead}
        defaultStage={defaultModalStage}
      />
    </div>
  );
}
