import React from 'react';
import { 
  Bell, 
  AlertCircle, 
  Clock, 
  Calendar, 
  ExternalLink, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Edit3, 
  ArrowRight,
  Plus
} from 'lucide-react';

const STAGES = ['New', 'Contacted', 'Replied', 'Meeting', 'Won', 'Lost'];

export default function RemindersPanel({ 
  remindersData, 
  onEditLead, 
  onUpdateStage, 
  onOpenAddLead 
}) {
  const { overdue = [], today = [], upcoming = [], todayDate } = remindersData || {};

  const totalActive = overdue.length + today.length + upcoming.length;

  return (
    <div className="reminders-view">
      <div className="view-header">
        <div>
          <h1 className="view-title">Follow-up Command Center</h1>
          <p className="view-subtitle">Timely reminders to re-engage prospective businesses and advance deals</p>
        </div>
        <button className="btn btn-primary" onClick={() => onOpenAddLead()}>
          <Plus size={18} />
          <span>Add Lead</span>
        </button>
      </div>

      {totalActive === 0 ? (
        <div className="empty-state-card">
          <CheckCircle2 size={48} className="empty-icon text-emerald" />
          <h3 className="empty-title">All Follow-ups Completed</h3>
          <p className="empty-desc">
            You have no pending follow-up reminders. Keep up the high responsiveness or schedule follow-up dates on your active leads.
          </p>
        </div>
      ) : (
        <div className="reminders-sections">
          {/* Overdue Section */}
          {overdue.length > 0 && (
            <div className="reminder-group overdue-group">
              <div className="reminder-group-header">
                <div className="group-title-wrap">
                  <div className="group-icon-box bg-rose">
                    <AlertCircle size={18} className="text-rose" />
                  </div>
                  <div>
                    <h2 className="group-title text-rose">Overdue Actions ({overdue.length})</h2>
                    <p className="group-subtitle">Immediate attention required to prevent deal stalling</p>
                  </div>
                </div>
              </div>

              <div className="reminders-grid">
                {overdue.map((lead) => (
                  <div key={lead.id} className="reminder-card card-urgent">
                    <div className="reminder-card-top">
                      <div>
                        <span className="reminder-badge-urgent">
                          Overdue ({lead.follow_up_date})
                        </span>
                        <h3 className="reminder-business-name">{lead.business_name}</h3>
                      </div>
                      <span className={`stage-badge stage-badge-${lead.stage.toLowerCase()}`}>
                        {lead.stage}
                      </span>
                    </div>

                    <div className="reminder-contact-row">
                      {lead.contact_name && <span className="contact-name">{lead.contact_name}</span>}
                      {lead.contact_email && (
                        <a href={`mailto:${lead.contact_email}`} className="quick-link" title="Send Email">
                          <Mail size={13} />
                          <span>{lead.contact_email}</span>
                        </a>
                      )}
                      {lead.contact_phone && (
                        <a href={`tel:${lead.contact_phone}`} className="quick-link" title="Call">
                          <Phone size={13} />
                          <span>{lead.contact_phone}</span>
                        </a>
                      )}
                    </div>

                    {lead.notes && (
                      <p className="reminder-notes">
                        <strong>Last note:</strong> {lead.notes}
                      </p>
                    )}

                    <div className="reminder-actions">
                      <select 
                        className="stage-selector-inline"
                        value={lead.stage}
                        onChange={(e) => onUpdateStage(lead.id, e.target.value)}
                      >
                        {STAGES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>

                      <button className="btn btn-secondary btn-sm" onClick={() => onEditLead(lead)}>
                        <Edit3 size={14} />
                        <span>Update Reminder</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Today Section */}
          {today.length > 0 && (
            <div className="reminder-group today-group">
              <div className="reminder-group-header">
                <div className="group-title-wrap">
                  <div className="group-icon-box bg-amber">
                    <Clock size={18} className="text-amber" />
                  </div>
                  <div>
                    <h2 className="group-title text-amber">Due Today ({today.length})</h2>
                    <p className="group-subtitle">Scheduled follow-up commitments for today ({todayDate})</p>
                  </div>
                </div>
              </div>

              <div className="reminders-grid">
                {today.map((lead) => (
                  <div key={lead.id} className="reminder-card card-today">
                    <div className="reminder-card-top">
                      <div>
                        <span className="reminder-badge-today">Today</span>
                        <h3 className="reminder-business-name">{lead.business_name}</h3>
                      </div>
                      <span className={`stage-badge stage-badge-${lead.stage.toLowerCase()}`}>
                        {lead.stage}
                      </span>
                    </div>

                    <div className="reminder-contact-row">
                      {lead.contact_name && <span className="contact-name">{lead.contact_name}</span>}
                      {lead.contact_email && (
                        <a href={`mailto:${lead.contact_email}`} className="quick-link" title="Send Email">
                          <Mail size={13} />
                          <span>{lead.contact_email}</span>
                        </a>
                      )}
                      {lead.contact_phone && (
                        <a href={`tel:${lead.contact_phone}`} className="quick-link" title="Call">
                          <Phone size={13} />
                          <span>{lead.contact_phone}</span>
                        </a>
                      )}
                    </div>

                    {lead.notes && (
                      <p className="reminder-notes">
                        <strong>Last note:</strong> {lead.notes}
                      </p>
                    )}

                    <div className="reminder-actions">
                      <select 
                        className="stage-selector-inline"
                        value={lead.stage}
                        onChange={(e) => onUpdateStage(lead.id, e.target.value)}
                      >
                        {STAGES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>

                      <button className="btn btn-secondary btn-sm" onClick={() => onEditLead(lead)}>
                        <Edit3 size={14} />
                        <span>Update Reminder</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Section */}
          {upcoming.length > 0 && (
            <div className="reminder-group upcoming-group">
              <div className="reminder-group-header">
                <div className="group-title-wrap">
                  <div className="group-icon-box bg-blue">
                    <Calendar size={18} className="text-blue" />
                  </div>
                  <div>
                    <h2 className="group-title">Upcoming Schedule ({upcoming.length})</h2>
                    <p className="group-subtitle">Future follow-up appointments and planned checkpoints</p>
                  </div>
                </div>
              </div>

              <div className="reminders-grid">
                {upcoming.map((lead) => (
                  <div key={lead.id} className="reminder-card card-upcoming">
                    <div className="reminder-card-top">
                      <div>
                        <span className="reminder-badge-upcoming">
                          {lead.follow_up_date}
                        </span>
                        <h3 className="reminder-business-name">{lead.business_name}</h3>
                      </div>
                      <span className={`stage-badge stage-badge-${lead.stage.toLowerCase()}`}>
                        {lead.stage}
                      </span>
                    </div>

                    <div className="reminder-contact-row">
                      {lead.contact_name && <span className="contact-name">{lead.contact_name}</span>}
                      {lead.contact_email && (
                        <a href={`mailto:${lead.contact_email}`} className="quick-link" title="Send Email">
                          <Mail size={13} />
                          <span>{lead.contact_email}</span>
                        </a>
                      )}
                    </div>

                    {lead.notes && (
                      <p className="reminder-notes">
                        <strong>Note:</strong> {lead.notes}
                      </p>
                    )}

                    <div className="reminder-actions">
                      <select 
                        className="stage-selector-inline"
                        value={lead.stage}
                        onChange={(e) => onUpdateStage(lead.id, e.target.value)}
                      >
                        {STAGES.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>

                      <button className="btn btn-secondary btn-sm" onClick={() => onEditLead(lead)}>
                        <Edit3 size={14} />
                        <span>Edit</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
