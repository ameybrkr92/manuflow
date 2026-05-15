import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { enquiriesApi } from '../../api/endpoints';
import { Plus, Search, FileSearch, Calendar, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const statusConfig: Record<string, { cls: string; label: string }> = {
  NEW: { cls: 'badge-blue', label: 'New' },
  UNDER_REVIEW: { cls: 'badge-amber', label: 'Under Review' },
  QUOTED: { cls: 'badge-purple', label: 'Quoted' },
  ORDER_RECEIVED: { cls: 'badge-green', label: 'Order Received' },
  LOST: { cls: 'badge-red', label: 'Lost' },
  CANCELLED: { cls: 'badge-gray', label: 'Cancelled' },
};

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = (status?: string) => {
    setLoading(true);
    enquiriesApi.list(status || undefined).then(setEnquiries).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Enquiries</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Customer RFQs — generate AI quotations with one click</p>
        </div>
        <Link to="/enquiries/new" className="btn-primary"><Plus size={16} /> New Enquiry</Link>
      </div>

      {/* Status Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['', 'NEW', 'UNDER_REVIEW', 'QUOTED', 'ORDER_RECEIVED', 'LOST'].map(s => (
          <button
            key={s}
            onClick={() => { setFilter(s); load(s); }}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: filter === s ? '#f97316' : 'rgba(255,255,255,0.05)',
              color: filter === s ? 'white' : '#94a3b8',
              border: filter === s ? 'none' : '1px solid rgba(255,255,255,0.08)',
              transition: 'all 0.2s',
            }}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Enquiry No</th>
                <th>Customer</th>
                <th>Subject</th>
                <th>Delivery Required</th>
                <th>Quotations</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map(e => (
                <tr key={e.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/enquiries/${e.id}`)}>
                  <td><span style={{ fontFamily: 'monospace', color: '#f97316', fontWeight: 600 }}>{e.enquiryNo}</span></td>
                  <td style={{ color: '#e2e8f0' }}>{e.customer?.name}</td>
                  <td style={{ color: '#94a3b8', maxWidth: 200 }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.subject}</div>
                  </td>
                  <td style={{ color: '#64748b', fontSize: 13 }}>
                    {e.deliveryRequired ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12} />
                        {new Date(e.deliveryRequired).toLocaleDateString('en-IN')}
                      </span>
                    ) : '—'}
                  </td>
                  <td style={{ color: e._count?.quotations > 0 ? '#f97316' : '#64748b' }}>
                    {e._count?.quotations || 0}
                  </td>
                  <td><span className={`badge ${statusConfig[e.status]?.cls || 'badge-gray'}`}>{statusConfig[e.status]?.label || e.status}</span></td>
                  <td style={{ color: '#64748b', fontSize: 12 }}>{new Date(e.createdAt).toLocaleDateString('en-IN')}</td>
                  <td onClick={e2 => e2.stopPropagation()}>
                    <Link
                      to={`/quotations/new?enquiryId=${e.id}`}
                      className="btn-ghost"
                      style={{ fontSize: 11, color: '#c084fc' }}
                    >
                      <Sparkles size={12} /> AI Quote
                    </Link>
                  </td>
                </tr>
              ))}
              {!enquiries.length && !loading && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                    No enquiries. <Link to="/enquiries/new" style={{ color: '#f97316' }}>Create one</Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
