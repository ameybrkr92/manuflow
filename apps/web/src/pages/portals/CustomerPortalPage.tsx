import React, { useEffect, useState } from 'react';
import { salesOrdersApi, enquiriesApi, quotationsApi, supportTicketsApi } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import { 
  Package, Clock, CheckCircle, FileText, 
  ArrowRight, MessageSquare, Download, Shield, Plus, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';


export default function CustomerPortalPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      salesOrdersApi.list(),
      enquiriesApi.list()
    ]).then(([ordersData, enquiriesData]) => {
      setOrders(ordersData);
      setEnquiries(enquiriesData);
    }).finally(() => setLoading(false));
  }, []);

  const [isEnquiryModalOpen, setIsEnquiryModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [newEnquiry, setNewEnquiry] = useState({ subject: '', description: '' });
  const [supportTicket, setSupportTicket] = useState({ subject: '', description: '', priority: 'MEDIUM' });

  const handleCreateEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await enquiriesApi.create({ ...newEnquiry, customerId: user?.customerId });
      toast.success('Enquiry submitted successfully');
      setIsEnquiryModalOpen(false);
      setNewEnquiry({ subject: '', description: '' });
      enquiriesApi.list().then(setEnquiries);
    } catch {
      toast.error('Failed to submit enquiry');
    }
  };

  const handleCreateSupportTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supportTicketsApi.create(supportTicket);
      toast.success('Support ticket raised successfully');
      setIsSupportModalOpen(false);
      setSupportTicket({ subject: '', description: '', priority: 'MEDIUM' });
    } catch {
      toast.error('Failed to raise support ticket');
    }
  };

  if (loading) return <div style={{ padding: 32, color: '#64748b' }}>Welcome back, {user?.firstName}. Loading your workspace...</div>;

  const activeOrders = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');

  const getStepStatus = (order: any, step: string) => {
    const statusMap: Record<string, number> = { 
      'CONFIRMED': 0, 
      'DESIGN_APPROVED': 1,
      'IN_PRODUCTION': 2, 
      'DISPATCHED': 3, 
      'DELIVERED': 4 
    };
    const currentStepIdx = statusMap[order.status] || 0;
    
    const steps = ['ORDERED', 'DESIGN', 'PRODUCTION', 'DISPATCH'];
    const stepIdx = steps.indexOf(step);
    
    if (stepIdx < currentStepIdx) return 'completed';
    if (stepIdx === currentStepIdx) return 'active';
    return 'pending';
  };

  const handleApproveDesign = async (orderId: string) => {
    try {
      await salesOrdersApi.approveDesign(orderId);
      toast.success('Design approved successfully');
      const updatedOrders = await salesOrdersApi.list();
      setOrders(updatedOrders);
    } catch {
      toast.error('Failed to approve design');
    }
  };

  return (
    <div className="fade-in" style={{ padding: 32 }}>
      <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', margin: 0 }}>Customer Portal</h1>
          <div style={{ fontSize: 14, color: '#64748b', marginTop: 4 }}>Track your orders, designs, and invoices in real-time</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase' }}>Logged in as</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#f97316' }}>{user?.firstName} {user?.lastName}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Active Orders Trackers */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 600, color: '#f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Package size={18} color="#f97316" /> Active Order Tracking
            </h3>
            {activeOrders.map(order => (
              <div key={order.id} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f5f9' }}>{order.orderNo}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>Expected Delivery: {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : 'TBD'}</div>
                  </div>
                  <span className={`badge ${order.status === 'IN_PRODUCTION' ? 'badge-amber' : 'badge-blue'}`}>{order.status}</span>
                </div>
                
                {/* Progress Bar */}
                <div style={{ position: 'relative', height: 40, marginTop: 10 }}>
                  <div style={{ position: 'absolute', top: 12, left: 0, right: 0, height: 2, background: '#1e2535' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                    {['ORDERED', 'DESIGN', 'PRODUCTION', 'DISPATCH'].map((step) => {
                      const status = getStepStatus(order, step);
                      return (
                        <div key={step} style={{ textAlign: 'center', width: 60 }}>
                          <div style={{ 
                            width: 24, height: 24, borderRadius: '50%', 
                            background: status === 'completed' ? '#22c55e' : status === 'active' ? '#f97316' : '#1e2535',
                            border: status === 'pending' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px',
                            boxShadow: status === 'active' ? '0 0 10px rgba(249,115,22,0.3)' : 'none'
                          }}>
                            {status === 'completed' ? <CheckCircle size={14} color="white" /> : 
                             status === 'active' ? <Clock size={14} color="white" /> : 
                             <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#374151' }} />}
                          </div>
                          <div style={{ fontSize: 10, color: status !== 'pending' ? '#f1f5f9' : '#475569', fontWeight: 600 }}>{step}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
            {activeOrders.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No active orders found.</div>}
          </div>

          {/* Recent Enquiries */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>My Enquiries</h3>
              <button onClick={() => setIsEnquiryModalOpen(true)} className="btn-secondary" style={{ fontSize: 12, padding: '6px 12px' }}>
                <Plus size={14} /> New Enquiry
              </button>
            </div>
            <table>
              <thead>
                <tr><th>Ref No</th><th>Subject</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {enquiries.slice(0, 5).map(e => (
                  <tr key={e.id}>
                    <td style={{ color: '#f97316', fontWeight: 600 }}>{e.enquiryNo}</td>
                    <td style={{ color: '#e2e8f0' }}>{e.subject}</td>
                    <td><span className={`badge badge-gray`}>{e.status}</span></td>
                    <td style={{ color: '#64748b', fontSize: 12 }}>{new Date(e.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Action Card */}
          <div className="card" style={{ padding: 24, background: 'linear-gradient(135deg, rgba(249,115,22,0.1), rgba(234,88,12,0.05))', border: '1px solid rgba(249,115,22,0.2)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#f1f5f9' }}>Quick Actions</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <button 
                onClick={() => {
                  const pendingOrder = orders.find(o => o.status === 'CONFIRMED');
                  if (pendingOrder) handleApproveDesign(pendingOrder.id);
                  else toast.error('No pending designs to approve');
                }}
                className="sidebar-link" 
                style={{ 
                  width: '100%', 
                  border: '1px solid rgba(249,115,22,0.2)', 
                  background: 'rgba(249,115,22,0.05)',
                  cursor: orders.some(o => o.status === 'CONFIRMED') ? 'pointer' : 'not-allowed',
                  opacity: orders.some(o => o.status === 'CONFIRMED') ? 1 : 0.6
                }}
              >
                <Shield size={16} color="#f97316" /> 
                {orders.some(o => o.status === 'CONFIRMED') ? 'Approve Latest Design' : 'Designs Approved'}
                <ArrowRight size={14} style={{ marginLeft: 'auto' }} />
              </button>
              <button 
                onClick={() => setIsSupportModalOpen(true)}
                className="sidebar-link" 
                style={{ width: '100%', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
              >
                <MessageSquare size={16} color="#3b82f6" /> Raise Support Ticket
                <ArrowRight size={14} style={{ marginLeft: 'auto' }} />
              </button>
              <button className="sidebar-link" style={{ width: '100%', border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
                <Download size={16} color="#22c55e" /> Download Invoice
                <ArrowRight size={14} style={{ marginLeft: 'auto' }} />
              </button>
            </div>
          </div>

          {/* AI Helper */}
          <div className="card" style={{ padding: 20, background: 'rgba(168,85,247,0.03)', border: '1px solid rgba(168,85,247,0.15)', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(168,85,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles size={14} color="#c084fc" />
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#c084fc' }}>AI Order Summary</span>
            </div>
            <p style={{ fontSize: 12, color: '#94a3b8', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
              "Your order for the Hydraulic Power Pack is currently in the manufacturing phase. 
              The estimated completion date is June 15th. 
              Engineering design has been approved."
            </p>
          </div>
        </div>
      </div>

      {/* New Enquiry Modal */}
      {isEnquiryModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 500, padding: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginTop: 0, marginBottom: 24 }}>New Enquiry</h2>
            <form onSubmit={handleCreateEnquiry}>
              <div style={{ marginBottom: 16 }}>
                <label>Subject / Product Name</label>
                <input 
                  className="input" 
                  value={newEnquiry.subject} 
                  onChange={e => setNewEnquiry(p => ({ ...p, subject: e.target.value }))}
                  placeholder="e.g. 10T Hydraulic Press"
                  required
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label>Description & Requirements</label>
                <textarea 
                  className="input" 
                  rows={5}
                  value={newEnquiry.description} 
                  onChange={e => setNewEnquiry(p => ({ ...p, description: e.target.value }))}
                  placeholder="Details about specifications, delivery timeline, etc."
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Submit Enquiry</button>
                <button type="button" onClick={() => setIsEnquiryModalOpen(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Support Ticket Modal */}
      {isSupportModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 500, padding: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#f1f5f9', marginTop: 0, marginBottom: 24 }}>Raise Support Ticket</h2>
            <form onSubmit={handleCreateSupportTicket}>
              <div style={{ marginBottom: 16 }}>
                <label>Subject</label>
                <input 
                  className="input" 
                  value={supportTicket.subject} 
                  onChange={e => setSupportTicket(p => ({ ...p, subject: e.target.value }))}
                  placeholder="e.g. Issue with delivery date"
                  required
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label>Priority</label>
                <select 
                  className="input"
                  value={supportTicket.priority}
                  onChange={e => setSupportTicket(p => ({ ...p, priority: e.target.value }))}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div style={{ marginBottom: 24 }}>
                <label>Description</label>
                <textarea 
                  className="input" 
                  rows={5}
                  value={supportTicket.description} 
                  onChange={e => setSupportTicket(p => ({ ...p, description: e.target.value }))}
                  placeholder="Describe your issue in detail..."
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Raise Ticket</button>
                <button type="button" onClick={() => setIsSupportModalOpen(false)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
