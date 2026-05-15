import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { salesOrdersApi } from '../../api/endpoints';
import { ArrowLeft, CheckCircle, Clock, IndianRupee, Package } from 'lucide-react';
import toast from 'react-hot-toast';

function fmtCurrency(v: any) {
  return `₹${parseFloat(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

const milestoneStatusConfig: Record<string, { cls: string; icon: React.ReactNode }> = {
  PENDING: { cls: 'badge-gray', icon: <Clock size={12} /> },
  INVOICED: { cls: 'badge-amber', icon: <IndianRupee size={12} /> },
  RECEIVED: { cls: 'badge-green', icon: <CheckCircle size={12} /> },
};

export default function SalesOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!id) return;
    salesOrdersApi.get(id).then(setOrder).catch(() => toast.error('Not found')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const updateMilestone = async (milestoneId: string, status: string) => {
    if (!id) return;
    try {
      await salesOrdersApi.updateMilestone(id, milestoneId, { status, ...(status === 'RECEIVED' ? { receivedDate: new Date().toISOString() } : {}) });
      toast.success('Milestone updated');
      load();
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div style={{ padding: 32, color: '#64748b' }}>Loading...</div>;
  if (!order) return <div style={{ padding: 32, color: '#ef4444' }}>Order not found</div>;

  const lineItems = (order.lineItems as any[]) || [];
  const milestones = order.paymentMilestones || [];
  const totalReceived = milestones.filter((m: any) => m.status === 'RECEIVED').reduce((s: number, m: any) => s + parseFloat(m.amount), 0);
  const totalPending = parseFloat(order.totalAmount) - totalReceived;

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} className="btn-ghost"><ArrowLeft size={16} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{order.orderNo}</h1>
            <span className={`badge ${
              order.status === 'DELIVERED' ? 'badge-green' : order.status === 'IN_PRODUCTION' ? 'badge-amber' :
              order.status === 'CONFIRMED' ? 'badge-blue' : 'badge-gray'
            }`}>{order.status?.replace(/_/g, ' ')}</span>
          </div>
          <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{order.subject}</div>
          <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
            Customer: <Link to={`/customers/${order.customerId}`} style={{ color: '#f97316', textDecoration: 'none' }}>{order.customer?.name}</Link>
            {order.quotation && <> · Quotation: <Link to={`/quotations/${order.quotationId}`} style={{ color: '#f97316', textDecoration: 'none' }}>{order.quotation.quotationNo}</Link></>}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#f97316' }}>{fmtCurrency(order.totalAmount)}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Total Order Value</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Payment Milestones */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginTop: 0, marginBottom: 4 }}>Payment Milestones</h3>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: '#4ade80' }}>Received: {fmtCurrency(totalReceived)}</div>
            <div style={{ fontSize: 12, color: '#fbbf24' }}>Pending: {fmtCurrency(totalPending)}</div>
          </div>

          {/* Progress bar */}
          <div style={{ height: 6, background: '#1e2535', borderRadius: 3, marginBottom: 16, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 3,
              width: `${Math.min(100, (totalReceived / parseFloat(order.totalAmount)) * 100)}%`,
              background: 'linear-gradient(90deg, #22c55e, #4ade80)',
              transition: 'width 0.5s ease',
            }} />
          </div>

          {milestones.length === 0 ? (
            <div style={{ fontSize: 13, color: '#64748b', textAlign: 'center', padding: 16 }}>No milestones defined</div>
          ) : (
            milestones.map((m: any) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{m.triggerEvent}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#f97316', minWidth: 80, textAlign: 'right' }}>
                  {fmtCurrency(m.amount)}
                </div>
                <span className={`badge ${milestoneStatusConfig[m.status]?.cls || 'badge-gray'}`}>
                  {milestoneStatusConfig[m.status]?.icon} {m.status}
                </span>
                {m.status !== 'RECEIVED' && (
                  <button
                    onClick={() => updateMilestone(m.id, m.status === 'PENDING' ? 'INVOICED' : 'RECEIVED')}
                    className="btn-ghost"
                    style={{ fontSize: 11, color: '#f97316' }}
                  >
                    {m.status === 'PENDING' ? 'Mark Invoiced' : 'Mark Received'}
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Work Orders */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>Work Orders</h3>
            <Link to={`/production?soId=${order.id}`} style={{ fontSize: 12, color: '#f97316', textDecoration: 'none' }}>Plan Production →</Link>
          </div>
          {order.workOrders?.length ? order.workOrders.map((wo: any) => (
            <div key={wo.id} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, color: '#f97316', fontWeight: 500 }}>{wo.workOrderNo}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{wo.productName}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`badge ${wo.status === 'COMPLETED' ? 'badge-green' : wo.status === 'IN_PROGRESS' ? 'badge-amber' : 'badge-gray'}`}>
                    {wo.status}
                  </span>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>{wo.progress}% done</div>
                </div>
              </div>
              <div style={{ marginTop: 8, height: 4, background: '#1e2535', borderRadius: 2 }}>
                <div style={{ height: '100%', width: `${wo.progress}%`, background: '#f97316', borderRadius: 2 }} />
              </div>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: 24, color: '#64748b', fontSize: 13 }}>
              No work orders yet. <Link to="/production" style={{ color: '#f97316' }}>Create production plan</Link>
            </div>
          )}
        </div>
      </div>

      {/* Line Items */}
      {lineItems.length > 0 && (
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginTop: 0, marginBottom: 12 }}>Order Line Items</h3>
          <table>
            <thead><tr><th>#</th><th>Description</th><th>Qty</th><th>UOM</th><th style={{ textAlign: 'right' }}>Amount</th></tr></thead>
            <tbody>
              {lineItems.map((item: any, i: number) => (
                <tr key={i}>
                  <td style={{ color: '#64748b' }}>{i + 1}</td>
                  <td style={{ color: '#e2e8f0' }}>{item.description}</td>
                  <td style={{ color: '#94a3b8' }}>{item.qty}</td>
                  <td style={{ color: '#94a3b8' }}>{item.uom}</td>
                  <td style={{ textAlign: 'right', color: '#f97316', fontWeight: 600 }}>{fmtCurrency(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12, gap: 20, fontSize: 14 }}>
            <span style={{ color: '#64748b' }}>Total: <strong style={{ color: '#f97316', fontSize: 16 }}>{fmtCurrency(order.totalAmount)}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
}
