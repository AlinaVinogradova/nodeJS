import React, { useState } from 'react';
import { 
  ExternalLink, 
  Mail, 
  Phone, 
  User, 
  Calendar, 
  AlertCircle, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  ArrowRight, 
  Clock, 
  Plus,
  FileText
} from 'lucide-react';

const STAGES = ['New', 'Contacted', 'Replied', 'Meeting', 'Won', 'Lost'];

const STAGE_CONFIG = {
  New: { badgeClass: 'stage-badge-new', borderClass: 'stage-col-new', title: 'New Leads' },
  Contacted: { badgeClass: 'stage-badge-contacted', borderClass: 'stage-col-contacted', title: 'Contacted' },
  Replied: { badgeClass: 'stage-badge-replied', borderClass: 'stage-col-replied', title: 'Replied' },
  Meeting: { badgeClass: 'stage-badge-meeting', borderClass: 'stage-col-meeting', title: 'Meeting Scheduled' },
  Won: { badgeClass: 'stage-badge-won', borderClass: 'stage-col-won', title: 'Won Deals' },
  Lost: { badgeClass: 'stage-badge-lost', borderClass: 'stage-col-lost', title: 'Lost / Closed' }
};

export default function PipelineBoard({ 
  leads, 
  onEditLead, 
  onDeleteLead, 
  onUpdateStage, 
  onOpenAddLead 
}) {
  const [draggedLeadId, setDraggedLeadId] = useState(null);

  // Group leads by stage
  const groupedLeads = STAGES.reduce((acc, stage) => {
    acc[stage] = leads.filter(l => l.stage === stage);
    return acc;
  }, {});

  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayString();

  const getReminderStatus = (followUpDate, stage) => {
    if (!followUpDate || stage === 'Won' || stage === 'Lost') return null;
    if (followUpDate < todayStr) return { type: 'overdue', label: `Overdue: ${followUpDate}` };
    if (followUpDate === todayStr) return { type: 'today', label: `Due Today` };
    return { type: 'upcoming', label: `Due: ${followUpDate}` };
  };

  const getNextStage = (currentStage) => {
    const idx = STAGES.indexOf(currentStage);
    if (idx >= 0 && idx < STAGES.length - 2) {
      return STAGES[idx + 1];
    }
    if (currentStage === 'Meeting') return 'Won';
    return null;
  };

  // Drag and drop handlers
  const handleDragStart = (e, leadId) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData('text/plain', String(leadId));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    const leadId = draggedLeadId || Number(e.dataTransfer.getData('text/plain'));
    if (leadId) {
      onUpdateStage(leadId, targetStage);
    }
    setDraggedLeadId(null);
  };

  return (
    <div className="pipeline-view">
      <div className="view-header">
        <div>
          <h1 className="view-title">Pipeline Workflow</h1>
          <p className="view-subtitle">Track lead interactions, transition stages, and manage customer journey</p>
        </div>
        <button className="btn btn-primary" onClick={() => onOpenAddLead('New')}>
          <Plus size={18} />
          <span>Add Lead</span>
        </button>
      </div>

      <div className="board-container">
        {STAGES.map((stage) => {
          const stageLeads = groupedLeads[stage] || [];
          const nextStage = getNextStage(stage);

          return (
            <div 
              key={stage} 
              className={`board-column ${STAGE_CONFIG[stage].borderClass}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              {/* Column Header */}
              <div className="column-header">
                <div className="column-title-wrap">
                  <span className={`stage-badge ${STAGE_CONFIG[stage].badgeClass}`}>
                    {stage}
                  </span>
                  <span className="column-count">{stageLeads.length}</span>
                </div>
                <button 
                  className="btn-icon-subtle" 
                  onClick={() => onOpenAddLead(stage)}
                  title={`Add lead directly to ${stage}`}
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Column Cards */}
              <div className="column-cards">
                {stageLeads.length === 0 ? (
                  <div className="empty-column-dropzone">
                    <span>Drop leads here or click +</span>
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const reminder = getReminderStatus(lead.follow_up_date, lead.stage);

                    return (
                      <div 
                        key={lead.id} 
                        className={`lead-card ${draggedLeadId === lead.id ? 'dragging' : ''}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                      >
                        {/* Card Header */}
                        <div className="card-top">
                          <div className="card-business-info">
                            <h3 className="card-business-name" title={lead.business_name}>
                              {lead.business_name}
                            </h3>
                            {lead.website && (
                              <a 
                                href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                                target="_blank"
                                rel="noreferrer"
                                className="card-website-link"
                                title={`Visit ${lead.website}`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink size={13} />
                                <span>{lead.website.replace(/^https?:\/\/(www\.)?/, '')}</span>
                              </a>
                            )}
                          </div>
                          
                          <div className="card-actions">
                            <button 
                              className="card-action-btn" 
                              onClick={() => onEditLead(lead)}
                              title="Edit Lead"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button 
                              className="card-action-btn delete-btn" 
                              onClick={() => onDeleteLead(lead.id, lead.business_name)}
                              title="Delete Lead"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>

                        {/* Contact Info */}
                        {(lead.contact_name || lead.contact_email || lead.contact_phone) && (
                          <div className="card-contacts">
                            {lead.contact_name && (
                              <div className="contact-item">
                                <User size={13} className="text-muted" />
                                <span>{lead.contact_name}</span>
                              </div>
                            )}
                            {lead.contact_email && (
                              <a 
                                href={`mailto:${lead.contact_email}`} 
                                className="contact-item contact-link"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Mail size={13} className="text-muted" />
                                <span className="truncate">{lead.contact_email}</span>
                              </a>
                            )}
                            {lead.contact_phone && (
                              <a 
                                href={`tel:${lead.contact_phone}`} 
                                className="contact-item contact-link"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Phone size={13} className="text-muted" />
                                <span>{lead.contact_phone}</span>
                              </a>
                            )}
                          </div>
                        )}

                        {/* Notes Preview */}
                        {lead.notes && (
                          <div className="card-notes" title={lead.notes}>
                            <FileText size={12} className="text-muted" />
                            <p className="notes-text">{lead.notes}</p>
                          </div>
                        )}

                        {/* Reminder Badge */}
                        {reminder && (
                          <div className={`card-reminder reminder-${reminder.type}`}>
                            {reminder.type === 'overdue' && <AlertCircle size={13} />}
                            {reminder.type === 'today' && <Clock size={13} />}
                            {reminder.type === 'upcoming' && <Calendar size={13} />}
                            <span>{reminder.label}</span>
                          </div>
                        )}

                        {/* Quick Stage Transitions */}
                        <div className="card-footer">
                          <select 
                            className="stage-selector-inline"
                            value={lead.stage}
                            onChange={(e) => onUpdateStage(lead.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {STAGES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>

                          {nextStage && (
                            <button 
                              className="btn-next-stage"
                              onClick={() => onUpdateStage(lead.id, nextStage)}
                              title={`Advance to ${nextStage}`}
                            >
                              <span>{nextStage}</span>
                              <ArrowRight size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
