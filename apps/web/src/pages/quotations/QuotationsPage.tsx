import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { quotationsApi } from '../../api/endpoints';
import { Plus, Sparkles, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const statusCls: Record<string, string> = {
  DRAFT: 'badge-gray', SENT: 'badge-blue', UNDER_NEGOTIATION: 'badge-amber',
  APPROVED: 'badge-green', REJECTED: 'badge-red', EXPIRED: 'badge-gray',
};

function fmtCurrency(v: any) {
  const n = parseFloat(v) || 0;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();

  const load = (status?: string) => {
    setLoading(true);
    quotationsApi.list(status || undefined).then(setQuotations).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Quotations</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Manage quotations and convert to Sales Orders</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/quotations/new" className="btn-secondary"><Plus size={15} /> Manual</Link>
          <Link to="/quotations/new" className="btn-primary" style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}>
            <Sparkles size={15} /> AI Generate
          </Link>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['', 'DRAFT', 'SENT', 'APPROVED', 'REJECTED'].map(s => (
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
                <th>Quotation No</th>
                <th>Customer</th>
                <th>Against Enquiry</th>
                <th>Amount</th>
                <th>AI</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {quotations.map(q => (
                <tr key={q.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/quotations/${q.id}`)}>
                  <td><span style={{ fontFamily: 'monospace', color: '#f97316', fontWeight: 600 }}>{q.quotationNo}</span></td>
                  <td style={{ color: '#e2e8f0' }}>{q.enquiry?.subject || 'Direct'}</td>
                  <td style={{ color: '#64748b', fontSize: 12 }}>{q.enquiry?.enquiryNo || '—'}</td>
                  <td style={{ color: '#f97316', fontWeight: 600 }}>{fmtCurrency(q.totalAmount)}</td>
                  <td>
                    {q.isAiGenerated && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#c084fc', fontSize: 11, fontWeight: 600 }}>
                        <Sparkles size={11} /> AI
                      </span>
                    )}
                  </td>
                  <td style={{ color: '#64748b', fontSize: 12 }}>
                    {q.validUntil ? new Date(q.validUntil).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td><span className={`badge ${statusCls[q.status] || 'badge-gray'}`}>{q.status}</span></td>
                  <td onClick={e => e.stopPropagation()}>
                    <Link to={`/quotations/${q.id}`} className="btn-ghost" style={{ fontSize: 12 }}>
                      <ArrowRight size={13} />
                    </Link>
                  </td>
                </tr>
              ))}
              {!quotations.length && !loading && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                  No quotations. <Link to="/quotations/new" style={{ color: '#f97316' }}>Create one</Link>
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
