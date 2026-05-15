import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { purchaseApi } from '../../api/endpoints';
import { ArrowLeft, FileText, ShoppingBag, Truck, CheckCircle, XCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';

function fmtCurrency(v: any) {
  return `₹${parseFloat(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export default function PurchaseOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [po, setPo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!id) return;
    purchaseApi.getPO(id).then(setPo).catch(() => toast.error('PO not found')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const updateStatus = async (status: string) => {
    try {
      await purchaseApi.updatePOStatus(id!, status);
      toast.success(`PO ${status.toLowerCase()}`);
      load();
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div style={{ padding: 32, color: '#64748b' }}>Loading...</div>;
  if (!po) return <div style={{ padding: 32, color: '#ef4444' }}>Purchase Order not found</div>;

  const items = (po.lineItems as any[]) || [];

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} className="btn-ghost"><ArrowLeft size={16} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{po.poNo}</h1>
            <span className={`badge ${
              po.status === 'SENT' ? 'badge-blue' :
              po.status === 'FULLY_RECEIVED' ? 'badge-green' :
              po.status === 'CANCELLED' ? 'badge-red' : 'badge-gray'
            }`}>{po.status?.replace(/_/g, ' ')}</span>
          </div>
          <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>
            Vendor: <Link to={`/purchase/vendors/${po.vendorId}`} style={{ color: '#f97316', textDecoration: 'none' }}>{po.vendor?.name}</Link>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {po.status === 'DRAFT' && (
            <button onClick={() => updateStatus('SENT')} className="btn-secondary">
              <Send size={14} /> Send PO
            </button>
          )}
          {['SENT', 'ACKNOWLEDGED'].includes(po.status) && (
            <button onClick={() => updateStatus('CANCELLED')} className="btn-ghost" style={{ color: '#ef4444' }}>
              <XCircle size={14} /> Cancel PO
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div>
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', marginTop: 0, marginBottom: 16 }}>Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Description</th><th>Qty</th><th>UOM</th><th>Rate</th><th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td style={{ color: '#e2e8f0' }}>{item.description}</td>
                    <td style={{ color: '#94a3b8' }}>{item.qty}</td>
                    <td style={{ color: '#94a3b8' }}>{item.uom}</td>
                    <td style={{ color: '#94a3b8' }}>{fmtCurrency(item.unitPrice || item.rate)}</td>
                    <td style={{ textAlign: 'right', color: '#f97316', fontWeight: 600 }}>{fmtCurrency(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
              <div style={{ width: 200 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13, color: '#64748b' }}>
                  <span>Subtotal</span><span>{fmtCurrency(po.subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13, color: '#64748b' }}>
                  <span>Tax</span><span>{fmtCurrency(po.taxAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.05)', fontSize: 16, fontWeight: 700, color: '#f97316' }}>
                  <span>Total</span><span>{fmtCurrency(po.totalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {po.notes && (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>Notes</div>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>{po.notes}</div>
            </div>
          )}
        </div>

        <div>
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginTop: 0, marginBottom: 16 }}>Delivery Info</h3>
            <div style={{ display: 'grid', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Expected Delivery</div>
                <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>
                  {po.deliveryDate ? new Date(po.deliveryDate).toLocaleDateString('en-IN') : 'Not specified'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Delivery Address</div>
                <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
                  {po.deliveryAddr ? (typeof po.deliveryAddr === 'string' ? po.deliveryAddr : JSON.stringify(po.deliveryAddr)) : 'Factory Warehouse'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#64748b' }}>Payment Terms</div>
                <div style={{ fontSize: 13, color: '#e2e8f0' }}>{po.paymentTerms || 'As per agreement'}</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginTop: 0, marginBottom: 16 }}>Receipts (GRNs)</h3>
            {po.grns?.length > 0 ? (
              <div style={{ display: 'grid', gap: 10 }}>
                {po.grns.map((grn: any) => (
                  <div key={grn.id} style={{ padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 8, fontSize: 12 }}>
                    <div style={{ color: '#3b82f6', fontWeight: 600 }}>{grn.grnNo}</div>
                    <div style={{ color: '#64748b', marginTop: 2 }}>{new Date(grn.receivedAt).toLocaleDateString('en-IN')}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 12, color: '#64748b', fontSize: 12 }}>No items received yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
