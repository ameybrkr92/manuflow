import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { enquiriesApi } from '../../api/endpoints';
import { ArrowLeft, Sparkles, Calendar, User, FileText, Plus, Paperclip, Loader2, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const statusConfig: Record<string, { cls: string; label: string }> = {
  NEW: { cls: 'badge-blue', label: 'New' },
  UNDER_REVIEW: { cls: 'badge-amber', label: 'Under Review' },
  QUOTED: { cls: 'badge-purple', label: 'Quoted' },
  ORDER_RECEIVED: { cls: 'badge-green', label: 'Order Received' },
  LOST: { cls: 'badge-red', label: 'Lost' },
  CANCELLED: { cls: 'badge-gray', label: 'Cancelled' },
};

export default function EnquiryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [enquiry, setEnquiry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);

  const load = () => {
    if (id) {
      enquiriesApi.get(id)
        .then(setEnquiry)
        .catch(() => toast.error('Enquiry not found'))
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => { load(); }, [id]);

  const handleSummarize = async () => {
    if (!id) return;
    setSummarizing(true);
    try {
      await enquiriesApi.summarize(id);
      toast.success('AI Summary generated');
      load();
    } catch {
      toast.error('AI Summary failed');
    } finally {
      setSummarizing(false);
    }
  };

  if (loading) return <div style={{ padding: 32, color: '#64748b' }}>Loading...</div>;
  if (!enquiry) return <div style={{ padding: 32, color: '#ef4444' }}>Enquiry not found</div>;

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate(-1)} className="btn-ghost"><ArrowLeft size={16} /></button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>{enquiry.enquiryNo}</h1>
            <span className={`badge ${statusConfig[enquiry.status]?.cls || 'badge-gray'}`}>
              {statusConfig[enquiry.status]?.label || enquiry.status}
            </span>
          </div>
          <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>{enquiry.subject}</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            onClick={handleSummarize} 
            disabled={summarizing}
            className="btn-ghost" 
            style={{ color: '#c084fc' }}
          >
            {summarizing ? <Loader2 size={16} className="spinner" /> : <Sparkles size={16} />}
            AI Summarize
          </button>
          <Link to={`/quotations/new?enquiryId=${enquiry.id}`} className="btn-secondary" style={{ color: '#c084fc' }}>
            <Sparkles size={16} /> AI Generate Quote
          </Link>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div>
          {/* AI Summary Banner */}
          {enquiry.aiSummary && (
            <div className="card" style={{ 
              padding: 20, marginBottom: 20, 
              background: 'rgba(168,85,247,0.03)', 
              border: '1px solid rgba(168,85,247,0.15)',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0.05 }}>
                <Sparkles size={100} color="#c084fc" />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Sparkles size={16} color="#c084fc" />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Executive Summary</span>
              </div>
              <p style={{ color: '#e2e8f0', fontSize: 14, lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
                "{enquiry.aiSummary}"
              </p>
            </div>
          )}

          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginTop: 0, marginBottom: 16 }}>Details</h3>
            <p style={{ color: '#e2e8f0', fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {enquiry.description || 'No detailed description provided.'}
            </p>

            {enquiry.specifications && Object.keys(enquiry.specifications).length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h4 style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', marginBottom: 12 }}>Technical Specifications</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {Object.entries(enquiry.specifications).map(([k, v]: [string, any]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                      <span style={{ color: '#64748b', fontSize: 13 }}>{k}</span>
                      <span style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', margin: 0 }}>Quotations</h3>
              <Link to={`/quotations/new?enquiryId=${enquiry.id}`} className="btn-ghost" style={{ fontSize: 12 }}>
                <Plus size={14} /> New Manual Quote
              </Link>
            </div>
            {enquiry.quotations?.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Quote No</th>
                    <th>Value</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiry.quotations.map((q: any) => (
                    <tr key={q.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/quotations/${q.id}`)}>
                      <td style={{ color: '#f97316', fontWeight: 600 }}>{q.quotationNo}</td>
                      <td style={{ color: '#e2e8f0' }}>₹{parseFloat(q.totalAmount).toLocaleString('en-IN')}</td>
                      <td><span className="badge badge-gray">{q.status}</span></td>
                      <td style={{ color: '#64748b', fontSize: 12 }}>{new Date(q.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ textAlign: 'center', padding: 24, color: '#64748b', fontSize: 13 }}>
                No quotations generated for this enquiry yet.
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginTop: 0, marginBottom: 16 }}>Customer Info</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 20, background: '#f9731622', color: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {enquiry.customer?.name?.[0]}
              </div>
              <div>
                <Link to={`/customers/${enquiry.customerId}`} style={{ color: '#e2e8f0', fontWeight: 600, textDecoration: 'none', display: 'block' }}>
                  {enquiry.customer?.name}
                </Link>
                <span style={{ fontSize: 12, color: '#64748b' }}>{enquiry.customer?.code}</span>
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginTop: 0, marginBottom: 16 }}>Attachments & Drawings</h3>
            {enquiry.attachments?.length > 0 ? (
              <div style={{ display: 'grid', gap: 10 }}>
                {enquiry.attachments.map((file: string, idx: number) => (
                  <div key={idx} style={{ 
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', 
                    background: 'rgba(255,255,255,0.03)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)'
                  }}>
                    <FileText size={18} color="#94a3b8" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>S3 Managed File</div>
                    </div>
                    <button className="btn-ghost" style={{ padding: 4 }}><ExternalLink size={14} /></button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 20, color: '#64748b', fontSize: 12, background: 'rgba(255,255,255,0.01)', borderRadius: 8, border: '1px dashed rgba(255,255,255,0.05)' }}>
                <Paperclip size={24} style={{ marginBottom: 8, opacity: 0.5 }} />
                <div>No attachments uploaded</div>
              </div>
            )}
            <button className="sidebar-link" style={{ width: '100%', marginTop: 16, justifyContent: 'center', fontSize: 12, border: '1px dashed rgba(255,255,255,0.1)' }}>
              <Plus size={14} /> Upload Drawing
            </button>
          </div>

          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginTop: 0, marginBottom: 16 }}>Metadata</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Calendar size={14} color="#64748b" />
                <div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Created On</div>
                  <div style={{ fontSize: 13, color: '#e2e8f0' }}>{new Date(enquiry.createdAt).toLocaleDateString('en-IN')}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Calendar size={14} color="#f97316" />
                <div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Delivery Required By</div>
                  <div style={{ fontSize: 13, color: enquiry.deliveryRequired ? '#e2e8f0' : '#64748b' }}>
                    {enquiry.deliveryRequired ? new Date(enquiry.deliveryRequired).toLocaleDateString('en-IN') : 'Not specified'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <User size={14} color="#64748b" />
                <div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Assigned To</div>
                  <div style={{ fontSize: 13, color: '#e2e8f0' }}>{enquiry.assignedTo || 'Unassigned'}</div>
                </div>
              </div>
            </div>
            {enquiry.notes && (
              <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 11, color: '#64748b', marginBottom: 4 }}>Internal Notes</div>
                <div style={{ fontSize: 12, color: '#94a3b8', fontStyle: 'italic' }}>{enquiry.notes}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
