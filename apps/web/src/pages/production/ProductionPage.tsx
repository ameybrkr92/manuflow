import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { productionApi, salesOrdersApi } from '../../api/endpoints';
import { Plus, Play, CheckCircle, Clock, AlertTriangle, Factory } from 'lucide-react';
import toast from 'react-hot-toast';

const statusCls: Record<string, string> = {
  PLANNED: 'badge-blue', RELEASED: 'badge-purple', IN_PROGRESS: 'badge-amber',
  ON_HOLD: 'badge-red', COMPLETED: 'badge-green', CANCELLED: 'badge-gray',
};

export default function ProductionPage() {
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [form, setForm] = useState({ salesOrderId: '', productName: '', qty: '1', plannedStart: '', plannedEnd: '', priority: '5', notes: '' });
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const load = (status?: string) => {
    setLoading(true);
    const soId = params.get('soId') || undefined;
    productionApi.list(status || undefined, soId).then(setWorkOrders).catch(() => toast.error('Failed')).finally(() => setLoading(false));
    productionApi.dashboard().then(setDashboard).catch(() => {});
  };

  useEffect(() => {
    load();
    salesOrdersApi.list().then(setSalesOrders);
  }, []);

  const handleCreate = async () => {
    if (!form.salesOrderId || !form.productName) return toast.error('Sales Order and Product Name required');
    try {
      const wo = await productionApi.create({ ...form, qty: parseFloat(form.qty), priority: parseInt(form.priority) });
      toast.success(`Work Order ${wo.workOrderNo} created`);
      setShowNew(false);
      setForm({ salesOrderId: '', productName: '', qty: '1', plannedStart: '', plannedEnd: '', priority: '5', notes: '' });
      load(filter);
    } catch (err: any) { toast.error(err?.response?.data?.message || 'Failed'); }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await productionApi.updateStatus(id, status);
      toast.success('Status updated');
      load(filter);
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Production Planning</h1>
          <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>Work orders, operations & shop floor execution</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary"><Plus size={15} /> New Work Order</button>
      </div>

      {/* Dashboard Stats */}
      {dashboard && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {[
            { label: 'Planned', value: dashboard.openOrders, color: '#3b82f6', icon: <Clock size={18} /> },
            { label: 'In Progress', value: dashboard.inProgress, color: '#f97316', icon: <Play size={18} /> },
            { label: 'Completed', value: dashboard.completed, color: '#4ade80', icon: <CheckCircle size={18} /> },
            { label: 'Work Centers', value: dashboard.workCenters?.length || 0, color: '#c084fc', icon: <Factory size={18} /> },
          ].map(card => (
            <div key={card.label} className="card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ color: card.color, opacity: 0.8 }}>{card.icon}</div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 700, color: card.color }}>{card.value}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{card.label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Status Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['', 'PLANNED', 'RELEASED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED'].map(s => (
          <button key={s} onClick={() => { setFilter(s); load(s); }}
            style={{
              padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              background: filter === s ? '#f97316' : 'rgba(255,255,255,0.05)',
              color: filter === s ? 'white' : '#94a3b8',
              border: filter === s ? 'none' : '1px solid rgba(255,255,255,0.08)', transition: 'all 0.2s',
            }}>
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
                <th>WO No</th><th>Product</th><th>Sales Order</th><th>Qty</th>
                <th>Progress</th><th>Planned End</th><th>Priority</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {workOrders.map(wo => {
                const isOverdue = wo.plannedEnd && new Date(wo.plannedEnd) < new Date() && !['COMPLETED', 'CANCELLED'].includes(wo.status);
                return (
                  <tr key={wo.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/production/${wo.id}`)}>
                    <td><span style={{ fontFamily: 'monospace', color: '#f97316', fontWeight: 600 }}>{wo.workOrderNo}</span></td>
                    <td style={{ color: '#e2e8f0', fontWeight: 500 }}>{wo.productName}</td>
                    <td style={{ fontSize: 13 }}>
                      {wo.salesOrder ? (
                        <span style={{ color: '#f97316' }}>{wo.salesOrder.orderNo}</span>
                      ) : '—'}
                      {wo.salesOrder?.customer && <span style={{ color: '#64748b', marginLeft: 6 }}>{wo.salesOrder.customer.name}</span>}
                    </td>
                    <td style={{ color: '#94a3b8' }}>{parseFloat(wo.qty)}</td>
                    <td style={{ minWidth: 120 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: '#1e2535', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${wo.progress}%`, background: wo.progress === 100 ? '#4ade80' : '#f97316', borderRadius: 3, transition: 'width 0.3s' }} />
                        </div>
                        <span style={{ fontSize: 11, color: '#64748b', minWidth: 28 }}>{wo.progress}%</span>
                      </div>
                    </td>
                    <td style={{ color: isOverdue ? '#ef4444' : '#64748b', fontSize: 13 }}>
                      {wo.plannedEnd ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {isOverdue && <AlertTriangle size={12} />}
                          {new Date(wo.plannedEnd).toLocaleDateString('en-IN')}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: wo.priority <= 2 ? '#ef4444' : wo.priority <= 4 ? '#f97316' : '#64748b' }}>
                        P{wo.priority}
                      </span>
                    </td>
                    <td><span className={`badge ${statusCls[wo.status] || 'badge-gray'}`}>{wo.status?.replace(/_/g, ' ')}</span></td>
                    <td onClick={e => e.stopPropagation()}>
                      {wo.status === 'PLANNED' && (
                        <button onClick={() => handleStatusChange(wo.id, 'IN_PROGRESS')} className="btn-ghost" style={{ fontSize: 11, color: '#f97316', padding: '4px 8px' }}>
                          <Play size={11} /> Start
                        </button>
                      )}
                      {wo.status === 'IN_PROGRESS' && (
                        <button onClick={() => handleStatusChange(wo.id, 'COMPLETED')} className="btn-ghost" style={{ fontSize: 11, color: '#4ade80', padding: '4px 8px' }}>
                          <CheckCircle size={11} /> Done
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {!workOrders.length && !loading && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>
                  No work orders. <button onClick={() => setShowNew(true)} style={{ background: 'none', border: 'none', color: '#f97316', cursor: 'pointer' }}>Create one</button>
                </td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* New Work Order Modal */}
      {showNew && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ padding: 28, width: 520, maxWidth: '90vw' }}>
            <h3 style={{ color: '#f1f5f9', fontWeight: 700, marginTop: 0 }}>New Work Order</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Sales Order *</label>
                <select className="select" value={form.salesOrderId} onChange={e => setForm(p => ({ ...p, salesOrderId: e.target.value }))}>
                  <option value="">Select Sales Order</option>
                  {salesOrders.map(so => <option key={so.id} value={so.id}>{so.orderNo} – {so.subject}</option>)}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Product Name *</label>
                <input className="input" value={form.productName} onChange={e => setForm(p => ({ ...p, productName: e.target.value }))} placeholder="e.g., HMC-500 Main Assembly" />
              </div>
              <div>
                <label>Quantity</label>
                <input className="input" type="number" value={form.qty} onChange={e => setForm(p => ({ ...p, qty: e.target.value }))} min="1" />
              </div>
              <div>
                <label>Priority (1=High, 10=Low)</label>
                <input className="input" type="number" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} min="1" max="10" />
              </div>
              <div>
                <label>Planned Start</label>
                <input className="input" type="date" value={form.plannedStart} onChange={e => setForm(p => ({ ...p, plannedStart: e.target.value }))} />
              </div>
              <div>
                <label>Planned End</label>
                <input className="input" type="date" value={form.plannedEnd} onChange={e => setForm(p => ({ ...p, plannedEnd: e.target.value }))} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Notes</label>
                <textarea className="input" rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={handleCreate} className="btn-primary">Create Work Order</button>
              <button onClick={() => setShowNew(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
