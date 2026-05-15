import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { customersApi, enquiriesApi } from '../../api/endpoints';
import { ArrowLeft, Building2, MapPin, Phone, Mail, Plus, FileText, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

const statusBadge: Record<string, string> = {
  CONFIRMED: 'badge-blue', IN_PRODUCTION: 'badge-amber', DISPATCHED: 'badge-purple',
  DELIVERED: 'badge-green', CANCELLED: 'badge-gray', NEW: 'badge-blue',
  QUOTED: 'badge-amber', ORDER_RECEIVED: 'badge-green', LOST: 'badge-red',
};

function fmtCurrency(v: any) {
  const n = parseFloat(v) || 0;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([customersApi.get(id), customersApi.getStats(id)])
      .then(([c, s]) => { setCustomer(c); setStats(s); })
      .catch(() => toast.error('Customer not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 32, color: '#64748b' }}>Loading...</div>;
  if (!customer) return <div style={{ padding: 32, color: '#ef4444' }}>Customer not found</div>;

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} className="btn-ghost"><ArrowLeft size={16} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: 'linear-gradient(135deg, #1e3a5f, #1e2535)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={20} color="#3b82f6" />
            </div>
            <div>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{customer.name}</h1>
              <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 13, color: '#64748b' }}>
                <span style={{ fontFamily: 'monospace', color: '#f97316' }}>{customer.code}</span>
                {customer.gstin && <span>GST: {customer.gstin}</span>}
                {customer.pan && <span>PAN: {customer.pan}</span>}
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to={`/enquiries/new?customerId=${customer.id}`} className="btn-primary">
            <Plus size={15} /> New Enquiry
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Orders', value: stats?.totalOrders || 0, color: '#3b82f6' },
          { label: 'Total Business', value: fmtCurrency(stats?.totalInvoiced || 0), color: '#22c55e' },
          { label: 'Open Orders', value: stats?.openOrders || 0, color: '#f97316' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Details */}
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', marginTop: 0, marginBottom: 16 }}>Company Details</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <MapPin size={14} color="#64748b" style={{ marginTop: 2, flexShrink: 0 }} />
              <div style={{ fontSize: 13, color: '#94a3b8' }}>
                {customer.billingAddress?.line1 && <div>{customer.billingAddress.line1}</div>}
                {customer.billingAddress?.line2 && <div>{customer.billingAddress.line2}</div>}
                {customer.billingAddress?.city && <div>{customer.billingAddress.city}, {customer.billingAddress.state} - {customer.billingAddress.pincode}</div>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, fontSize: 13 }}>
              <span style={{ color: '#64748b' }}>Credit Limit:</span>
              <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{fmtCurrency(customer.creditLimit)}</span>
            </div>
            <div style={{ display: 'flex', gap: 10, fontSize: 13 }}>
              <span style={{ color: '#64748b' }}>Payment Terms:</span>
              <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{customer.paymentTerms}</span>
            </div>
          </div>

          {customer.contactPersons?.length > 0 && (
            <>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', marginBottom: 12, marginTop: 20 }}>Contacts</h3>
              {customer.contactPersons.map((c: any, i: number) => (
                <div key={i} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0' }}>{c.name}</div>
                  {c.designation && <div style={{ fontSize: 12, color: '#64748b' }}>{c.designation}</div>}
                  <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                    {c.phone && <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={11} />{c.phone}</span>}
                    {c.email && <span style={{ fontSize: 12, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={11} />{c.email}</span>}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Orders */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>Recent Orders</h3>
            <Link to={`/sales-orders?customerId=${customer.id}`} style={{ fontSize: 12, color: '#f97316', textDecoration: 'none' }}>View all</Link>
          </div>
          {customer.salesOrders?.length ? customer.salesOrders.slice(0, 5).map((o: any) => (
            <Link key={o.id} to={`/sales-orders/${o.id}`} style={{ textDecoration: 'none', display: 'block', marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.04)' }}>
                <div>
                  <div style={{ fontSize: 13, color: '#f97316', fontWeight: 500 }}>{o.orderNo}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>{fmtCurrency(o.totalAmount)}</div>
                </div>
                <span className={`badge ${statusBadge[o.status] || 'badge-gray'}`}>{o.status?.replace(/_/g, ' ')}</span>
              </div>
            </Link>
          )) : (
            <div style={{ textAlign: 'center', padding: 24, color: '#64748b', fontSize: 13 }}>No orders yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
