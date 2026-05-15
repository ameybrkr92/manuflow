import React, { useEffect, useState } from 'react';
import { dispatchApi } from '../../api/endpoints';
import { 
  Truck, Package, FileText, CheckCircle, 
  MapPin, Calendar, Plus, ExternalLink 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function DispatchPage() {
  const [advices, setAdvices] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [d, s] = await Promise.all([
        dispatchApi.list(),
        dispatchApi.dashboard()
      ]);
      setAdvices(d);
      setStats(s);
    } catch {
      toast.error('Failed to load dispatch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await dispatchApi.updateStatus(id, status, { dispatchDate: new Date() });
      toast.success('Status updated');
      loadData();
    } catch { toast.error('Failed to update status'); }
  };

  if (loading) return <div style={{ padding: 32, color: '#64748b' }}>Loading dispatch module...</div>;

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Dispatch & Logistics</h1>
          <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Manage shipments, packing lists, and transport tracking</div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Planned Today</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#3b82f6' }}>{stats?.pending || 0}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Shipped Today</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#4ade80' }}>{stats?.dispatchedToday || 0}</div>
          </div>
          <button className="btn-primary" style={{ marginLeft: 16 }}>
            <Plus size={16} /> Create Dispatch Advice
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 20 }}>
        {advices.map(da => (
          <div key={da.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Truck size={18} color="#f97316" />
                <span style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{da.daNo}</span>
              </div>
              <span className={`badge ${da.status === 'DISPATCHED' ? 'badge-green' : 'badge-blue'}`}>{da.status}</span>
            </div>

            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Customer / Order</div>
                <div style={{ fontSize: 14, color: '#e2e8f0', fontWeight: 600 }}>{da.salesOrder?.customer?.name}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>Against Sales Order: {da.salesOrder?.orderNo}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Transporter</div>
                  <div style={{ fontSize: 13, color: '#94a3b8' }}>{da.transporterName || 'Self Pickup'}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Vehicle No</div>
                  <div style={{ fontSize: 13, color: '#94a3b8', fontFamily: 'monospace' }}>{da.vehicleNo || '—'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                {da.status === 'PLANNED' && (
                  <button onClick={() => updateStatus(da.id, 'DISPATCHED')} className="btn-primary" style={{ flex: 1 }}>
                    <CheckCircle size={16} /> Confirm Dispatch
                  </button>
                )}
                <button className="btn-secondary" style={{ flex: 1 }}>
                  <FileText size={16} /> Packing List
                </button>
                <button className="btn-ghost" title="E-Way Bill"><ExternalLink size={16} /></button>
              </div>
            </div>

            <div style={{ padding: '12px 20px', background: 'rgba(255,255,255,0.02)', fontSize: 11, color: '#64748b', display: 'flex', gap: 16 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {new Date(da.createdAt).toLocaleDateString('en-IN')}</span>
              {da.ewaybillNo && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>EWB: {da.ewaybillNo}</span>}
            </div>
          </div>
        ))}

        {advices.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, background: 'rgba(255,255,255,0.02)', borderRadius: 12 }}>
            <Truck size={40} color="#374151" style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 16, color: '#f1f5f9', fontWeight: 600 }}>No shipments planned</div>
            <p style={{ color: '#64748b', marginTop: 8 }}>Dispatch advices will appear here once ready for logistics.</p>
          </div>
        )}
      </div>
    </div>
  );
}
