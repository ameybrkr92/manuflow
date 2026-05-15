import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { purchaseApi } from '../../api/endpoints';
import { ArrowLeft, User, Phone, Mail, MapPin, CreditCard, ShoppingBag, History } from 'lucide-react';
import toast from 'react-hot-toast';

export default function VendorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      purchaseApi.getVendor(id)
        .then(setVendor)
        .catch(() => toast.error('Vendor not found'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div style={{ padding: 32, color: '#64748b' }}>Loading...</div>;
  if (!vendor) return <div style={{ padding: 32, color: '#ef4444' }}>Vendor not found</div>;

  const pos = vendor.purchaseOrders || [];
  const grns = vendor.grns || [];

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} className="btn-ghost"><ArrowLeft size={16} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{vendor.name}</h1>
            <span style={{ fontSize: 13, color: '#64748b', fontFamily: 'monospace' }}>{vendor.code}</span>
            {vendor.isMSME && <span className="badge badge-green">MSME</span>}
          </div>
          <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{vendor.categories?.join(', ') || 'General Supplier'}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-secondary">Edit Vendor</button>
          <button className="btn-primary" onClick={() => navigate('/purchase/po/new')}>Create PO</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Contact & Legal */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginTop: 0, marginBottom: 16 }}>Contact & Legal</h3>
            <div style={{ display: 'grid', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <CreditCard size={15} color="#64748b" />
                <div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>GSTIN</div>
                  <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 600 }}>{vendor.gstin || '—'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MapPin size={15} color="#64748b" />
                <div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Address</div>
                  <div style={{ fontSize: 13, color: '#e2e8f0' }}>{vendor.address?.city}, {vendor.address?.state}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <History size={15} color="#64748b" />
                <div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Payment Terms</div>
                  <div style={{ fontSize: 13, color: '#f97316', fontWeight: 600 }}>{vendor.paymentTerms}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          {vendor.bankDetails && (
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginTop: 0, marginBottom: 16 }}>Bank Details</h3>
              <div style={{ fontSize: 13, color: '#94a3b8' }}>
                <div style={{ marginBottom: 4 }}>Account: {vendor.bankDetails.accNo}</div>
                <div style={{ marginBottom: 4 }}>IFSC: {vendor.bankDetails.ifsc}</div>
                <div>Bank: {vendor.bankDetails.bankName}</div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Recent POs */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingBag size={16} color="#f97316" /> Recent Purchase Orders
              </h3>
            </div>
            <table>
              <thead>
                <tr>
                  <th>PO No</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pos.map((po: any) => (
                  <tr key={po.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/purchase/po/${po.id}`)}>
                    <td style={{ color: '#f97316', fontWeight: 600 }}>{po.poNo}</td>
                    <td style={{ color: '#64748b', fontSize: 12 }}>{new Date(po.createdAt).toLocaleDateString('en-IN')}</td>
                    <td style={{ color: '#e2e8f0', fontWeight: 600 }}>₹{parseFloat(po.totalAmount).toLocaleString('en-IN')}</td>
                    <td><span className="badge badge-gray">{po.status}</span></td>
                  </tr>
                ))}
                {pos.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>No POs found</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Recent Receipts */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
                <History size={16} color="#3b82f6" /> Recent GRNs (Goods Receipts)
              </h3>
            </div>
            <table>
              <thead>
                <tr>
                  <th>GRN No</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>QC Status</th>
                </tr>
              </thead>
              <tbody>
                {grns.map((grn: any) => (
                  <tr key={grn.id}>
                    <td style={{ color: '#3b82f6', fontWeight: 600 }}>{grn.grnNo}</td>
                    <td style={{ color: '#64748b', fontSize: 12 }}>{new Date(grn.createdAt).toLocaleDateString('en-IN')}</td>
                    <td style={{ color: '#94a3b8' }}>{grn.lineItems?.length || 0} items</td>
                    <td><span className={`badge ${grn.status === 'ACCEPTED' ? 'badge-green' : 'badge-amber'}`}>{grn.status}</span></td>
                  </tr>
                ))}
                {grns.length === 0 && (
                  <tr><td colSpan={4} style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>No receipts found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
