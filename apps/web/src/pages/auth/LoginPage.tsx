import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Factory, Eye, EyeOff, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'radial-gradient(ellipse at 20% 50%, rgba(249,115,22,0.08) 0%, transparent 50%), #0f1117',
    }}>
      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', padding: 60, borderRight: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ maxWidth: 440, width: '100%' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(249,115,22,0.4)',
            }}>
              <Factory size={24} color="white" />
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>ManuFlow</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>AI-Native Manufacturing ERP</div>
            </div>
          </div>

          <h1 style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Welcome back</h1>
          <p style={{ color: '#64748b', marginBottom: 32, fontSize: 15 }}>Sign in to your manufacturing workspace</p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label>Email address</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@yourcompany.com"
                required
                autoFocus
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
              {loading ? <span className="spinner" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} /> : 'Sign In'}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: '#64748b' }}>
            Don't have an account? <Link to="/signup" style={{ color: '#f97316', textDecoration: 'none', fontWeight: 600 }}>Create one</Link>
          </p>

          <div style={{ marginTop: 24, padding: 16, background: 'rgba(249,115,22,0.06)', borderRadius: 10, border: '1px solid rgba(249,115,22,0.15)' }}>
            <div style={{ fontSize: 12, color: '#f97316', fontWeight: 600, marginBottom: 4 }}>Demo Credentials</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Email: demo@manuflow.in</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Password: demo1234</div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ width: 480, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 60 }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.2)',
            borderRadius: 20, padding: '6px 14px', marginBottom: 20,
          }}>
            <Sparkles size={12} color="#c084fc" />
            <span style={{ fontSize: 12, color: '#c084fc', fontWeight: 600 }}>AI-Powered ERP</span>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 700, color: '#f1f5f9', lineHeight: 1.3, marginBottom: 16 }}>
            Replace SAP for your<br />manufacturing business
          </h2>
          <p style={{ color: '#64748b', fontSize: 15, lineHeight: 1.6 }}>
            From customer enquiry to GST invoice — manage your entire SPM and capital goods operation with AI-native tools built for Indian manufacturers.
          </p>
        </div>

        {[
          { title: 'AI Quotation Generator', desc: 'Claude drafts quotations based on enquiry specs and past orders in seconds', color: '#f97316' },
          { title: 'GST-Native Billing', desc: 'CGST/SGST/IGST, e-invoice (IRN), e-waybill — all compliant out of the box', color: '#22c55e' },
          { title: 'Real-time Shop Floor', desc: 'Digital job cards, live production dashboard, WhatsApp alerts', color: '#3b82f6' },
          { title: 'Full MRP & Quality', desc: 'Auto-generate purchase requisitions, NCR workflows, FAT checklists', color: '#a855f7' },
        ].map(feature => (
          <div key={feature.title} style={{
            display: 'flex', gap: 14, marginBottom: 20,
          }}>
            <div style={{ width: 4, borderRadius: 2, background: feature.color, flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginBottom: 4 }}>{feature.title}</div>
              <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>{feature.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
