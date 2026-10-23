import React from 'react';

const STAGES = ['New', 'Contacted', 'Replied', 'Meeting', 'Won', 'Lost'];

export default function PipelineBoard({
  leads,
  todayStr,
  onEditLead,
  onDeleteLead,
  onUpdateStage,
  onOpenAdd
}) {
  const getFollowUpStatus = (date, stage) => {
    if (!date || stage === 'Won' || stage === 'Lost') return null;
    if (date < todayStr) return { type: 'overdue', label: `Overdue: ${date}` };
    if (date === todayStr) return { type: 'due-today', label: `Due Today` };
    return { type: 'upcoming', label: `Due: ${date}` };
  };

  return (
    <div className="kanban-board">
      {STAGES.map((stage) => {
        const stageLeads = leads.filter((l) => l.stage === stage);

        return (
          <div key={stage} className="kanban-column">
            <div className="column-header">
              <span>{stage}</span>
              <span className="column-count">{stageLeads.length}</span>
            </div>

            {stageLeads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 8px', color: '#94a3b8', fontSize: '12px' }}>
                No leads
              </div>
            ) : (
              stageLeads.map((lead) => {
                const followUp = getFollowUpStatus(lead.follow_up_date, lead.stage);

                return (
                  <div key={lead.id} className="lead-card">
                    <div className="lead-card-header">
                      <span className="lead-title">{lead.business_name}</span>
                    </div>

                    {lead.website && (
                      <a
                        href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="lead-link"
                      >
                        {lead.website.replace(/^https?:\/\//, '')}
                      </a>
                    )}

                    {(lead.contact_name || lead.contact_email || lead.contact_phone) && (
                      <div className="lead-contact">
                        {lead.contact_name && <div><strong>Contact:</strong> {lead.contact_name}</div>}
                        {lead.contact_email && <div>{lead.contact_email}</div>}
                        {lead.contact_phone && <div>{lead.contact_phone}</div>}
                      </div>
                    )}

                    {lead.notes && <div className="lead-notes">{lead.notes}</div>}

                    {followUp && (
                      <span className={`badge badge-${followUp.type}`}>
                        {followUp.label}
                      </span>
                    )}

                    <div className="lead-card-footer">
                      <select
                        className="select-input"
                        style={{ padding: '3px 6px', fontSize: '12px' }}
                        value={lead.stage}
                        onChange={(e) => onUpdateStage(lead.id, e.target.value)}
                        aria-label="Change stage"
                      >
                        {STAGES.map((s) => (
                          <option key={s} value={s}>
                            Move: {s}
                          </option>
                        ))}
                      </select>

                      <div className="card-actions">
                        <button
                          className="btn-icon"
                          onClick={() => onEditLead(lead)}
                          title="Edit"
                        >
                          ✎
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => onDeleteLead(lead.id)}
                          title="Delete"
                          style={{ color: '#ef4444' }}
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            <button
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', marginTop: 'auto', borderStyle: 'dashed' }}
              onClick={() => onOpenAdd(stage)}
            >
              + Add to {stage}
            </button>
          </div>
        );
      })}
    </div>
  );
}
