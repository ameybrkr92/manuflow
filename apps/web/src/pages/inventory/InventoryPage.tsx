import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryApi } from '../../api/endpoints';
import { Plus, Search, Package, AlertTriangle, ArrowUpRight, ArrowDownLeft, Filter, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

function fmtStock(v: any, uom: string) {
  const n = parseFloat(v) || 0;
  return `${n.toLocaleString('en-IN')} ${uom}`;
}

export default function InventoryPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [showAdjust, setShowAdjust] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  
  const [newForm, setNewForm] = useState({ 
    partNo: '', description: '', uom: 'Nos', category: '', 
    reorderLevel: '10', minStock: '5', valuationRate: '0' 
  });
  
  const [adjustForm, setAdjustForm] = useState({ 
    type: 'in' as 'in' | 'out', qty: '1', rate: '', documentRef: '', notes: '' 
  });

  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    Promise.all([
      inventoryApi.list(search || undefined, category || undefined),
      inventoryApi.dashboard(),
      inventoryApi.getCategories()
    ]).then(([mats, dash, cats]) => {
      setMaterials(mats);
      setDashboard(dash);
      setCategories(cats);
    }).catch(() => toast.error('Failed to load inventory'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [search, category]);

  const handleCreate = async () => {
    if (!newForm.partNo || !newForm.description) return toast.error('Part No and Description required');
    try {
      await inventoryApi.create({
        ...newForm,
        reorderLevel: parseFloat(newForm.reorderLevel),
        minStock: parseFloat(newForm.minStock),
        valuationRate: parseFloat(newForm.valuationRate)
      });
      toast.success('Material created');
      setShowNew(false);
      load();
    } catch { toast.error('Failed to create material'); }
  };

  const handleAdjust = async () => {
    if (!adjustForm.qty || !adjustForm.documentRef) return toast.error('Quantity and Ref required');
    try {
      const call = adjustForm.type === 'in' ? inventoryApi.stockIn : inventoryApi.stockOut;
      await call(selectedMaterial.id, {
        qty: parseFloat(adjustForm.qty),
        rate: parseFloat(adjustForm.rate || selectedMaterial.valuationRate),
        documentRef: adjustForm.documentRef,
        notes: adjustForm.notes
      });
      toast.success('Stock adjusted');
      setShowAdjust(false);
      load();
    } catch { toast.error('Failed to adjust stock'); }
  };

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Store & Inventory</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Material master, stock levels & ledger tracking</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setShowNew(true)} className="btn-primary"><Plus size={15} /> New Material</button>
        </div>
      </div>

      {/* Dashboard Stats */}
      {dashboard && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#f97316' }}>{dashboard.totalItems}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Total Items in Master</div>
          </div>
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: dashboard.lowStockCount > 0 ? '#ef4444' : '#4ade80', display: 'flex', alignItems: 'center', gap: 8 }}>
              {dashboard.lowStockCount}
              {dashboard.lowStockCount > 0 && <AlertTriangle size={20} />}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Items Below Reorder Level</div>
          </div>
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6' }}>₹{(dashboard.inventoryValue / 100000).toFixed(2)}L</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Total Inventory Value</div>
          </div>
          <div className="card" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#c084fc' }}>{dashboard.recentTransactions?.length || 0}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Recent Transactions</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input 
            className="input" 
            style={{ paddingLeft: 36 }} 
            placeholder="Search by Part No or Description..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="select" style={{ width: 200 }} value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>Loading...</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Part No</th>
                <th>Description</th>
                <th>Category</th>
                <th>Current Stock</th>
                <th>Reorder Level</th>
                <th>Valuation</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {materials.map(m => {
                const isLow = parseFloat(m.currentStock) <= parseFloat(m.reorderLevel);
                return (
                  <tr key={m.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/inventory/${m.id}`)}>
                    <td><span style={{ fontFamily: 'monospace', color: '#f97316', fontWeight: 600 }}>{m.partNo}</span></td>
                    <td style={{ color: '#e2e8f0', fontWeight: 500 }}>{m.description}</td>
                    <td style={{ color: '#64748b', fontSize: 13 }}>{m.category || '—'}</td>
                    <td style={{ color: isLow ? '#ef4444' : '#4ade80', fontWeight: 600 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {fmtStock(m.currentStock, m.uom)}
                        {isLow && <AlertTriangle size={14} />}
                      </div>
                    </td>
                    <td style={{ color: '#94a3b8' }}>{fmtStock(m.reorderLevel, m.uom)}</td>
                    <td style={{ color: '#64748b', fontSize: 13 }}>₹{parseFloat(m.valuationRate).toLocaleString('en-IN')}</td>
                    <td><span className="badge badge-gray">{isLow ? 'LOW STOCK' : 'AVAILABLE'}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button 
                          onClick={() => { setSelectedMaterial(m); setAdjustForm(p => ({ ...p, type: 'in' })); setShowAdjust(true); }}
                          className="btn-ghost" 
                          style={{ color: '#4ade80', padding: 6 }}
                          title="Stock In"
                        >
                          <ArrowDownLeft size={16} />
                        </button>
                        <button 
                          onClick={() => { setSelectedMaterial(m); setAdjustForm(p => ({ ...p, type: 'out' })); setShowAdjust(true); }}
                          className="btn-ghost" 
                          style={{ color: '#ef4444', padding: 6 }}
                          title="Stock Out"
                        >
                          <ArrowUpRight size={16} />
                        </button>
                        <button className="btn-ghost" style={{ padding: 6 }}><ChevronRight size={16} color="#64748b" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!materials.length && !loading && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                    No materials found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* New Material Modal */}
      {showNew && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ padding: 28, width: 500, maxWidth: '90vw' }}>
            <h3 style={{ color: '#f1f5f9', fontWeight: 700, marginTop: 0, marginBottom: 20 }}>New Material</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label>Part Number *</label>
                <input className="input" value={newForm.partNo} onChange={e => setNewForm(p => ({ ...p, partNo: e.target.value }))} placeholder="e.g., RAW-STL-001" />
              </div>
              <div>
                <label>UOM *</label>
                <select className="select" value={newForm.uom} onChange={e => setNewForm(p => ({ ...p, uom: e.target.value }))}>
                  {['Nos', 'kg', 'm', 'mm', 'Set', 'Pcs', 'L', 'Roll'].map(u => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Description *</label>
                <input className="input" value={newForm.description} onChange={e => setNewForm(p => ({ ...p, description: e.target.value }))} placeholder="e.g., Mild Steel Plate 10mm" />
              </div>
              <div>
                <label>Category</label>
                <input className="input" value={newForm.category} onChange={e => setNewForm(p => ({ ...p, category: e.target.value }))} placeholder="e.g., Raw Material" />
              </div>
              <div>
                <label>Initial Rate (₹)</label>
                <input className="input" type="number" value={newForm.valuationRate} onChange={e => setNewForm(p => ({ ...p, valuationRate: e.target.value }))} />
              </div>
              <div>
                <label>Reorder Level</label>
                <input className="input" type="number" value={newForm.reorderLevel} onChange={e => setNewForm(p => ({ ...p, reorderLevel: e.target.value }))} />
              </div>
              <div>
                <label>Min Stock</label>
                <input className="input" type="number" value={newForm.minStock} onChange={e => setNewForm(p => ({ ...p, minStock: e.target.value }))} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={handleCreate} className="btn-primary">Create Material</button>
              <button onClick={() => setShowNew(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {showAdjust && selectedMaterial && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ padding: 28, width: 400, maxWidth: '90vw' }}>
            <h3 style={{ color: '#f1f5f9', fontWeight: 700, marginTop: 0, marginBottom: 8 }}>
              Stock {adjustForm.type === 'in' ? 'In' : 'Out'}
            </h3>
            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>
              Adjusting stock for <strong style={{ color: '#f97316' }}>{selectedMaterial.partNo}</strong>
            </p>
            
            <div style={{ display: 'grid', gap: 14 }}>
              <div>
                <label>Quantity ({selectedMaterial.uom})</label>
                <input className="input" type="number" value={adjustForm.qty} onChange={e => setAdjustForm(p => ({ ...p, qty: e.target.value }))} />
              </div>
              <div>
                <label>Rate (₹ per {selectedMaterial.uom})</label>
                <input className="input" type="number" value={adjustForm.rate} onChange={e => setAdjustForm(p => ({ ...p, rate: e.target.value }))} placeholder={selectedMaterial.valuationRate} />
              </div>
              <div>
                <label>Document Ref (PO/Invoice/Job No) *</label>
                <input className="input" value={adjustForm.documentRef} onChange={e => setAdjustForm(p => ({ ...p, documentRef: e.target.value }))} placeholder="e.g., PO-24-001" />
              </div>
              <div>
                <label>Notes</label>
                <textarea className="input" rows={2} value={adjustForm.notes} onChange={e => setAdjustForm(p => ({ ...p, notes: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
              <button onClick={handleAdjust} className="btn-primary" style={{ background: adjustForm.type === 'in' ? '#22c55e' : '#ef4444' }}>
                Confirm {adjustForm.type === 'in' ? 'Receipt' : 'Issue'}
              </button>
              <button onClick={() => setShowAdjust(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
