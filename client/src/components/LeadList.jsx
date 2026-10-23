import React from 'react';

const STAGES = ['New', 'Contacted', 'Replied', 'Meeting', 'Won', 'Lost'];

export default function LeadList({
  leads,
  todayStr,
  onEditLead,
  onDeleteLead,
  onUpdateStage
}) {
  const getFollowUpStatus = (date, stage) => {
    if (!date || stage === 'Won' || stage === 'Lost') return null;
    if (date < todayStr) return { type: 'overdue', label: `${date} (Overdue)` };
    if (date === todayStr) return { type: 'due-today', label: `Today` };
    return { type: 'upcoming', label: date };
  };

  if (leads.length === 0) {
    return (
      <div className="empty-state">
        <h3>No leads found</h3>
        <p>Try adjusting your search or stage filters, or add a new lead.</p>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="lead-table">
        <thead>
          <tr>
            <th>Business & Website</th>
            <th>Contact</th>
            <th>Stage</th>
            <th>Follow-up</th>
            <th>Notes</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const followUp = getFollowUpStatus(lead.follow_up_date, lead.stage);

            return (
              <tr key={lead.id}>
                <td>
                  <strong style={{ display: 'block', color: '#0f172a' }}>
                    {lead.business_name}
                  </strong>
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
                </td>

                <td>
                  {lead.contact_name && <div>{lead.contact_name}</div>}
                  {lead.contact_email && (
                    <div style={{ color: '#64748b', fontSize: '12px' }}>{lead.contact_email}</div>
                  )}
                  {lead.contact_phone && (
                    <div style={{ color: '#64748b', fontSize: '12px' }}>{lead.contact_phone}</div>
                  )}
                  {!lead.contact_name && !lead.contact_email && !lead.contact_phone && (
                    <span style={{ color: '#94a3b8' }}>—</span>
                  )}
                </td>

                <td>
                  <select
                    className="select-input"
                    style={{ padding: '4px 8px', fontSize: '12px' }}
                    value={lead.stage}
                    onChange={(e) => onUpdateStage(lead.id, e.target.value)}
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>

                <td>
                  {followUp ? (
                    <span className={`badge badge-${followUp.type}`}>
                      {followUp.label}
                    </span>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>—</span>
                  )}
                </td>

                <td style={{ maxWidth: '250px' }}>
                  {lead.notes ? (
                    <span style={{ color: '#475569', fontSize: '12px' }}>{lead.notes}</span>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>—</span>
                  )}
                </td>

                <td style={{ textAlign: 'right' }}>
                  <div style={{ display: 'inline-flex', gap: '4px' }}>
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
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
