import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { purchaseApi } from '../../api/endpoints';
import { Plus, ShoppingBag, FileText, Package, Users, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const poStatusCls: Record<string, string> = {
  DRAFT: 'badge-gray', SENT: 'badge-blue', ACKNOWLEDGED: 'badge-purple',
  PARTIAL_RECEIVED: 'badge-amber', FULLY_RECEIVED: 'badge-green', CANCELLED: 'badge-red',
};

const prStatusCls: Record<string, string> = {
  DRAFT: 'badge-gray', PENDING_APPROVAL: 'badge-amber', APPROVED: 'badge-green',
  REJECTED: 'badge-red', PO_RAISED: 'badge-purple',
};

type Tab = 'vendors' | 'pr' | 'po' | 'grn';

function fmtCurrency(v: any) {
  const n = parseFloat(v) || 0;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export default function PurchasePage() {
  const [tab, setTab] = useState<Tab>('po');
  const [vendors, setVendors] = useState<any[]>([]);
  const [prs, setPrs] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [grns, setGrns] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showNewVendor, setShowNewVendor] = useState(false);
  const [showNewPR, setShowNewPR] = useState(false);
  const [vendorForm, setVendorForm] = useState({ code: '', name: '', gstin: '', paymentTerms: '30 days' });
  const [prForm, setPrForm] = useState({ description: '', qty: '1', uom: 'Nos', notes: '' });
  const navigate = useNavigate();

  useEffect(() => {
    purchaseApi.dashboard().then(setDashboard).catch(() => {});
    loadTab(tab);
  }, []);

  const loadTab = (t: Tab) => {
    setLoading(true);
    const calls: Record<Tab, Promise<any>> = {
      vendors: purchaseApi.listVendors().then(setVendors),
      pr: purchaseApi.listPRs().then(setPrs),
      po: purchaseApi.listPOs().then(setPos),
      grn: purchaseApi.listGRNs().then(setGrns),
    };
    calls[t].catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };

  const switchTab = (t: Tab) => { setTab(t); loadTab(t); };

  const handleCreateVendor = async () => {
    if (!vendorForm.code || !vendorForm.name) return toast.error('Code and Name required');
    try {
      await purchaseApi.createVendor({ ...vendorForm, address: {} });
      toast.success('Vendor created');
      setShowNewVendor(false);
      setVendorForm({ code: '', name: '', gstin: '', paymentTerms: '30 days' });
      loadTab('vendors');
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Failed'); }
  };

  const handleCreatePR = async () => {
    if (!prForm.description) return toast.error('Description required');
    try {
      await purchaseApi.createPR({ ...prForm, qty: parseFloat(prForm.qty) });
      toast.success('PR created');
      setShowNewPR(false);
      setPrForm({ description: '', qty: '1', uom: 'Nos', notes: '' });
      loadTab('pr');
    } catch { toast.error('Failed'); }
  };

  const handlePRAction = async (id: string, status: string) => {
    try {
      await purchaseApi.updatePRStatus(id, status);
      toast.success('PR updated');
      loadTab('pr');
    } catch { toast.error('Failed'); }
  };

  const handlePOStatus = async (id: string, status: string) => {
    try {
      await purchaseApi.updatePOStatus(id, status);
      toast.success('PO updated');
      loadTab('po');
    } catch { toast.error('Failed'); }
  };

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: 'po', label: 'Purchase Orders', icon: <FileText size={15} />, count: dashboard?.openPOs },
    { key: 'pr', label: 'Requisitions', icon: <ShoppingBag size={15} />, count: dashboard?.openPRs },
    { key: 'grn', label: 'GRN', icon: <Package size={15} />, count: dashboard?.pendingGRNs },
    { key: 'vendors', label: 'Vendors', icon: <Users size={15} />, count: dashboard?.vendors },
  ];

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Purchase & Vendor</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>PRs, POs, GRNs and vendor management</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {tab === 'vendors' && <button onClick={() => setShowNewVendor(true)} className="btn-primary"><Plus size={15} /> New Vendor</button>}
          {tab === 'pr' && <button onClick={() => setShowNewPR(true)} className="btn-primary"><Plus size={15} /> New PR</button>}
          {tab === 'po' && <button onClick={() => navigate('/purchase/po/new')} className="btn-primary"><Plus size={15} /> New PO</button>}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 10, width: 'fit-content' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => switchTab(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
              background: tab === t.key ? '#f97316' : 'transparent',
              color: tab === t.key ? 'white' : '#94a3b8', border: 'none', transition: 'all 0.2s',
            }}>
            {t.icon} {t.label}
            {t.count !== undefined && (
              <span style={{ background: tab === t.key ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '1px 7px', fontSize: 11 }}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading...</div> : (
          <>
            {/* Purchase Orders */}
            {tab === 'po' && (
              <table>
                <thead><tr><th>PO No</th><th>Vendor</th><th>Total</th><th>Delivery</th><th>GRNs</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {pos.map(po => (
                    <tr key={po.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/purchase/po/${po.id}`)}>
                      <td><span style={{ fontFamily: 'monospace', color: '#f97316', fontWeight: 600 }}>{po.poNo}</span></td>
                      <td style={{ color: '#e2e8f0' }}>{po.vendor?.name}</td>
                      <td style={{ color: '#f97316', fontWeight: 600 }}>{fmtCurrency(po.totalAmount)}</td>
                      <td style={{ color: '#64748b', fontSize: 13 }}>{po.deliveryDate ? new Date(po.deliveryDate).toLocaleDateString('en-IN') : '—'}</td>
                      <td style={{ color: '#64748b' }}>{po._count?.grns || 0}</td>
                      <td><span className={`badge ${poStatusCls[po.status] || 'badge-gray'}`}>{po.status?.replace(/_/g, ' ')}</span></td>
                      <td onClick={e => e.stopPropagation()}>
                        {po.status === 'DRAFT' && (
                          <button onClick={() => handlePOStatus(po.id, 'SENT')} className="btn-ghost" style={{ fontSize: 11, color: '#3b82f6' }}>Send</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!pos.length && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No purchase orders</td></tr>}
                </tbody>
              </table>
            )}

            {/* Purchase Requisitions */}
            {tab === 'pr' && (
              <table>
                <thead><tr><th>PR No</th><th>Description</th><th>Qty</th><th>Required By</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {prs.map(pr => (
                    <tr key={pr.id}>
                      <td><span style={{ fontFamily: 'monospace', color: '#f97316', fontWeight: 600 }}>{pr.prNo}</span></td>
                      <td style={{ color: '#e2e8f0' }}>{pr.description}</td>
                      <td style={{ color: '#94a3b8' }}>{parseFloat(pr.qty)} {pr.uom}</td>
                      <td style={{ color: '#64748b', fontSize: 13 }}>{pr.requiredBy ? new Date(pr.requiredBy).toLocaleDateString('en-IN') : '—'}</td>
                      <td><span className={`badge ${prStatusCls[pr.status] || 'badge-gray'}`}>{pr.status?.replace(/_/g, ' ')}</span></td>
                      <td>
                        {pr.status === 'PENDING_APPROVAL' && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={() => handlePRAction(pr.id, 'APPROVED')} className="btn-ghost" style={{ fontSize: 11, color: '#4ade80' }}>Approve</button>
                            <button onClick={() => handlePRAction(pr.id, 'REJECTED')} className="btn-ghost" style={{ fontSize: 11, color: '#ef4444' }}>Reject</button>
                          </div>
                        )}
                        {pr.status === 'DRAFT' && (
                          <button onClick={() => handlePRAction(pr.id, 'PENDING_APPROVAL')} className="btn-ghost" style={{ fontSize: 11, color: '#f97316' }}>Submit</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!prs.length && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No requisitions</td></tr>}
                </tbody>
              </table>
            )}

            {/* GRNs */}
            {tab === 'grn' && (
              <table>
                <thead><tr><th>GRN No</th><th>PO No</th><th>Vendor</th><th>Received</th><th>Status</th><th></th></tr></thead>
                <tbody>
                  {grns.map(grn => (
                    <tr key={grn.id}>
                      <td><span style={{ fontFamily: 'monospace', color: '#f97316', fontWeight: 600 }}>{grn.grnNo}</span></td>
                      <td style={{ color: '#94a3b8' }}>{grn.purchaseOrder?.poNo}</td>
                      <td style={{ color: '#e2e8f0' }}>{grn.vendor?.name}</td>
                      <td style={{ color: '#64748b', fontSize: 13 }}>{new Date(grn.receivedAt).toLocaleDateString('en-IN')}</td>
                      <td><span className={`badge ${grn.status === 'ACCEPTED' ? 'badge-green' : grn.status === 'REJECTED' ? 'badge-red' : 'badge-amber'}`}>{grn.status?.replace(/_/g, ' ')}</span></td>
                      <td>
                        {grn.status === 'PENDING_QC' && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button onClick={async () => { await purchaseApi.updateGRNStatus(grn.id, 'ACCEPTED'); loadTab('grn'); toast.success('GRN accepted'); }} className="btn-ghost" style={{ fontSize: 11, color: '#4ade80' }}>Accept</button>
                            <button onClick={async () => { await purchaseApi.updateGRNStatus(grn.id, 'REJECTED'); loadTab('grn'); toast.success('GRN rejected'); }} className="btn-ghost" style={{ fontSize: 11, color: '#ef4444' }}>Reject</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {!grns.length && <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No GRNs</td></tr>}
                </tbody>
              </table>
            )}

            {/* Vendors */}
            {tab === 'vendors' && (
              <table>
                <thead><tr><th>Code</th><th>Name</th><th>GSTIN</th><th>Payment Terms</th><th>MSME</th><th>POs</th><th></th></tr></thead>
                <tbody>
                  {vendors.map(v => (
                    <tr key={v.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/purchase/vendors/${v.id}`)}>
                      <td><span style={{ fontFamily: 'monospace', color: '#f97316', fontWeight: 600 }}>{v.code}</span></td>
                      <td style={{ color: '#e2e8f0', fontWeight: 500 }}>{v.name}</td>
                      <td style={{ color: '#64748b', fontSize: 12 }}>{v.gstin || '—'}</td>
                      <td style={{ color: '#94a3b8', fontSize: 13 }}>{v.paymentTerms}</td>
                      <td>{v.isMSME ? <span className="badge badge-green">MSME</span> : '—'}</td>
                      <td style={{ color: '#64748b' }}>{v._count?.purchaseOrders || 0}</td>
                      <td><ChevronRight size={16} color="#64748b" /></td>
                    </tr>
                  ))}
                  {!vendors.length && <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No vendors. <button onClick={() => setShowNewVendor(true)} style={{ background: 'none', border: 'none', color: '#f97316', cursor: 'pointer' }}>Add one</button></td></tr>}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {/* New Vendor Modal */}
      {showNewVendor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ padding: 28, width: 460, maxWidth: '90vw' }}>
            <h3 style={{ color: '#f1f5f9', fontWeight: 700, marginTop: 0 }}>New Vendor</h3>
            <div style={{ display: 'grid', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
                <div>
                  <label>Code *</label>
                  <input className="input" value={vendorForm.code} onChange={e => setVendorForm(p => ({ ...p, code: e.target.value }))} placeholder="VND001" />
                </div>
                <div>
                  <label>Vendor Name *</label>
                  <input className="input" value={vendorForm.name} onChange={e => setVendorForm(p => ({ ...p, name: e.target.value }))} placeholder="Supplier name" />
                </div>
              </div>
              <div>
                <label>GSTIN</label>
                <input className="input" value={vendorForm.gstin} onChange={e => setVendorForm(p => ({ ...p, gstin: e.target.value }))} placeholder="27AXXXX..." />
              </div>
              <div>
                <label>Payment Terms</label>
                <select className="select" value={vendorForm.paymentTerms} onChange={e => setVendorForm(p => ({ ...p, paymentTerms: e.target.value }))}>
                  {['Advance', '7 days', '15 days', '30 days', '45 days', '60 days', '90 days'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={handleCreateVendor} className="btn-primary">Create Vendor</button>
              <button onClick={() => setShowNewVendor(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* New PR Modal */}
      {showNewPR && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ padding: 28, width: 460, maxWidth: '90vw' }}>
            <h3 style={{ color: '#f1f5f9', fontWeight: 700, marginTop: 0 }}>New Purchase Requisition</h3>
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label>Material / Description *</label>
                <input className="input" value={prForm.description} onChange={e => setPrForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g., Ball Screw 25mm dia, 500mm length" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label>Quantity</label>
                  <input className="input" type="number" value={prForm.qty} onChange={e => setPrForm(p => ({ ...p, qty: e.target.value }))} min="0.001" step="0.001" />
                </div>
                <div>
                  <label>UOM</label>
                  <select className="select" value={prForm.uom} onChange={e => setPrForm(p => ({ ...p, uom: e.target.value }))}>
                    {['Nos', 'Set', 'Pcs', 'kg', 'm', 'mm', 'L'].map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label>Notes</label>
                <input className="input" value={prForm.notes} onChange={e => setPrForm(p => ({ ...p, notes: e.target.value }))} placeholder="e.g., For WO24-0001, urgent" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={handleCreatePR} className="btn-primary">Create PR</button>
              <button onClick={() => setShowNewPR(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
