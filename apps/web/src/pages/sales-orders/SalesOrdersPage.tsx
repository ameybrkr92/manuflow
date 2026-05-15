import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { salesOrdersApi } from '../../api/endpoints';
import { ShoppingCart, AlertTriangle, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const statusCls: Record<string, string> = {
  CONFIRMED: 'badge-blue', IN_PRODUCTION: 'badge-amber', DISPATCHED: 'badge-purple',
  DELIVERED: 'badge-green', CANCELLED: 'badge-gray', ON_HOLD: 'badge-red',
};

function fmtCurrency(v: any) {
  const n = parseFloat(v) || 0;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  const load = (status?: string) => {
    setLoading(true);
    salesOrdersApi.list(status || undefined).then(setOrders).catch(() => toast.error('Failed')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Sales Orders</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Track orders from confirmation to delivery</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['', 'CONFIRMED', 'IN_PRODUCTION', 'DISPATCHED', 'DELIVERED'].map(s => (
          <button key={s} onClick={() => { setFilter(s); load(s); }}
            style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: filter === s ? '#f97316' : 'rgba(255,255,255,0.05)',
              color: filter === s ? 'white' : '#94a3b8',
              border: filter === s ? 'none' : '1px solid rgba(255,255,255,0.08)', transition: 'all 0.2s' }}>
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading...</div> : (
          <table>
            <thead>
              <tr>
                <th>Order No</th><th>Customer</th><th>Subject</th><th>Value</th>
                <th>Delivery Date</th><th>Work Orders</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => {
                const isOverdue = o.deliveryDate && new Date(o.deliveryDate) < new Date() && !['DELIVERED','CANCELLED'].includes(o.status);
                return (
                  <tr key={o.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/sales-orders/${o.id}`)}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {isOverdue && <AlertTriangle size={13} color="#ef4444" />}
                        <span style={{ fontFamily: 'monospace', color: '#f97316', fontWeight: 600 }}>{o.orderNo}</span>
                      </div>
                    </td>
                    <td style={{ color: '#e2e8f0' }}>{o.customer?.name}</td>
                    <td style={{ color: '#94a3b8', maxWidth: 200 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{o.subject}</div>
                    </td>
                    <td style={{ color: '#f97316', fontWeight: 600 }}>{fmtCurrency(o.totalAmount)}</td>
                    <td style={{ color: isOverdue ? '#ef4444' : '#64748b', fontSize: 13 }}>
                      {o.deliveryDate ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Calendar size={12} />
                          {new Date(o.deliveryDate).toLocaleDateString('en-IN')}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ color: '#64748b' }}>{o._count?.workOrders || 0}</td>
                    <td><span className={`badge ${statusCls[o.status] || 'badge-gray'}`}>{o.status?.replace(/_/g, ' ')}</span></td>
                  </tr>
                );
              })}
              {!orders.length && !loading && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                  No orders. <Link to="/quotations" style={{ color: '#f97316' }}>Convert a quotation</Link>
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
