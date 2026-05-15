import React, { useEffect, useState } from 'react';
import { shopFloorApi } from '../../api/endpoints';
import { 
  Play, Pause, CheckCircle, AlertTriangle, Clock, 
  ChevronRight, LayoutGrid, List, Zap, HardDrive 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShopFloorPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterWorkCenter, setFilterWorkCenter] = useState('');

  const loadData = async () => {
    try {
      const [jobsData, statsData] = await Promise.all([
        shopFloorApi.getJobs({ workCenterId: filterWorkCenter }),
        shopFloorApi.dashboard()
      ]);
      setJobs(jobsData);
      setStats(statsData);
    } catch (err) {
      toast.error('Failed to load shop floor data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [filterWorkCenter]);

  const handleStart = async (id: string) => {
    try {
      await shopFloorApi.startJob(id);
      toast.success('Job started');
      loadData();
    } catch { toast.error('Failed to start job'); }
  };

  const handleComplete = async (id: string) => {
    const hours = prompt('Enter actual hours spent:', '1');
    if (hours === null) return;
    try {
      await shopFloorApi.completeJob(id, parseFloat(hours));
      toast.success('Job completed');
      loadData();
    } catch { toast.error('Failed to complete job'); }
  };

  const handlePause = async (id: string) => {
    const reason = prompt('Enter reason for pausing (e.g. Breakdown, No Material, Setup):');
    if (!reason) return;
    try {
      await shopFloorApi.pauseJob(id, reason);
      toast.success('Job paused');
      loadData();
    } catch { toast.error('Failed to pause job'); }
  };

  const handleDowntime = async (jobCardId: string) => {
    const reasonCode = prompt('Enter downtime reason code (BREAKDOWN, SETUP, POWER, MATERIAL):');
    if (!reasonCode) return;
    try {
      await shopFloorApi.logDowntime({ 
        jobCardId, 
        reasonCode: reasonCode.toUpperCase(), 
        startTime: new Date().toISOString() 
      });
      toast.success('Downtime logged');
    } catch { toast.error('Failed to log downtime'); }
  };

  if (loading) return <div style={{ padding: 32, color: '#64748b' }}>Loading shop floor...</div>;

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Shop Floor Execution</h1>
          <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Real-time job tracking and execution</div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Active Jobs</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#c084fc' }}>{stats?.activeJobs || 0}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Done Today</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#4ade80' }}>{stats?.completedToday || 0}</div>
          </div>
        </div>
      </div>

      {/* Operator View: Grid of Job Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 20 }}>
        {jobs.map(job => (
          <div key={job.id} className="card" style={{ 
            padding: 0, 
            border: job.status === 'IN_PROGRESS' ? '1px solid rgba(192,132,252,0.3)' : 
                   job.status === 'PAUSED' ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255,255,255,0.05)',
            background: job.status === 'IN_PROGRESS' ? 'rgba(192,132,252,0.03)' : 
                        job.status === 'PAUSED' ? 'rgba(239,68,68,0.02)' : '#161b22'
          }}>
            <div style={{ padding: 20, borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, fontFamily: 'monospace' }}>{job.jobCardNo}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', marginTop: 4 }}>{job.operation?.operationName}</div>
              </div>
              <span className={`badge ${
                job.status === 'IN_PROGRESS' ? 'badge-purple' : 
                job.status === 'PAUSED' ? 'badge-red' : 'badge-gray'
              }`}>{job.status}</span>
            </div>

            <div style={{ padding: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>Work Order</div>
                  <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{job.workOrder?.workOrderNo}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase' }}>Work Center</div>
                  <div style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{job.workCenter?.name}</div>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: 12, borderRadius: 8, marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 }}>Product</div>
                <div style={{ fontSize: 13, color: '#94a3b8' }}>{job.workOrder?.productName} (Qty: {job.workOrder?.qty})</div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                {(job.status === 'PENDING' || job.status === 'PAUSED') && (
                  <button onClick={() => handleStart(job.id)} className="btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, #a855f7, #7e22ce)' }}>
                    <Play size={16} /> {job.status === 'PAUSED' ? 'Resume' : 'Start Job'}
                  </button>
                )}
                {job.status === 'IN_PROGRESS' && (
                  <>
                    <button onClick={() => handleComplete(job.id)} className="btn-primary" style={{ flex: 2, background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                      <CheckCircle size={16} /> Mark Complete
                    </button>
                    <button onClick={() => handlePause(job.id)} className="btn-secondary" style={{ flex: 1 }}>
                      <Pause size={16} /> Pause
                    </button>
                  </>
                )}
                <button onClick={() => handleDowntime(job.id)} className="btn-ghost" title="Report Downtime"><AlertTriangle size={16} color="#ef4444" /></button>
              </div>
            </div>
          </div>
        ))}

        {jobs.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px dashed rgba(255,255,255,0.1)' }}>
            <Zap size={40} color="#374151" style={{ marginBottom: 16 }} />
            <div style={{ fontSize: 16, color: '#f1f5f9', fontWeight: 600 }}>No active jobs assigned</div>
            <p style={{ color: '#64748b', marginTop: 8 }}>Select a different work center or wait for new work orders.</p>
          </div>
        )}
      </div>
    </div>
  );
}
