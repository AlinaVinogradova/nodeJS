import React, { useState, useEffect } from 'react';

const STAGES = ['New', 'Contacted', 'Replied', 'Meeting', 'Won', 'Lost'];

export default function LeadModal({ isOpen, onClose, onSave, initialData, defaultStage = 'New' }) {
  const [formData, setFormData] = useState({
    business_name: '',
    website: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    stage: 'New',
    follow_up_date: '',
    notes: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        business_name: initialData.business_name || '',
        website: initialData.website || '',
        contact_name: initialData.contact_name || '',
        contact_email: initialData.contact_email || '',
        contact_phone: initialData.contact_phone || '',
        stage: initialData.stage || 'New',
        follow_up_date: initialData.follow_up_date || '',
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        business_name: '',
        website: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        stage: defaultStage || 'New',
        follow_up_date: '',
        notes: ''
      });
    }
    setError('');
  }, [initialData, defaultStage, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.business_name.trim()) {
      return setError('Business name is required');
    }

    try {
      setSubmitting(true);
      await onSave(formData, initialData?.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save lead');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{initialData ? 'Edit Lead' : 'Add New Lead'}</h2>
          <button className="btn-icon" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="business_name">Business Name *</label>
              <input
                id="business_name"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                placeholder="Acme Corp"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="stage">Pipeline Stage</label>
                <select
                  id="stage"
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                >
                  {STAGES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact_name">Contact Name</label>
                <input
                  id="contact_name"
                  name="contact_name"
                  value={formData.contact_name}
                  onChange={handleChange}
                  placeholder="John Smith"
                />
              </div>

              <div className="form-group">
                <label htmlFor="contact_email">Contact Email</label>
                <input
                  id="contact_email"
                  name="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="contact_phone">Contact Phone</label>
                <input
                  id="contact_phone"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="form-group">
                <label htmlFor="follow_up_date">Follow-up Reminder Date</label>
                <input
                  id="follow_up_date"
                  name="follow_up_date"
                  type="date"
                  value={formData.follow_up_date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Log discussion notes, next steps..."
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : initialData ? 'Update Lead' : 'Add Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
