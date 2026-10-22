import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Edit3, 
  Trash2, 
  ExternalLink, 
  Mail, 
  Phone, 
  Calendar, 
  AlertCircle, 
  Clock, 
  Plus, 
  X,
  Building,
  User
} from 'lucide-react';

const STAGES = ['New', 'Contacted', 'Replied', 'Meeting', 'Won', 'Lost'];

export default function LeadList({ 
  leads, 
  selectedStageFilter, 
  setSelectedStageFilter, 
  onEditLead, 
  onDeleteLead, 
  onUpdateStage, 
  onOpenAddLead 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [reminderFilter, setReminderFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_desc');

  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayString();

  // Filter & sort leads
  const filteredLeads = useMemo(() => {
    return leads
      .filter((lead) => {
        // Stage filter
        if (selectedStageFilter && selectedStageFilter !== 'All' && lead.stage !== selectedStageFilter) {
          return false;
        }

        // Reminder filter
        if (reminderFilter === 'overdue') {
          if (!lead.follow_up_date || lead.follow_up_date >= todayStr || lead.stage === 'Won' || lead.stage === 'Lost') {
            return false;
          }
        } else if (reminderFilter === 'today') {
          if (lead.follow_up_date !== todayStr || lead.stage === 'Won' || lead.stage === 'Lost') {
            return false;
          }
        } else if (reminderFilter === 'upcoming') {
          if (!lead.follow_up_date || lead.follow_up_date <= todayStr || lead.stage === 'Won' || lead.stage === 'Lost') {
            return false;
          }
        } else if (reminderFilter === 'none') {
          if (lead.follow_up_date) return false;
        }

        // Search term filter
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchBusiness = lead.business_name?.toLowerCase().includes(q);
          const matchWebsite = lead.website?.toLowerCase().includes(q);
          const matchContact = lead.contact_name?.toLowerCase().includes(q);
          const matchEmail = lead.contact_email?.toLowerCase().includes(q);
          const matchPhone = lead.contact_phone?.toLowerCase().includes(q);
          const matchNotes = lead.notes?.toLowerCase().includes(q);

          return matchBusiness || matchWebsite || matchContact || matchEmail || matchPhone || matchNotes;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name_asc') return (a.business_name || '').localeCompare(b.business_name || '');
        if (sortBy === 'name_desc') return (b.business_name || '').localeCompare(a.business_name || '');
        if (sortBy === 'created_asc') return new Date(a.created_at) - new Date(b.created_at);
        if (sortBy === 'created_desc') return new Date(b.created_at) - new Date(a.created_at);
        if (sortBy === 'followup_asc') {
          if (!a.follow_up_date) return 1;
          if (!b.follow_up_date) return -1;
          return a.follow_up_date.localeCompare(b.follow_up_date);
        }
        return 0;
      });
  }, [leads, selectedStageFilter, reminderFilter, searchTerm, sortBy, todayStr]);

  const getReminderStatus = (followUpDate, stage) => {
    if (!followUpDate || stage === 'Won' || stage === 'Lost') return null;
    if (followUpDate < todayStr) return { type: 'overdue', label: `${followUpDate} (Overdue)` };
    if (followUpDate === todayStr) return { type: 'today', label: `Today` };
    return { type: 'upcoming', label: followUpDate };
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedStageFilter('All');
    setReminderFilter('all');
    setSortBy('created_desc');
  };

  const hasActiveFilters = searchTerm || (selectedStageFilter && selectedStageFilter !== 'All') || reminderFilter !== 'all';

  return (
    <div className="lead-list-view">
      <div className="view-header">
        <div>
          <h1 className="view-title">Lead Directory</h1>
          <p className="view-subtitle">Search, filter, and manage your complete business directory</p>
        </div>
        <button className="btn btn-primary" onClick={() => onOpenAddLead()}>
          <Plus size={18} />
          <span>Add Lead</span>
        </button>
      </div>

      {/* Control Bar: Search & Filters */}
      <div className="controls-card">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search business, website, contact, notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="btn-clear-search" onClick={() => setSearchTerm('')} title="Clear search">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="filters-group">
          {/* Stage Filter */}
          <div className="filter-item">
            <label className="filter-label">Stage:</label>
            <select 
              className="select-input"
              value={selectedStageFilter || 'All'}
              onChange={(e) => setSelectedStageFilter(e.target.value)}
            >
              <option value="All">All Stages ({leads.length})</option>
              {STAGES.map(s => {
                const count = leads.filter(l => l.stage === s).length;
                return (
                  <option key={s} value={s}>{s} ({count})</option>
                );
              })}
            </select>
          </div>

          {/* Reminder Filter */}
          <div className="filter-item">
            <label className="filter-label">Follow-up:</label>
            <select 
              className="select-input"
              value={reminderFilter}
              onChange={(e) => setReminderFilter(e.target.value)}
            >
              <option value="all">All Reminders</option>
              <option value="overdue">Overdue</option>
              <option value="today">Due Today</option>
              <option value="upcoming">Upcoming</option>
              <option value="none">No Date Set</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="filter-item">
            <label className="filter-label">Sort:</label>
            <select 
              className="select-input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="created_desc">Newest Added</option>
              <option value="created_asc">Oldest Added</option>
              <option value="name_asc">Business Name (A-Z)</option>
              <option value="name_desc">Business Name (Z-A)</option>
              <option value="followup_asc">Follow-up Date</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button className="btn-text-clear" onClick={clearFilters}>
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Count Bar */}
      <div className="results-meta">
        <span>Showing <strong>{filteredLeads.length}</strong> of <strong>{leads.length}</strong> total leads</span>
      </div>

      {/* Leads Table */}
      {filteredLeads.length === 0 ? (
        <div className="empty-state-card">
          <Building size={48} className="empty-icon text-muted" />
          <h3 className="empty-title">No leads match your criteria</h3>
          <p className="empty-desc">
            Try adjusting your search terms or filters, or add a new business to your pipeline.
          </p>
          <div className="empty-actions">
            {hasActiveFilters && (
              <button className="btn btn-secondary" onClick={clearFilters}>
                Clear All Filters
              </button>
            )}
            <button className="btn btn-primary" onClick={() => onOpenAddLead()}>
              <Plus size={16} />
              <span>Add New Lead</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="leads-table">
            <thead>
              <tr>
                <th>Business Name & Website</th>
                <th>Primary Contact</th>
                <th>Pipeline Stage</th>
                <th>Follow-up Reminder</th>
                <th>Notes</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLeads.map((lead) => {
                const reminder = getReminderStatus(lead.follow_up_date, lead.stage);

                return (
                  <tr key={lead.id} className="lead-table-row">
                    {/* Business Name & Website */}
                    <td className="cell-business">
                      <div className="business-title">{lead.business_name}</div>
                      {lead.website ? (
                        <a 
                          href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                          target="_blank" 
                          rel="noreferrer"
                          className="table-website-link"
                          title={`Open ${lead.website}`}
                        >
                          <ExternalLink size={12} />
                          <span>{lead.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
                        </a>
                      ) : (
                        <span className="text-muted text-sm">—</span>
                      )}
                    </td>

                    {/* Contact Info */}
                    <td className="cell-contact">
                      {lead.contact_name ? (
                        <div className="contact-name">{lead.contact_name}</div>
                      ) : (
                        <span className="text-muted text-sm">No contact name</span>
                      )}
                      <div className="contact-meta-row">
                        {lead.contact_email && (
                          <a href={`mailto:${lead.contact_email}`} className="table-contact-link" title={lead.contact_email}>
                            <Mail size={12} />
                            <span>{lead.contact_email}</span>
                          </a>
                        )}
                        {lead.contact_phone && (
                          <a href={`tel:${lead.contact_phone}`} className="table-contact-link" title={lead.contact_phone}>
                            <Phone size={12} />
                            <span>{lead.contact_phone}</span>
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Stage Dropdown */}
                    <td className="cell-stage">
                      <select 
                        className={`table-stage-select stage-select-${lead.stage.toLowerCase()}`}
                        value={lead.stage}
                        onChange={(e) => onUpdateStage(lead.id, e.target.value)}
                      >
                        {STAGES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>

                    {/* Reminder Status */}
                    <td className="cell-reminder">
                      {reminder ? (
                        <div className={`table-reminder-pill reminder-${reminder.type}`}>
                          {reminder.type === 'overdue' && <AlertCircle size={13} />}
                          {reminder.type === 'today' && <Clock size={13} />}
                          {reminder.type === 'upcoming' && <Calendar size={13} />}
                          <span>{reminder.label}</span>
                        </div>
                      ) : (
                        <span className="text-muted text-sm">—</span>
                      )}
                    </td>

                    {/* Notes Preview */}
                    <td className="cell-notes" title={lead.notes}>
                      <span className="table-notes-text">
                        {lead.notes || <span className="text-muted">—</span>}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="cell-actions text-right">
                      <div className="table-actions-group">
                        <button 
                          className="table-btn edit" 
                          onClick={() => onEditLead(lead)}
                          title="Edit Lead"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button 
                          className="table-btn delete" 
                          onClick={() => onDeleteLead(lead.id, lead.business_name)}
                          title="Delete Lead"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
