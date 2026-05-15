import React, { useEffect, useState } from 'react';
import { qualityApi } from '../../api/endpoints';
import { 
  ShieldCheck, FileText, AlertOctagon, Plus, Search, 
  CheckCircle2, XCircle, Clock, Filter 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function QualityPage() {
  const [activeTab, setActiveTab] = useState<'records' | 'ncrs' | 'plans'>('records');
  const [records, setRecords] = useState<any[]>([]);
  const [ncrs, setNcrs] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [r, n, p, s] = await Promise.all([
        qualityApi.getRecords(),
        qualityApi.getNCRs(),
        qualityApi.getPlans(),
        qualityApi.dashboard()
      ]);
      setRecords(r);
      setNcrs(n);
      setPlans(p);
      setStats(s);
    } catch {
      toast.error('Failed to load quality data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  if (loading) return <div style={{ padding: 32, color: '#64748b' }}>Loading quality module...</div>;

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Quality Management</h1>
          <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Inspection records and non-conformance tracking</div>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          <div className="stat-card" style={{ padding: '12px 20px', minWidth: 160 }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Open NCRs</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#ef4444' }}>{stats?.openNCRs || 0}</div>
          </div>
          <div className="stat-card" style={{ padding: '12px 20px', minWidth: 160 }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Inspections</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#3b82f6' }}>{stats?.totalInspections || 0}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 1 }}>
        {[
          { id: 'records', label: 'Inspection Records', icon: ShieldCheck },
          { id: 'ncrs', label: 'Non-Conformances (NCR)', icon: AlertOctagon },
          { id: 'plans', label: 'Inspection Plans', icon: FileText },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px',
              border: 'none', background: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500,
              color: activeTab === tab.id ? '#f97316' : '#64748b',
              borderBottom: activeTab === tab.id ? '2px solid #f97316' : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
        <button className="btn-primary" style={{ marginLeft: 'auto', marginBottom: 8 }}>
          <Plus size={16} /> {activeTab === 'plans' ? 'New Plan' : activeTab === 'ncrs' ? 'Raise NCR' : 'Record Inspection'}
        </button>
      </div>

      {/* Content */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {activeTab === 'records' && (
          <table>
            <thead>
              <tr>
                <th>Part / Item</th><th>Type</th><th>Result</th><th>Inspected By</th><th>Date</th><th>Ref</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id}>
                  <td>
                    <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{r.partNo}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>{r.partName}</div>
                  </td>
                  <td style={{ color: '#94a3b8', fontSize: 13 }}>{r.inspectionType}</td>
                  <td>
                    <span className={`badge ${r.overallResult === 'PASS' ? 'badge-green' : 'badge-red'}`}>
                      {r.overallResult === 'PASS' ? <CheckCircle2 size={12} style={{ marginRight: 4 }} /> : <XCircle size={12} style={{ marginRight: 4 }} />}
                      {r.overallResult}
                    </span>
                  </td>
                  <td style={{ color: '#94a3b8' }}>{r.inspectedBy}</td>
                  <td style={{ color: '#64748b', fontSize: 12 }}>{new Date(r.inspectedAt).toLocaleDateString('en-IN')}</td>
                  <td style={{ color: '#f97316', fontWeight: 500 }}>{r.workOrder?.workOrderNo || r.grnId || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'ncrs' && (
          <table>
            <thead>
              <tr>
                <th>NCR No</th><th>Title</th><th>Status</th><th>Defect Type</th><th>Work Order</th><th>Raised On</th>
              </tr>
            </thead>
            <tbody>
              {ncrs.map(n => (
                <tr key={n.id}>
                  <td style={{ color: '#ef4444', fontWeight: 700, fontFamily: 'monospace' }}>{n.ncrNo}</td>
                  <td style={{ color: '#f1f5f9' }}>{n.title}</td>
                  <td>
                    <span className={`badge ${n.status === 'OPEN' ? 'badge-red' : 'badge-green'}`}>{n.status}</span>
                  </td>
                  <td style={{ color: '#94a3b8' }}>{n.defectType}</td>
                  <td style={{ color: '#f97316' }}>{n.workOrder?.workOrderNo || '—'}</td>
                  <td style={{ color: '#64748b', fontSize: 12 }}>{new Date(n.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'plans' && (
          <table>
            <thead>
              <tr>
                <th>Part No</th><th>Part Name</th><th>Parameters</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {plans.map(p => (
                <tr key={p.id}>
                  <td style={{ color: '#f97316', fontWeight: 600 }}>{p.partNo}</td>
                  <td style={{ color: '#f1f5f9' }}>{p.partName}</td>
                  <td style={{ color: '#94a3b8' }}>{Array.isArray(p.parameters) ? p.parameters.length : 0} parameters defined</td>
                  <td><span className={`badge ${p.isActive ? 'badge-green' : 'badge-gray'}`}>{p.isActive ? 'Active' : 'Draft'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
