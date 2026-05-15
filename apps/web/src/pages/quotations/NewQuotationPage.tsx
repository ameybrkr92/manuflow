import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { quotationsApi, enquiriesApi, customersApi } from '../../api/endpoints';
import { ArrowLeft, Sparkles, Plus, Trash2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface LineItem { description: string; qty: number; uom: string; unitRate: number; amount: number; hsnCode?: string; }

const defaultItem = (): LineItem => ({ description: '', qty: 1, uom: 'Nos', unitRate: 0, amount: 0, hsnCode: '' });

function fmtINR(n: number) { return n.toLocaleString('en-IN', { maximumFractionDigits: 2 }); }

export default function NewQuotationPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const enquiryId = params.get('enquiryId');

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);

  const [form, setForm] = useState({
    customerId: '', enquiryId: enquiryId || '',
    deliveryWeeks: 12, paymentTerms: '30% advance, 30% design approval, 30% FAT, 10% installation',
    validUntil: '', notes: '', termsConditions: 'Subject to Pune jurisdiction. Force majeure applicable.',
    gstType: 'CGST_SGST', gstRate: 18,
  });
  const [items, setItems] = useState<LineItem[]>([defaultItem()]);
  const [aiSummary, setAiSummary] = useState('');

  const subtotal = items.reduce((s, i) => s + (i.amount || 0), 0);
  const taxAmount = subtotal * (form.gstRate / 100);
  const totalAmount = subtotal + taxAmount;

  useEffect(() => {
    customersApi.list().then(setCustomers);
    enquiriesApi.list().then(setEnquiries);
  }, []);

  useEffect(() => {
    if (enquiryId) {
      enquiriesApi.get(enquiryId).then(e => {
        setSelectedEnquiry(e);
        setForm(p => ({ ...p, customerId: e.customerId, enquiryId }));
      });
    }
  }, [enquiryId]);

  const set = (f: string, v: any) => setForm(p => ({ ...p, [f]: v }));

  const setItem = (i: number, f: keyof LineItem, v: any) => {
    setItems(prev => prev.map((item, idx) => {
      if (idx !== i) return item;
      const updated = { ...item, [f]: v };
      if (f === 'qty' || f === 'unitRate') updated.amount = updated.qty * updated.unitRate;
      return updated;
    }));
  };

  const addItem = () => setItems(p => [...p, defaultItem()]);
  const removeItem = (i: number) => setItems(p => p.filter((_, idx) => idx !== i));

  const handleAiGenerate = async () => {
    const eid = form.enquiryId;
    if (!eid) return toast.error('Select an enquiry first to use AI generation');
    setAiLoading(true);
    toast('🤖 Claude is generating your quotation...', { duration: 5000 });
    try {
      const quotation = await quotationsApi.aiGenerate(eid);
      toast.success('AI Quotation generated!');
      navigate(`/quotations/${quotation.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'AI generation failed. Check API key.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerId) return toast.error('Select a customer');
    if (!items.some(i => i.description)) return toast.error('Add at least one line item');
    setLoading(true);
    try {
      const taxBreakup = form.gstType === 'IGST'
        ? { igst: taxAmount }
        : { cgst: taxAmount / 2, sgst: taxAmount / 2 };
      const q = await quotationsApi.create({
        ...form,
        lineItems: items,
        subtotal, taxAmount, totalAmount, taxBreakup,
        validUntil: form.validUntil || undefined,
      });
      toast.success('Quotation created');
      navigate(`/quotations/${q.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create quotation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in" style={{ padding: 32, maxWidth: 960, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button onClick={() => navigate(-1)} className="btn-ghost"><ArrowLeft size={16} /> Back</button>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>New Quotation</h1>
            <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>Manual entry or generate instantly with AI</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleAiGenerate}
          disabled={aiLoading}
          style={{
            padding: '10px 20px', borderRadius: 8, border: '1px solid rgba(168,85,247,0.4)',
            background: 'rgba(168,85,247,0.1)', color: '#c084fc', fontWeight: 600, fontSize: 14,
            cursor: aiLoading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8,
            transition: 'all 0.2s',
          }}
        >
          {aiLoading ? <Loader2 size={16} className="spinner" /> : <Sparkles size={16} />}
          {aiLoading ? 'Claude is thinking...' : 'AI Generate Quotation'}
        </button>
      </div>

      {/* AI hint banner */}
      <div style={{ padding: '12px 16px', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 10, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Sparkles size={16} color="#c084fc" />
        <div style={{ fontSize: 13, color: '#94a3b8' }}>
          <strong style={{ color: '#c084fc' }}>AI Generate</strong> — Select an enquiry above, click the purple button, and Claude will draft a complete quotation with line items, GST, delivery timeline, and payment milestones in seconds.
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginTop: 0, marginBottom: 20 }}>Header</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label>Customer *</label>
              <select className="select" value={form.customerId} onChange={e => set('customerId', e.target.value)} required>
                <option value="">Select Customer</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.code})</option>)}
              </select>
            </div>
            <div>
              <label>Against Enquiry</label>
              <select className="select" value={form.enquiryId} onChange={e => {
                set('enquiryId', e.target.value);
                if (e.target.value) {
                  const enq = enquiries.find(eq => eq.id === e.target.value);
                  if (enq) { setSelectedEnquiry(enq); set('customerId', enq.customerId); }
                }
              }}>
                <option value="">— None (manual) —</option>
                {enquiries.map(e => <option key={e.id} value={e.id}>{e.enquiryNo} - {e.subject}</option>)}
              </select>
            </div>
            <div>
              <label>Delivery (Weeks)</label>
              <input className="input" type="number" value={form.deliveryWeeks} onChange={e => set('deliveryWeeks', parseInt(e.target.value))} min={1} />
            </div>
            <div>
              <label>Valid Until</label>
              <input className="input" type="date" value={form.validUntil} onChange={e => set('validUntil', e.target.value)} />
            </div>
            <div>
              <label>GST Type</label>
              <select className="select" value={form.gstType} onChange={e => set('gstType', e.target.value)}>
                <option value="CGST_SGST">CGST + SGST (Same State)</option>
                <option value="IGST">IGST (Interstate)</option>
              </select>
            </div>
            <div>
              <label>GST Rate (%)</label>
              <select className="select" value={form.gstRate} onChange={e => set('gstRate', parseInt(e.target.value))}>
                <option value={5}>5%</option><option value={12}>12%</option>
                <option value={18}>18%</option><option value={28}>28%</option>
              </select>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>Line Items</h3>
            <button type="button" onClick={addItem} className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>
              <Plus size={13} /> Add Item
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '3fr 80px 80px 120px 120px 100px auto', gap: '4px 8px', marginBottom: 8 }}>
            {['Description', 'Qty', 'UOM', 'Unit Rate ₹', 'Amount ₹', 'HSN', ''].map(h => (
              <label key={h} style={{ marginBottom: 0 }}>{h}</label>
            ))}
          </div>
          {items.map((item, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '3fr 80px 80px 120px 120px 100px auto', gap: '6px 8px', marginBottom: 6 }}>
              <input className="input" placeholder="Item description" value={item.description} onChange={e => setItem(i, 'description', e.target.value)} />
              <input className="input" type="number" value={item.qty} onChange={e => setItem(i, 'qty', parseFloat(e.target.value))} min={0} />
              <select className="select" value={item.uom} onChange={e => setItem(i, 'uom', e.target.value)}>
                {['Nos', 'Set', 'Kg', 'MT', 'Mtr', 'Sqm', 'Ltr', 'LS'].map(u => <option key={u}>{u}</option>)}
              </select>
              <input className="input" type="number" value={item.unitRate} onChange={e => setItem(i, 'unitRate', parseFloat(e.target.value))} min={0} />
              <input className="input" value={`₹${fmtINR(item.amount)}`} readOnly style={{ color: '#f97316', fontWeight: 600 }} />
              <input className="input" placeholder="HSN Code" value={item.hsnCode || ''} onChange={e => setItem(i, 'hsnCode', e.target.value)} />
              <button type="button" onClick={() => removeItem(i)} className="btn-ghost" style={{ color: '#ef4444' }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {/* Totals */}
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: 280 }}>
              {[
                { label: 'Subtotal', value: `₹${fmtINR(subtotal)}` },
                form.gstType === 'CGST_SGST'
                  ? { label: `CGST (${form.gstRate / 2}%)`, value: `₹${fmtINR(taxAmount / 2)}` }
                  : { label: `IGST (${form.gstRate}%)`, value: `₹${fmtINR(taxAmount)}` },
                ...(form.gstType === 'CGST_SGST' ? [{ label: `SGST (${form.gstRate / 2}%)`, value: `₹${fmtINR(taxAmount / 2)}` }] : []),
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13, color: '#94a3b8' }}>
                  <span>{row.label}</span><span>{row.value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: 16, fontWeight: 700, color: '#f97316' }}>
                <span>Total</span><span>₹{fmtINR(totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginTop: 0, marginBottom: 16 }}>Terms & Notes</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            <div>
              <label>Payment Terms</label>
              <input className="input" value={form.paymentTerms} onChange={e => set('paymentTerms', e.target.value)} />
            </div>
            <div>
              <label>Notes to Customer</label>
              <textarea className="input" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} style={{ resize: 'vertical' }} />
            </div>
            <div>
              <label>Terms & Conditions</label>
              <textarea className="input" rows={2} value={form.termsConditions} onChange={e => set('termsConditions', e.target.value)} style={{ resize: 'vertical' }} />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="submit" disabled={loading} className="btn-primary" style={{ padding: '12px 28px' }}>
            {loading ? 'Creating...' : 'Save Quotation as Draft'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
