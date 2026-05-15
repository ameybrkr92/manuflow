import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import CustomersPage from './pages/customers/CustomersPage';
import NewCustomerPage from './pages/customers/NewCustomerPage';
import CustomerDetailPage from './pages/customers/CustomerDetailPage';
import EnquiriesPage from './pages/enquiries/EnquiriesPage';
import NewEnquiryPage from './pages/enquiries/NewEnquiryPage';
import EnquiryDetailPage from './pages/enquiries/EnquiryDetailPage';
import QuotationsPage from './pages/quotations/QuotationsPage';
import NewQuotationPage from './pages/quotations/NewQuotationPage';
import QuotationDetailPage from './pages/quotations/QuotationDetailPage';
import SalesOrdersPage from './pages/sales-orders/SalesOrdersPage';
import SalesOrderDetailPage from './pages/sales-orders/SalesOrderDetailPage';
import BOMPage from './pages/bom/BOMPage';
import BOMDetailPage from './pages/bom/BOMDetailPage';
import ProductionPage from './pages/production/ProductionPage';
import WorkOrderDetailPage from './pages/production/WorkOrderDetailPage';
import PurchasePage from './pages/purchase/PurchasePage';
import VendorDetailPage from './pages/purchase/VendorDetailPage';
import PurchaseOrderDetailPage from './pages/purchase/PurchaseOrderDetailPage';
import InventoryPage from './pages/inventory/InventoryPage';
import MaterialDetailPage from './pages/inventory/MaterialDetailPage';
import ShopFloorPage from './pages/shop-floor/ShopFloorPage';
import QualityPage from './pages/quality/QualityPage';
import DispatchPage from './pages/dispatch/DispatchPage';
import FinancePage from './pages/finance/FinancePage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import AiAssistantPage from './pages/ai/AiAssistantPage';
import SignupPage from './pages/auth/SignupPage';
import CustomerPortalPage from './pages/portals/CustomerPortalPage';
import VendorPortalPage from './pages/portals/VendorPortalPage';

function ComingSoon({ title }: { title: string }) {
  return (
    <div style={{ padding: 32, textAlign: 'center', color: '#64748b' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🚧</div>
      <h2 style={{ color: '#f1f5f9' }}>{title}</h2>
      <p>This module is coming in Phase 1c. The schema and API stubs are already in place.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#161b25', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)' },
            duration: 4000,
          }}
        />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/customer-portal" element={<CustomerPortalPage />} />
          <Route path="/vendor-portal" element={<VendorPortalPage />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/new" element={<NewCustomerPage />} />
            <Route path="/customers/:id" element={<CustomerDetailPage />} />
            <Route path="/enquiries" element={<EnquiriesPage />} />
            <Route path="/enquiries/new" element={<NewEnquiryPage />} />
            <Route path="/enquiries/:id" element={<EnquiryDetailPage />} />
            <Route path="/quotations" element={<QuotationsPage />} />
            <Route path="/quotations/new" element={<NewQuotationPage />} />
            <Route path="/quotations/:id" element={<QuotationDetailPage />} />
            <Route path="/sales-orders" element={<SalesOrdersPage />} />
            <Route path="/sales-orders/:id" element={<SalesOrderDetailPage />} />
            <Route path="/ai" element={<AiAssistantPage />} />
            
            <Route path="/bom" element={<BOMPage />} />
            <Route path="/bom/:id" element={<BOMDetailPage />} />
            
            <Route path="/production" element={<ProductionPage />} />
            <Route path="/production/:id" element={<WorkOrderDetailPage />} />
            
            <Route path="/purchase" element={<PurchasePage />} />
            <Route path="/purchase/vendors/:id" element={<VendorDetailPage />} />
            <Route path="/purchase/po/:id" element={<PurchaseOrderDetailPage />} />
            <Route path="/purchase/po/new" element={<ComingSoon title="New Purchase Order" />} />
            
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/inventory/:id" element={<MaterialDetailPage />} />

            <Route path="/shop-floor" element={<ShopFloorPage />} />
            <Route path="/quality" element={<QualityPage />} />
            <Route path="/dispatch" element={<DispatchPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
