import React, { useEffect, useState } from 'react';
import { analyticsApi } from '../../api/endpoints';
import { 
  BarChart3, TrendingUp, Target, ShieldCheck, 
  IndianRupee, ArrowUpRight, ArrowDownRight, Filter 
} from 'lucide-react';
import toast from 'react-hot-toast';

function fmtCurrency(v: any) {
  const n = parseFloat(v) || 0;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsApi.getKpis(),
      analyticsApi.getRevenueTrend()
    ]).then(([kpis, t]) => {
      setData(kpis);
      setTrend(t);
    }).catch(() => {
      toast.error('Failed to load analytics');
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 32, color: '#64748b' }}>Calculating insights...</div>;

  const kpiGroups = [
    {
      title: 'Sales & Revenue',
      icon: IndianRupee,
      color: '#f97316',
      metrics: [
        { label: 'Total Revenue', value: fmtCurrency(data?.sales?.totalRevenue), sub: 'Overall order value' },
        { label: 'Avg Order Value', value: fmtCurrency(data?.sales?.avgOrderValue), sub: 'Per confirmed order' },
        { label: 'Order Conversion', value: '64%', sub: 'Enquiry to Order', trend: '+12%' },
      ]
    },
    {
      title: 'Production Efficiency',
      icon: Target,
      color: '#c084fc',
      metrics: [
        { label: 'OTD Rate', value: `${(data?.production?.onTimeDelivery || 0).toFixed(1)}%`, sub: 'On-time Delivery' },
        { label: 'Work Orders', value: String(data?.production?.totalWorkOrders), sub: 'Active & Completed' },
        { label: 'Resource Load', value: '82%', sub: 'Avg utilization', trend: '+5%' },
      ]
    },
    {
      title: 'Quality Performance',
      icon: ShieldCheck,
      color: '#22c55e',
      metrics: [
        { label: 'First Pass Yield', value: `${(data?.quality?.firstPassYield || 0).toFixed(1)}%`, sub: 'No rework needed' },
        { label: 'Open NCRs', value: String(data?.quality?.openNCRs), sub: 'Awaiting closure', critical: data?.quality?.openNCRs > 5 },
        { label: 'Vendor Rating', value: '4.2/5', sub: 'Average quality', trend: '-0.2' },
      ]
    }
  ];

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Business Analytics</h1>
          <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Deep dive into operational performance and trends</div>
        </div>
        <button className="btn-secondary">
          <Filter size={16} /> Last 6 Months
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginBottom: 32 }}>
        {kpiGroups.map(group => (
          <div key={group.title} className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <div style={{ padding: 10, background: `${group.color}15`, borderRadius: 10 }}>
                <group.icon size={20} color={group.color} />
              </div>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#f1f5f9' }}>{group.title}</h3>
            </div>
            <div style={{ display: 'grid', gap: 20 }}>
              {group.metrics.map(m => (
                <div key={m.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>{m.label}</div>
                    {m.trend && (
                      <span style={{ fontSize: 11, color: m.trend.startsWith('+') ? '#4ade80' : '#ef4444', display: 'flex', alignItems: 'center', gap: 2 }}>
                        {m.trend.startsWith('+') ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {m.trend}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: m.critical ? '#ef4444' : '#f1f5f9' }}>{m.value}</div>
                  <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>{m.sub}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        {/* Revenue Trend Chart (Visual Simulation) */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 24px', fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>Revenue Trend (Last 6 Months)</h3>
          <div style={{ height: 200, display: 'flex', alignItems: 'flex-end', gap: 16, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            {trend.map(t => {
              const max = Math.max(...trend.map(x => x.value)) || 1;
              const height = (t.value / max) * 100;
              return (
                <div key={t.month} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ 
                    width: '100%', 
                    height: `${height}%`, 
                    background: 'linear-gradient(to top, rgba(249,115,22,0.1), #f97316)', 
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.5s ease-out'
                  }} title={fmtCurrency(t.value)} />
                  <span style={{ fontSize: 11, color: '#64748b' }}>{t.month}</span>
                </div>
              );
            })}
            {trend.length === 0 && <div style={{ flex: 1, textAlign: 'center', color: '#64748b' }}>No historical data available.</div>}
          </div>
        </div>

        {/* Collection Efficiency Card */}
        <div className="card" style={{ padding: 24, background: 'linear-gradient(135deg, rgba(34,197,94,0.05), rgba(59,130,246,0.05))' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>Collection Status</h3>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ 
              width: 120, height: 120, borderRadius: '50%', border: '8px solid #1e2535', 
              borderTopColor: '#22c55e', margin: '0 auto 16px', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
              transform: 'rotate(135deg)'
            }}>
              <div style={{ transform: 'rotate(-135deg)', fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>
                {(data?.finance?.collectionEfficiency || 0).toFixed(0)}%
              </div>
            </div>
            <div style={{ fontSize: 13, color: '#94a3b8' }}>Overall Efficiency</div>
          </div>
          <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#64748b' }}>Collected</span>
              <span style={{ color: '#4ade80', fontWeight: 600 }}>{fmtCurrency(data?.finance?.totalCollected)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#64748b' }}>Outstanding</span>
              <span style={{ color: '#f97316', fontWeight: 600 }}>{fmtCurrency(data?.finance?.pendingCollection)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
