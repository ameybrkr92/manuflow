Build a full-stack AI-native ERP platform for Indian Special Purpose Machine (SPM) 
and Capital Goods Manufacturing companies. This is a vertical SaaS product that 
covers end-to-end manufacturing operations — from customer enquiry to GST invoice — 
with AI assistance throughout. The platform must replace SAP's core manufacturing 
modules for mid-market Indian manufacturers (50–500 employees).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TECH STACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Frontend: React + Vite + Tailwind CSS
- Backend: NestJS (REST + WebSockets for real-time)
- Database: PostgreSQL with Prisma ORM
- Auth: JWT + Role-Based Access Control (RBAC)
- AI: Claude API (Anthropic) for all AI features
- Mobile: React Native for shop floor supervisor app
- File Storage: AWS S3 (for drawings, quality docs, invoices)
- Notifications: WhatsApp Business API + Email
- GST: Integration with GST Suvidha Provider API
- Deployment: Docker + AWS ap-south-1 (Mumbai region)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER ROLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Super Admin (platform owner)
2. Company Admin (manufacturer's IT/owner)
3. Sales Manager
4. Design/Engineering Head
5. Production Planner
6. Shop Floor Supervisor
7. Quality Inspector
8. Purchase Manager
9. Store/Inventory Manager
10. Dispatch Manager
11. Finance/Accounts Manager
12. Customer (read-only portal)
13. Vendor (read-only portal)

Each role sees only their relevant modules and data.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODULE 1 — CUSTOMER & ORDER MANAGEMENT
(SAP SD equivalent)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Customer master: GSTIN, PAN, billing/shipping address, 
  credit limit, payment terms, contact persons
- Enquiry management: capture customer RFQ with 
  specifications, drawings upload, delivery requirements
- AI Quotation Generator: based on enquiry specs, 
  similar past orders, and current material rates, 
  Claude auto-drafts a quotation with line items, 
  taxes, and delivery timeline
- Quotation versioning and approval workflow
- Order confirmation: convert approved quotation to 
  Sales Order with milestone-based payment schedule
- Payment milestone tracking: advance, against design 
  approval, against FAT, against dispatch, on installation
- Customer portal: customer can log in to track their 
  order status, raise queries, approve designs, 
  download invoices
- WhatsApp alerts to customer at each milestone
- AI feature: Claude answers "Why is my order delayed?" 
  by tracing the full order-to-production chain

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODULE 2 — DESIGN & ENGINEERING
(SAP PLM/Engineering Change Management equivalent)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Bill of Materials (BOM) builder: multi-level BOM with 
  part numbers, descriptions, qty, UOM, make/buy flag
- AI BOM Suggestion: Claude suggests BOM based on 
  product type and similar past orders from the database
- Drawing register: upload and version-control all 
  engineering drawings (PDF/DXF/STEP) linked to BOM items
- Engineering Change Notice (ECN) workflow: raise ECN, 
  impact analysis on open production orders, approval flow
- Design review checklist with sign-off tracking
- FAT (Factory Acceptance Test) checklist builder 
  linked to each order
- Customer design approval workflow with e-sign or 
  WhatsApp confirmation
- BOM cost rollup: auto-calculate estimated cost 
  from BOM + current material prices

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODULE 3 — PRODUCTION PLANNING
(SAP PP equivalent)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Work Order creation from Sales Order + BOM
- Operations routing: define sequence of manufacturing 
  steps (turning, milling, welding, assembly, painting, 
  testing) with work centers and standard hours
- Capacity planning: view work center load vs capacity 
  across all open orders on a Gantt chart
- AI Scheduler: Claude auto-schedules work orders 
  considering work center capacity, material availability, 
  and delivery deadlines; flags conflicts
- Material Requirements Planning (MRP): auto-calculate 
  material requirements from all open work orders vs 
  current stock; generate purchase requisitions for 
  shortages automatically
- Production calendar: define working days, shifts, 
  holidays per work center
- Sub-contracting: flag operations or parts sent to 
  external vendors, track return, manage gate pass
- AI feature: Claude predicts delivery date confidence 
  score for each open order based on current shop floor 
  load and material status

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODULE 4 — SHOP FLOOR EXECUTION
(SAP ME/MES equivalent)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Job card issuance: digital job card per operation 
  per work order with drawing reference and instructions
- Mobile app for shop floor: supervisor scans/selects 
  job card, marks start/pause/complete, logs actual hours
- Real-time production dashboard: live status of all 
  work orders — Not Started / In Progress / Blocked / 
  Complete — with percentage completion
- Downtime logging: operator logs machine downtime with 
  reason code (breakdown, setup, power failure, no material)
- Material issue to shop floor: store issues material 
  against job card, consumption tracked per work order
- Rework and scrap tracking: log rework qty, scrap qty 
  with reason; impact on cost automatically calculated
- Shift handover log: digital shift notes per work center
- AI feature: Claude flags work orders at risk of 
  delay based on actual vs planned progress and 
  notifies production planner on WhatsApp

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODULE 5 — QUALITY MANAGEMENT
(SAP QM equivalent)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Inspection plan builder: define inspection parameters, 
  acceptance criteria, measurement type per part/operation
- In-process quality checks: inspector records 
  measurements against inspection plan during production
- Incoming material inspection: inspect raw materials 
  and bought-out items on GRN; accept / reject / 
  conditional accept with hold tag
- Final inspection and FAT: structured FAT checklist 
  with pass/fail per parameter, customer witness sign-off
- Non-Conformance Report (NCR) workflow: 
  - Auto-raised on inspection failure
  - Root cause analysis fields (5-Why, Ishikawa)
  - Corrective action assignment with due date
  - Verification and closure by quality head
  - NCR linked back to work order, part, and operator
- Quality certificates: auto-generate material test 
  certificates and inspection reports as PDF
- Defect Pareto report: top defects by type, work 
  center, part, and time period
- AI feature: Claude analyses NCR history and 
  proactively flags high-risk operations before 
  production starts on similar orders

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODULE 6 — PURCHASE & VENDOR MANAGEMENT
(SAP MM Purchasing equivalent)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Vendor master: GSTIN, PAN, bank details, 
  approved material categories, rating, payment terms
- Purchase Requisition (PR): auto-generated from MRP 
  or manual raise; approval workflow
- Request for Quotation (RFQ): send RFQ to multiple 
  vendors, compare quotes in a price comparison matrix
- Purchase Order (PO): generate GST-compliant PO 
  with delivery schedule; vendor receives on portal/WhatsApp
- PO amendment workflow with version history
- Vendor portal: vendor acknowledges PO, updates 
  delivery date, uploads dispatch documents
- Goods Receipt Note (GRN): record receipt against PO, 
  trigger QC inspection, update stock
- 3-way matching: PO vs GRN vs Vendor Invoice 
  auto-matched before payment approval
- Vendor performance scorecard: on-time delivery rate, 
  rejection rate, price variance per vendor
- MSME payment compliance: system flags invoices 
  approaching 45-day MSME payment deadline
- AI feature: Claude recommends preferred vendors 
  for each material category based on past performance

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODULE 7 — STORE & INVENTORY MANAGEMENT
(SAP MM Inventory equivalent)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Material master: part number, description, UOM, 
  HSN code, reorder level, min/max stock, storage location
- Stock ledger: every inward/outward transaction 
  with document reference (GRN, job card issue, 
  transfer, scrap, return)
- Stock valuation: weighted average cost method
- Multiple storage locations and bin management
- Material transfer between locations with gate pass
- Goods return to vendor: raise return against GRN 
  with debit note
- Physical stock verification: cycle count workflow 
  with variance report and adjustment approval
- Slow-moving and non-moving stock report
- Material reservation: reserve stock against work 
  orders so it isn't consumed elsewhere
- AI feature: Claude predicts stock-out risk 3 weeks 
  ahead for all materials across open work orders 
  and auto-raises purchase requisitions

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODULE 8 — DISPATCH & LOGISTICS
(SAP SD Delivery equivalent)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Dispatch planning: create dispatch advice against 
  sales order after FAT clearance and finance clearance
- Packing list and delivery challan generation
- E-waybill generation via NIC API integration
- Outward gate pass with security acknowledgement
- Lorry receipt / transporter document upload
- Delivery confirmation: customer acknowledges 
  receipt on portal or WhatsApp
- Installation tracking: for SPM, track site 
  installation milestones after dispatch
- Returnable packing material tracking
- Dispatch MIS: orders dispatched, pending dispatch, 
  average dispatch lead time

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODULE 9 — FINANCE & BILLING
(SAP FI/CO equivalent)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- GST-compliant sales invoice generation: 
  CGST/SGST/IGST auto-calculated based on 
  customer state vs company state
- E-invoice generation via IRP integration (IRN + QR)
- Milestone-based invoice raising linked to 
  payment schedule in sales order
- Proforma invoice and advance receipt
- Accounts receivable: outstanding invoices, 
  aging analysis, payment follow-up log
- Accounts payable: vendor invoices, due dates, 
  payment scheduling, TDS deduction
- Expense management: petty cash, travel, project expenses
- Cost of production report per work order: 
  material cost + labour cost + overhead vs standard cost
- Profitability report per order and per customer
- GSTR-1 and GSTR-2A/2B reconciliation report
- TDS/TCS tracking and Form 26Q data
- Trial balance, P&L, Balance Sheet (basic)
- AI feature: Claude answers finance queries in 
  natural language — "What is our outstanding from 
  Tata Motors this month?" or "Which orders are 
  running at a loss?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODULE 10 — MIS & ANALYTICS DASHBOARD
(SAP BI/Analytics equivalent)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Executive dashboard: order book value, 
  revenue this month, orders at risk, 
  top delayed work orders, cash position
- Production KPIs: OEE (Overall Equipment 
  Effectiveness), on-time delivery rate, 
  rework %, capacity utilisation per work center
- Quality KPIs: first-pass yield, NCR trend, 
  top defect categories, vendor rejection rate
- Sales KPIs: enquiry-to-order conversion, 
  average order value, customer-wise revenue
- Finance KPIs: DSO (Days Sales Outstanding), 
  DPO (Days Payable Outstanding), 
  order-wise profitability
- Fully filterable by date range, customer, 
  product type, work center, department
- Export all reports to Excel and PDF
- AI feature: Claude generates a daily morning 
  briefing — "Today you have 3 orders at risk, 
  2 NCRs pending closure, and ₹12L invoice 
  overdue from ABC Pvt Ltd"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AI ASSISTANT — CORE FEATURE (CROSS-MODULE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A persistent AI assistant (powered by Claude API) 
available on every screen via a chat panel:

- Understands full manufacturing context — it knows 
  every order, work order, material, vendor, customer 
  in the system
- Natural language queries across all modules:
  "Show me all orders delayed by more than 2 weeks"
  "Which vendor has the worst rejection rate this quarter?"
  "What is the total value of open purchase orders?"
  "Draft a quotation for 10 units of hydraulic press 
   based on last year's similar order"
- Proactive alerts: AI monitors the system and sends 
  WhatsApp alerts for critical exceptions without 
  being asked
- Voice input support on mobile app for 
  shop floor workers who can't type

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INDIA-SPECIFIC COMPLIANCE (NON-NEGOTIABLE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- GST: CGST/SGST/IGST, HSN codes, e-invoice (IRN), 
  e-waybill, GSTR-1 data export
- TDS on vendor payments (Section 194C, 194Q)
- MSME payment 45-day compliance flag
- Multi-company and multi-GSTIN support
- Financial year: April to March
- Audit trail: every record change logged with 
  user, timestamp, before/after values
- Data residency: all data stored in AWS Mumbai (India)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UX PRINCIPLES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Mobile-first for shop floor roles
- Desktop-first for planning, finance, management roles
- Dark mode support
- WhatsApp-native notifications (not just email)
- Offline capability on mobile app for 
  job card updates (sync when connected)
- Onboarding wizard: company can go live in 
  under 2 hours with guided setup
- Bulk data import via Excel templates for 
  material master, customer master, vendor master

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MULTI-TENANCY & SECURITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Full multi-tenant SaaS architecture
- Each company's data is fully isolated 
  (schema-per-tenant or row-level security)
- SSO support (Google, Microsoft)
- 2FA for all admin roles
- Complete audit log
- API-first: all modules accessible via REST API 
  for future integrations

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MVP PRIORITY ORDER (build in this sequence)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 1 (Core revenue flow):
  Customer & Order Management → BOM & Engineering 
  → Production Planning → Shop Floor Execution 
  → Quality Management → GST Invoice

Phase 2 (Operations depth):
  Purchase & Vendor → Store & Inventory → Dispatch

Phase 3 (Intelligence & Reporting):
  Full MIS → AI Assistant → Customer Portal 
  → Vendor Portal → Mobile App

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
START WITH:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generate the complete database schema (PostgreSQL) 
covering all modules above, then scaffold the 
NestJS backend with module structure, then build 
the React frontend starting with Module 1 
(Customer & Order Management) with full CRUD, 
role-based access, and the AI quotation generator 
using Claude API.