import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { customersApi } from '../../api/endpoints';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ContactPerson { name: string; designation: string; phone: string; email: string; }

export default function NewCustomerPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: '', name: '', gstin: '', pan: '',
    billingAddress: { line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' },
    paymentTerms: '30 days', creditLimit: 0, notes: '',
  });
  const [contacts, setContacts] = useState<ContactPerson[]>([{ name: '', designation: '', phone: '', email: '' }]);

  const set = (field: string, value: any) => setForm(prev => ({ ...prev, [field]: value }));
  const setAddr = (field: string, value: string) =>
    setForm(prev => ({ ...prev, billingAddress: { ...prev.billingAddress, [field]: value } }));

  const addContact = () => setContacts(prev => [...prev, { name: '', designation: '', phone: '', email: '' }]);
  const removeContact = (i: number) => setContacts(prev => prev.filter((_, idx) => idx !== i));
  const setContact = (i: number, field: string, value: string) =>
    setContacts(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: value } : c));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.name) return toast.error('Code and Name are required');
    setLoading(true);
    try {
      const customer = await customersApi.create({ ...form, contactPersons: contacts.filter(c => c.name) });
      toast.success('Customer created successfully');
      navigate(`/customers/${customer.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ padding: 32, maxWidth: 800, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button onClick={() => navigate(-1)} className="btn-ghost">
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>New Customer</h1>
          <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>Create a new customer master record</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Basic Info */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 20, marginTop: 0 }}>Basic Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label>Customer Code *</label>
              <input className="input" value={form.code} onChange={e => set('code', e.target.value.toUpperCase())} placeholder="ACME001" required />
            </div>
            <div>
              <label>Company Name *</label>
              <input className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Acme Industries Pvt Ltd" required />
            </div>
            <div>
              <label>GSTIN</label>
              <input className="input" value={form.gstin} onChange={e => set('gstin', e.target.value.toUpperCase())} placeholder="27AABCA1234A1Z5" maxLength={15} />
            </div>
            <div>
              <label>PAN</label>
              <input className="input" value={form.pan} onChange={e => set('pan', e.target.value.toUpperCase())} placeholder="AABCA1234A" maxLength={10} />
            </div>
            <div>
              <label>Payment Terms</label>
              <select className="select" value={form.paymentTerms} onChange={e => set('paymentTerms', e.target.value)}>
                <option>Advance</option><option>7 days</option><option>15 days</option>
                <option>30 days</option><option>45 days</option><option>60 days</option>
                <option>Milestone-based</option>
              </select>
            </div>
            <div>
              <label>Credit Limit (₹)</label>
              <input className="input" type="number" value={form.creditLimit} onChange={e => set('creditLimit', parseFloat(e.target.value))} placeholder="500000" />
            </div>
          </div>
        </div>

        {/* Billing Address */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 20, marginTop: 0 }}>Billing Address</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <label>Address Line 1</label>
              <input className="input" value={form.billingAddress.line1} onChange={e => setAddr('line1', e.target.value)} placeholder="Plot No, Street" />
            </div>
            <div>
              <label>Address Line 2</label>
              <input className="input" value={form.billingAddress.line2} onChange={e => setAddr('line2', e.target.value)} placeholder="Area, Landmark" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              <div>
                <label>City</label>
                <input className="input" value={form.billingAddress.city} onChange={e => setAddr('city', e.target.value)} placeholder="Mumbai" />
              </div>
              <div>
                <label>State</label>
                <select className="select" value={form.billingAddress.state} onChange={e => setAddr('state', e.target.value)}>
                  <option value="">Select State</option>
                  {['Maharashtra','Gujarat','Karnataka','Tamil Nadu','Telangana','Rajasthan','Delhi','West Bengal','UP','MP','Punjab','Haryana','Andhra Pradesh','Kerala','Odisha','Jharkhand','Bihar','Chhattisgarh','Uttarakhand','Himachal Pradesh','Goa'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label>Pincode</label>
                <input className="input" value={form.billingAddress.pincode} onChange={e => setAddr('pincode', e.target.value)} placeholder="400001" maxLength={6} />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Persons */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>Contact Persons</h3>
            <button type="button" onClick={addContact} className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>
              <Plus size={13} /> Add Contact
            </button>
          </div>
          {contacts.map((c, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 10, marginBottom: 10 }}>
              <input className="input" placeholder="Name" value={c.name} onChange={e => setContact(i, 'name', e.target.value)} />
              <input className="input" placeholder="Designation" value={c.designation} onChange={e => setContact(i, 'designation', e.target.value)} />
              <input className="input" placeholder="Phone" value={c.phone} onChange={e => setContact(i, 'phone', e.target.value)} />
              <input className="input" placeholder="Email" value={c.email} onChange={e => setContact(i, 'email', e.target.value)} />
              {contacts.length > 1 && (
                <button type="button" onClick={() => removeContact(i)} className="btn-ghost" style={{ color: '#ef4444' }}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Notes */}
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <label>Notes</label>
          <textarea className="input" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Internal notes about this customer..." style={{ resize: 'vertical' }} />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '12px 28px' }}>
            {loading ? 'Creating...' : 'Create Customer'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
