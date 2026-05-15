import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productionApi } from '../../api/endpoints';
import { ArrowLeft, Play, CheckCircle, Plus, Wrench } from 'lucide-react';
import toast from 'react-hot-toast';

const statusColors: Record<string, string> = {
  PLANNED: '#3b82f6', RELEASED: '#a855f7', IN_PROGRESS: '#f97316', ON_HOLD: '#ef4444', COMPLETED: '#4ade80', CANCELLED: '#64748b',
};

export default function WorkOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wo, setWo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAddOp, setShowAddOp] = useState(false);
  const [workCenters, setWorkCenters] = useState<any[]>([]);
  const [opForm, setOpForm] = useState({ workCenterId: '', operationName: '', sequence: '1', plannedHours: '8', notes: '' });

  const load = () => {
    if (!id) return;
    productionApi.get(id).then(setWo).catch(() => toast.error('Not found')).finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    productionApi.listWorkCenters().then(setWorkCenters);
  }, [id]);

  const handleStatusChange = async (status: string) => {
    try {
      await productionApi.updateStatus(id!, status);
      toast.success('Status updated');
      load();
    } catch { toast.error('Failed'); }
  };

  const handleProgressUpdate = async (progress: number) => {
    try {
      await productionApi.updateProgress(id!, progress);
      load();
    } catch { toast.error('Failed'); }
  };

  const handleAddOperation = async () => {
    if (!opForm.workCenterId || !opForm.operationName) return toast.error('Work Center and Operation Name required');
    try {
      await productionApi.addOperation(id!, {
        ...opForm,
        sequence: parseInt(opForm.sequence),
        plannedHours: parseFloat(opForm.plannedHours),
      });
      toast.success('Operation added + Job Card created');
      setShowAddOp(false);
      setOpForm({ workCenterId: '', operationName: '', sequence: '1', plannedHours: '8', notes: '' });
      load();
    } catch { toast.error('Failed'); }
  };

  if (loading) return <div style={{ padding: 32, color: '#64748b' }}>Loading...</div>;
  if (!wo) return <div style={{ padding: 32, color: '#ef4444' }}>Work Order not found</div>;

  const operations: any[] = wo.operations || [];
  const totalPlannedHrs = operations.reduce((s: number, op: any) => s + parseFloat(op.plannedHours || 0), 0);
  const totalActualHrs = operations.reduce((s: number, op: any) => s + parseFloat(op.actualHours || 0), 0);

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} className="btn-ghost"><ArrowLeft size={16} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{wo.workOrderNo}</h1>
            <span style={{
              padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              background: statusColors[wo.status] + '22', color: statusColors[wo.status],
            }}>{wo.status?.replace(/_/g, ' ')}</span>
            <span style={{ fontSize: 13, color: '#64748b' }}>Priority P{wo.priority}</span>
          </div>
          <div style={{ fontSize: 15, color: '#e2e8f0', marginTop: 4 }}>{wo.productName}</div>
          {wo.salesOrder && (
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>
              SO: <Link to={`/sales-orders/${wo.salesOrderId}`} style={{ color: '#f97316', textDecoration: 'none' }}>{wo.salesOrder.orderNo}</Link>
              {wo.salesOrder.customer && ` — ${wo.salesOrder.customer.name}`}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {wo.status === 'PLANNED' && (
            <button onClick={() => handleStatusChange('IN_PROGRESS')} className="btn-secondary" style={{ color: '#f97316' }}>
              <Play size={14} /> Start Production
            </button>
          )}
          {wo.status === 'IN_PROGRESS' && (
            <button onClick={() => handleStatusChange('COMPLETED')} className="btn-secondary" style={{ color: '#4ade80' }}>
              <CheckCircle size={14} /> Mark Complete
            </button>
          )}
          <button onClick={() => setShowAddOp(true)} className="btn-primary"><Plus size={14} /> Add Operation</button>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Quantity', value: parseFloat(wo.qty) },
          { label: 'Operations', value: operations.length },
          { label: 'Planned Hrs', value: `${totalPlannedHrs.toFixed(1)}h`, color: '#3b82f6' },
          { label: 'Actual Hrs', value: `${totalActualHrs.toFixed(1)}h`, color: '#f97316' },
        ].map(card => (
          <div key={card.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: (card as any).color || '#f1f5f9' }}>{card.value}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Progress Slider */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>Overall Progress</h3>
          <span style={{ fontSize: 18, fontWeight: 700, color: wo.progress === 100 ? '#4ade80' : '#f97316' }}>{wo.progress}%</span>
        </div>
        <div style={{ height: 10, background: '#1e2535', borderRadius: 5, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ height: '100%', width: `${wo.progress}%`, background: wo.progress === 100 ? 'linear-gradient(90deg,#22c55e,#4ade80)' : 'linear-gradient(90deg,#ea580c,#f97316)', borderRadius: 5, transition: 'width 0.4s ease' }} />
        </div>
        {wo.status === 'IN_PROGRESS' && (
          <div style={{ display: 'flex', gap: 8 }}>
            {[25, 50, 75, 100].map(p => (
              <button key={p} onClick={() => handleProgressUpdate(p)} className="btn-ghost" style={{ fontSize: 12, padding: '4px 12px', color: wo.progress >= p ? '#f97316' : '#64748b' }}>
                {p}%
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Operations Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Wrench size={16} color="#f97316" /> Operations & Job Cards
          </h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Seq</th><th>Operation</th><th>Work Center</th><th>Planned Hrs</th><th>Actual Hrs</th><th>Status</th><th>Job Cards</th>
            </tr>
          </thead>
          <tbody>
            {operations.map(op => (
              <tr key={op.id}>
                <td style={{ color: '#64748b', fontSize: 12 }}>{op.sequence}</td>
                <td style={{ color: '#e2e8f0', fontWeight: 500 }}>{op.operationName}</td>
                <td>
                  <span style={{ fontSize: 13, color: '#f97316' }}>{op.workCenter?.code}</span>
                  <span style={{ fontSize: 12, color: '#64748b', marginLeft: 6 }}>{op.workCenter?.name}</span>
                </td>
                <td style={{ color: '#3b82f6' }}>{parseFloat(op.plannedHours).toFixed(1)}h</td>
                <td style={{ color: '#f97316' }}>{parseFloat(op.actualHours || 0).toFixed(1)}h</td>
                <td>
                  <span style={{
                    padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600,
                    background: op.status === 'COMPLETED' ? '#4ade8022' : op.status === 'IN_PROGRESS' ? '#f9731622' : '#64748b22',
                    color: op.status === 'COMPLETED' ? '#4ade80' : op.status === 'IN_PROGRESS' ? '#f97316' : '#64748b',
                  }}>{op.status}</span>
                </td>
                <td style={{ color: '#64748b', fontSize: 12 }}>{op.jobCards?.length || 0} JC</td>
              </tr>
            ))}
            {!operations.length && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>
                No operations. <button onClick={() => setShowAddOp(true)} style={{ background: 'none', border: 'none', color: '#f97316', cursor: 'pointer' }}>Add first operation</button>
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Operation Modal */}
      {showAddOp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ padding: 28, width: 480, maxWidth: '90vw' }}>
            <h3 style={{ color: '#f1f5f9', fontWeight: 700, marginTop: 0 }}>Add Operation</h3>
            <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>A Job Card will be auto-created for this operation.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Work Center *</label>
                <select className="select" value={opForm.workCenterId} onChange={e => setOpForm(p => ({ ...p, workCenterId: e.target.value }))}>
                  <option value="">Select Work Center</option>
                  {workCenters.map(wc => <option key={wc.id} value={wc.id}>{wc.code} — {wc.name}</option>)}
                </select>
                {!workCenters.length && <p style={{ fontSize: 11, color: '#f97316', marginTop: 4 }}>No work centers yet — go to Production → Work Centers to add</p>}
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Operation Name *</label>
                <input className="input" value={opForm.operationName} onChange={e => setOpForm(p => ({ ...p, operationName: e.target.value }))} placeholder="e.g., Rough Milling, Assembly, Welding" />
              </div>
              <div>
                <label>Sequence</label>
                <input className="input" type="number" value={opForm.sequence} onChange={e => setOpForm(p => ({ ...p, sequence: e.target.value }))} min="1" />
              </div>
              <div>
                <label>Planned Hours</label>
                <input className="input" type="number" value={opForm.plannedHours} onChange={e => setOpForm(p => ({ ...p, plannedHours: e.target.value }))} min="0.5" step="0.5" />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label>Notes / Instructions</label>
                <input className="input" value={opForm.notes} onChange={e => setOpForm(p => ({ ...p, notes: e.target.value }))} placeholder="e.g., Refer drawing DWG-001" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={handleAddOperation} className="btn-primary">Add Operation</button>
              <button onClick={() => setShowAddOp(false)} className="btn-secondary">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
