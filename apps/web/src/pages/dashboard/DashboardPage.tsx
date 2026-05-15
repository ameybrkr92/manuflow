import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { salesOrdersApi, productionApi, purchaseApi, inventoryApi } from '../../api/endpoints';
import {
  TrendingUp, ShoppingCart, AlertTriangle, IndianRupee,
  ArrowRight, Clock, CheckCircle, Package, Factory, ShoppingBag
} from 'lucide-react';

const statusBadge: Record<string, string> = {
  CONFIRMED: 'badge-blue', IN_PRODUCTION: 'badge-amber', DISPATCHED: 'badge-purple',
  DELIVERED: 'badge-green', CANCELLED: 'badge-gray', ON_HOLD: 'badge-red',
};

function fmtCurrency(val: any) {
  const n = parseFloat(val) || 0;
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString('en-IN')}`;
}

export default function DashboardPage() {
  const [salesStats, setSalesStats] = useState<any>(null);
  const [prodStats, setProdStats] = useState<any>(null);
  const [purcStats, setPurcStats] = useState<any>(null);
  const [invStats, setInvStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      salesOrdersApi.getDashboard().catch(() => null),
      productionApi.dashboard().catch(() => null),
      purchaseApi.dashboard().catch(() => null),
      inventoryApi.dashboard().catch(() => null),
    ]).then(([sales, prod, purc, inv]) => {
      setSalesStats(sales);
      setProdStats(prod);
      setPurcStats(purc);
      setInvStats(inv);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ padding: 32, display: 'flex', alignItems: 'center', gap: 10, color: '#64748b' }}>
      <div className="spinner" style={{ width: 20, height: 20, border: '2px solid rgba(249,115,22,0.3)', borderTopColor: '#f97316', borderRadius: '50%' }} />
      Loading executive dashboard...
    </div>
  );

  const statCards = [
    {
      label: 'Order Book Value', value: fmtCurrency(salesStats?.orderBookValue || 0),
      icon: IndianRupee, color: '#f97316', bg: 'rgba(249,115,22,0.1)',
      sub: `${salesStats?.openOrders || 0} active orders`,
    },
    {
      label: 'Production Load', value: String(prodStats?.inProgress || 0),
      icon: Factory, color: '#c084fc', bg: 'rgba(192,132,252,0.1)',
      sub: `${prodStats?.openOrders || 0} planned jobs`,
    },
    {
      label: 'Inventory Value', value: fmtCurrency(invStats?.inventoryValue || 0),
      icon: Package, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',
      sub: `${invStats?.lowStockCount || 0} items low stock`,
    },
    {
      label: 'Pending Purchase', value: String(purcStats?.openPOs || 0),
      icon: ShoppingBag, color: '#22c55e', bg: 'rgba(34,197,94,0.1)',
      sub: `${purcStats?.openPRs || 0} requisitions`,
    },
  ];

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Executive Dashboard</h1>
        <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
          Holistic view of manufacturing operations — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {statCards.map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: s.label.includes('stock') && invStats?.lowStockCount > 0 ? '#ef4444' : '#64748b', marginTop: 4 }}>{s.sub}</div>
              </div>
              <div style={{ padding: 10, borderRadius: 10, background: s.bg }}>
                <s.icon size={18} color={s.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Recent Orders */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingCart size={16} color="#f97316" /> Recent Sales Orders
              </div>
              <Link to="/sales-orders" style={{ fontSize: 12, color: '#f97316', textDecoration: 'none' }}>View all →</Link>
            </div>
            <table>
              <thead>
                <tr><th>Order No</th><th>Customer</th><th>Value</th><th>Status</th></tr>
              </thead>
              <tbody>
                {(salesStats?.recentOrders || []).slice(0, 5).map((o: any) => (
                  <tr key={o.id}>
                    <td><Link to={`/sales-orders/${o.id}`} style={{ color: '#f97316', textDecoration: 'none', fontWeight: 600 }}>{o.orderNo}</Link></td>
                    <td style={{ color: '#e2e8f0' }}>{o.customer?.name}</td>
                    <td style={{ color: '#e2e8f0' }}>{fmtCurrency(o.totalAmount)}</td>
                    <td><span className={`badge ${statusBadge[o.status] || 'badge-gray'}`}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Production Progress */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Factory size={16} color="#c084fc" /> Active Work Orders
              </div>
              <Link to="/production" style={{ fontSize: 12, color: '#c084fc', textDecoration: 'none' }}>View shop floor →</Link>
            </div>
            <div style={{ padding: '10px 20px' }}>
              {(prodStats?.recentOrders || []).slice(0, 3).map((wo: any) => (
                <div key={wo.id} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{wo.productName}</span>
                    <span style={{ fontSize: 12, color: '#f97316', fontFamily: 'monospace' }}>{wo.workOrderNo}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 6, background: '#1e2535', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${wo.progress}%`, background: '#c084fc', borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 11, color: '#64748b', minWidth: 28 }}>{wo.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick Actions */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 16 }}>Core Operations</div>
            {[
              { to: '/enquiries/new', label: 'New Enquiry', icon: ShoppingCart, color: '#f97316' },
              { to: '/bom', label: 'BOM Design', icon: Package, color: '#c084fc' },
              { to: '/purchase/po/new', label: 'Raise PO', icon: ShoppingBag, color: '#22c55e' },
              { to: '/inventory', label: 'Store Issues', icon: Package, color: '#3b82f6' },
            ].map(qa => (
              <Link key={qa.to} to={qa.to} className="sidebar-link" style={{ marginBottom: 4, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <qa.icon size={16} color={qa.color} />
                <span style={{ fontSize: 13, color: '#e2e8f0' }}>{qa.label}</span>
                <ArrowRight size={14} style={{ marginLeft: 'auto', opacity: 0.3 }} />
              </Link>
            ))}
          </div>

          {/* Critical Alerts */}
          <div className="card" style={{ padding: 20, border: '1px solid rgba(239,68,68,0.2)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#ef4444', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertTriangle size={14} /> Attention Required
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {invStats?.lowStockCount > 0 && (
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  ⚠️ <strong style={{ color: '#e2e8f0' }}>{invStats.lowStockCount}</strong> items are below reorder level.
                </div>
              )}
              {prodStats?.openOrders > 0 && (
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  🕒 <strong style={{ color: '#e2e8f0' }}>{prodStats.openOrders}</strong> jobs pending release.
                </div>
              )}
              {purcStats?.pendingGRNs > 0 && (
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  📦 <strong style={{ color: '#e2e8f0' }}>{purcStats.pendingGRNs}</strong> shipments awaiting QC.
                </div>
              )}
            </div>
          </div>

          {/* AI Briefing */}
          <div className="card" style={{ padding: 20, background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(59,130,246,0.1))', border: '1px solid rgba(168,85,247,0.2)' }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#c084fc', marginBottom: 6 }}>🤖 AI Morning Brief</div>
            <div style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>
              "Today's focus: 3 work orders are behind schedule. Steel stock is low. Your highest priority order SO-24-012 is 80% complete."
            </div>
            <Link to="/ai" style={{ display: 'inline-block', marginTop: 10, fontSize: 12, color: '#c084fc', textDecoration: 'none', fontWeight: 600 }}>
              Talk to Assistant →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
