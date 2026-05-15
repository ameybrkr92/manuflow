import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { customersApi } from '../../api/endpoints';
import { Plus, Search, Building2, Phone, MapPin, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = (s?: string) => {
    setLoading(true);
    customersApi.list(s).then(setCustomers).catch(() => toast.error('Failed to load customers')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); load(search); };

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Customers</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>{customers.length} registered customers</p>
        </div>
        <Link to="/customers/new" className="btn-primary">
          <Plus size={16} /> Add Customer
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            className="input"
            style={{ paddingLeft: 38 }}
            placeholder="Search by name, code, or GSTIN..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-secondary">Search</button>
      </form>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>
            <div className="spinner" style={{ width: 24, height: 24, border: '2px solid rgba(249,115,22,0.3)', borderTopColor: '#f97316', borderRadius: '50%', margin: '0 auto 12px' }} />
            Loading customers...
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Company Name</th>
                <th>GSTIN</th>
                <th>Contact</th>
                <th>Credit Limit</th>
                <th>Orders</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/customers/${c.id}`)}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontSize: 13, color: '#f97316', fontWeight: 600 }}>{c.code}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #1e3a5f, #1e2535)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Building2 size={14} color="#3b82f6" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, color: '#e2e8f0' }}>{c.name}</div>
                        {c.billingAddress?.city && <div style={{ fontSize: 12, color: '#64748b' }}>{c.billingAddress.city}, {c.billingAddress.state}</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#94a3b8' }}>{c.gstin || '—'}</td>
                  <td style={{ color: '#94a3b8', fontSize: 13 }}>
                    {c.contactPersons?.[0]?.name || '—'}
                  </td>
                  <td style={{ color: '#e2e8f0', fontWeight: 500 }}>
                    ₹{parseFloat(c.creditLimit || 0).toLocaleString('en-IN')}
                  </td>
                  <td>
                    <span style={{ color: '#f97316', fontWeight: 600 }}>{c._count?.salesOrders || 0}</span>
                    <span style={{ color: '#64748b', fontSize: 12 }}> orders</span>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <Link to={`/customers/${c.id}`} className="btn-ghost" style={{ fontSize: 12 }}>
                      <ExternalLink size={13} /> View
                    </Link>
                  </td>
                </tr>
              ))}
              {!customers.length && !loading && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                    No customers found. <Link to="/customers/new" style={{ color: '#f97316' }}>Add your first customer</Link>
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
