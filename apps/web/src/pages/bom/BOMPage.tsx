import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { bomApi, salesOrdersApi } from '../../api/endpoints';
import { Plus, Sparkles, CheckCircle, Clock, FileText, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const statusCls: Record<string, string> = {
  DRAFT: 'badge-gray', APPROVED: 'badge-green', OBSOLETE: 'badge-red',
};

function fmtCurrency(v: any) {
  const n = parseFloat(v) || 0;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)}L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export default function BOMPage() {
  const [boms, setBoms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [newForm, setNewForm] = useState({ productName: '', description: '', salesOrderId: '' });
  const [aiForm, setAiForm] = useState({ productName: '', description: '', salesOrderId: '' });
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const load = () => {
    const soId = params.get('soId') || undefined;
    setLoading(true);
    bomApi.list(soId).then(setBoms).catch(() => toast.error('Failed to load')).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    salesOrdersApi.list().then(setSalesOrders);
  }, []);

  const handleCreate = async () => {
    if (!newForm.productName) return toast.error('Product name required');
    try {
      const bom = await bomApi.create(newForm);
      toast.success('BOM created');
      setShowNewModal(false);
      navigate(`/bom/${bom.id}`);
    } catch { toast.error('Failed to create'); }
  };

  const handleAiGenerate = async () => {
    if (!aiForm.productName || !aiForm.description) return toast.error('Product name and description required');
    setGenerating(true);
    try {
      const bom = await bomApi.aiGenerate(aiForm);
      toast.success(`AI generated ${bom.items?.length || 0} BOM items!`);
      setShowAiModal(false);
      load();
    } catch { toast.error('AI generation failed'); }
    finally { setGenerating(false); }
  };

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Bill of Materials</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Engineering BOMs — AI-powered generation from product specs</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowAiModal(true)} className="btn-secondary" style={{ color: '#c084fc', borderColor: 'rgba(192,132,252,0.3)' }}>
            <Sparkles size={15} /> AI Generate BOM
          </button>
          <button onClick={() => setShowNewModal(true)} className="btn-primary">
            <Plus size={15} /> New BOM
          </button>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>BOM No</th><th>Product Name</th><th>Sales Order</th>
                <th>Items</th><th>Total Cost</th><th>AI</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {boms.map(b => (
                <tr key={b.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/bom/${b.id}`)}>
                  <td><span style={{ fontFamily: 'monospace', color: '#f97316', fontWeight: 600 }}>{b.bomNo}</span></td>
                  <td style={{ color: '#e2e8f0', fontWeight: 500 }}>{b.productName}</td>
                  <td style={{ color: '#64748b', fontSize: 13 }}>
                    {b.salesOrder ? (
                      <span style={{ color: '#f97316' }}>{b.salesOrder.orderNo}</span>
                    ) : '—'}
                  </td>
                  <td style={{ color: '#94a3b8' }}>{b._count?.items || 0} items</td>
                  <td style={{ color: '#f97316', fontWeight: 600 }}>{b.totalCost ? fmtCurrency(b.totalCost) : '—'}</td>
                  <td>
                    {b.isAiGenerated && (
                      <span style={{ fontSize: 11, color: '#c084fc', display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Sparkles size={11} /> AI
                      </span>
                    )}
                  </td>
                  <td><span className={`badge ${statusCls[b.status] || 'badge-gray'}`}>{b.status}</span></td>
                  <td><ChevronRight size={16} color="#64748b" /></td>
                </tr>
              ))}
              {!boms.length && !loading && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                  No BOMs yet. <button onClick={() => setShowAiModal(true)} style={{ background: 'none', border: 'none', color: '#c084fc', cursor: 'pointer' }}>Generate with AI</button>
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* New BOM Modal */}
      {showNewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ padding: 28, width: 480, maxWidth: '90vw' }}>
            <h3 style={{ color: '#f1f5f9', fontWeight: 700, marginTop: 0 }}>New BOM</h3>
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label>Product Name *</label>
                <input className="input" value={newForm.productName} onChange={e => setNewForm(p => ({ ...p, productName: e.target.value }))} placeholder="e.g., 5-Axis CNC Milling Machine" />
              </div>
              <div>
                <label>Description</label>
                <textarea className="input" rows={2} value={newForm.description} onChange={e => setNewForm(p => ({ ...p, description: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
              <div>
                <label>Linked Sales Order</label>
                <select className="select" value={newForm.salesOrderId} onChange={e => setNewForm(p => ({ ...p, salesOrderId: e.target.value }))}>
                  <option value="">— None —</option>
                  {salesOrders.map(so => <option key={so.id} value={so.id}>{so.orderNo} – {so.subject}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={handleCreate} className="btn-primary">Create BOM</button>
              <button onClick={() => setShowNewModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generate Modal */}
      {showAiModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ padding: 28, width: 520, maxWidth: '90vw' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Sparkles size={20} color="#c084fc" />
              <h3 style={{ color: '#f1f5f9', fontWeight: 700, margin: 0 }}>AI Generate BOM</h3>
            </div>
            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>
              Describe your product and AI will generate a complete Bill of Materials with part numbers, quantities, make/buy decisions, and estimated costs.
            </p>
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label>Product Name *</label>
                <input className="input" value={aiForm.productName} onChange={e => setAiForm(p => ({ ...p, productName: e.target.value }))} placeholder="e.g., Horizontal Machining Centre HMC-500" />
              </div>
              <div>
                <label>Product Description *</label>
                <textarea className="input" rows={4} value={aiForm.description}
                  onChange={e => setAiForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe specifications, application, key features, capacity requirements, material, etc."
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div>
                <label>Linked Sales Order</label>
                <select className="select" value={aiForm.salesOrderId} onChange={e => setAiForm(p => ({ ...p, salesOrderId: e.target.value }))}>
                  <option value="">— None —</option>
                  {salesOrders.map(so => <option key={so.id} value={so.id}>{so.orderNo} – {so.subject}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={handleAiGenerate} disabled={generating} className="btn-primary" style={{ background: 'linear-gradient(135deg, #7c3aed, #c084fc)' }}>
                {generating ? '⚡ Generating BOM...' : '⚡ Generate with AI'}
              </button>
              <button onClick={() => setShowAiModal(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
