import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { quotationsApi } from '../../api/endpoints';
import { ArrowLeft, Sparkles, CheckCircle, XCircle, ShoppingCart, Send } from 'lucide-react';
import toast from 'react-hot-toast';

function fmtCurrency(v: any) {
  return `₹${parseFloat(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export default function QuotationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);

  const load = () => {
    if (!id) return;
    quotationsApi.get(id).then(setQuotation).catch(() => toast.error('Not found')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const updateStatus = async (status: string) => {
    if (!id) return;
    try {
      await quotationsApi.updateStatus(id, status);
      toast.success(`Quotation ${status.toLowerCase()}`);
      load();
    } catch { toast.error('Failed'); }
  };

  const handleConvert = async () => {
    if (!id) return;
    setConverting(true);
    try {
      const order = await quotationsApi.convertToOrder(id);
      toast.success('Sales Order created!');
      navigate(`/sales-orders/${order.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to convert');
    } finally { setConverting(false); }
  };

  if (loading) return <div style={{ padding: 32, color: '#64748b' }}>Loading...</div>;
  if (!quotation) return <div style={{ padding: 32, color: '#ef4444' }}>Quotation not found</div>;

  const taxBreakup = quotation.taxBreakup as any;
  const lineItems = (quotation.lineItems as any[]) || [];

  return (
    <div className="fade-in" style={{ padding: 32, maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} className="btn-ghost"><ArrowLeft size={16} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{quotation.quotationNo}</h1>
            {quotation.isAiGenerated && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(168,85,247,0.15)', color: '#c084fc', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                <Sparkles size={11} /> AI Generated
              </span>
            )}
            <span className={`badge ${
              quotation.status === 'APPROVED' ? 'badge-green' :
              quotation.status === 'REJECTED' ? 'badge-red' :
              quotation.status === 'SENT' ? 'badge-blue' : 'badge-gray'
            }`}>{quotation.status}</span>
          </div>
          {quotation.enquiry && (
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              Against: <Link to={`/enquiries/${quotation.enquiryId}`} style={{ color: '#f97316', textDecoration: 'none' }}>{quotation.enquiry.enquiryNo}</Link> — {quotation.enquiry.subject}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          {quotation.status === 'DRAFT' && (
            <button onClick={() => updateStatus('SENT')} className="btn-secondary">
              <Send size={14} /> Send to Customer
            </button>
          )}
          {['DRAFT', 'SENT', 'UNDER_NEGOTIATION'].includes(quotation.status) && (
            <>
              <button onClick={() => updateStatus('APPROVED')} className="btn-primary" style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                <CheckCircle size={14} /> Approve
              </button>
              <button onClick={() => updateStatus('REJECTED')} className="btn-secondary" style={{ color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}>
                <XCircle size={14} /> Reject
              </button>
            </>
          )}
          {quotation.status === 'APPROVED' && !quotation.salesOrders?.length && (
            <button onClick={handleConvert} disabled={converting} className="btn-primary">
              <ShoppingCart size={14} /> {converting ? 'Converting...' : 'Convert to Order'}
            </button>
          )}
        </div>
      </div>

      {/* AI Summary */}
      {quotation.isAiGenerated && quotation.aiPrompt && (
        <div style={{ padding: '12px 16px', background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: 10, marginBottom: 20, fontSize: 13, color: '#94a3b8' }}>
          <strong style={{ color: '#c084fc' }}>🤖 AI Basis:</strong> {JSON.parse(quotation.aiPrompt || '""')}
        </div>
      )}

      {/* Quotation Content */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, marginBottom: 24 }}>
          {[
            { label: 'Delivery', value: `${quotation.deliveryWeeks || '—'} weeks` },
            { label: 'Valid Until', value: quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString('en-IN') : '—' },
            { label: 'Payment Terms', value: quotation.paymentTerms || '—' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 14, color: '#e2e8f0' }}>{s.value}</div>
            </div>
          ))}
        </div>

        <h3 style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', marginBottom: 12 }}>Line Items</h3>
        <table>
          <thead>
            <tr>
              <th>#</th><th>Description</th><th>Qty</th><th>UOM</th><th>Unit Rate</th><th>HSN</th><th style={{ textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item: any, i: number) => (
              <tr key={i}>
                <td style={{ color: '#64748b' }}>{i + 1}</td>
                <td style={{ color: '#e2e8f0' }}>{item.description}</td>
                <td style={{ color: '#94a3b8' }}>{item.qty}</td>
                <td style={{ color: '#94a3b8' }}>{item.uom}</td>
                <td style={{ color: '#94a3b8' }}>{fmtCurrency(item.unitRate)}</td>
                <td style={{ color: '#64748b', fontFamily: 'monospace', fontSize: 12 }}>{item.hsnCode || '—'}</td>
                <td style={{ textAlign: 'right', color: '#f97316', fontWeight: 600 }}>{fmtCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
          <div style={{ width: 300 }}>
            {[
              { label: 'Subtotal', value: fmtCurrency(quotation.subtotal) },
              taxBreakup?.cgst && { label: `CGST`, value: fmtCurrency(taxBreakup.cgst) },
              taxBreakup?.sgst && { label: `SGST`, value: fmtCurrency(taxBreakup.sgst) },
              taxBreakup?.igst && { label: `IGST`, value: fmtCurrency(taxBreakup.igst) },
            ].filter(Boolean).map((row: any) => (
              <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13, color: '#94a3b8' }}>
                <span>{row.label}</span><span>{row.value}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', fontSize: 18, fontWeight: 700, color: '#f97316' }}>
              <span>Total</span><span>{fmtCurrency(quotation.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {quotation.notes && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Notes</div>
          <div style={{ fontSize: 13, color: '#94a3b8' }}>{quotation.notes}</div>
        </div>
      )}

      {quotation.salesOrders?.length > 0 && (
        <div className="card" style={{ padding: 16, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <div style={{ fontSize: 13, color: '#4ade80', fontWeight: 600 }}>
            ✅ Converted to Sales Order:&nbsp;
            <Link to={`/sales-orders/${quotation.salesOrders[0].id}`} style={{ color: '#f97316', textDecoration: 'none' }}>
              {quotation.salesOrders[0].orderNo}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
