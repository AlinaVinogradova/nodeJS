import React from 'react';
import { 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Calendar, 
  AlertCircle,
  ArrowRight,
  Target,
  Sparkles,
  Layers
} from 'lucide-react';

const STAGE_CONFIG = {
  New: { label: 'New', color: 'stage-new', bg: '#eff6ff', border: '#bfdbfe', text: '#1e40af' },
  Contacted: { label: 'Contacted', color: 'stage-contacted', bg: '#ecfeff', border: '#a5f3fc', text: '#0e7490' },
  Replied: { label: 'Replied', color: 'stage-replied', bg: '#f5f3ff', border: '#ddd6fe', text: '#6d28d9' },
  Meeting: { label: 'Meeting', color: 'stage-meeting', bg: '#fffbeb', border: '#fde68a', text: '#b45309' },
  Won: { label: 'Won', color: 'stage-won', bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d' },
  Lost: { label: 'Lost', color: 'stage-lost', bg: '#fef2f2', border: '#fecaca', text: '#b91c1c' }
};

export default function Dashboard({ stats, onSelectStageFilter, onNavigateReminders, onOpenAddLead }) {
  if (!stats) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Calculating pipeline metrics...</p>
      </div>
    );
  }

  const { totalLeads = 0, stageCounts = {}, reminders = {}, metrics = {} } = stats;

  const stages = ['New', 'Contacted', 'Replied', 'Meeting', 'Won', 'Lost'];

  return (
    <div className="dashboard-view">
      <div className="view-header">
        <div>
          <h1 className="view-title">Executive Pipeline Overview</h1>
          <p className="view-subtitle">High-utility performance summary and stage distribution analytics</p>
        </div>
        <button className="btn btn-secondary" onClick={onOpenAddLead}>
          + Quick Add Lead
        </button>
      </div>

      {/* Top High-Level Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Total Active Pipeline</span>
            <div className="metric-icon-box bg-blue">
              <Users size={20} className="text-blue" />
            </div>
          </div>
          <div className="metric-value">{totalLeads}</div>
          <div className="metric-footer">
            <span className="metric-subtext">
              {metrics.activeLeads || 0} in progress &bull; {metrics.closedLeads || 0} closed
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Win Rate (Closed Leads)</span>
            <div className="metric-icon-box bg-emerald">
              <TrendingUp size={20} className="text-emerald" />
            </div>
          </div>
          <div className="metric-value">{metrics.winRate || 0}%</div>
          <div className="metric-footer">
            <span className="metric-subtext">
              {stageCounts.Won || 0} Won vs {stageCounts.Lost || 0} Lost
            </span>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Follow-ups Due Today</span>
            <div className="metric-icon-box bg-amber">
              <Calendar size={20} className="text-amber" />
            </div>
          </div>
          <div className="metric-value">{reminders.today || 0}</div>
          <div className="metric-footer">
            <button className="metric-link text-amber" onClick={onNavigateReminders}>
              View schedule <ArrowRight size={14} />
            </button>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <span className="metric-title">Overdue Action Items</span>
            <div className={`metric-icon-box ${reminders.overdue > 0 ? 'bg-rose' : 'bg-gray'}`}>
              <AlertCircle size={20} className={reminders.overdue > 0 ? 'text-rose' : 'text-gray'} />
            </div>
          </div>
          <div className={`metric-value ${reminders.overdue > 0 ? 'text-rose' : ''}`}>
            {reminders.overdue || 0}
          </div>
          <div className="metric-footer">
            {reminders.overdue > 0 ? (
              <button className="metric-link text-rose" onClick={onNavigateReminders}>
                Resolve urgency <ArrowRight size={14} />
              </button>
            ) : (
              <span className="metric-subtext text-emerald">All follow-ups on track</span>
            )}
          </div>
        </div>
      </div>

      {/* Stage Breakdown Dashboard */}
      <div className="dashboard-section">
        <div className="section-header">
          <div className="section-title-wrap">
            <Layers size={18} className="text-primary" />
            <h2 className="section-title">Lead Distribution by Pipeline Stage</h2>
          </div>
          <span className="section-badge">Click stage card to filter</span>
        </div>

        <div className="stage-cards-grid">
          {stages.map((stage) => {
            const count = stageCounts[stage] || 0;
            const percentage = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
            const cfg = STAGE_CONFIG[stage];

            return (
              <div 
                key={stage} 
                className={`stage-metric-card stage-border-${stage.toLowerCase()}`}
                onClick={() => onSelectStageFilter(stage)}
                role="button"
                tabIndex={0}
                title={`Filter by ${stage}`}
              >
                <div className="stage-card-top">
                  <span className={`stage-badge stage-badge-${stage.toLowerCase()}`}>
                    {stage}
                  </span>
                  <span className="stage-share">{percentage}%</span>
                </div>
                <div className="stage-card-count">{count}</div>
                <div className="stage-progress-bar">
                  <div 
                    className={`stage-progress-fill fill-${stage.toLowerCase()}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="stage-card-bottom">
                  <span>{count === 1 ? '1 business' : `${count} businesses`}</span>
                  <ArrowRight size={14} className="hover-arrow" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Funnel Progress Visual */}
      <div className="dashboard-section">
        <div className="funnel-container">
          <div className="funnel-header">
            <h3 className="funnel-title">Conversion Pipeline Flow</h3>
            <span className="funnel-desc">Visual progression of prospective clients through lifecycle</span>
          </div>

          <div className="funnel-bars">
            {stages.map((stage, idx) => {
              const count = stageCounts[stage] || 0;
              const percentage = totalLeads > 0 ? Math.max((count / totalLeads) * 100, count > 0 ? 8 : 2) : 0;

              return (
                <div key={stage} className="funnel-item">
                  <div className="funnel-label-row">
                    <span className="funnel-stage-name">{stage}</span>
                    <span className="funnel-stage-count">{count} leads</span>
                  </div>
                  <div className="funnel-track">
                    <div 
                      className={`funnel-bar-fill fill-${stage.toLowerCase()}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
