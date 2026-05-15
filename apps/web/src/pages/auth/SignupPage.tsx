import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/endpoints';
import { Factory, Eye, EyeOff, Sparkles, Building2, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    companyName: '',
    gstin: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.register(formData);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Registration failed. Check details.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'radial-gradient(ellipse at 80% 50%, rgba(168,85,247,0.08) 0%, transparent 50%), #0f1117',
    }}>
      {/* Left panel (Image/Text) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 80, background: 'rgba(255,255,255,0.01)' }}>
         <div style={{ maxWidth: 480 }}>
            <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.2)',
                borderRadius: 20, padding: '6px 14px', marginBottom: 24,
            }}>
                <Sparkles size={12} color="#f97316" />
                <span style={{ fontSize: 12, color: '#f97316', fontWeight: 600 }}>Get Started in 2 Minutes</span>
            </div>
            <h1 style={{ fontSize: 40, fontWeight: 800, color: '#f1f5f9', lineHeight: 1.1, marginBottom: 24, letterSpacing: '-0.02em' }}>
                The AI-Native Core for your <span style={{ color: '#f97316' }}>Factory.</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: 18, lineHeight: 1.6, marginBottom: 40 }}>
                Join the network of modern Indian manufacturers managing everything from sales to shop floor on ManuFlow.
            </p>

            {[
                { title: 'Zero Infrastructure', desc: 'No servers needed. 100% cloud-native and secure.' },
                { title: 'GST Integrated', desc: 'Automated E-Invoicing and E-Waybill generation.' },
                { title: 'AI Assistant', desc: 'Claude-powered insights and automated quotation drafting.' }
            ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(255,255,255,0.05)' }}>
                        <CheckCircle size={16} color="#22c55e" />
                    </div>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0' }}>{item.title}</div>
                        <div style={{ fontSize: 13, color: '#64748b' }}>{item.desc}</div>
                    </div>
                </div>
            ))}
         </div>
      </div>

      {/* Right panel (Form) */}
      <div style={{ width: 560, padding: 60, display: 'flex', flexDirection: 'column', justifyContent: 'center', borderLeft: '1px solid rgba(255,255,255,0.05)', background: '#0f1117' }}>
        <div style={{ maxWidth: 440, width: '100%', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Factory size={20} color="white" />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9' }}>ManuFlow</div>
          </div>

          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#f1f5f9', marginBottom: 8 }}>Create your account</h2>
          <p style={{ color: '#64748b', marginBottom: 32, fontSize: 14 }}>Start your 14-day free trial. No credit card required.</p>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <label>First Name</label>
                <input className="input" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="John" required />
              </div>
              <div>
                <label>Last Name</label>
                <input className="input" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" required />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Company Name</label>
              <div style={{ position: 'relative' }}>
                <Building2 size={16} color="#64748b" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                <input className="input" style={{ paddingLeft: 40 }} name="companyName" value={formData.companyName} onChange={handleChange} placeholder="Acme Manufacturing Pvt Ltd" required />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>GSTIN</label>
              <input className="input" name="gstin" value={formData.gstin} onChange={handleChange} placeholder="27AAAAA0000A1Z5" required />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label>Work Email</label>
              <input className="input" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@company.com" required />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
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

            <button className="btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15 }}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 14, color: '#64748b' }}>
            Already have an account? <Link to="/login" style={{ color: '#f97316', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function CheckCircle({ size, color }: { size: number, color: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
    )
}
