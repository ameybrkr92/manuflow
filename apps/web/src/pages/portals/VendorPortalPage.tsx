import React, { useEffect, useState } from 'react';
import { purchaseApi, qualityApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { 
  ShoppingBag, Truck, Shield, IndianRupee, 
  FileText, CheckCircle, AlertTriangle, ArrowRight 
} from 'lucide-react';
import toast from 'react-hot-toast';

function fmtCurrency(v: any) {
  return `₹${parseFloat(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export default function VendorPortalPage() {
  const { user } = useAuth();
  const [pos, setPos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [invoiceData, setInvoiceData] = useState({ invoiceNo: '', invoiceUrl: 'https://placeholder.com/invoice.pdf' });

  useEffect(() => {
    purchaseApi.listPOs().then(data => {
      setPos(data);
    }).catch(() => {
      toast.error('Failed to load POs');
    }).finally(() => setLoading(false));
  }, []);

  const handleAcknowledge = async (poId: string) => {
    try {
      await purchaseApi.acknowledgePO(poId);
      toast.success('Purchase Order acknowledged');
      const updatedPos = await purchaseApi.listPOs();
      setPos(updatedPos);
    } catch {
      toast.error('Failed to acknowledge PO');
    }
  };

  const handleUploadInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await purchaseApi.uploadInvoice(selectedPO.id, invoiceData);
      toast.success('Invoice uploaded successfully');
      setIsInvoiceModalOpen(false);
      setInvoiceData({ invoiceNo: '', invoiceUrl: 'https://placeholder.com/invoice.pdf' });
      const updatedPos = await purchaseApi.listPOs();
      setPos(updatedPos);
    } catch {
      toast.error('Failed to upload invoice');
    }
  };

  if (loading) return <div style={{ padding: 32, color: '#64748b' }}>Welcome back, {user?.firstName}. Loading your orders...</div>;

  const openPOs = pos.filter(p => p.status !== 'FULLY_RECEIVED' && p.status !== 'CANCELLED');

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Vendor Portal</h1>
          <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Manage your purchase orders, shipments, and payments</div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div className="stat-card" style={{ padding: '12px 20px', minWidth: 150 }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Open POs</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#3b82f6' }}>{openPOs.length}</div>
          </div>
          <div className="stat-card" style={{ padding: '12px 20px', minWidth: 150 }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Pending QC</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#f97316' }}>2</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Recent Purchase Orders */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingBag size={18} color="#3b82f6" /> Recent Purchase Orders
              </h3>
            </div>
            <table>
              <thead>
                <tr><th>PO No</th><th>Amount</th><th>Status</th><th>Date</th><th>Action</th></tr>
              </thead>
              <tbody>
                {pos.map(po => (
                  <tr key={po.id}>
                    <td style={{ color: '#3b82f6', fontWeight: 600, fontFamily: 'monospace' }}>{po.poNo}</td>
                    <td style={{ color: '#f1f5f9' }}>{fmtCurrency(po.totalAmount)}</td>
                    <td><span className={`badge ${po.status === 'SENT' ? 'badge-blue' : 'badge-green'}`}>{po.status}</span></td>
                    <td style={{ color: '#64748b', fontSize: 12 }}>{new Date(po.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {po.status === 'SENT' ? (
                          <button 
                            onClick={() => handleAcknowledge(po.id)} 
                            className="btn-ghost" 
                            style={{ fontSize: 12, color: '#3b82f6', padding: 0 }}
                          >
                            Acknowledge
                          </button>
                        ) : (
                          <span style={{ fontSize: 12, color: '#64748b' }}>Acknowledged</span>
                        )}
                        {po.status === 'ACKNOWLEDGED' && !po.vendorInvoiceNo && (
                          <button 
                            onClick={() => {
                              setSelectedPO(po);
                              setIsInvoiceModalOpen(true);
                            }} 
                            className="btn-ghost" 
                            style={{ fontSize: 12, color: '#f97316', padding: 0 }}
                          >
                            Upload Invoice
                          </button>
                        )}
                        {po.vendorInvoiceNo && (
                          <span style={{ fontSize: 12, color: '#10b981' }}>Inv: {po.vendorInvoiceNo}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Shipment Tracking */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Truck size={18} color="#22c55e" /> Shipment Status
            </h3>
            <div style={{ background: 'rgba(255,255,255,0.02)', padding: 16, borderRadius: 12, border: '1px dashed rgba(255,255,255,0.1)' }}>
              <div style={{ textAlign: 'center', color: '#64748b', fontSize: 13 }}>
                You have 2 shipments currently undergoing Quality Inspection at the factory store.
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Vendor Quick Actions */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>Vendor Actions</h3>
            <div style={{ display: 'grid', gap: 10 }}>
              <button className="sidebar-link" style={{ width: '100%', background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.1)' }}>
                <FileText size={16} color="#3b82f6" /> Upload Invoice
                <ArrowRight size={14} style={{ marginLeft: 'auto' }} />
              </button>
              <button className="sidebar-link" style={{ width: '100%', background: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.1)' }}>
                <Truck size={16} color="#22c55e" /> Update Dispatch Status
                <ArrowRight size={14} style={{ marginLeft: 'auto' }} />
              </button>
            </div>
          </div>

          {/* Payment Status */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>Payment Summary</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>Pending</span>
                <span style={{ fontSize: 12, color: '#f1f5f9', fontWeight: 600 }}>{fmtCurrency(45000)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#64748b' }}>Paid (This Month)</span>
                <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>{fmtCurrency(120000)}</span>
              </div>
            </div>
          </div>

          {/* Quality Alerts */}
          <div className="card" style={{ padding: 20, border: '1px solid rgba(239,68,68,0.2)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Shield size={14} /> Quality Notifications
            </div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>
              ⚠️ Item <strong style={{ color: '#e2e8f0' }}>MS-PLATE-12MM</strong> was rejected in latest GRN due to surface finish. Please check.
            </div>
          </div>
        </div>
      </div>
      {/* Invoice Modal */}
      {isInvoiceModalOpen && selectedPO && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 450, padding: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginTop: 0, marginBottom: 8 }}>Upload Invoice</h2>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>For PO #{selectedPO.poNo}</div>
            <form onSubmit={handleUploadInvoice}>
              <div style={{ marginBottom: 16 }}>
                <label>Invoice Number</label>
                <input 
                  className="input" 
                  value={invoiceData.invoiceNo} 
                  onChange={e => setInvoiceData(p => ({ ...p, invoiceNo: e.target.value }))}
                  placeholder="e.g. INV-2024-001"
                  required
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label>Invoice File (URL Mock)</label>
                <input 
                  className="input" 
                  value={invoiceData.invoiceUrl} 
                  onChange={e => setInvoiceData(p => ({ ...p, invoiceUrl: e.target.value }))}
                  placeholder="https://..."
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Submit Invoice</button>
                <button type="button" onClick={() => setIsInvoiceModalOpen(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
