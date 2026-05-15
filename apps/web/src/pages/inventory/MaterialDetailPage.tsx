import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { inventoryApi } from '../../api/endpoints';
import { ArrowLeft, Package, History, TrendingUp, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

function fmtStock(v: any, uom: string) {
  return `${parseFloat(v || 0).toLocaleString('en-IN')} ${uom}`;
}

export default function MaterialDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [material, setMaterial] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      inventoryApi.get(id)
        .then(setMaterial)
        .catch(() => toast.error('Material not found'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div style={{ padding: 32, color: '#64748b' }}>Loading...</div>;
  if (!material) return <div style={{ padding: 32, color: '#ef4444' }}>Material not found</div>;

  const ledger = material.stockLedger || [];
  const isLow = parseFloat(material.currentStock) <= parseFloat(material.reorderLevel);

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} className="btn-ghost"><ArrowLeft size={16} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{material.partNo}</h1>
            <span className={`badge ${isLow ? 'badge-red' : 'badge-green'}`}>
              {isLow ? 'LOW STOCK' : 'IN STOCK'}
            </span>
          </div>
          <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{material.description}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Current Stock</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: isLow ? '#ef4444' : '#4ade80' }}>
            {fmtStock(material.currentStock, material.uom)}
          </div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Reorder Level</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#f97316' }}>{fmtStock(material.reorderLevel, material.uom)}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Valuation Rate</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#3b82f6' }}>₹{parseFloat(material.valuationRate).toLocaleString('en-IN')}</div>
        </div>
        <div className="card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Total Value</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#c084fc' }}>
            ₹{(parseFloat(material.currentStock) * parseFloat(material.valuationRate)).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <History size={16} color="#f97316" />
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#f1f5f9' }}>Stock Ledger (Recent Transactions)</h3>
        </div>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Qty Change</th>
              <th>Rate</th>
              <th>Balance</th>
              <th>Ref / Document</th>
              <th>Transacted By</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((entry: any) => (
              <tr key={entry.id}>
                <td style={{ color: '#64748b', fontSize: 12 }}>{new Date(entry.transactedAt).toLocaleString('en-IN')}</td>
                <td>
                  <span style={{ 
                    fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                    background: entry.transactionType.includes('ADJUSTMENT') ? 'rgba(59,130,246,0.1)' : 'rgba(168,85,247,0.1)',
                    color: entry.transactionType.includes('ADJUSTMENT') ? '#3b82f6' : '#a855f7'
                  }}>
                    {entry.transactionType}
                  </span>
                </td>
                <td style={{ color: parseFloat(entry.qty) > 0 ? '#4ade80' : '#ef4444', fontWeight: 600 }}>
                  {parseFloat(entry.qty) > 0 ? '+' : ''}{parseFloat(entry.qty)}
                </td>
                <td style={{ color: '#94a3b8', fontSize: 13 }}>₹{parseFloat(entry.rate).toLocaleString('en-IN')}</td>
                <td style={{ color: '#e2e8f0', fontWeight: 500 }}>{parseFloat(entry.balanceQty)}</td>
                <td style={{ color: '#f97316', fontSize: 13, fontWeight: 500 }}>{entry.documentRef}</td>
                <td style={{ color: '#64748b', fontSize: 12 }}>{entry.transactedBy || 'System'}</td>
              </tr>
            ))}
            {ledger.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 32, color: '#64748b' }}>No transactions recorded yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
