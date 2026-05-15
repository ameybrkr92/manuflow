import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { bomApi } from '../../api/endpoints';
import { ArrowLeft, Plus, Trash2, CheckCircle, Sparkles, Package } from 'lucide-react';
import toast from 'react-hot-toast';

const makeOrBuyColors: Record<string, string> = {
  MAKE: '#f97316', BUY: '#3b82f6', SUB_CONTRACT: '#a855f7',
};

function fmtCurrency(v: any) {
  return `₹${parseFloat(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export default function BOMDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bom, setBom] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({
    partNo: '', description: '', qty: '1', uom: 'Nos', makeOrBuy: 'BUY', unitCost: '', notes: '',
  });

  const load = () => {
    if (!id) return;
    bomApi.get(id).then(setBom).catch(() => toast.error('Not found')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleApprove = async () => {
    setApproving(true);
    try {
      await bomApi.approve(id!);
      toast.success('BOM approved!');
      load();
    } catch { toast.error('Failed'); }
    finally { setApproving(false); }
  };

  const handleAddItem = async () => {
    if (!newItem.partNo || !newItem.description) return toast.error('Part No and Description required');
    try {
      await bomApi.addItem(id!, {
        ...newItem,
        qty: parseFloat(newItem.qty),
        unitCost: newItem.unitCost ? parseFloat(newItem.unitCost) : undefined,
      });
      toast.success('Item added');
      setNewItem({ partNo: '', description: '', qty: '1', uom: 'Nos', makeOrBuy: 'BUY', unitCost: '', notes: '' });
      setShowAddItem(false);
      load();
    } catch { toast.error('Failed to add item'); }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!confirm('Remove this item?')) return;
    try {
      await bomApi.removeItem(itemId);
      toast.success('Item removed');
      load();
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div style={{ padding: 32, color: '#64748b' }}>Loading...</div>;
  if (!bom) return <div style={{ padding: 32, color: '#ef4444' }}>BOM not found</div>;

  const items: any[] = bom.items || [];
  const totalCost = items.reduce((s: number, item: any) => s + (parseFloat(item.totalCost || item.unitCost * item.qty || 0)), 0);
  const makeItems = items.filter(i => i.makeOrBuy === 'MAKE').length;
  const buyItems = items.filter(i => i.makeOrBuy === 'BUY').length;

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} className="btn-ghost"><ArrowLeft size={16} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{bom.bomNo}</h1>
            <span className={`badge ${bom.status === 'APPROVED' ? 'badge-green' : 'badge-gray'}`}>{bom.status}</span>
            {bom.isAiGenerated && (
              <span style={{ fontSize: 11, color: '#c084fc', display: 'flex', alignItems: 'center', gap: 3 }}>
                <Sparkles size={11} /> AI Generated
              </span>
            )}
          </div>
          <div style={{ fontSize: 15, color: '#e2e8f0', marginTop: 4 }}>{bom.productName}</div>
          {bom.description && <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{bom.description}</div>}
          {bom.salesOrder && (
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
              Linked to SO: <Link to={`/sales-orders/${bom.salesOrderId}`} style={{ color: '#f97316', textDecoration: 'none' }}>{bom.salesOrder.orderNo}</Link>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {bom.status !== 'APPROVED' && (
            <button onClick={handleApprove} disabled={approving} className="btn-secondary" style={{ color: '#4ade80', borderColor: 'rgba(74,222,128,0.3)' }}>
              <CheckCircle size={15} /> {approving ? 'Approving...' : 'Approve BOM'}
            </button>
          )}
          <button onClick={() => setShowAddItem(true)} className="btn-primary">
            <Plus size={15} /> Add Item
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Items', value: items.length, color: '#f97316' },
          { label: 'MAKE Items', value: makeItems, color: '#f97316' },
          { label: 'BUY Items', value: buyItems, color: '#3b82f6' },
          { label: 'Est. Cost', value: totalCost > 0 ? `₹${(totalCost / 100000).toFixed(2)}L` : '—', color: '#4ade80' },
        ].map(card => (
          <div key={card.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Items Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Package size={16} color="#f97316" /> BOM Line Items
          </h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th><th>Part No</th><th>Description</th><th>Qty</th><th>UOM</th>
              <th>Make/Buy</th><th>Unit Cost</th><th>Total Cost</th><th>Notes</th>
              {bom.status !== 'APPROVED' && <th></th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, i: number) => (
              <tr key={item.id}>
                <td style={{ color: '#64748b', fontSize: 12 }}>{i + 1}</td>
                <td><span style={{ fontFamily: 'monospace', color: '#f97316', fontWeight: 600, fontSize: 12 }}>{item.partNo}</span></td>
                <td style={{ color: '#e2e8f0' }}>{item.description}</td>
                <td style={{ color: '#94a3b8' }}>{parseFloat(item.qty).toFixed(2)}</td>
                <td style={{ color: '#64748b', fontSize: 12 }}>{item.uom}</td>
                <td>
                  <span style={{
                    padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                    background: makeOrBuyColors[item.makeOrBuy] + '22',
                    color: makeOrBuyColors[item.makeOrBuy],
                  }}>
                    {item.makeOrBuy?.replace('_', ' ')}
                  </span>
                </td>
                <td style={{ color: '#94a3b8', fontSize: 13 }}>{item.unitCost ? fmtCurrency(item.unitCost) : '—'}</td>
                <td style={{ color: '#f97316', fontWeight: 600, fontSize: 13 }}>
                  {item.totalCost ? fmtCurrency(item.totalCost) : item.unitCost ? fmtCurrency(parseFloat(item.unitCost) * parseFloat(item.qty)) : '—'}
                </td>
                <td style={{ color: '#64748b', fontSize: 12, maxWidth: 120 }}>{item.notes || '—'}</td>
                {bom.status !== 'APPROVED' && (
                  <td>
                    <button onClick={() => handleRemoveItem(item.id)} className="btn-ghost" style={{ color: '#ef4444', padding: '4px 8px' }}>
                      <Trash2 size={13} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {!items.length && (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                No items. <button onClick={() => setShowAddItem(true)} style={{ background: 'none', border: 'none', color: '#f97316', cursor: 'pointer' }}>Add first item</button>
              </td></tr>
            )}
          </tbody>
          {totalCost > 0 && (
            <tfoot>
              <tr>
                <td colSpan={7} style={{ textAlign: 'right', color: '#64748b', fontSize: 13 }}>Total Estimated Cost:</td>
                <td style={{ color: '#f97316', fontWeight: 700, fontSize: 16 }}>{fmtCurrency(totalCost)}</td>
                <td colSpan={bom.status !== 'APPROVED' ? 2 : 1} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Add Item Modal */}
      {showAddItem && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ padding: 28, width: 520, maxWidth: '90vw' }}>
            <h3 style={{ color: '#f1f5f9', fontWeight: 700, marginTop: 0 }}>Add BOM Item</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label>Part No *</label>
                <input className="input" value={newItem.partNo} onChange={e => setNewItem(p => ({ ...p, partNo: e.target.value }))} placeholder="e.g., SPM-001" />
              </div>
              <div>
                <label>Make/Buy</label>
                <select className="select" value={newItem.makeOrBuy} onChange={e => setNewItem(p => ({ ...p, makeOrBuy: e.target.value }))}>
                  <option value="BUY">BUY</option>
                  <option value="MAKE">MAKE</option>
                  <option value="SUB_CONTRACT">SUB_CONTRACT</option>
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Description *</label>
                <input className="input" value={newItem.description} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))} placeholder="e.g., Linear Guide Way LM25" />
              </div>
              <div>
                <label>Quantity</label>
                <input className="input" type="number" value={newItem.qty} onChange={e => setNewItem(p => ({ ...p, qty: e.target.value }))} min="0.001" step="0.001" />
              </div>
              <div>
                <label>UOM</label>
                <select className="select" value={newItem.uom} onChange={e => setNewItem(p => ({ ...p, uom: e.target.value }))}>
                  {['Nos', 'Set', 'Pcs', 'kg', 'm', 'mm', 'L', 'Roll', 'Pair'].map(u => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label>Unit Cost (₹)</label>
                <input className="input" type="number" value={newItem.unitCost} onChange={e => setNewItem(p => ({ ...p, unitCost: e.target.value }))} placeholder="0" />
              </div>
              <div>
                <label>Notes</label>
                <input className="input" value={newItem.notes} onChange={e => setNewItem(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes..." />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={handleAddItem} className="btn-primary">Add Item</button>
              <button onClick={() => setShowAddItem(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
