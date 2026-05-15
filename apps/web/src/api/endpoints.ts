import api from './client';

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then(r => r.data),
  register: (data: any) =>
    api.post('/auth/register', data).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
};

export const customersApi = {
  list: (search?: string) =>
    api.get('/customers', { params: { search } }).then(r => r.data),
  get: (id: string) => api.get(`/customers/${id}`).then(r => r.data),
  getStats: (id: string) => api.get(`/customers/${id}/stats`).then(r => r.data),
  create: (data: any) => api.post('/customers', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/customers/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/customers/${id}`).then(r => r.data),
};

export const enquiriesApi = {
  list: (status?: string) =>
    api.get('/enquiries', { params: { status } }).then(r => r.data),
  get: (id: string) => api.get(`/enquiries/${id}`).then(r => r.data),
  create: (data: any) => api.post('/enquiries', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/enquiries/${id}`, data).then(r => r.data),
  updateStatus: (id: string, status: string) =>
    api.put(`/enquiries/${id}/status`, { status }).then(r => r.data),
  summarize: (id: string) => api.post(`/enquiries/${id}/summarize`).then(r => r.data),
};

export const quotationsApi = {
  list: (status?: string) =>
    api.get('/quotations', { params: { status } }).then(r => r.data),
  get: (id: string) => api.get(`/quotations/${id}`).then(r => r.data),
  create: (data: any) => api.post('/quotations', data).then(r => r.data),
  aiGenerate: (enquiryId: string) =>
    api.post('/quotations/ai-generate', { enquiryId }).then(r => r.data),
  updateStatus: (id: string, status: string) =>
    api.put(`/quotations/${id}/status`, { status }).then(r => r.data),
  convertToOrder: (id: string) =>
    api.post(`/quotations/${id}/convert-to-order`).then(r => r.data),
};

export const salesOrdersApi = {
  list: (status?: string) =>
    api.get('/sales-orders', { params: { status } }).then(r => r.data),
  get: (id: string) => api.get(`/sales-orders/${id}`).then(r => r.data),
  getDashboard: () => api.get('/sales-orders/dashboard').then(r => r.data),
  updateStatus: (id: string, status: string) =>
    api.put(`/sales-orders/${id}/status`, { status }).then(r => r.data),
  updateMilestone: (soId: string, milestoneId: string, data: any) =>
    api.put(`/sales-orders/${soId}/milestones/${milestoneId}`, data).then(r => r.data),
  approveDesign: (id: string) =>
    api.post(`/sales-orders/${id}/approve-design`).then(r => r.data),
};

export const bomApi = {
  list: (salesOrderId?: string) =>
    api.get('/bom', { params: { salesOrderId } }).then(r => r.data),
  get: (id: string) => api.get(`/bom/${id}`).then(r => r.data),
  create: (data: any) => api.post('/bom', data).then(r => r.data),
  aiGenerate: (data: any) => api.post('/bom/ai-generate', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/bom/${id}`, data).then(r => r.data),
  approve: (id: string) => api.put(`/bom/${id}/approve`).then(r => r.data),
  addItem: (bomId: string, data: any) => api.post(`/bom/${bomId}/items`, data).then(r => r.data),
  removeItem: (itemId: string) => api.delete(`/bom/items/${itemId}`).then(r => r.data),
};

export const productionApi = {
  dashboard: () => api.get('/production/dashboard').then(r => r.data),
  // Work Centers
  listWorkCenters: () => api.get('/production/work-centers').then(r => r.data),
  createWorkCenter: (data: any) => api.post('/production/work-centers', data).then(r => r.data),
  updateWorkCenter: (id: string, data: any) => api.put(`/production/work-centers/${id}`, data).then(r => r.data),
  // Work Orders
  list: (status?: string, salesOrderId?: string) =>
    api.get('/production', { params: { status, salesOrderId } }).then(r => r.data),
  get: (id: string) => api.get(`/production/${id}`).then(r => r.data),
  create: (data: any) => api.post('/production', data).then(r => r.data),
  updateStatus: (id: string, status: string) =>
    api.put(`/production/${id}/status`, { status }).then(r => r.data),
  updateProgress: (id: string, progress: number) =>
    api.put(`/production/${id}/progress`, { progress }).then(r => r.data),
  addOperation: (id: string, data: any) => api.post(`/production/${id}/operations`, data).then(r => r.data),
};

export const purchaseApi = {
  dashboard: () => api.get('/purchase/dashboard').then(r => r.data),
  // Vendors
  listVendors: (search?: string) => api.get('/purchase/vendors', { params: { search } }).then(r => r.data),
  getVendor: (id: string) => api.get(`/purchase/vendors/${id}`).then(r => r.data),
  createVendor: (data: any) => api.post('/purchase/vendors', data).then(r => r.data),
  updateVendor: (id: string, data: any) => api.put(`/purchase/vendors/${id}`, data).then(r => r.data),
  // PRs
  listPRs: (status?: string) => api.get('/purchase/pr', { params: { status } }).then(r => r.data),
  createPR: (data: any) => api.post('/purchase/pr', data).then(r => r.data),
  updatePRStatus: (id: string, status: string) => api.put(`/purchase/pr/${id}/status`, { status }).then(r => r.data),
  // POs
  listPOs: (status?: string) => api.get('/purchase/po', { params: { status } }).then(r => r.data),
  getPO: (id: string) => api.get(`/purchase/po/${id}`).then(r => r.data),
  createPO: (data: any) => api.post('/purchase/po', data).then(r => r.data),
  updatePOStatus: (id: string, status: string) => api.put(`/purchase/po/${id}/status`, { status }).then(r => r.data),
  acknowledgePO: (id: string) => api.post(`/purchase/po/${id}/acknowledge`).then(r => r.data),
  uploadInvoice: (id: string, data: { invoiceNo: string; invoiceUrl: string }) => 
    api.post(`/purchase/po/${id}/invoice`, data).then(r => r.data),
  // GRNs
  listGRNs: () => api.get('/purchase/grn').then(r => r.data),
  createGRN: (data: any) => api.post('/purchase/grn', data).then(r => r.data),
  updateGRNStatus: (id: string, status: string) => api.put(`/purchase/grn/${id}/status`, { status }).then(r => r.data),
};

export const inventoryApi = {
  dashboard: () => api.get('/inventory/dashboard').then(r => r.data),
  list: (search?: string, category?: string) =>
    api.get('/inventory', { params: { search, category } }).then(r => r.data),
  get: (id: string) => api.get(`/inventory/${id}`).then(r => r.data),
  create: (data: any) => api.post('/inventory', data).then(r => r.data),
  update: (id: string, data: any) => api.put(`/inventory/${id}`, data).then(r => r.data),
  stockIn: (id: string, data: any) => api.post(`/inventory/${id}/stock-in`, data).then(r => r.data),
  stockOut: (id: string, data: any) => api.post(`/inventory/${id}/stock-out`, data).then(r => r.data),
  getLowStock: () => api.get('/inventory/low-stock').then(r => r.data),
  getCategories: () => api.get('/inventory/categories').then(r => r.data),
};

export const aiApi = {
  query: (question: string, conversationHistory?: any[]) =>
    api.post('/ai/query', { question, conversationHistory }).then(r => r.data),
};

export const shopFloorApi = {
  getJobs: (params?: any) => api.get('/shop-floor/jobs', { params }).then(r => r.data),
  startJob: (id: string) => api.post(`/shop-floor/jobs/${id}/start`).then(r => r.data),
  pauseJob: (id: string, reason: string) => api.post(`/shop-floor/jobs/${id}/pause`, { reason }).then(r => r.data),
  completeJob: (id: string, actualHours: number) => api.post(`/shop-floor/jobs/${id}/complete`, { actualHours }).then(r => r.data),
  logDowntime: (data: any) => api.post('/shop-floor/downtime', data).then(r => r.data),
  dashboard: () => api.get('/shop-floor/dashboard').then(r => r.data),
};

export const qualityApi = {
  getPlans: () => api.get('/quality/plans').then(r => r.data),
  createPlan: (data: any) => api.post('/quality/plans', data).then(r => r.data),
  getRecords: (params?: any) => api.get('/quality/records', { params }).then(r => r.data),
  recordInspection: (data: any) => api.post('/quality/records', data).then(r => r.data),
  getNCRs: () => api.get('/quality/ncrs').then(r => r.data),
  createNCR: (data: any) => api.post('/quality/ncrs', data).then(r => r.data),
  updateNCR: (id: string, data: any) => api.patch(`/quality/ncrs/${id}`, data).then(r => r.data),
  dashboard: () => api.get('/quality/dashboard').then(r => r.data),
};

export const dispatchApi = {
  list: () => api.get('/dispatch').then(r => r.data),
  create: (data: any) => api.post('/dispatch', data).then(r => r.data),
  updateStatus: (id: string, status: string, data?: any) => api.patch(`/dispatch/${id}/status`, { status, data }).then(r => r.data),
  dashboard: () => api.get('/dispatch/dashboard').then(r => r.data),
};

export const financeApi = {
  listInvoices: () => api.get('/finance/invoices').then(r => r.data),
  createInvoice: (data: any) => api.post('/finance/invoices', data).then(r => r.data),
  recordPayment: (id: string, amount: number) => api.post(`/finance/invoices/${id}/payments`, { amount }).then(r => r.data),
  dashboard: () => api.get('/finance/dashboard').then(r => r.data),
};

export const analyticsApi = {
  getKpis: () => api.get('/analytics/kpis').then(r => r.data),
  getRevenueTrend: () => api.get('/analytics/revenue-trend').then(r => r.data),
};

export const supportTicketsApi = {
  list: () => api.get('/support-tickets').then(r => r.data),
  create: (data: any) => api.post('/support-tickets', data).then(r => r.data),
  get: (id: string) => api.get(`/support-tickets/${id}`).then(r => r.data),
  updateStatus: (id: string, status: string) => api.put(`/support-tickets/${id}/status`, { status }).then(r => r.data),
};
