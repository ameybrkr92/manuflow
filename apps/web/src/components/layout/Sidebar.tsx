import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, FileSearch, FileText, ShoppingCart,
  ClipboardList, Factory, Shield, ShoppingBag, Package,
  Truck, Receipt, BarChart3, Bot, LogOut, Settings, ChevronRight, Zap
} from 'lucide-react';

const navItems = [
  { section: 'Overview', items: [{ to: '/', icon: LayoutDashboard, label: 'Dashboard' }] },
  {
    section: 'Sales',
    roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'SALES_MANAGER', 'FINANCE_MANAGER'],
    items: [
      { to: '/customers', icon: Users, label: 'Customers' },
      { to: '/enquiries', icon: FileSearch, label: 'Enquiries' },
      { to: '/quotations', icon: FileText, label: 'Quotations' },
      { to: '/sales-orders', icon: ShoppingCart, label: 'Sales Orders' },
    ],
  },
  {
    section: 'Engineering',
    roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'DESIGN_HEAD', 'PRODUCTION_PLANNER'],
    items: [
      { to: '/bom', icon: ClipboardList, label: 'BOM & Design' },
    ],
  },
  {
    section: 'Manufacturing',
    roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'PRODUCTION_PLANNER', 'SHOP_FLOOR_SUPERVISOR', 'QUALITY_INSPECTOR'],
    items: [
      { to: '/production', icon: Factory, label: 'Production Planning' },
      { to: '/shop-floor', icon: Zap, label: 'Shop Floor' },
      { to: '/quality', icon: Shield, label: 'Quality' },
    ],
  },
  {
    section: 'Supply Chain',
    roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'PURCHASE_MANAGER', 'STORE_MANAGER', 'DISPATCH_MANAGER'],
    items: [
      { to: '/purchase', icon: ShoppingBag, label: 'Purchase' },
      { to: '/inventory', icon: Package, label: 'Inventory' },
      { to: '/dispatch', icon: Truck, label: 'Dispatch' },
    ],
  },
  {
    section: 'Finance',
    roles: ['SUPER_ADMIN', 'COMPANY_ADMIN', 'FINANCE_MANAGER'],
    items: [
      { to: '/finance', icon: Receipt, label: 'Finance & GST' },
      { to: '/analytics', icon: BarChart3, label: 'Analytics & MIS' },
    ],
  },
  // Portal Sections
  {
    section: 'Customer Portal',
    roles: ['CUSTOMER'],
    items: [
      { to: '/enquiries', icon: FileSearch, label: 'My Enquiries' },
      { to: '/quotations', icon: FileText, label: 'Quotations' },
      { to: '/sales-orders', icon: ShoppingCart, label: 'Track Orders' },
      { to: '/finance', icon: Receipt, label: 'Invoices' },
    ],
  },
  {
    section: 'Vendor Portal',
    roles: ['VENDOR'],
    items: [
      { to: '/purchase', icon: ShoppingBag, label: 'Purchase Orders' },
      { to: '/quality', icon: Shield, label: 'Inspections' },
    ],
  },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <aside style={{
      width: 220,
      minWidth: 220,
      height: '100vh',
      background: '#0d1117',
      borderRight: '1px solid rgba(255,255,255,0.05)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      overflowY: 'auto',
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 8,
            background: 'linear-gradient(135deg, #f97316, #ea580c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Factory size={18} color="white" />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9' }}>ManuFlow</div>
            <div style={{ fontSize: 10, color: '#64748b', letterSpacing: '0.5px' }}>ERP PLATFORM</div>
          </div>
        </div>
        {user?.company && (
          <div style={{
            marginTop: 10, padding: '6px 10px',
            background: 'rgba(249,115,22,0.08)', borderRadius: 6,
            fontSize: 11, color: '#f97316', fontWeight: 500,
          }}>
            {user.company.name}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {navItems
          .filter(section => !section.roles || (user?.role && section.roles.includes(user.role)))
          .map((section) => (
            <div key={section.section} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#374151', letterSpacing: '0.8px', padding: '0 8px 6px', textTransform: 'uppercase' }}>
                {section.section}
              </div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <item.icon size={16} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}

        {/* AI Assistant */}
        <NavLink to="/ai" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)', marginTop: 8 }}>
          <Bot size={16} />
          AI Assistant
          <span style={{ marginLeft: 'auto', background: 'rgba(168,85,247,0.3)', color: '#c084fc', fontSize: 9, padding: '2px 6px', borderRadius: 10, fontWeight: 700 }}>AI</span>
        </NavLink>
      </nav>

      {/* User */}
      <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'linear-gradient(135deg, #f97316, #9a3412)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0,
          }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.firstName} {user?.lastName}</div>
            <div style={{ fontSize: 10, color: '#64748b' }}>{user?.role?.replace(/_/g, ' ')}</div>
          </div>
          <button onClick={handleLogout} className="btn-ghost" style={{ padding: '4px' }}>
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
