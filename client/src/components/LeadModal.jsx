import React, { useState, useEffect } from 'react';
import { X, Building2, Globe, User, Mail, Phone, Calendar, FileText, CheckCircle2 } from 'lucide-react';

const STAGES = ['New', 'Contacted', 'Replied', 'Meeting', 'Won', 'Lost'];

export default function LeadModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = null, 
  defaultStage = 'New' 
}) {
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

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setErrors({});
  }, [initialData, defaultStage, isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.business_name.trim()) {
      newErrors.business_name = 'Business name is required';
    }
    if (formData.contact_email && !formData.contact_email.includes('@')) {
      newErrors.contact_email = 'Please enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSave(formData, initialData?.id);
      onClose();
    } catch (err) {
      setErrors({ form: err.message || 'Failed to save lead' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Building2 size={22} className="text-primary" />
            <div>
              <h2 className="modal-title">
                {initialData ? 'Edit Lead Details' : 'Add New Business Lead'}
              </h2>
              <p className="modal-subtitle">
                {initialData ? 'Update contact information and pipeline stage' : 'Record a new prospective business to contact'}
              </p>
            </div>
          </div>
          <button className="btn-close-modal" onClick={onClose} title="Close (Esc)">
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          {errors.form && (
            <div className="form-error-banner">
              {errors.form}
            </div>
          )}

          <div className="form-row">
            {/* Business Name */}
            <div className="form-group flex-1">
              <label className="form-label" htmlFor="business_name">
                Business Name <span className="text-rose">*</span>
              </label>
              <div className="input-with-icon">
                <Building2 size={16} className="input-icon" />
                <input
                  type="text"
                  id="business_name"
                  name="business_name"
                  className={`form-input ${errors.business_name ? 'input-error' : ''}`}
                  placeholder="e.g. Acme Innovations"
                  value={formData.business_name}
                  onChange={handleChange}
                  autoFocus
                />
              </div>
              {errors.business_name && <span className="field-error">{errors.business_name}</span>}
            </div>

            {/* Website */}
            <div className="form-group flex-1">
              <label className="form-label" htmlFor="website">
                Website
              </label>
              <div className="input-with-icon">
                <Globe size={16} className="input-icon" />
                <input
                  type="text"
                  id="website"
                  name="website"
                  className="form-input"
                  placeholder="e.g. acme.com or https://acme.com"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            {/* Contact Name */}
            <div className="form-group flex-1">
              <label className="form-label" htmlFor="contact_name">
                Contact Person Name
              </label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  id="contact_name"
                  name="contact_name"
                  className="form-input"
                  placeholder="e.g. Sarah Connor"
                  value={formData.contact_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Contact Email */}
            <div className="form-group flex-1">
              <label className="form-label" htmlFor="contact_email">
                Contact Email
              </label>
              <div className="input-with-icon">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  id="contact_email"
                  name="contact_email"
                  className={`form-input ${errors.contact_email ? 'input-error' : ''}`}
                  placeholder="e.g. sarah@acme.com"
                  value={formData.contact_email}
                  onChange={handleChange}
                />
              </div>
              {errors.contact_email && <span className="field-error">{errors.contact_email}</span>}
            </div>
          </div>

          <div className="form-row">
            {/* Contact Phone */}
            <div className="form-group flex-1">
              <label className="form-label" htmlFor="contact_phone">
                Contact Phone
              </label>
              <div className="input-with-icon">
                <Phone size={16} className="input-icon" />
                <input
                  type="tel"
                  id="contact_phone"
                  name="contact_phone"
                  className="form-input"
                  placeholder="e.g. +1 (555) 234-5678"
                  value={formData.contact_phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Pipeline Stage */}
            <div className="form-group flex-1">
              <label className="form-label" htmlFor="stage">
                Pipeline Stage
              </label>
              <select
                id="stage"
                name="stage"
                className="form-select"
                value={formData.stage}
                onChange={handleChange}
              >
                {STAGES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Follow-up Date */}
          <div className="form-group">
            <label className="form-label" htmlFor="follow_up_date">
              Follow-up Reminder Date
            </label>
            <div className="input-with-icon">
              <Calendar size={16} className="input-icon" />
              <input
                type="date"
                id="follow_up_date"
                name="follow_up_date"
                className="form-input"
                value={formData.follow_up_date}
                onChange={handleChange}
              />
            </div>
            <span className="field-hint">
              Set a target date to trigger follow-up alerts and overdue notifications.
            </span>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="form-label" htmlFor="notes">
              Notes & Interaction History
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              className="form-textarea"
              placeholder="Record conversation details, next steps, feedback, deal value..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          {/* Modal Footer */}
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <span>{initialData ? 'Save Changes' : 'Create Lead'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
