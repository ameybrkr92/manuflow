import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { enquiriesApi, customersApi } from '../../api/endpoints';
import { ArrowLeft, Upload, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NewEnquiryPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [form, setForm] = useState({
    customerId: params.get('customerId') || '',
    subject: '',
    description: '',
    deliveryRequired: '',
    notes: '',
  });
  const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>([
    { key: 'Machine Type', value: '' },
    { key: 'Quantity', value: '' },
    { key: 'Material', value: '' },
  ]);

  useEffect(() => {
    customersApi.list().then(setCustomers);
  }, []);

  const set = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));
  const addSpec = () => setSpecs(p => [...p, { key: '', value: '' }]);
  const removeSpec = (i: number) => setSpecs(p => p.filter((_, idx) => idx !== i));
  const setSpec = (i: number, f: 'key' | 'value', v: string) =>
    setSpecs(p => p.map((s, idx) => idx === i ? { ...s, [f]: v } : s));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId || !form.subject) return toast.error('Customer and Subject required');
    setLoading(true);
    try {
      const specifications = specs.reduce((acc: any, s) => { if (s.key) acc[s.key] = s.value; return acc; }, {});
      const enquiry = await enquiriesApi.create({ ...form, specifications });
      toast.success('Enquiry created successfully');
      navigate(`/enquiries/${enquiry.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create enquiry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ padding: 32, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button onClick={() => navigate(-1)} className="btn-ghost"><ArrowLeft size={16} /> Back</button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>New Enquiry</h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>Capture customer RFQ — then generate AI quotation</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginTop: 0, marginBottom: 20 }}>Enquiry Details</h3>
          <div style={{ display: 'grid', gap: 16 }}>
            <div>
              <label>Customer *</label>
              <select className="select" value={form.customerId} onChange={e => set('customerId', e.target.value)} required>
                <option value="">Select Customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
              </select>
            </div>
            <div>
              <label>Subject / Product Required *</label>
              <input className="input" value={form.subject} onChange={e => set('subject', e.target.value)} placeholder="e.g., 5-Axis CNC Milling Machine, 2 nos" required />
            </div>
            <div>
              <label>Detailed Description</label>
              <textarea className="input" rows={4} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Customer's requirements, application details, special conditions..." style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label>Delivery Required By</label>
              <input className="input" type="date" value={form.deliveryRequired} onChange={e => set('deliveryRequired', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>Technical Specifications</h3>
            <button type="button" onClick={addSpec} className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>
              <Plus size={13} /> Add Row
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '4px 10px', marginBottom: 4 }}>
            <label style={{ marginBottom: 4 }}>Parameter</label>
            <label style={{ marginBottom: 4 }}>Value / Requirement</label>
            <div />
          </div>
          {specs.map((s, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '6px 10px', marginBottom: 6 }}>
              <input className="input" placeholder="e.g., Stroke Length" value={s.key} onChange={e => setSpec(i, 'key', e.target.value)} />
              <input className="input" placeholder="e.g., 500mm" value={s.value} onChange={e => setSpec(i, 'value', e.target.value)} />
              <button type="button" onClick={() => removeSpec(i)} className="btn-ghost" style={{ color: '#ef4444' }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <label>Internal Notes</label>
          <textarea className="input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Notes for internal team..." style={{ resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '12px 28px' }}>
            {loading ? 'Creating...' : 'Create Enquiry'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
          <span style={{ fontSize: 12, color: '#64748b', marginLeft: 8 }}>
            💡 After creating, use <strong style={{ color: '#c084fc' }}>AI Generate Quotation</strong> to draft a quote instantly
          </span>
        </div>
      </form>
    </div>
  );
}
