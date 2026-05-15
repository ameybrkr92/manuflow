import React, { useEffect, useState } from 'react';
import { financeApi } from '../../api/endpoints';
import { 
  Receipt, IndianRupee, TrendingUp, CreditCard, 
  ArrowUpRight, Download, Plus, Filter 
} from 'lucide-react';
import toast from 'react-hot-toast';

function fmtCurrency(v: any) {
  return `₹${parseFloat(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export default function FinancePage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [inv, s] = await Promise.all([
        financeApi.listInvoices(),
        financeApi.dashboard()
      ]);
      setInvoices(inv);
      setStats(s);
    } catch {
      toast.error('Failed to load finance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handlePayment = async (id: string) => {
    const amount = prompt('Enter payment amount:');
    if (!amount) return;
    try {
      await financeApi.recordPayment(id, parseFloat(amount));
      toast.success('Payment recorded');
      loadData();
    } catch { toast.error('Failed to record payment'); }
  };

  if (loading) return <div style={{ padding: 32, color: '#64748b' }}>Loading finance module...</div>;

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Finance & Billing</h1>
          <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Invoicing, payments, and tax compliance</div>
        </div>
        <button className="btn-primary">
          <Plus size={16} /> Create Invoice
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 28 }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Total Invoiced</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>{fmtCurrency(stats?.totalInvoiced)}</div>
            </div>
            <div style={{ padding: 10, background: 'rgba(59,130,246,0.1)', borderRadius: 10 }}>
              <Receipt size={20} color="#3b82f6" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Total Collected</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#4ade80' }}>{fmtCurrency(stats?.totalCollected)}</div>
            </div>
            <div style={{ padding: 10, background: 'rgba(34,197,94,0.1)', borderRadius: 10 }}>
              <TrendingUp size={20} color="#22c55e" />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Pending Collection</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#f97316' }}>{fmtCurrency(stats?.pendingCollection)}</div>
            </div>
            <div style={{ padding: 10, background: 'rgba(249,115,22,0.1)', borderRadius: 10 }}>
              <CreditCard size={20} color="#f97316" />
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>Recent Invoices</h3>
          <button className="btn-ghost" style={{ fontSize: 12 }}><Filter size={14} /> Filter</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Invoice No</th><th>Customer</th><th>Amount</th><th>Paid</th><th>Status</th><th>Date</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv.id}>
                <td style={{ color: '#f1f5f9', fontWeight: 600, fontFamily: 'monospace' }}>{inv.invoiceNo}</td>
                <td style={{ color: '#e2e8f0' }}>{inv.customer?.name}</td>
                <td style={{ color: '#f1f5f9', fontWeight: 600 }}>{fmtCurrency(inv.totalAmount)}</td>
                <td style={{ color: '#4ade80' }}>{fmtCurrency(inv.paidAmount)}</td>
                <td>
                  <span className={`badge ${
                    inv.status === 'PAID' ? 'badge-green' : 
                    inv.status === 'PARTIALLY_PAID' ? 'badge-amber' : 'badge-gray'
                  }`}>{inv.status}</span>
                </td>
                <td style={{ color: '#64748b', fontSize: 12 }}>{new Date(inv.invoiceDate).toLocaleDateString('en-IN')}</td>
                <td>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handlePayment(inv.id)} className="btn-ghost" style={{ padding: 4 }} title="Record Payment">
                      <IndianRupee size={14} />
                    </button>
                    <button className="btn-ghost" style={{ padding: 4 }} title="Download PDF">
                      <Download size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No invoices found</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
