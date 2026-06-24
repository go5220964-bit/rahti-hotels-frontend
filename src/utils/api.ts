import { RequestType, RequestStatus, ApprovalStatus, Role } from '../types_local';

export interface DailyFinancialSummary {
  date: string;
  branchId: string;
  shiftCount: number;
  totalRoomRevenue: number;
  totalServiceRevenue: number;
  totalDamageCollected: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  shiftReports: any[];
}

export interface AttendanceSummary {
  totalEmployees: number;
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  averageHoursPerDay: number;
  byEmployee: any[];
}

export interface LeaveReport {
  totalRequests: number;
  approved: number;
  rejected: number;
  pending: number;
  byType: {
    Annual: number;
    Sick: number;
    Emergency: number;
    Unpaid: number;
  };
  byEmployee: any[];
}

export interface LoanReport {
  totalAmountLent: number;
  totalRepaid: number;
  totalOutstanding: number;
  byEmployee: any[];
}

export interface MaintenanceReport {
  totalRequests: number;
  open: number;
  inProgress: number;
  completed: number;
  approved: number;
  averageResponseTimeHours: number;
  byTechnician: any[];
}

export interface InventoryReport {
  totalItemsCount: number;
  lowStockCount: number;
  criticalStockCount: number;
  pendingRequests: number;
  itemsList: any[];
}

export interface ProcurementReport {
  totalSpend: number;
  approvedSpend: number;
  pendingSpend: number;
  byCategory: any;
  byBranch: any;
}

export interface DamageReportSummary {
  totalReports: number;
  collectedValue: number;
  outstandingValue: number;
  byType: any;
}

export interface LostFoundReport {
  totalFound: number;
  claimed: number;
  archived: number;
  active: number;
  recoveryRate: number;
}

export interface ExecutiveSummary {
  byBranch: any[];
  totals: {
    revenue: number;
    profit: number;
    maintenance: number;
    damage: number;
  };
}

export interface Document {
  id: string;
  title: string;
  type: string;
  department: string;
  branchId: string;
  branch?: {
    id: string;
    name: string;
    location?: string | null;
  };
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  issuer?: string | null;
  expiryDate?: string | null;
  issueDate?: string | null;
  isExpired: boolean;
  notes?: string | null;
  uploadedById: string;
  uploadedBy?: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LostFoundItem {
  id: string;
  ticketNumber: string;
  reportedBy: string;
  reporter?: User;
  branchId: string;
  branch?: Branch;
  location: string;
  description: string;
  photoUrl?: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
  reservationRef?: string | null;
  status: string;
  claimedBy?: string | null;
  claimedIdType?: string | null;
  claimedIdNumber?: string | null;
  claimedAt?: string | null;
  handedOverBy?: string | null;
  archivedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DamageReport {
  id: string;
  ticketNumber: string;
  reportedBy: string;
  reporter?: User;
  branchId: string;
  branch?: Branch;
  reservationRef?: string | null;
  guestName?: string | null;
  guestPhone?: string | null;
  roomNumber: string;
  damageType: string;
  description: string;
  photoUrls: string;
  reportedDuring: string;
  estimatedValue?: number | null;
  finalValue?: number | null;
  status: string;
  reviewedBy?: string | null;
  reviewer?: User | null;
  reviewNote?: string | null;
  reviewedAt?: string | null;
  paymentMethod?: string | null;
  paymentDueDate?: string | null;
  paymentRef?: string | null;
  collectedBy?: string | null;
  collectedAt?: string | null;
  refusalReason?: string | null;
  waivedBy?: string | null;
  waivedAt?: string | null;
  waiverReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DamageStats {
  total: number;
  paid: number;
  refused: number;
  waived: number;
  pendingReview: number;
  totalCollected: number;
  totalLost: number;
}


export interface Branch {
  id: string;
  name: string;
  location?: string;
  lat?: number | null;
  lng?: number | null;
  radiusMeters?: number;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  phoneNumber: string;
  branchId: string;
  branch?: Branch;
  employeeType?: 'Fixed' | 'Mobile';
  annualLeaveBalance?: number;
  sickLeaveBalance?: number;
  botEnabled?: boolean;
  email?: string | null;
  isActive?: boolean;
}

export interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  branchId: string | null;
  branch?: Branch;
  isOpen: boolean;
  isActive: boolean;
  createdAt?: string;
}

export interface AttendanceLog {
  id: string;
  userId: string;
  user?: User;
  branchId: string | null;
  branch?: Branch;
  type: 'CheckIn' | 'CheckOut';
  timestamp: string;
  lat: number;
  lng: number;
  distanceMeters: number;
  isValid: boolean;
  rejectionReason?: string | null;
}

export interface ShiftReport {
  id: string;
  createdAt: string;
  reporterId: string;
  reporter?: User;
  branchId: string;
  branch?: Branch;
  shiftLabel: string;
  cashTotal: number;
  cashExpenses: number;
  cashNet: number;
  visa: number;
  mada: number;
  mastercard: number;
  gulfNet: number;
  tabby: number;
  bankTransfer: number;
  grandTotal: number;
  status: string;
  rejectionReason?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  shiftId?: string | null;
  customStartTime?: string | null;
  customEndTime?: string | null;
  isManual?: boolean;
  manualEnteredBy?: string | null;
  damageCompensations?: number;
  roomRevenue?: number;
  serviceRevenue?: number;
}

export interface LoanRequest {
  id: string;
  userId: string;
  user?: User;
  amount: number;
  reason: string;
  status: string; // 'Pending' | 'Approved' | 'Rejected'
  repaymentMonths?: number;
  reviewedBy?: string | null;
  reviewNote?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  user?: User;
  leaveType: string; // 'Annual' | 'Sick' | 'Emergency' | 'Unpaid'
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: string; // 'Pending' | 'Approved' | 'Rejected'
  reviewedBy?: string | null;
  reviewNote?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
}

export interface RequestItem {
  id: string;
  requestType: RequestType;
  status: RequestStatus;
  branchId: string;
  branch?: Branch;
  description: string;
  reporterId: string;
  reporter?: User;
  assignedToId?: string | null;
  assignedTo?: User | null;
  estimatedCost?: number | null;
  actualCost?: number | null;
  beforeImageUrl?: string | null;
  afterImageUrl?: string | null;
  invoiceImageUrl?: string | null;
  approvalStatus: ApprovalStatus;
  rating?: number | null;
  rejectionReason?: string | null;
  rejectionCount?: number | null;
  inventoryItemId?: string | null;
  inventoryItem?: InventoryItem | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stockLevel: number;
  reorderLevel: number;
  status: 'Available' | 'Out_of_Stock';
  branchId: string;
  branch?: Branch;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaintenanceTimeline {
  id: string;
  requestId: string;
  action: string;
  performedBy: string;
  performerName?: string;
  note?: string | null;
  photoUrl?: string | null;
  createdAt: string;
}

export interface MaintenanceRequest {
  id: string;
  ticketNumber: string;
  reportedBy: string;
  reporterName?: string;
  reporter?: User;
  branchId: string;
  branchName?: string;
  branch?: Branch;
  category: string;
  location: string;
  description: string;
  photoUrl?: string | null;
  priority: string;
  status: string;
  assignedTo?: string | null;
  technicianName?: string | null;
  technician?: User | null;
  completionPhotoUrl?: string | null;
  completionNote?: string | null;
  rejectionReason?: string | null;
  rejectionCount: number;
  assignedAt?: string | null;
  completedAt?: string | null;
  closedAt?: string | null;
  closedBy?: string | null;
  supervisorNote?: string | null;
  sparePartsNeeded: boolean;
  procurementId?: string | null;
  createdAt: string;
  updatedAt: string;
  timeline?: MaintenanceTimeline[];
}

export interface ItemCategory {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
}

export interface Item {
  id: string;
  name: string;
  unit: string;
  categoryId: string;
  category?: ItemCategory;
  description?: string | null;
  stockEntries?: StockEntry[];
  movements?: StockMovement[];
  createdAt?: string;
}

export interface StockEntry {
  id: string;
  itemId: string;
  item?: Item;
  branchId: string;
  branch?: Branch;
  quantity: number;
  minThreshold: number;
  maxCapacity: number;
  lastUpdated?: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  item?: Item;
  branchId: string;
  branch?: Branch;
  type: 'In' | 'Out' | 'Transfer' | 'Adjustment';
  quantity: number;
  reason: string;
  referenceId?: string | null;
  performedBy: string;
  performer?: User;
  note?: string | null;
  createdAt: string;
}

export interface WarehouseRequest {
  id: string;
  ticketNumber: string;
  requestedBy: string;
  requester?: User;
  branchId: string;
  branch?: Branch;
  itemId: string;
  item?: Item;
  quantityRequested: number;
  quantityIssued: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'PartiallyApproved';
  purpose?: string | null;
  approvedBy?: string | null;
  approver?: User | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  category?: string | null;
  rating?: number;
  isActive: boolean;
  createdAt?: string;
}

export interface ProcurementRequest {
  id: string;
  ticketNumber: string;
  requestedBy: string;
  requester?: User;
  branchId: string;
  branch?: Branch;
  itemId?: string | null;
  item?: Item | null;
  itemName: string;
  quantityNeeded: number;
  unit: string;
  estimatedPrice?: number | null;
  actualPrice?: number | null;
  paymentMethod?: string | null;
  paymentDueDate?: string | null;
  supplierId?: string | null;
  supplier?: Supplier | null;
  source: string;
  status: string;
  procurementNote?: string | null;
  financialNote?: string | null;
  rejectionReason?: string | null;
  reviewedBy?: string | null;
  reviewer?: User | null;
  approvedBy?: string | null;
  approver?: User | null;
  purchasedBy?: string | null;
  purchaser?: User | null;
  receiptPhotoUrl?: string | null;
  referenceId?: string | null;
  createdAt: string;
  updatedAt: string;
}


const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

// Global fetch override for token header injection
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = async (input, init) => {
    let urlStr = '';
    let isRequestObject = false;
    
    if (typeof input === 'string') {
      urlStr = input;
    } else if (input && typeof input === 'object') {
      urlStr = (input as any).url || '';
      isRequestObject = true;
    }

    if (urlStr.includes(BACKEND_URL) && !urlStr.includes('/auth/login')) {
      const token = localStorage.getItem('rahti_token');
      if (token) {
        if (isRequestObject) {
          const req = input as Request;
          const newHeaders = new Headers(req.headers);
          newHeaders.set('Authorization', `Bearer ${token}`);
          
          let newInit: RequestInit = init ? { ...init } : {};
          newInit.headers = newHeaders;
          
          const newRequest = new Request(req, newInit);
          return originalFetch(newRequest);
        } else {
          let newInit: RequestInit = init ? { ...init } : {};
          const newHeaders = newInit.headers ? new Headers(newInit.headers) : new Headers();
          newHeaders.set('Authorization', `Bearer ${token}`);
          newInit.headers = newHeaders;
          return originalFetch(input, newInit);
        }
      }
    }
    return originalFetch(input, init);
  };
}

// Rich Mock Data
const MOCK_BRANCHES: Branch[] = [
  { id: 'b-1', name: 'Sail Road Branch', location: 'Mombasa, Kenya' },
  { id: 'b-2', name: 'Beachside Resort Branch', location: 'Diani Beach, Kenya' }
];

let localDocuments: Document[] = [
  {
    id: 'doc-1',
    title: 'رخصة الدفاع المدني - السيل',
    type: 'FIRE_PERMIT',
    department: 'BRANCH',
    branchId: 'b-1',
    branch: { id: 'b-1', name: 'Sail Road Branch' },
    fileUrl: '/uploads/documents/fire_permit_sail_road.pdf',
    fileName: 'fire_permit_sail_road.pdf',
    fileSize: 102450,
    mimeType: 'application/pdf',
    issuer: 'الدفاع المدني السعودي',
    issueDate: new Date(Date.now() - 300 * 24 * 3600 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 65 * 24 * 3600 * 1000).toISOString(),
    isExpired: false,
    uploadedById: 'u-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'doc-2',
    title: 'عقد صيانة المصاعد الذكية',
    type: 'CONTRACT',
    department: 'MAINTENANCE',
    branchId: 'b-1',
    branch: { id: 'b-1', name: 'Sail Road Branch' },
    fileUrl: '/uploads/documents/elevator_maintenance_contract.pdf',
    fileName: 'elevator_maintenance_contract.pdf',
    fileSize: 450000,
    mimeType: 'application/pdf',
    issuer: 'شركة ميتسوبيشي للمصاعد',
    issueDate: new Date(Date.now() - 340 * 24 * 3600 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 25 * 24 * 3600 * 1000).toISOString(),
    isExpired: false,
    uploadedById: 'u-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'doc-3',
    title: 'التأمين الطبي الشامل للموظفين',
    type: 'INSURANCE',
    department: 'HR',
    branchId: 'b-1',
    branch: { id: 'b-1', name: 'Sail Road Branch' },
    fileUrl: '/uploads/documents/bupa_insurance_2026.pdf',
    fileName: 'bupa_insurance_2026.pdf',
    fileSize: 1200000,
    mimeType: 'application/pdf',
    issuer: 'شركة بوبا للتأمين',
    issueDate: new Date(Date.now() - 360 * 24 * 3600 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
    isExpired: false,
    uploadedById: 'u-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'doc-4',
    title: 'الرخصة البلدية التشغيلية - الشاطئ',
    type: 'LICENSE',
    department: 'BRANCH',
    branchId: 'b-2',
    branch: { id: 'b-2', name: 'Beachside Resort Branch' },
    fileUrl: '/uploads/documents/municipality_permit_beachside.pdf',
    fileName: 'municipality_permit_beachside.pdf',
    fileSize: 85000,
    mimeType: 'application/pdf',
    issuer: 'أمانة منطقة مكة المكرمة',
    issueDate: new Date(Date.now() - 400 * 24 * 3600 * 1000).toISOString(),
    expiryDate: new Date(Date.now() - 35 * 24 * 3600 * 1000).toISOString(),
    isExpired: true,
    uploadedById: 'u-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'doc-5',
    title: 'شهادة تسجيل ضريبة القيمة المضافة',
    type: 'CERTIFICATE',
    department: 'BRANCH',
    branchId: 'b-1',
    branch: { id: 'b-1', name: 'Sail Road Branch' },
    fileUrl: '/uploads/documents/vat_registration_cert.pdf',
    fileName: 'vat_registration_cert.pdf',
    fileSize: 180000,
    mimeType: 'application/pdf',
    issuer: 'الهيئة العامة للزكاة والدخل',
    issueDate: new Date(Date.now() - 730 * 24 * 3600 * 1000).toISOString(),
    expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
    isExpired: false,
    uploadedById: 'u-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const MOCK_USERS: User[] = [
  { id: 'u-1', name: 'Aman Al-Saeed', role: Role.Admin, phoneNumber: '+1234567890', branchId: 'b-1' },
  { id: 'u-2', name: 'Elena Petrova', role: Role.CEO, phoneNumber: '+1234567891', branchId: 'b-1' },
  { id: 'u-3', name: 'Sarah Conners', role: Role.FinanceManager, phoneNumber: '+1234567892', branchId: 'b-1' },
  { id: 'u-4', name: 'Thomas Miller', role: Role.Technician, phoneNumber: '+1234567893', branchId: 'b-1' },
  { id: 'u-5', name: 'Lara Croft', role: Role.Receptionist, phoneNumber: '+1234567894', branchId: 'b-1' },
  { id: 'u-6', name: 'Marcus Vance', role: Role.WarehouseManager, phoneNumber: '+1234567895', branchId: 'b-1' },
  { id: 'u-7', name: 'أحمد', role: Role.Technician, phoneNumber: '+966501111001', branchId: 'b-1' },
  { id: 'u-8', name: 'خالد', role: Role.Technician, phoneNumber: '+966501111002', branchId: 'b-1' },
  { id: 'u-9', name: 'Omar Maintenance', role: Role.MaintenanceSupervisor, phoneNumber: '+966501111003', branchId: 'b-1' },
  { id: 'u-10', name: 'Branch Manager', role: Role.BranchManager, phoneNumber: '+966501111004', branchId: 'b-1' }
];

const MOCK_ITEM_CATEGORIES: ItemCategory[] = [
  { id: 'cat-1', name: 'مناشف', description: 'جميع أنواع المناشف والشراشف الفندقية' },
  { id: 'cat-2', name: 'أدوات نظافة', description: 'منظفات وسوائل ومطهرات للغرف والمرافق' },
  { id: 'cat-3', name: 'قطع غيار', description: 'قطع صيانة وتجهيزات كهربائية وسباكة' },
  { id: 'cat-4', name: 'مستلزمات مكتبية', description: 'قرطاسية وأوراق طباعة وأقلام للمكاتب والاستقبال' },
  { id: 'cat-5', name: 'أغذية ومشروبات', description: 'مأكولات ومشروبات وضيافة للنزلاء' },
  { id: 'cat-6', name: 'عام', description: 'مستلزمات عامة أخرى' }
];

const MOCK_ITEMS: Item[] = [
  { id: 'item-1', name: 'منشفة يد صغيرة', unit: 'قطعة', categoryId: 'cat-1' },
  { id: 'item-2', name: 'مفرش حمام قطني', unit: 'قطعة', categoryId: 'cat-1' },
  { id: 'item-3', name: 'منظف زجاج', unit: 'علبة', categoryId: 'cat-2' },
  { id: 'item-4', name: 'صابون سائل للأيدي', unit: 'لتر', categoryId: 'cat-2' },
  { id: 'item-5', name: 'مصباح إضاءة LED 12W', unit: 'قطعة', categoryId: 'cat-3' },
  { id: 'item-6', name: 'مفصلة باب معدنية', unit: 'قطعة', categoryId: 'cat-3' },
  { id: 'item-7', name: 'ورق طباعة A4', unit: 'علبة', categoryId: 'cat-4' },
  { id: 'item-8', name: 'أقلام حبر زرقاء', unit: 'علبة', categoryId: 'cat-4' },
  { id: 'item-9', name: 'بن قهوة عربي', unit: 'كيلو', categoryId: 'cat-5' },
  { id: 'item-10', name: 'مياه معدنية 330 مل', unit: 'علبة', categoryId: 'cat-5' }
];

const MOCK_STOCK_ENTRIES: StockEntry[] = [
  { id: 'se-1-1', itemId: 'item-1', branchId: 'b-1', quantity: 50, minThreshold: 10, maxCapacity: 100 },
  { id: 'se-1-2', itemId: 'item-2', branchId: 'b-1', quantity: 30, minThreshold: 10, maxCapacity: 100 },
  { id: 'se-1-3', itemId: 'item-3', branchId: 'b-1', quantity: 15, minThreshold: 5, maxCapacity: 50 },
  { id: 'se-1-4', itemId: 'item-4', branchId: 'b-1', quantity: 25, minThreshold: 5, maxCapacity: 50 },
  { id: 'se-1-5', itemId: 'item-5', branchId: 'b-1', quantity: 2, minThreshold: 5, maxCapacity: 50 },
  { id: 'se-1-6', itemId: 'item-6', branchId: 'b-1', quantity: 8, minThreshold: 5, maxCapacity: 30 },
  { id: 'se-1-7', itemId: 'item-7', branchId: 'b-1', quantity: 12, minThreshold: 5, maxCapacity: 40 },
  { id: 'se-1-8', itemId: 'item-8', branchId: 'b-1', quantity: 6, minThreshold: 3, maxCapacity: 20 },
  { id: 'se-1-9', itemId: 'item-9', branchId: 'b-1', quantity: 10, minThreshold: 4, maxCapacity: 30 },
  { id: 'se-1-10', itemId: 'item-10', branchId: 'b-1', quantity: 150, minThreshold: 50, maxCapacity: 500 },
  { id: 'se-2-1', itemId: 'item-1', branchId: 'b-2', quantity: 50, minThreshold: 10, maxCapacity: 100 },
  { id: 'se-2-2', itemId: 'item-2', branchId: 'b-2', quantity: 30, minThreshold: 10, maxCapacity: 100 },
  { id: 'se-2-3', itemId: 'item-3', branchId: 'b-2', quantity: 15, minThreshold: 5, maxCapacity: 50 },
  { id: 'se-2-4', itemId: 'item-4', branchId: 'b-2', quantity: 25, minThreshold: 5, maxCapacity: 50 },
  { id: 'se-2-5', itemId: 'item-5', branchId: 'b-2', quantity: 2, minThreshold: 5, maxCapacity: 50 },
  { id: 'se-2-6', itemId: 'item-6', branchId: 'b-2', quantity: 8, minThreshold: 5, maxCapacity: 30 },
  { id: 'se-2-7', itemId: 'item-7', branchId: 'b-2', quantity: 12, minThreshold: 5, maxCapacity: 40 },
  { id: 'se-2-8', itemId: 'item-8', branchId: 'b-2', quantity: 6, minThreshold: 3, maxCapacity: 20 },
  { id: 'se-2-9', itemId: 'item-9', branchId: 'b-2', quantity: 10, minThreshold: 4, maxCapacity: 30 },
  { id: 'se-2-10', itemId: 'item-10', branchId: 'b-2', quantity: 150, minThreshold: 50, maxCapacity: 500 }
];

const MOCK_SUPPLIERS: Supplier[] = [
  { id: 'sup-1', name: 'شركة التوريدات الفندقية السريعة', contactName: 'أحمد سالم', phone: '+966555111222', isActive: true, category: 'مستلزمات فندقية', rating: 5 },
  { id: 'sup-2', name: 'مؤسسة الغيار الحديثة للكهرباء', contactName: 'خالد العتيبي', phone: '+966555333444', isActive: true, category: 'قطع غيار', rating: 4 },
  { id: 'sup-3', name: 'مكتبة النجاح للمستلزمات المكتبية', contactName: 'يوسف الحربي', phone: '+966555555666', isActive: true, category: 'قرطاسية', rating: 3 }
];

const MOCK_WAREHOUSE_REQUESTS: WarehouseRequest[] = [
  {
    id: 'whr-1',
    ticketNumber: 'WHR-2026-0001',
    itemId: 'item-1',
    requestedBy: 'u-5',
    branchId: 'b-1',
    quantityRequested: 10,
    quantityIssued: 0,
    status: 'Pending',
    purpose: 'تغيير مناشف الغرف الطابق الثاني',
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600000).toISOString()
  },
  {
    id: 'whr-2',
    ticketNumber: 'WHR-2026-0002',
    itemId: 'item-3',
    requestedBy: 'u-5',
    branchId: 'b-1',
    quantityRequested: 5,
    quantityIssued: 5,
    status: 'Approved',
    purpose: 'تنظيف زجاج البهو الرئيسي',
    approvedBy: 'u-6',
    createdAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600000).toISOString()
  },
  {
    id: 'whr-3',
    ticketNumber: 'WHR-2026-0003',
    itemId: 'item-5',
    requestedBy: 'u-7',
    branchId: 'b-1',
    quantityRequested: 3,
    quantityIssued: 0,
    status: 'Rejected',
    purpose: 'صيانة إنارة الممر الطابق الثالث',
    approvedBy: 'u-6',
    rejectionReason: 'المخزون منخفض جداً، يرجى تقديم طلب شراء',
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 3600000).toISOString()
  },
  {
    id: 'whr-4',
    ticketNumber: 'WHR-2026-0004',
    itemId: 'item-10',
    requestedBy: 'u-5',
    branchId: 'b-1',
    quantityRequested: 50,
    quantityIssued: 30,
    status: 'PartiallyApproved',
    purpose: 'توزيع مياه للنزلاء',
    approvedBy: 'u-6',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600000).toISOString()
  }
];

const MOCK_PROCUREMENTS: ProcurementRequest[] = [
  {
    id: 'pro-1',
    ticketNumber: 'PRO-2026-0001',
    itemId: 'item-5',
    itemName: 'مصباح إضاءة LED 12W',
    requestedBy: 'u-6',
    branchId: 'b-1',
    quantityNeeded: 48,
    unit: 'قطعة',
    source: 'LowStock',
    status: 'Pending',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600000).toISOString()
  },
  {
    id: 'pro-2',
    ticketNumber: 'PRO-2026-0002',
    itemId: 'item-6',
    itemName: 'مفصلة باب معدنية',
    requestedBy: 'u-7',
    branchId: 'b-1',
    quantityNeeded: 10,
    unit: 'قطعة',
    source: 'MaintenanceSpareParts',
    status: 'ReviewedByProcurement',
    reviewedBy: 'u-7',
    estimatedPrice: 150.0,
    supplierId: 'sup-2',
    paymentMethod: 'Cash',
    procurementNote: 'تسعير معتمد من مؤسسة الغيار',
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 3600000).toISOString()
  },
  {
    id: 'pro-3',
    ticketNumber: 'PRO-2026-0003',
    itemId: 'item-9',
    itemName: 'بن قهوة عربي',
    requestedBy: 'u-6',
    branchId: 'b-1',
    quantityNeeded: 20,
    unit: 'كيلو',
    source: 'LowStock',
    status: 'FinanciallyApproved',
    reviewedBy: 'u-7',
    approvedBy: 'u-3',
    estimatedPrice: 800.0,
    supplierId: 'sup-1',
    paymentMethod: 'BankTransfer',
    procurementNote: 'بن هرري درجة أولى',
    financialNote: 'معتمد للصرف',
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600000).toISOString()
  }
];

const MOCK_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'sm-1',
    itemId: 'item-3',
    branchId: 'b-1',
    type: 'Out',
    quantity: -5,
    reason: 'EmployeeRequest',
    referenceId: 'whr-2',
    performedBy: 'u-6',
    note: 'صرف طلب تنظيف زجاج',
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString()
  },
  {
    id: 'sm-2',
    itemId: 'item-10',
    branchId: 'b-1',
    type: 'Out',
    quantity: -30,
    reason: 'EmployeeRequest',
    referenceId: 'whr-4',
    performedBy: 'u-6',
    note: 'صرف جزئي لطلب توزيع مياه',
    createdAt: new Date(Date.now() - 1 * 3600000).toISOString()
  }
];

let localItemCategories = [...MOCK_ITEM_CATEGORIES];
let localItems = [...MOCK_ITEMS];
let localStockEntries = [...MOCK_STOCK_ENTRIES];
let localSuppliers = [...MOCK_SUPPLIERS];
let localWarehouseRequests = [...MOCK_WAREHOUSE_REQUESTS];
let localProcurements = [...MOCK_PROCUREMENTS];
let localStockMovements = [...MOCK_STOCK_MOVEMENTS];

const localLostItems: LostFoundItem[] = [
  {
    id: 'lf-1',
    ticketNumber: 'LF-2026-0001',
    location: 'غرفة 203',
    description: 'محفظة جلدية سوداء تحتوي على بطاقات وبطاقة هوية',
    reportedBy: 'u-50',
    branchId: 'b-1',
    status: 'Stored',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lf-2',
    ticketNumber: 'LF-2026-0002',
    location: 'اللوبي',
    description: 'ساعة يد ذكية لون فضي ماركة آبل',
    reportedBy: 'u-3',
    branchId: 'b-1',
    guestName: 'أحمد العتيبي',
    guestPhone: '+966509999888',
    status: 'ContactedGuest',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lf-3',
    ticketNumber: 'LF-2026-0003',
    location: 'غرفة 115',
    description: 'هاتف جوال آيفون 15 برو ماكس',
    reportedBy: 'u-50',
    branchId: 'b-1',
    guestName: 'سليمان الحربي',
    guestPhone: '+966502223344',
    status: 'Claimed',
    claimedBy: 'سليمان الحربي',
    claimedIdType: 'NationalId',
    claimedIdNumber: '1023456789',
    claimedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    handedOverBy: 'u-3',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'lf-4',
    ticketNumber: 'LF-2026-0004',
    location: 'المطعم',
    description: 'ساعة يد كاسيو سوداء',
    reportedBy: 'u-3',
    branchId: 'b-1',
    status: 'Archived',
    archivedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 31 * 24 * 3600 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const localDamageReports: DamageReport[] = [
  {
    id: 'dmg-1',
    ticketNumber: 'DMG-2026-0001',
    reportedBy: 'u-9',
    branchId: 'b-1',
    roomNumber: 'غرفة 302',
    damageType: 'Electronics',
    description: 'تلف شاشة التلفزيون وكسر في الإطار الخارجي',
    reportedDuring: 'Stay',
    status: 'New',
    photoUrls: '[]',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dmg-2',
    ticketNumber: 'DMG-2026-0002',
    reportedBy: 'u-3',
    branchId: 'b-1',
    roomNumber: 'غرفة 108',
    damageType: 'Fixture',
    description: 'كسر مرآة الحمام الرئيسية وسقوطها',
    reportedDuring: 'Checkout',
    status: 'UnderReview',
    photoUrls: '[]',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dmg-3',
    ticketNumber: 'DMG-2026-0003',
    reportedBy: 'u-50',
    branchId: 'b-1',
    roomNumber: 'غرفة 205',
    damageType: 'Fixture',
    description: 'تلف فتحة التكييف وتساقط الماء منها',
    reportedDuring: 'Stay',
    estimatedValue: 1000,
    finalValue: 800,
    status: 'PendingGuestDecision',
    reviewedBy: 'u-9',
    reviewNote: 'تم الاتفاق على تعويض 800 ريال بدلاً من 1000',
    reviewedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    photoUrls: '[]',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dmg-4',
    ticketNumber: 'DMG-2026-0004',
    reportedBy: 'u-3',
    branchId: 'b-1',
    roomNumber: 'غرفة 401',
    damageType: 'Linen',
    description: 'تمزيق شرشف السرير الفاخر بالكامل',
    reportedDuring: 'Checkout',
    estimatedValue: 150,
    finalValue: 150,
    status: 'Paid',
    reviewedBy: 'u-9',
    reviewedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    paymentMethod: 'Cash',
    paymentRef: 'REC-998877',
    collectedBy: 'u-3',
    collectedAt: new Date().toISOString(),
    photoUrls: '[]',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'dmg-5',
    ticketNumber: 'DMG-2026-0005',
    reportedBy: 'u-50',
    branchId: 'b-1',
    roomNumber: 'غرفة 312',
    damageType: 'Furniture',
    description: 'تلف وكسر في رجل كرسي الخشب بالصالة',
    reportedDuring: 'Stay',
    estimatedValue: 300,
    finalValue: 300,
    status: 'Refused',
    reviewedBy: 'u-9',
    reviewedAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    refusalReason: 'العميل ينفي المسؤولية',
    photoUrls: '[]',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const hydrateLostItems = (items: LostFoundItem[]): LostFoundItem[] => {
  const users = [
    { id: 'u-1', name: 'Aman Al-Saeed', role: Role.Admin, phoneNumber: '+1234567890', branchId: 'b-1' },
    { id: 'u-2', name: 'Elena Petrova', role: Role.CEO, phoneNumber: '+1234567891', branchId: 'b-1' },
    { id: 'u-3', name: 'Lara Croft', role: Role.Receptionist, phoneNumber: '+1234567894', branchId: 'b-1' },
    { id: 'u-9', name: 'Branch Manager', role: Role.BranchManager, phoneNumber: '+966501111004', branchId: 'b-1' },
    { id: 'u-50', name: 'Fatima', role: Role.HousekeepingStaff, phoneNumber: '+966501111005', branchId: 'b-1' }
  ];
  const branches = [
    { id: 'b-1', name: 'Sail Road Branch', location: 'Mombasa, Kenya' }
  ];
  return items.map(item => {
    const reporter = users.find(u => u.id === item.reportedBy) as any;
    const branch = branches.find(b => b.id === item.branchId) as any;
    return { ...item, reporter, branch };
  });
};

const hydrateDamageReports = (reports: DamageReport[]): DamageReport[] => {
  const users = [
    { id: 'u-1', name: 'Aman Al-Saeed', role: Role.Admin, phoneNumber: '+1234567890', branchId: 'b-1' },
    { id: 'u-2', name: 'Elena Petrova', role: Role.CEO, phoneNumber: '+1234567891', branchId: 'b-1' },
    { id: 'u-3', name: 'Lara Croft', role: Role.Receptionist, phoneNumber: '+1234567894', branchId: 'b-1' },
    { id: 'u-9', name: 'Branch Manager', role: Role.BranchManager, phoneNumber: '+966501111004', branchId: 'b-1' },
    { id: 'u-50', name: 'Fatima', role: Role.HousekeepingStaff, phoneNumber: '+966501111005', branchId: 'b-1' }
  ];
  const branches = [
    { id: 'b-1', name: 'Sail Road Branch', location: 'Mombasa, Kenya' }
  ];
  return reports.map(r => {
    const reporter = users.find(u => u.id === r.reportedBy) as any;
    const branch = branches.find(b => b.id === r.branchId) as any;
    const reviewer = r.reviewedBy ? (users.find(u => u.id === r.reviewedBy) as any) : null;
    return { ...r, reporter, branch, reviewer };
  });
};

const hydrateItems = (itemsList: Item[]): Item[] => {
  return itemsList.map(i => ({
    ...i,
    category: localItemCategories.find(c => c.id === i.categoryId)
  }));
};

const hydrateWarehouseRequests = (reqs: WarehouseRequest[]): WarehouseRequest[] => {
  return reqs.map(r => ({
    ...r,
    requester: MOCK_USERS.find(u => u.id === r.requestedBy),
    branch: MOCK_BRANCHES.find(b => b.id === r.branchId),
    item: hydrateItems(localItems).find(i => i.id === r.itemId),
    approver: r.approvedBy ? MOCK_USERS.find(u => u.id === r.approvedBy) : null
  }));
};

const hydrateProcurements = (reqs: ProcurementRequest[]): ProcurementRequest[] => {
  return reqs.map(r => ({
    ...r,
    requester: MOCK_USERS.find(u => u.id === r.requestedBy),
    branch: MOCK_BRANCHES.find(b => b.id === r.branchId),
    item: r.itemId ? hydrateItems(localItems).find(i => i.id === r.itemId) : null,
    supplier: r.supplierId ? localSuppliers.find(s => s.id === r.supplierId) : null,
    reviewer: r.reviewedBy ? MOCK_USERS.find(u => u.id === r.reviewedBy) : null,
    approver: r.approvedBy ? MOCK_USERS.find(u => u.id === r.approvedBy) : null,
    purchaser: r.purchasedBy ? MOCK_USERS.find(u => u.id === r.purchasedBy) : null
  }));
};

const hydrateStockEntries = (entries: StockEntry[]): StockEntry[] => {
  return entries.map(e => ({
    ...e,
    item: hydrateItems(localItems).find(i => i.id === e.itemId),
    branch: MOCK_BRANCHES.find(b => b.id === e.branchId)
  }));
};

const hydrateStockMovements = (moves: StockMovement[]): StockMovement[] => {
  return moves.map(m => ({
    ...m,
    item: hydrateItems(localItems).find(i => i.id === m.itemId),
    branch: MOCK_BRANCHES.find(b => b.id === m.branchId),
    performer: MOCK_USERS.find(u => u.id === m.performedBy)
  }));
};



const MOCK_INVENTORY: InventoryItem[] = [
  { id: 'inv-1', name: 'صابون حمام فاخر', category: 'مستلزمات الغرف', stockLevel: 250, reorderLevel: 50, status: 'Available', branchId: 'b-1' },
  { id: 'inv-2', name: 'مناشف قطنية بيضاء', category: 'مستلزمات الغرف', stockLevel: 120, reorderLevel: 20, status: 'Available', branchId: 'b-1' },
  { id: 'inv-3', name: 'شامبو للشعر', category: 'مستلزمات الغرف', stockLevel: 0, reorderLevel: 40, status: 'Out_of_Stock', branchId: 'b-1' },
  { id: 'inv-4', name: 'أغطية سرير مزدوجة', category: 'البياضات', stockLevel: 80, reorderLevel: 15, status: 'Available', branchId: 'b-1' }
];

const MOCK_REQUESTS: RequestItem[] = [
  {
    id: 'req-1',
    requestType: RequestType.Maintenance,
    status: RequestStatus.Pending,
    branchId: 'b-1',
    description: 'Rooftop chiller unit fan motor is seizing. Requires urgent replacement.',
    reporterId: 'u-5',
    assignedToId: null,
    estimatedCost: 800,
    beforeImageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
    approvalStatus: ApprovalStatus.Approved,
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600000).toISOString()
  },
  {
    id: 'req-2',
    requestType: RequestType.Maintenance,
    status: RequestStatus.Reopened,
    branchId: 'b-1',
    description: 'Room 304 water leakage in bathroom sealing.',
    reporterId: 'u-5',
    assignedToId: 'u-4',
    estimatedCost: 120,
    beforeImageUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800',
    approvalStatus: ApprovalStatus.Approved,
    rejectionCount: 1,
    rejectionReason: 'العازل غير كافٍ ولا يزال هناك تسريب بسيط عند تشغيل الصنبور (تأكد من الزوايا)',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600000).toISOString()
  },
  {
    id: 'req-3',
    requestType: RequestType.Maintenance,
    status: RequestStatus.Awaiting_Confirmation,
    branchId: 'b-1',
    description: 'Sail Road lobby main bulb replacements.',
    reporterId: 'u-5',
    assignedToId: 'u-4',
    estimatedCost: 75,
    beforeImageUrl: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&q=80&w=800',
    afterImageUrl: 'https://images.unsplash.com/photo-1557425955-df376b5903c8?auto=format&fit=crop&q=80&w=800',
    approvalStatus: ApprovalStatus.Approved,
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600000).toISOString()
  },
  {
    id: 'req-4',
    requestType: RequestType.Procurement,
    status: RequestStatus.Pending,
    branchId: 'b-1',
    description: 'Purchase 12x heavy duty linen carts for housekeeping team.',
    reporterId: 'u-1',
    estimatedCost: 4800,
    invoiceImageUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=800',
    approvalStatus: ApprovalStatus.Pending_Finance,
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString()
  },
  {
    id: 'req-5',
    requestType: RequestType.Procurement,
    status: RequestStatus.Pending,
    branchId: 'b-2',
    description: 'Commercial laundry washing machine (Speed Queen 50lb capacity).',
    reporterId: 'u-1',
    estimatedCost: 14500,
    invoiceImageUrl: 'https://images.unsplash.com/photo-1545180856-f6d33306078e?auto=format&fit=crop&q=80&w=800',
    approvalStatus: ApprovalStatus.Pending_CEO,
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 3600000).toISOString()
  }
];

const hydrateRequests = (reqs: RequestItem[]): RequestItem[] => {
  return reqs.map(r => ({
    ...r,
    branch: MOCK_BRANCHES.find(b => b.id === r.branchId),
    reporter: MOCK_USERS.find(u => u.id === r.reporterId),
    assignedTo: r.assignedToId ? MOCK_USERS.find(u => u.id === r.assignedToId) : null
  }));
};

const hydrateInventory = (items: InventoryItem[]): InventoryItem[] => {
  return items.map(i => ({
    ...i,
    branch: MOCK_BRANCHES.find(b => b.id === i.branchId)
  }));
};

const hydrateUsers = (users: User[]): User[] => {
  return users.map(u => ({
    ...u,
    branch: MOCK_BRANCHES.find(b => b.id === u.branchId)
  }));
};

const MOCK_MAINTENANCE_REQUESTS: MaintenanceRequest[] = [
  {
    id: 'mnt-1',
    ticketNumber: 'MNT-2026-0001',
    reportedBy: 'u-5', // Lara Croft
    branchId: 'b-1', // Sail Road
    category: 'Electrical',
    location: 'غرفة 101',
    description: 'تعطل المكيف بالكامل وصدور رائحة حريق خفيفة',
    priority: 'Urgent',
    status: 'New',
    rejectionCount: 0,
    sparePartsNeeded: false,
    createdAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
    timeline: [
      {
        id: 'timeline-1-1',
        requestId: 'mnt-1',
        action: 'Created',
        performedBy: 'u-5',
        note: 'تم إنشاء بلاغ الصيانة الجديد بنجاح.',
        createdAt: new Date(Date.now() - 4 * 3600000).toISOString()
      }
    ]
  },
  {
    id: 'mnt-2',
    ticketNumber: 'MNT-2026-0002',
    reportedBy: 'u-5',
    branchId: 'b-1',
    category: 'Plumbing',
    location: 'الحمام الرئيسي',
    description: 'تسريب مياه تحت المغسلة وتجمع المياه على الأرض',
    priority: 'High',
    status: 'InProgress',
    assignedTo: 'u-7', // أحمد
    assignedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    rejectionCount: 0,
    sparePartsNeeded: false,
    createdAt: new Date(Date.now() - 3 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    timeline: [
      {
        id: 'timeline-2-1',
        requestId: 'mnt-2',
        action: 'Created',
        performedBy: 'u-5',
        note: 'تم إنشاء بلاغ الصيانة الجديد بنجاح.',
        createdAt: new Date(Date.now() - 3 * 3600000).toISOString()
      },
      {
        id: 'timeline-2-2',
        requestId: 'mnt-2',
        action: 'Assigned',
        performedBy: 'u-9', // Omar Maintenance
        note: 'تم تعيين الفني أحمد لمباشرة العطل.',
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
      },
      {
        id: 'timeline-2-3',
        requestId: 'mnt-2',
        action: 'Started',
        performedBy: 'u-7',
        note: 'بدأ الفني العمل الميداني على إصلاح العطل.',
        createdAt: new Date(Date.now() - 1.5 * 3600000).toISOString()
      }
    ]
  },
  {
    id: 'mnt-3',
    ticketNumber: 'MNT-2026-0003',
    reportedBy: 'u-5',
    branchId: 'b-1',
    category: 'General',
    location: 'مدخل الفندق',
    description: 'كسر في المقبض الخارجي للباب الرئيسي وصعوبة في الإغلاق',
    priority: 'Normal',
    status: 'PendingInternalApproval',
    assignedTo: 'u-8', // خالد
    assignedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
    completedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    completionNote: 'تم إصلاح قفل الباب وضبط المفصلات واستبدال المقبض التالف',
    rejectionCount: 0,
    sparePartsNeeded: false,
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
    timeline: [
      {
        id: 'timeline-3-1',
        requestId: 'mnt-3',
        action: 'Created',
        performedBy: 'u-5',
        note: 'تم إنشاء بلاغ الصيانة الجديد بنجاح.',
        createdAt: new Date(Date.now() - 6 * 3600000).toISOString()
      },
      {
        id: 'timeline-3-2',
        requestId: 'mnt-3',
        action: 'Assigned',
        performedBy: 'u-9',
        note: 'تم تعيين الفني خالد لمباشرة العطل.',
        createdAt: new Date(Date.now() - 5 * 3600000).toISOString()
      },
      {
        id: 'timeline-3-3',
        requestId: 'mnt-3',
        action: 'Started',
        performedBy: 'u-8',
        note: 'بدأ الفني العمل الميداني على إصلاح العطل.',
        createdAt: new Date(Date.now() - 4.5 * 3600000).toISOString()
      },
      {
        id: 'timeline-3-4',
        requestId: 'mnt-3',
        action: 'CompletionSubmitted',
        performedBy: 'u-8',
        note: 'تم إصلاح قفل الباب وضبط المفصلات واستبدال المقبض التالف',
        createdAt: new Date(Date.now() - 1 * 3600000).toISOString()
      }
    ]
  },
  {
    id: 'mnt-4',
    ticketNumber: 'MNT-2026-0004',
    reportedBy: 'u-5',
    branchId: 'b-1',
    category: 'AC',
    location: 'غرفة 205',
    description: 'ضوضاء عالية جداً عند تشغيل المكيف على السرعة العالية',
    priority: 'Normal',
    status: 'Closed',
    assignedTo: 'u-7',
    assignedAt: new Date(Date.now() - 30 * 3600000).toISOString(),
    completedAt: new Date(Date.now() - 25 * 3600000).toISOString(),
    closedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    closedBy: 'u-1', // adminUser
    completionNote: 'تم تنظيف مرشح الهواء وحل مشكلة الضوضاء.',
    supervisorNote: 'تم تأكيد الإصلاح واختبار الجهاز.',
    rejectionCount: 0,
    sparePartsNeeded: false,
    createdAt: new Date(Date.now() - 32 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    timeline: [
      {
        id: 'timeline-4-1',
        requestId: 'mnt-4',
        action: 'Created',
        performedBy: 'u-5',
        note: 'تم إنشاء بلاغ الصيانة الجديد بنجاح.',
        createdAt: new Date(Date.now() - 32 * 3600000).toISOString()
      },
      {
        id: 'timeline-4-2',
        requestId: 'mnt-4',
        action: 'Assigned',
        performedBy: 'u-9',
        note: 'تم تعيين الفني أحمد لمباشرة العطل.',
        createdAt: new Date(Date.now() - 30 * 3600000).toISOString()
      },
      {
        id: 'timeline-4-3',
        requestId: 'mnt-4',
        action: 'Started',
        performedBy: 'u-7',
        note: 'بدأ الفني العمل الميداني على إصلاح العطل.',
        createdAt: new Date(Date.now() - 29 * 3600000).toISOString()
      },
      {
        id: 'timeline-4-4',
        requestId: 'mnt-4',
        action: 'CompletionSubmitted',
        performedBy: 'u-7',
        note: 'تم تنظيف مرشح الهواء وحل مشكلة الضوضاء.',
        createdAt: new Date(Date.now() - 25 * 3600000).toISOString()
      },
      {
        id: 'timeline-4-5',
        requestId: 'mnt-4',
        action: 'Closed',
        performedBy: 'u-1',
        note: 'تم تأكيد وإغلاق بلاغ الصيانة بنجاح.',
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
      }
    ]
  },
  {
    id: 'mnt-5',
    ticketNumber: 'MNT-2026-0005',
    reportedBy: 'u-5',
    branchId: 'b-1',
    category: 'Electrical',
    location: 'مولد الكهرباء',
    description: 'عطل في المولد الرئيسي وتوقف نظام الطاقة الاحتياطي',
    priority: 'Urgent',
    status: 'SpareParts',
    assignedTo: 'u-7',
    assignedAt: new Date(Date.now() - 10 * 3600000).toISOString(),
    rejectionCount: 0,
    sparePartsNeeded: true,
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
    timeline: [
      {
        id: 'timeline-5-1',
        requestId: 'mnt-5',
        action: 'Created',
        performedBy: 'u-5',
        note: 'تم إنشاء بلاغ الصيانة الجديد بنجاح.',
        createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
      },
      {
        id: 'timeline-5-2',
        requestId: 'mnt-5',
        action: 'Assigned',
        performedBy: 'u-9',
        note: 'تم تعيين الفني أحمد لمباشرة العطل.',
        createdAt: new Date(Date.now() - 10 * 3600000).toISOString()
      },
      {
        id: 'timeline-5-3',
        requestId: 'mnt-5',
        action: 'Started',
        performedBy: 'u-7',
        note: 'بدأ الفني العمل الميداني على إصلاح العطل.',
        createdAt: new Date(Date.now() - 9.5 * 3600000).toISOString()
      },
      {
        id: 'timeline-5-4',
        requestId: 'mnt-5',
        action: 'SparePartsRequested',
        performedBy: 'u-7',
        note: 'طلب قطع غيار: لوحة تحكم كهربائية للمولد الرئيسي',
        createdAt: new Date(Date.now() - 8 * 3600000).toISOString()
      }
    ]
  }
];

const hydrateMaintenanceRequests = (reqs: MaintenanceRequest[]): MaintenanceRequest[] => {
  return reqs.map(r => {
    const reporter = MOCK_USERS.find(u => u.id === r.reportedBy);
    const branch = MOCK_BRANCHES.find(b => b.id === r.branchId);
    const technician = r.assignedTo ? MOCK_USERS.find(u => u.id === r.assignedTo) : null;
    
    // Also hydrate timeline with performer names
    const hydratedTimeline = (r.timeline || []).map(t => {
      const performer = MOCK_USERS.find(u => u.id === t.performedBy);
      return {
        ...t,
        performerName: performer ? performer.name : t.performedBy
      };
    });

    return {
      ...r,
      reporterName: reporter ? reporter.name : 'موظف مجهول',
      branchName: branch ? branch.name : 'فرع غير معروف',
      technicianName: technician ? technician.name : null,
      reporter,
      branch,
      technician,
      timeline: hydratedTimeline
    };
  });
};

let localMaintenanceRequests = [...MOCK_MAINTENANCE_REQUESTS];

let localRequests = [...MOCK_REQUESTS];
let localInventory = [...MOCK_INVENTORY];


const MOCK_LOANS: LoanRequest[] = [
  {
    id: 'loan-1',
    userId: 'u-5',
    amount: 500,
    reason: 'مصاريف شخصية طارئة',
    status: 'Pending',
    createdAt: new Date().toISOString()
  },
  {
    id: 'loan-2',
    userId: 'u-5',
    amount: 1000,
    reason: 'إصلاح سيارة',
    status: 'Approved',
    reviewedBy: 'u-3',
    reviewedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'loan-3',
    userId: 'u-5',
    amount: 2000,
    reason: 'شراء جهاز',
    status: 'Rejected',
    reviewedBy: 'u-3',
    reviewNote: 'المبلغ يتجاوز الحد المسموح',
    reviewedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  }
];

const MOCK_LEAVES: LeaveRequest[] = [
  {
    id: 'leave-1',
    userId: 'u-5',
    leaveType: 'Annual',
    startDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 9 * 24 * 3600 * 1000).toISOString().split('T')[0],
    daysCount: 3,
    reason: 'إجازة عائلية',
    status: 'Pending',
    createdAt: new Date().toISOString()
  },
  {
    id: 'leave-2',
    userId: 'u-5',
    leaveType: 'Sick',
    startDate: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString().split('T')[0],
    daysCount: 2,
    reason: 'نزلة برد شديدة',
    status: 'Approved',
    reviewedBy: 'u-1',
    reviewedAt: new Date().toISOString(),
    createdAt: new Date(Date.now() - 11 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'leave-3',
    userId: 'u-5',
    leaveType: 'Emergency',
    startDate: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 18 * 24 * 3600 * 1000).toISOString().split('T')[0],
    daysCount: 5,
    reason: 'حالة وفاة طارئة',
    status: 'Rejected',
    reviewedBy: 'u-1',
    reviewNote: 'لا يوجد تغطية كافية',
    reviewedAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }
];

let localLoans = [...MOCK_LOANS];
let localLeaves = [...MOCK_LEAVES];

const hydrateLoans = (loans: LoanRequest[]): LoanRequest[] => {
  return loans.map(l => ({
    ...l,
    user: MOCK_USERS.find(u => u.id === l.userId)
  }));
};

const hydrateLeaves = (leaves: LeaveRequest[]): LeaveRequest[] => {
  return leaves.map(l => ({
    ...l,
    user: MOCK_USERS.find(u => u.id === l.userId)
  }));
};

const MOCK_SHIFT_REPORTS: ShiftReport[] = [
  {
    id: 'sr-1',
    createdAt: new Date().toISOString(),
    reporterId: 'u-5',
    branchId: 'b-1',
    shiftLabel: 'صباحي',
    cashTotal: 1200.0,
    cashExpenses: 150.0,
    cashNet: 1050.0,
    visa: 450.0,
    mada: 600.0,
    mastercard: 150.0,
    gulfNet: 0.0,
    tabby: 100.0,
    bankTransfer: 300.0,
    grandTotal: 2650.0,
    status: 'PendingAccountant'
  },
  {
    id: 'sr-2',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString(),
    reporterId: 'u-5',
    branchId: 'b-1',
    shiftLabel: 'مسائي',
    cashTotal: 2000.0,
    cashExpenses: 100.0,
    cashNet: 1900.0,
    visa: 800.0,
    mada: 1200.0,
    mastercard: 300.0,
    gulfNet: 50.0,
    tabby: 200.0,
    bankTransfer: 500.0,
    grandTotal: 4950.0,
    status: 'Approved',
    reviewedBy: 'محاسب الفندق',
    reviewedAt: new Date().toISOString()
  },
  {
    id: 'sr-3',
    createdAt: new Date(Date.now() - 48 * 3600000).toISOString(),
    reporterId: 'u-5',
    branchId: 'b-1',
    shiftLabel: 'ليلي',
    cashTotal: 800.0,
    cashExpenses: 50.0,
    cashNet: 750.0,
    visa: 200.0,
    mada: 300.0,
    mastercard: 100.0,
    gulfNet: 0.0,
    tabby: 0.0,
    bankTransfer: 150.0,
    grandTotal: 1500.0,
    status: 'Rejected',
    rejectionReason: 'يوجد عجز في الكاش بمقدار 50 ريال',
    reviewedBy: 'محاسب الفندق',
    reviewedAt: new Date().toISOString()
  }
];

const MOCK_SHIFTS: Shift[] = [
  { id: 's-1', name: 'صباحي', startTime: '07:00', endTime: '15:00', branchId: null, isOpen: false, isActive: true },
  { id: 's-2', name: 'مسائي', startTime: '15:00', endTime: '23:00', branchId: null, isOpen: false, isActive: true },
  { id: 's-3', name: 'ليلي', startTime: '23:00', endTime: '07:00', branchId: null, isOpen: false, isActive: true },
  { id: 's-4', name: 'مفتوحة', startTime: '', endTime: '', branchId: null, isOpen: true, isActive: true }
];

const MOCK_ATTENDANCE: AttendanceLog[] = [
  {
    id: 'att-1',
    userId: 'u-5',
    type: 'CheckIn',
    timestamp: new Date().toISOString(),
    lat: 21.4857,
    lng: 39.1924,
    distanceMeters: 15.0,
    isValid: true,
    branchId: 'b-1'
  },
  {
    id: 'att-2',
    userId: 'u-4',
    type: 'CheckIn',
    timestamp: new Date().toISOString(),
    lat: 21.4861,
    lng: 39.1922,
    distanceMeters: 45.0,
    isValid: true,
    branchId: 'b-1'
  },
  {
    id: 'att-3',
    userId: 'u-4',
    type: 'CheckIn',
    timestamp: new Date().toISOString(),
    lat: 21.5122,
    lng: 39.1620,
    distanceMeters: 3500.0,
    isValid: false,
    rejectionReason: 'خارج النطاق الجغرافي للفرع',
    branchId: 'b-1'
  }
];

let localShifts = [...MOCK_SHIFTS];
let localAttendance = [...MOCK_ATTENDANCE];

const hydrateShiftReports = (reports: ShiftReport[]): ShiftReport[] => {
  return reports.map(r => {
    // Find paid damages for the same branch and date (approx date check)
    const reportDate = new Date(r.createdAt).toDateString();
    const paidDamages = localDamageReports.filter(d => 
      d.branchId === r.branchId && 
      d.status === 'Paid' && 
      d.collectedAt && 
      new Date(d.collectedAt).toDateString() === reportDate
    );
    const damageCompensations = paidDamages.reduce((sum, d) => sum + (d.finalValue || 0), 0);
    const remaining = r.grandTotal - damageCompensations;
    const roomRevenue = remaining * 0.75;
    const serviceRevenue = remaining * 0.25;

    return {
      ...r,
      reporter: MOCK_USERS.find(u => u.id === r.reporterId),
      branch: MOCK_BRANCHES.find(b => b.id === r.branchId),
      shift: localShifts.find(s => s.id === r.shiftId) || null,
      damageCompensations,
      roomRevenue,
      serviceRevenue
    };
  });
};

const hydrateAttendance = (logs: AttendanceLog[]): AttendanceLog[] => {
  return logs.map(l => ({
    ...l,
    user: MOCK_USERS.find(u => u.id === l.userId),
    branch: MOCK_BRANCHES.find(b => b.id === l.branchId)
  }));
};

let localShiftReports = [...MOCK_SHIFT_REPORTS];

export const api = {
  getBranches: async (): Promise<Branch[]> => {
    try {
      const res = await fetch(`${BACKEND_URL}/branches`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, using mock branches:', e);
    }
    return MOCK_BRANCHES;
  },

  getUsers: async (): Promise<User[]> => {
    try {
      const res = await fetch(`${BACKEND_URL}/users`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return hydrateUsers(payload.data);
      }
    } catch (e) {
      console.warn('API error, using mock users:', e);
    }
    return hydrateUsers(MOCK_USERS);
  },

  createUser: async (data: any): Promise<User> => {
    try {
      const res = await fetch(`${BACKEND_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, creating local user:', e);
    }

    const newUser: User = {
      id: `u-${Date.now()}`,
      name: data.name,
      role: data.role,
      phoneNumber: data.phoneNumber,
      branchId: data.branchId
    };
    MOCK_USERS.push(newUser);
    return newUser;
  },

  createBranch: async (data: any): Promise<Branch> => {
    try {
      const res = await fetch(`${BACKEND_URL}/branches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, creating local branch:', e);
    }

    const newBranch: Branch = {
      id: `b-${Date.now()}`,
      name: data.name,
      location: data.location || ''
    };
    MOCK_BRANCHES.push(newBranch);
    return newBranch;
  },

  deleteInventoryItem: async (id: string): Promise<void> => {
    try {
      const res = await fetch(`${BACKEND_URL}/inventory/${id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) return;
    } catch (e) {
      console.warn('API error, deleting local inventory item:', e);
    }

    const idx = localInventory.findIndex(i => i.id === id);
    if (idx !== -1) {
      localInventory.splice(idx, 1);
    }
  },

  updateUser: async (id: string, updates: any): Promise<User> => {
    try {
      const res = await fetch(`${BACKEND_URL}/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, updating local user:', e);
    }

    const idx = MOCK_USERS.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('User not found');

    const updated = {
      ...MOCK_USERS[idx],
      ...updates
    };
    MOCK_USERS[idx] = updated;
    return hydrateUsers([updated])[0];
  },

  deleteUser: async (id: string): Promise<void> => {
    try {
      const res = await fetch(`${BACKEND_URL}/users/${id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) return;
    } catch (e) {
      console.warn('API error, deleting local user:', e);
    }

    const idx = MOCK_USERS.findIndex(u => u.id === id);
    if (idx !== -1) {
      MOCK_USERS.splice(idx, 1);
    }
  },

  getUser: async (id: string): Promise<User> => {
    try {
      const res = await fetch(`${BACKEND_URL}/users`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        const users = hydrateUsers(payload.data);
        const user = users.find((u: any) => u.id === id);
        if (user) return user;
      }
    } catch (e) {
      console.warn('API error, getting user locally:', e);
    }
    const user = MOCK_USERS.find(u => u.id === id);
    if (user) return hydrateUsers([user])[0];
    throw new Error('User not found');
  },

  transferBranch: async (userId: string, newBranchId: string, reason?: string): Promise<User> => {
    try {
      const res = await fetch(`${BACKEND_URL}/users/${userId}/transfer-branch`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newBranchId, reason }),
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, transferring user branch locally:', e);
    }
    const idx = MOCK_USERS.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('User not found');
    MOCK_USERS[idx].branchId = newBranchId;
    return hydrateUsers([MOCK_USERS[idx]])[0];
  },

  updateBranch: async (id: string, updates: any): Promise<Branch> => {
    try {
      const res = await fetch(`${BACKEND_URL}/branches/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, updating local branch:', e);
    }

    const idx = MOCK_BRANCHES.findIndex(b => b.id === id);
    if (idx === -1) throw new Error('Branch not found');

    const updated = {
      ...MOCK_BRANCHES[idx],
      ...updates
    };
    MOCK_BRANCHES[idx] = updated;
    return updated;
  },

  deleteBranch: async (id: string): Promise<void> => {
    try {
      const res = await fetch(`${BACKEND_URL}/branches/${id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) return;
    } catch (e) {
      console.warn('API error, deleting local branch:', e);
    }

    const idx = MOCK_BRANCHES.findIndex(b => b.id === id);
    if (idx !== -1) {
      MOCK_BRANCHES.splice(idx, 1);
    }
  },

  getRequests: async (filters?: any): Promise<RequestItem[]> => {
    try {
      let url = `${BACKEND_URL}/requests`;
      if (filters) {
        const params = new URLSearchParams(filters);
        url += `?${params.toString()}`;
      }
      const res = await fetch(url, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, using local requests state:', e);
    }

    let filtered = [...localRequests];
    if (filters) {
      if (filters.status) filtered = filtered.filter(r => r.status === filters.status);
      if (filters.requestType) filtered = filtered.filter(r => r.requestType === filters.requestType);
      if (filters.approvalStatus) filtered = filtered.filter(r => r.approvalStatus === filters.approvalStatus);
    }
    return hydrateRequests(filtered);
  },

  getRequestById: async (id: string): Promise<RequestItem> => {
    try {
      const res = await fetch(`${BACKEND_URL}/requests/${id}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, using local requests:', e);
    }
    const found = localRequests.find(r => r.id === id);
    if (!found) throw new Error('Request not found');
    return hydrateRequests([found])[0];
  },

  updateRequest: async (id: string, updates: any): Promise<RequestItem> => {
    try {
      const res = await fetch(`${BACKEND_URL}/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, updating local state:', e);
    }

    const idx = localRequests.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Request not found');

    const updated = {
      ...localRequests[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (updates.status === RequestStatus.Completed) {
      updated.approvalStatus = ApprovalStatus.Approved;
    }

    localRequests[idx] = updated;
    return hydrateRequests([updated])[0];
  },

  getProcurementThreshold: async (): Promise<{ procurementApprovalThreshold: number }> => {
    return { procurementApprovalThreshold: 5000.0 };
  },

  // Inventory API Client functions [NEW]
  getInventory: async (filters?: any): Promise<InventoryItem[]> => {
    try {
      let url = `${BACKEND_URL}/inventory`;
      if (filters) {
        const params = new URLSearchParams(filters);
        url += `?${params.toString()}`;
      }
      const res = await fetch(url, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, using local inventory state:', e);
    }

    let filtered = [...localInventory];
    if (filters) {
      if (filters.status) filtered = filtered.filter(i => i.status === filters.status);
      if (filters.branchId) filtered = filtered.filter(i => i.branchId === filters.branchId);
      if (filters.category) filtered = filtered.filter(i => i.category === filters.category);
    }
    return hydrateInventory(filtered);
  },

  createInventoryItem: async (data: any): Promise<InventoryItem> => {
    try {
      const res = await fetch(`${BACKEND_URL}/inventory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, creating local inventory item:', e);
    }

    const newItem: InventoryItem = {
      id: `inv-${Date.now()}`,
      name: data.name,
      category: data.category,
      stockLevel: parseInt(data.stockLevel, 10) || 0,
      reorderLevel: parseInt(data.reorderLevel, 10) || 0,
      status: data.status || 'Available',
      branchId: data.branchId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    localInventory.push(newItem);
    return hydrateInventory([newItem])[0];
  },

  updateInventoryItem: async (id: string, updates: any): Promise<InventoryItem> => {
    try {
      const res = await fetch(`${BACKEND_URL}/inventory/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, updating local inventory item:', e);
    }

    const idx = localInventory.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Inventory item not found');

    const updated = {
      ...localInventory[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    if (updates.stockLevel !== undefined) {
      updated.stockLevel = parseInt(updates.stockLevel, 10) || 0;
      if (updated.stockLevel <= 0) {
        updated.status = 'Out_of_Stock';
      } else if (updates.status === undefined) {
        updated.status = 'Available';
      }
    }

    localInventory[idx] = updated;
    return hydrateInventory([updated])[0];
  },

  getShiftReports: async (filters?: any): Promise<ShiftReport[]> => {
    try {
      let url = `${BACKEND_URL}/shift-reports`;
      if (filters) {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
          if (filters[key] !== undefined && filters[key] !== '') {
            params.append(key, filters[key]);
          }
        });
        url += `?${params.toString()}`;
      }
      const res = await fetch(url, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, fetching mock shift reports:', e);
    }
    
    let filtered = [...localShiftReports];
    if (filters) {
      if (filters.branchId) filtered = filtered.filter(r => r.branchId === filters.branchId);
      if (filters.reporterId) filtered = filtered.filter(r => r.reporterId === filters.reporterId);
      if (filters.status) filtered = filtered.filter(r => r.status === filters.status);
    }
    return hydrateShiftReports(filtered);
  },

  getShiftReportById: async (id: string): Promise<ShiftReport> => {
    try {
      const res = await fetch(`${BACKEND_URL}/shift-reports/${id}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, getting shift report by id locally:', e);
    }
    const found = localShiftReports.find(r => r.id === id);
    if (!found) throw new Error('Shift report not found');
    return hydrateShiftReports([found])[0];
  },

  createShiftReport: async (data: any): Promise<ShiftReport> => {
    try {
      const res = await fetch(`${BACKEND_URL}/shift-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, creating local shift report:', e);
    }

    const cashNet = data.cashTotal - data.cashExpenses;
    const grandTotal = cashNet + data.visa + data.mada + data.mastercard + data.gulfNet + data.tabby + data.bankTransfer;

    const newReport: ShiftReport = {
      id: `sr-${Date.now()}`,
      createdAt: new Date().toISOString(),
      reporterId: data.reporterId,
      branchId: data.branchId,
      shiftLabel: data.shiftLabel,
      cashTotal: data.cashTotal,
      cashExpenses: data.cashExpenses,
      cashNet,
      visa: data.visa,
      mada: data.mada,
      mastercard: data.mastercard,
      gulfNet: data.gulfNet,
      tabby: data.tabby,
      bankTransfer: data.bankTransfer,
      grandTotal,
      status: 'PendingAccountant'
    };

    localShiftReports.push(newReport);
    return hydrateShiftReports([newReport])[0];
  },

  updateShiftReport: async (id: string, updates: any): Promise<ShiftReport> => {
    try {
      const res = await fetch(`${BACKEND_URL}/shift-reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, updating local shift report:', e);
    }

    const idx = localShiftReports.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Shift report not found');

    const report = localShiftReports[idx];
    const merged = { ...report, ...updates };

    const cashTotal = merged.cashTotal !== undefined ? merged.cashTotal : report.cashTotal;
    const cashExpenses = merged.cashExpenses !== undefined ? merged.cashExpenses : report.cashExpenses;
    const cashNet = cashTotal - cashExpenses;

    const visa = merged.visa !== undefined ? merged.visa : report.visa;
    const mada = merged.mada !== undefined ? merged.mada : report.mada;
    const mastercard = merged.mastercard !== undefined ? merged.mastercard : report.mastercard;
    const gulfNet = merged.gulfNet !== undefined ? merged.gulfNet : report.gulfNet;
    const tabby = merged.tabby !== undefined ? merged.tabby : report.tabby;
    const bankTransfer = merged.bankTransfer !== undefined ? merged.bankTransfer : report.bankTransfer;

    const grandTotal = cashNet + visa + mada + mastercard + gulfNet + tabby + bankTransfer;

    const updated = {
      ...merged,
      cashNet,
      grandTotal
    };

    localShiftReports[idx] = updated;
    return hydrateShiftReports([updated])[0];
  },

  deleteShiftReport: async (id: string): Promise<void> => {
    try {
      const res = await fetch(`${BACKEND_URL}/shift-reports/${id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) return;
    } catch (e) {
      console.warn('API error, deleting local shift report:', e);
    }

    const idx = localShiftReports.findIndex(r => r.id === id);
    if (idx !== -1) {
      localShiftReports.splice(idx, 1);
    }
  },

  approveShiftReport: async (id: string, reviewerId: string): Promise<ShiftReport> => {
    try {
      const res = await fetch(`${BACKEND_URL}/shift-reports/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerId }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, approving shift report locally:', e);
    }
    
    const idx = localShiftReports.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Shift report not found');
    
    const reviewer = MOCK_USERS.find(u => u.id === reviewerId);
    const reviewerName = reviewer ? reviewer.name : reviewerId;
    
    const updated = {
      ...localShiftReports[idx],
      status: 'Approved',
      reviewedBy: reviewerName,
      reviewedAt: new Date().toISOString()
    };
    localShiftReports[idx] = updated;
    return hydrateShiftReports([updated])[0];
  },

  rejectShiftReport: async (id: string, reviewerId: string, reason: string): Promise<ShiftReport> => {
    try {
      const res = await fetch(`${BACKEND_URL}/shift-reports/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerId, reason }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, rejecting shift report locally:', e);
    }
    
    const idx = localShiftReports.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Shift report not found');
    
    const reviewer = MOCK_USERS.find(u => u.id === reviewerId);
    const reviewerName = reviewer ? reviewer.name : reviewerId;
    
    const updated = {
      ...localShiftReports[idx],
      status: 'Rejected',
      rejectionReason: reason,
      reviewedBy: reviewerName,
      reviewedAt: new Date().toISOString()
    };
    localShiftReports[idx] = updated;
    return hydrateShiftReports([updated])[0];
  },

  getReporterStats: async (reporterId: string, preserveHistory: boolean = true): Promise<any> => {
    try {
      const res = await fetch(`${BACKEND_URL}/shift-reports/stats/${reporterId}?preserveHistory=${preserveHistory}`, {
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, calculating reporter stats locally:', e);
    }

    const user = MOCK_USERS.find(u => u.id === reporterId);
    if (!user) throw new Error('User not found');

    let reports = localShiftReports.filter(r => r.reporterId === reporterId);
    if (!preserveHistory) {
      reports = reports.filter(r => r.branchId === user.branchId);
    }

    const totalSubmitted = reports.length;
    const approved = reports.filter(r => r.status === 'Approved').length;
    const rejected = reports.filter(r => r.status === 'Rejected').length;
    const rejectionRate = totalSubmitted > 0 ? (rejected / totalSubmitted) * 100 : 0;

    return {
      totalSubmitted,
      approved,
      rejected,
      rejectionRate: parseFloat(rejectionRate.toFixed(2))
    };
  },

  transferUserBranch: async (userId: string, newBranchId: string, preserveHistory: boolean): Promise<User> => {
    try {
      const res = await fetch(`${BACKEND_URL}/users/${userId}/transfer-branch`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newBranchId, preserveHistory }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, transferring user branch locally:', e);
    }

    const idx = MOCK_USERS.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error('User not found');

    const updatedUser = {
      ...MOCK_USERS[idx],
      branchId: newBranchId
    };
    MOCK_USERS[idx] = updatedUser;
    return hydrateUsers([updatedUser])[0];
  },

  getShifts: async (branchId?: string): Promise<Shift[]> => {
    try {
      const url = branchId ? `${BACKEND_URL}/shifts/branch/${branchId}` : `${BACKEND_URL}/shifts`;
      const res = await fetch(url, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, fetching shifts locally:', e);
    }
    return localShifts.filter(s => s.isActive && (!branchId || s.branchId === null || s.branchId === branchId));
  },

  createShift: async (data: any): Promise<Shift> => {
    try {
      const res = await fetch(`${BACKEND_URL}/shifts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, creating local shift:', e);
    }
    const newShift: Shift = {
      id: `s-${Date.now()}`,
      name: data.name,
      startTime: data.startTime,
      endTime: data.endTime,
      branchId: data.branchId || null,
      isOpen: data.isOpen || false,
      isActive: true
    };
    localShifts.push(newShift);
    return newShift;
  },

  updateShift: async (id: string, data: any): Promise<Shift> => {
    try {
      const res = await fetch(`${BACKEND_URL}/shifts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, updating local shift:', e);
    }
    const idx = localShifts.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Shift not found');
    const updated = { ...localShifts[idx], ...data };
    localShifts[idx] = updated;
    return updated;
  },

  deleteShift: async (id: string): Promise<void> => {
    try {
      const res = await fetch(`${BACKEND_URL}/shifts/${id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) return;
    } catch (e) {
      console.warn('API error, deleting local shift:', e);
    }
    const idx = localShifts.findIndex(s => s.id === id);
    if (idx !== -1) {
      localShifts[idx].isActive = false; // soft delete
    }
  },

  getTodayAttendance: async (branchId?: string): Promise<AttendanceLog[]> => {
    try {
      const url = branchId ? `${BACKEND_URL}/attendance/today?branchId=${branchId}` : `${BACKEND_URL}/attendance/today`;
      const res = await fetch(url, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, getting today attendance locally:', e);
    }
    let filtered = [...localAttendance];
    if (branchId) {
      filtered = filtered.filter(a => a.branchId === branchId);
    }
    return hydrateAttendance(filtered);
  },

  getEmployeeAttendanceHistory: async (userId: string): Promise<AttendanceLog[]> => {
    try {
      const res = await fetch(`${BACKEND_URL}/attendance/history/${userId}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, getting attendance history locally:', e);
    }
    return hydrateAttendance(localAttendance.filter(a => a.userId === userId));
  },

  getAttendanceSummary: async (): Promise<any> => {
    try {
      const res = await fetch(`${BACKEND_URL}/attendance/summary`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, getting attendance summary locally:', e);
    }
    const presentUserIds = new Set(localAttendance.filter(a => a.type === 'CheckIn' && a.isValid).map(a => a.userId));
    const outOfRangeCount = localAttendance.filter(a => !a.isValid).length;
    const totalEmployees = MOCK_USERS.length;
    const presentCount = presentUserIds.size;
    const absentCount = totalEmployees - presentCount;

    const branchSummaries = MOCK_BRANCHES.map(b => {
      const branchUsers = MOCK_USERS.filter(u => u.branchId === b.id);
      const present = branchUsers.filter(u => presentUserIds.has(u.id)).length;
      return {
        branchId: b.id,
        branchName: b.name,
        present,
        absent: branchUsers.length - present
      };
    });

    return {
      presentCount,
      absentCount,
      outOfRangeCount,
      totalEmployees,
      branchSummaries
    };
  },

  recordAttendanceCheckIn: async (userId: string, lat: number, lng: number): Promise<any> => {
    try {
      const res = await fetch(`${BACKEND_URL}/attendance/check-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, lat, lng }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, check-in locally:', e);
    }
    const user = MOCK_USERS.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    const branch = MOCK_BRANCHES.find(b => b.id === user.branchId);
    if (!branch) throw new Error('Branch not found');

    const bLat = branch.lat || 21.4858;
    const bLng = branch.lng || 39.1925;
    
    const dy = (lat - bLat) * 111000;
    const dx = (lng - bLng) * 111000 * Math.cos(bLat * Math.PI / 180);
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radiusLimit = branch.radiusMeters || 200;
    const isValid = distance <= radiusLimit;

    const newLog: AttendanceLog = {
      id: `att-${Date.now()}`,
      userId,
      branchId: branch.id,
      type: 'CheckIn',
      timestamp: new Date().toISOString(),
      lat,
      lng,
      distanceMeters: distance,
      isValid,
      rejectionReason: isValid ? null : 'خارج النطاق الجغرافي للفرع'
    };
    localAttendance.push(newLog);
    return {
      log: newLog,
      isValid,
      branchName: branch.name,
      distanceMeters: distance,
      radiusLimit,
      timestamp: newLog.timestamp
    };
  },

  recordAttendanceCheckOut: async (userId: string, lat: number, lng: number): Promise<any> => {
    try {
      const res = await fetch(`${BACKEND_URL}/attendance/check-out`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, lat, lng }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, check-out locally:', e);
    }
    const user = MOCK_USERS.find(u => u.id === userId);
    if (!user) throw new Error('User not found');
    const branch = MOCK_BRANCHES.find(b => b.id === user.branchId);
    if (!branch) throw new Error('Branch not found');

    const bLat = branch.lat || 21.4858;
    const bLng = branch.lng || 39.1925;
    
    const dy = (lat - bLat) * 111000;
    const dx = (lng - bLng) * 111000 * Math.cos(bLat * Math.PI / 180);
    const distance = Math.sqrt(dx * dx + dy * dy);
    const radiusLimit = branch.radiusMeters || 200;
    const isValid = distance <= radiusLimit;

    const newLog: AttendanceLog = {
      id: `att-${Date.now()}`,
      userId,
      branchId: branch.id,
      type: 'CheckOut',
      timestamp: new Date().toISOString(),
      lat,
      lng,
      distanceMeters: distance,
      isValid,
      rejectionReason: isValid ? null : 'خارج النطاق الجغرافي للفرع'
    };
    localAttendance.push(newLog);
    return {
      log: newLog,
      isValid,
      branchName: branch.name,
      distanceMeters: distance,
      radiusLimit,
      timestamp: newLog.timestamp
    };
  },

  getLoanRequests: async (filters?: { status?: string; userId?: string }): Promise<LoanRequest[]> => {
    try {
      const q = new URLSearchParams();
      if (filters?.status) q.append('status', filters.status);
      if (filters?.userId) q.append('userId', filters.userId);
      const res = await fetch(`${BACKEND_URL}/loans?${q.toString()}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, getting loans locally:', e);
    }
    let filtered = localLoans;
    if (filters?.status) filtered = filtered.filter(l => l.status === filters.status);
    if (filters?.userId) filtered = filtered.filter(l => l.userId === filters.userId);
    return hydrateLoans(filtered);
  },

  createLoanRequest: async (data: { userId: string; amount: number; reason: string; repaymentMonths?: number }): Promise<LoanRequest> => {
    try {
      const res = await fetch(`${BACKEND_URL}/loans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, creating loan locally:', e);
    }
    const newLoan: LoanRequest = {
      id: `loan-${Date.now()}`,
      userId: data.userId,
      amount: data.amount,
      reason: data.reason,
      repaymentMonths: data.repaymentMonths || 1,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    localLoans.push(newLoan);
    return hydrateLoans([newLoan])[0];
  },

  reviewLoanRequest: async (id: string, reviewerId: string, status: string, reviewNote?: string): Promise<LoanRequest> => {
    try {
      const res = await fetch(`${BACKEND_URL}/loans/${id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerId, status, reviewNote }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, reviewing loan locally:', e);
    }
    const index = localLoans.findIndex(l => l.id === id);
    if (index !== -1) {
      localLoans[index] = {
        ...localLoans[index],
        status,
        reviewedBy: reviewerId,
        reviewNote: reviewNote || null,
        reviewedAt: new Date().toISOString()
      };
      return hydrateLoans([localLoans[index]])[0];
    }
    throw new Error('Loan not found');
  },

  getEmployeeLoanHistory: async (userId: string): Promise<LoanRequest[]> => {
    try {
      const res = await fetch(`${BACKEND_URL}/loans/user/${userId}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, getting loan history locally:', e);
    }
    return hydrateLoans(localLoans.filter(l => l.userId === userId));
  },

  getLeaveRequests: async (filters?: { status?: string; userId?: string; leaveType?: string }): Promise<LeaveRequest[]> => {
    try {
      const q = new URLSearchParams();
      if (filters?.status) q.append('status', filters.status);
      if (filters?.userId) q.append('userId', filters.userId);
      if (filters?.leaveType) q.append('leaveType', filters.leaveType);
      const res = await fetch(`${BACKEND_URL}/leaves?${q.toString()}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, getting leaves locally:', e);
    }
    let filtered = localLeaves;
    if (filters?.status) filtered = filtered.filter(l => l.status === filters.status);
    if (filters?.userId) filtered = filtered.filter(l => l.userId === filters.userId);
    if (filters?.leaveType) filtered = filtered.filter(l => l.leaveType === filters.leaveType);
    return hydrateLeaves(filtered);
  },

  createLeaveRequest: async (data: { userId: string; leaveType: string; startDate: string; endDate: string; reason: string }): Promise<LeaveRequest> => {
    try {
      const res = await fetch(`${BACKEND_URL}/leaves`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, creating leave locally:', e);
    }
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    const daysCount = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
    const newLeave: LeaveRequest = {
      id: `leave-${Date.now()}`,
      userId: data.userId,
      leaveType: data.leaveType,
      startDate: data.startDate,
      endDate: data.endDate,
      daysCount,
      reason: data.reason,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    localLeaves.push(newLeave);
    return hydrateLeaves([newLeave])[0];
  },

  reviewLeaveRequest: async (id: string, reviewerId: string, status: string, reviewNote?: string): Promise<LeaveRequest> => {
    try {
      const res = await fetch(`${BACKEND_URL}/leaves/${id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerId, status, reviewNote }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, reviewing leave locally:', e);
    }
    const index = localLeaves.findIndex(l => l.id === id);
    if (index !== -1) {
      localLeaves[index] = {
        ...localLeaves[index],
        status,
        reviewedBy: reviewerId,
        reviewNote: reviewNote || null,
        reviewedAt: new Date().toISOString()
      };
      return hydrateLeaves([localLeaves[index]])[0];
    }
    throw new Error('Leave not found');
  },

  getLeaveBalance: async (userId: string): Promise<any> => {
    try {
      const res = await fetch(`${BACKEND_URL}/leaves/balance/${userId}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, getting leave balance locally:', e);
    }
    if (userId === 'u-5') {
      return { annualLeaveBalance: 21, sickLeaveBalance: 12 };
    }
    return { annualLeaveBalance: 21, sickLeaveBalance: 14 };
  },

  adjustLeaveBalance: async (userId: string, data: { annualLeaveBalance: number; sickLeaveBalance: number }): Promise<any> => {
    try {
      const res = await fetch(`${BACKEND_URL}/leaves/balance/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, adjusting leave balance locally:', e);
    }
    return { userId, ...data };
  },

  getMaintenanceRequests: async (filters?: {
    status?: string;
    branchId?: string;
    assignedTo?: string;
    category?: string;
    priority?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<MaintenanceRequest[]> => {
    try {
      const q = new URLSearchParams();
      if (filters?.status) q.append('status', filters.status);
      if (filters?.branchId) q.append('branchId', filters.branchId);
      if (filters?.assignedTo) q.append('assignedTo', filters.assignedTo);
      if (filters?.category) q.append('category', filters.category);
      if (filters?.priority) q.append('priority', filters.priority);
      if (filters?.dateFrom) q.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) q.append('dateTo', filters.dateTo);

      const res = await fetch(`${BACKEND_URL}/maintenance?${q.toString()}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, getting maintenance requests locally:', e);
    }
    
    // Local filtering
    let filtered = localMaintenanceRequests;
    if (filters?.status) filtered = filtered.filter(r => r.status === filters.status);
    if (filters?.branchId) filtered = filtered.filter(r => r.branchId === filters.branchId);
    if (filters?.assignedTo) filtered = filtered.filter(r => r.assignedTo === filters.assignedTo);
    if (filters?.category) filtered = filtered.filter(r => r.category === filters.category);
    if (filters?.priority) filtered = filtered.filter(r => r.priority === filters.priority);
    if (filters?.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(r => new Date(r.createdAt) >= fromDate);
    }
    if (filters?.dateTo) {
      const toDate = new Date(filters.dateTo);
      filtered = filtered.filter(r => new Date(r.createdAt) <= toDate);
    }
    return hydrateMaintenanceRequests(filtered);
  },

  getMaintenanceStats: async (): Promise<any> => {
    try {
      const res = await fetch(`${BACKEND_URL}/maintenance/stats`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, getting stats locally:', e);
    }

    const all = localMaintenanceRequests;
    const total = all.length;
    const byStatus: { [key: string]: number } = {};
    const byCategory: { [key: string]: number } = {};
    const byBranch: { [key: string]: number } = {};

    all.forEach(req => {
      byStatus[req.status] = (byStatus[req.status] || 0) + 1;
      byCategory[req.category] = (byCategory[req.category] || 0) + 1;
      const branchName = req.branchId === 'b-2' ? 'Beachside Resort Branch' : 'Sail Road Branch';
      byBranch[branchName] = (byBranch[branchName] || 0) + 1;
    });

    const closed = all.filter(r => r.status === 'Closed' && r.closedAt);
    let avgResolutionHours = 0;
    if (closed.length > 0) {
      const totalMs = closed.reduce((sum, req) => {
        return sum + (new Date(req.closedAt!).getTime() - new Date(req.createdAt).getTime());
      }, 0);
      avgResolutionHours = totalMs / (1000 * 60 * 60 * closed.length);
    }

    return {
      total,
      byStatus,
      byCategory,
      byBranch,
      avgResolutionHours
    };
  },

  getMaintenanceById: async (id: string): Promise<MaintenanceRequest> => {
    try {
      const res = await fetch(`${BACKEND_URL}/maintenance/${id}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, getting request by id locally:', e);
    }
    const found = localMaintenanceRequests.find(r => r.id === id);
    if (!found) throw new Error('Maintenance request not found');
    return hydrateMaintenanceRequests([found])[0];
  },

  createMaintenanceRequest: async (data: {
    reportedBy: string;
    branchId: string;
    category: string;
    location: string;
    description: string;
    priority?: string;
    photoUrl?: string;
  }): Promise<MaintenanceRequest> => {
    try {
      const res = await fetch(`${BACKEND_URL}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, creating request locally:', e);
    }

    const ticketNumber = `MNT-2026-${String(localMaintenanceRequests.length + 1).padStart(4, '0')}`;
    const newRequest: MaintenanceRequest = {
      id: `mnt-${Date.now()}`,
      ticketNumber,
      reportedBy: data.reportedBy,
      branchId: data.branchId,
      category: data.category,
      location: data.location,
      description: data.description,
      priority: data.priority || 'Normal',
      photoUrl: data.photoUrl || null,
      status: 'New',
      rejectionCount: 0,
      sparePartsNeeded: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          id: `timeline-${Date.now()}`,
          requestId: `mnt-${Date.now()}`,
          action: 'Created',
          performedBy: data.reportedBy,
          note: 'تم إنشاء بلاغ الصيانة الجديد بنجاح.',
          createdAt: new Date().toISOString()
        }
      ]
    };
    localMaintenanceRequests.push(newRequest);
    return hydrateMaintenanceRequests([newRequest])[0];
  },

  assignTechnician: async (id: string, technicianId: string, supervisorId?: string): Promise<MaintenanceRequest> => {
    const sId = supervisorId || 'u-9'; // Default to Omar Maintenance
    try {
      const res = await fetch(`${BACKEND_URL}/maintenance/${id}/assign`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technicianId, supervisorId: sId }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, assigning technician locally:', e);
    }

    const index = localMaintenanceRequests.findIndex(r => r.id === id);
    if (index !== -1) {
      const req = localMaintenanceRequests[index];
      const tech = MOCK_USERS.find(u => u.id === technicianId);
      const updated: MaintenanceRequest = {
        ...req,
        status: 'AssignedToTechnician',
        assignedTo: technicianId,
        assignedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeline: [
          ...(req.timeline || []),
          {
            id: `timeline-${Date.now()}`,
            requestId: id,
            action: 'Assigned',
            performedBy: sId,
            note: `تم تعيين الفني ${tech ? tech.name : ''} لمباشرة العطل.`,
            createdAt: new Date().toISOString()
          }
        ]
      };
      localMaintenanceRequests[index] = updated;
      return hydrateMaintenanceRequests([updated])[0];
    }
    throw new Error('Request not found');
  },

  startWork: async (id: string, technicianId?: string): Promise<MaintenanceRequest> => {
    const tId = technicianId || 'u-7';
    try {
      const res = await fetch(`${BACKEND_URL}/maintenance/${id}/start`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technicianId: tId }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, starting work locally:', e);
    }

    const index = localMaintenanceRequests.findIndex(r => r.id === id);
    if (index !== -1) {
      const req = localMaintenanceRequests[index];
      const updated: MaintenanceRequest = {
        ...req,
        status: 'InProgress',
        updatedAt: new Date().toISOString(),
        timeline: [
          ...(req.timeline || []),
          {
            id: `timeline-${Date.now()}`,
            requestId: id,
            action: 'Started',
            performedBy: tId,
            note: 'بدأ الفني العمل الميداني على إصلاح العطل.',
            createdAt: new Date().toISOString()
          }
        ]
      };
      localMaintenanceRequests[index] = updated;
      return hydrateMaintenanceRequests([updated])[0];
    }
    throw new Error('Request not found');
  },

  submitCompletion: async (id: string, note: string, photoUrl?: string, technicianId?: string): Promise<MaintenanceRequest> => {
    const tId = technicianId || 'u-7';
    try {
      const res = await fetch(`${BACKEND_URL}/maintenance/${id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technicianId: tId, completionNote: note, completionPhotoUrl: photoUrl }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, submitting completion locally:', e);
    }

    const index = localMaintenanceRequests.findIndex(r => r.id === id);
    if (index !== -1) {
      const req = localMaintenanceRequests[index];
      const updated: MaintenanceRequest = {
        ...req,
        status: 'PendingInternalApproval',
        completionNote: note,
        completionPhotoUrl: photoUrl || null,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeline: [
          ...(req.timeline || []),
          {
            id: `timeline-${Date.now()}`,
            requestId: id,
            action: 'CompletionSubmitted',
            performedBy: tId,
            note,
            photoUrl: photoUrl || null,
            createdAt: new Date().toISOString()
          }
        ]
      };
      localMaintenanceRequests[index] = updated;
      return hydrateMaintenanceRequests([updated])[0];
    }
    throw new Error('Request not found');
  },

  approveCompletion: async (id: string, note?: string, approverId?: string): Promise<MaintenanceRequest> => {
    const aId = approverId || 'u-10'; // default Branch Manager
    try {
      const res = await fetch(`${BACKEND_URL}/maintenance/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approverId: aId, supervisorNote: note }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, approving completion locally:', e);
    }

    const index = localMaintenanceRequests.findIndex(r => r.id === id);
    if (index !== -1) {
      const req = localMaintenanceRequests[index];
      const updated: MaintenanceRequest = {
        ...req,
        status: 'Closed',
        closedAt: new Date().toISOString(),
        closedBy: aId,
        supervisorNote: note || null,
        updatedAt: new Date().toISOString(),
        timeline: [
          ...(req.timeline || []),
          {
            id: `timeline-${Date.now()}`,
            requestId: id,
            action: 'Closed',
            performedBy: aId,
            note: note || 'تم تأكيد وإغلاق بلاغ الصيانة بنجاح.',
            createdAt: new Date().toISOString()
          }
        ]
      };
      localMaintenanceRequests[index] = updated;
      return hydrateMaintenanceRequests([updated])[0];
    }
    throw new Error('Request not found');
  },

  rejectCompletion: async (id: string, reason: string, approverId?: string): Promise<MaintenanceRequest> => {
    const aId = approverId || 'u-10';
    try {
      const res = await fetch(`${BACKEND_URL}/maintenance/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approverId: aId, rejectionReason: reason }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, rejecting completion locally:', e);
    }

    const index = localMaintenanceRequests.findIndex(r => r.id === id);
    if (index !== -1) {
      const req = localMaintenanceRequests[index];
      const updated: MaintenanceRequest = {
        ...req,
        status: 'Rejected',
        rejectionReason: reason,
        rejectionCount: req.rejectionCount + 1,
        updatedAt: new Date().toISOString(),
        timeline: [
          ...(req.timeline || []),
          {
            id: `timeline-${Date.now()}`,
            requestId: id,
            action: 'Rejected',
            performedBy: aId,
            note: reason,
            createdAt: new Date().toISOString()
          }
        ]
      };
      localMaintenanceRequests[index] = updated;
      return hydrateMaintenanceRequests([updated])[0];
    }
    throw new Error('Request not found');
  },

  requestSpareParts: async (id: string, description: string, technicianId?: string): Promise<MaintenanceRequest> => {
    const tId = technicianId || 'u-7';
    try {
      const res = await fetch(`${BACKEND_URL}/maintenance/${id}/spare-parts`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ technicianId: tId, description }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, requesting spare parts locally:', e);
    }

    const index = localMaintenanceRequests.findIndex(r => r.id === id);
    if (index !== -1) {
      const req = localMaintenanceRequests[index];
      const updated: MaintenanceRequest = {
        ...req,
        status: 'SpareParts',
        sparePartsNeeded: true,
        updatedAt: new Date().toISOString(),
        timeline: [
          ...(req.timeline || []),
          {
            id: `timeline-${Date.now()}`,
            requestId: id,
            action: 'SparePartsRequested',
            performedBy: tId,
            note: `طلب قطع غيار: ${description}`,
            createdAt: new Date().toISOString()
          }
        ]
      };
      localMaintenanceRequests[index] = updated;
      return hydrateMaintenanceRequests([updated])[0];
    }
    throw new Error('Request not found');
  },

  resumeAfterParts: async (id: string, supervisorId?: string): Promise<MaintenanceRequest> => {
    const sId = supervisorId || 'u-9';
    try {
      const res = await fetch(`${BACKEND_URL}/maintenance/${id}/resume`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supervisorId: sId }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, resuming after parts locally:', e);
    }

    const index = localMaintenanceRequests.findIndex(r => r.id === id);
    if (index !== -1) {
      const req = localMaintenanceRequests[index];
      const updated: MaintenanceRequest = {
        ...req,
        status: 'InProgress',
        sparePartsNeeded: false,
        updatedAt: new Date().toISOString(),
        timeline: [
          ...(req.timeline || []),
          {
            id: `timeline-${Date.now()}`,
            requestId: id,
            action: 'Started',
            performedBy: sId,
            note: 'تم استئناف العمل على البلاغ بعد توفر قطع الغيار اللازمة.',
            createdAt: new Date().toISOString()
          }
        ]
      };
      localMaintenanceRequests[index] = updated;
      return hydrateMaintenanceRequests([updated])[0];
    }
    throw new Error('Request not found');
  },

  getTechnicianWorkload: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${BACKEND_URL}/maintenance/workload`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, getting workloads locally:', e);
    }

    const techs = MOCK_USERS.filter(u => u.role === Role.Technician);
    return techs.map(t => {
      const count = localMaintenanceRequests.filter(r =>
        r.assignedTo === t.id &&
        ['AssignedToTechnician', 'InProgress', 'SpareParts', 'Rejected'].includes(r.status)
      ).length;
      return {
        id: t.id,
        name: t.name,
        phoneNumber: t.phoneNumber,
        isAvailable: count === 0,
        openTicketsCount: count
      };
    });
  },

  getWarehouseCategories: async (): Promise<ItemCategory[]> => {
    try {
      const res = await fetch(`${BACKEND_URL}/warehouse/categories`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, using mock warehouse categories:', e);
    }
    return localItemCategories;
  },

  getWarehouseItems: async (filters?: { categoryId?: string; search?: string }): Promise<Item[]> => {
    try {
      const q = new URLSearchParams();
      if (filters?.categoryId) q.append('categoryId', filters.categoryId);
      if (filters?.search) q.append('search', filters.search);
      const res = await fetch(`${BACKEND_URL}/warehouse/items?${q.toString()}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, using mock warehouse items:', e);
    }
    let filtered = [...localItems];
    if (filters?.categoryId) {
      filtered = filtered.filter(i => i.categoryId === filters.categoryId);
    }
    if (filters?.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter(i => i.name.toLowerCase().includes(s));
    }
    return hydrateItems(filtered);
  },

  createWarehouseItem: async (data: { name: string; unit: string; categoryId: string; description?: string }): Promise<Item> => {
    try {
      const res = await fetch(`${BACKEND_URL}/warehouse/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, creating local warehouse item:', e);
    }
    const newItem: Item = {
      id: `item-${Date.now()}`,
      name: data.name,
      unit: data.unit,
      categoryId: data.categoryId,
      description: data.description || null,
      createdAt: new Date().toISOString()
    };
    localItems.push(newItem);
    MOCK_BRANCHES.forEach(b => {
      localStockEntries.push({
        id: `se-${Date.now()}-${b.id}`,
        itemId: newItem.id,
        branchId: b.id,
        quantity: 0,
        minThreshold: 5,
        maxCapacity: 100
      });
    });
    return hydrateItems([newItem])[0];
  },

  updateWarehouseItem: async (id: string, data: { name?: string; unit?: string; categoryId?: string; description?: string }): Promise<Item> => {
    try {
      const res = await fetch(`${BACKEND_URL}/warehouse/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, updating local warehouse item:', e);
    }
    const idx = localItems.findIndex(i => i.id === id);
    if (idx === -1) throw new Error('Item not found');
    localItems[idx] = { ...localItems[idx], ...data };
    return hydrateItems([localItems[idx]])[0];
  },

  getBranchStock: async (branchId: string): Promise<StockEntry[]> => {
    try {
      const res = await fetch(`${BACKEND_URL}/warehouse/stock/${branchId}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, using mock stock entries:', e);
    }
    return hydrateStockEntries(localStockEntries.filter(e => e.branchId === branchId));
  },

  adjustStock: async (data: { itemId: string; branchId: string; quantity: number; type: 'In' | 'Out' | 'Transfer' | 'Adjustment'; reason: string; performedBy: string; note?: string; referenceId?: string }): Promise<StockEntry> => {
    try {
      const res = await fetch(`${BACKEND_URL}/warehouse/stock/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, adjusting local stock:', e);
    }
    const entryIdx = localStockEntries.findIndex(e => e.itemId === data.itemId && e.branchId === data.branchId);
    if (entryIdx === -1) throw new Error('Stock entry not found');
    
    const qtyChange = data.type === 'Out' ? -Math.abs(data.quantity) : Math.abs(data.quantity);
    localStockEntries[entryIdx].quantity = Math.max(0, localStockEntries[entryIdx].quantity + qtyChange);
    
    const newMovement: StockMovement = {
      id: `sm-${Date.now()}`,
      itemId: data.itemId,
      branchId: data.branchId,
      type: data.type,
      quantity: qtyChange,
      reason: data.reason,
      performedBy: data.performedBy,
      note: data.note || null,
      referenceId: data.referenceId || null,
      createdAt: new Date().toISOString()
    };
    localStockMovements.push(newMovement);

    const entry = localStockEntries[entryIdx];
    if (entry.quantity <= entry.minThreshold) {
      const activeProc = localProcurements.find(p => p.itemId === entry.itemId && p.branchId === entry.branchId && p.status !== 'Received');
      if (!activeProc) {
        const item = localItems.find(i => i.id === entry.itemId);
        const ticketNumber = `PRO-2026-${String(localProcurements.length + 1).padStart(4, '0')}`;
        localProcurements.push({
          id: `pro-${Date.now()}`,
          ticketNumber,
          requestedBy: data.performedBy,
          branchId: data.branchId,
          itemId: entry.itemId,
          itemName: item ? item.name : 'صنف مخزني',
          quantityNeeded: entry.maxCapacity - entry.quantity,
          unit: item ? item.unit : 'قطعة',
          source: 'LowStock',
          status: 'Pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
    }

    return hydrateStockEntries([localStockEntries[entryIdx]])[0];
  },

  getWarehouseRequests: async (filters?: { status?: string; branchId?: string; itemId?: string }): Promise<WarehouseRequest[]> => {
    try {
      const q = new URLSearchParams();
      if (filters?.status) q.append('status', filters.status);
      if (filters?.branchId) q.append('branchId', filters.branchId);
      if (filters?.itemId) q.append('itemId', filters.itemId);
      const res = await fetch(`${BACKEND_URL}/warehouse/requests?${q.toString()}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, using mock warehouse requests:', e);
    }
    let filtered = [...localWarehouseRequests];
    if (filters?.status) filtered = filtered.filter(r => r.status === filters.status);
    if (filters?.branchId) filtered = filtered.filter(r => r.branchId === filters.branchId);
    if (filters?.itemId) filtered = filtered.filter(r => r.itemId === filters.itemId);
    return hydrateWarehouseRequests(filtered);
  },

  createWarehouseRequest: async (data: { requestedBy: string; branchId: string; itemId: string; quantityRequested: number; purpose?: string }): Promise<WarehouseRequest> => {
    try {
      const res = await fetch(`${BACKEND_URL}/warehouse/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, creating local warehouse request:', e);
    }
    const ticketNumber = `WHR-2026-${String(localWarehouseRequests.length + 1).padStart(4, '0')}`;
    const newRequest: WarehouseRequest = {
      id: `whr-${Date.now()}`,
      ticketNumber,
      requestedBy: data.requestedBy,
      branchId: data.branchId,
      itemId: data.itemId,
      quantityRequested: data.quantityRequested,
      quantityIssued: 0,
      status: 'Pending',
      purpose: data.purpose || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localWarehouseRequests.push(newRequest);
    return hydrateWarehouseRequests([newRequest])[0];
  },

  approveWarehouseRequest: async (id: string, approverId: string, quantityIssued: number): Promise<WarehouseRequest> => {
    try {
      const res = await fetch(`${BACKEND_URL}/warehouse/requests/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approverId, quantityIssued }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, approving local warehouse request:', e);
    }
    const idx = localWarehouseRequests.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Warehouse request not found');
    const req = localWarehouseRequests[idx];
    const status = quantityIssued < req.quantityRequested ? 'PartiallyApproved' : 'Approved';
    
    localWarehouseRequests[idx] = {
      ...req,
      status,
      quantityIssued,
      approvedBy: approverId,
      updatedAt: new Date().toISOString()
    };

    const entryIdx = localStockEntries.findIndex(e => e.itemId === req.itemId && e.branchId === req.branchId);
    if (entryIdx !== -1) {
      localStockEntries[entryIdx].quantity = Math.max(0, localStockEntries[entryIdx].quantity - quantityIssued);
      
      localStockMovements.push({
        id: `sm-${Date.now()}`,
        itemId: req.itemId,
        branchId: req.branchId,
        type: 'Out',
        quantity: -quantityIssued,
        reason: 'EmployeeRequest',
        referenceId: id,
        performedBy: approverId,
        createdAt: new Date().toISOString()
      });

      const entry = localStockEntries[entryIdx];
      if (entry.quantity <= entry.minThreshold) {
        const activeProc = localProcurements.find(p => p.itemId === entry.itemId && p.branchId === entry.branchId && p.status !== 'Received');
        if (!activeProc) {
          const item = localItems.find(i => i.id === entry.itemId);
          const ticketNumber = `PRO-2026-${String(localProcurements.length + 1).padStart(4, '0')}`;
          localProcurements.push({
            id: `pro-${Date.now()}`,
            ticketNumber,
            requestedBy: approverId,
            branchId: req.branchId,
            itemId: entry.itemId,
            itemName: item ? item.name : 'صنف مخزني',
            quantityNeeded: entry.maxCapacity - entry.quantity,
            unit: item ? item.unit : 'قطعة',
            source: 'LowStock',
            status: 'Pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      }
    }

    return hydrateWarehouseRequests([localWarehouseRequests[idx]])[0];
  },

  rejectWarehouseRequest: async (id: string, approverId: string, rejectionReason: string): Promise<WarehouseRequest> => {
    try {
      const res = await fetch(`${BACKEND_URL}/warehouse/requests/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approverId, rejectionReason }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, rejecting local warehouse request:', e);
    }
    const idx = localWarehouseRequests.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Warehouse request not found');
    localWarehouseRequests[idx] = {
      ...localWarehouseRequests[idx],
      status: 'Rejected',
      approvedBy: approverId,
      rejectionReason,
      updatedAt: new Date().toISOString()
    };
    return hydrateWarehouseRequests([localWarehouseRequests[idx]])[0];
  },

  getWarehouseStats: async (branchId?: string): Promise<any> => {
    try {
      const q = branchId ? `?branchId=${branchId}` : '';
      const res = await fetch(`${BACKEND_URL}/warehouse/stats${q}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, getting local warehouse stats:', e);
    }
    
    const entries = branchId ? localStockEntries.filter(e => e.branchId === branchId) : localStockEntries;
    const totalItems = entries.length;
    const lowStockItems = entries.filter(e => e.quantity <= e.minThreshold).length;
    const outOfStockItems = entries.filter(e => e.quantity === 0).length;
    
    const reqs = branchId ? localWarehouseRequests.filter(r => r.branchId === branchId) : localWarehouseRequests;
    const pendingRequests = reqs.filter(r => r.status === 'Pending').length;

    return {
      totalItems,
      lowStockItems,
      outOfStockItems,
      pendingRequests
    };
  },

  getProcurements: async (filters?: { status?: string; branchId?: string; source?: string }): Promise<ProcurementRequest[]> => {
    try {
      const q = new URLSearchParams();
      if (filters?.status) q.append('status', filters.status);
      if (filters?.branchId) q.append('branchId', filters.branchId);
      if (filters?.source) q.append('source', filters.source);
      const res = await fetch(`${BACKEND_URL}/warehouse/procurement?${q.toString()}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, using mock procurements:', e);
    }
    let filtered = [...localProcurements];
    if (filters?.status) filtered = filtered.filter(p => p.status === filters.status);
    if (filters?.branchId) filtered = filtered.filter(p => p.branchId === filters.branchId);
    if (filters?.source) filtered = filtered.filter(p => p.source === filters.source);
    return hydrateProcurements(filtered);
  },

  getProcurementById: async (id: string): Promise<ProcurementRequest> => {
    try {
      const res = await fetch(`${BACKEND_URL}/warehouse/procurement/${id}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, using local procurement by id:', e);
    }
    const found = localProcurements.find(p => p.id === id);
    if (!found) throw new Error('Procurement request not found');
    return hydrateProcurements([found])[0];
  },

  reviewProcurement: async (id: string, data: { reviewerId: string; note?: string; estimatedPrice: number; supplierId: string; paymentMethod: string }): Promise<ProcurementRequest> => {
    try {
      const res = await fetch(`${BACKEND_URL}/warehouse/procurement/${id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, reviewing local procurement:', e);
    }
    const idx = localProcurements.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Procurement request not found');
    localProcurements[idx] = {
      ...localProcurements[idx],
      status: 'ReviewedByProcurement',
      reviewedBy: data.reviewerId,
      estimatedPrice: data.estimatedPrice,
      supplierId: data.supplierId,
      paymentMethod: data.paymentMethod,
      procurementNote: data.note || null,
      updatedAt: new Date().toISOString()
    };
    return hydrateProcurements([localProcurements[idx]])[0];
  },

  financiallyApproveProcurement: async (id: string, approverId: string, note?: string): Promise<ProcurementRequest> => {
    try {
      const res = await fetch(`${BACKEND_URL}/warehouse/procurement/${id}/approve`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approverId, note }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, approving local procurement:', e);
    }
    const idx = localProcurements.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Procurement request not found');
    localProcurements[idx] = {
      ...localProcurements[idx],
      status: 'FinanciallyApproved',
      approvedBy: approverId,
      financialNote: note || null,
      updatedAt: new Date().toISOString()
    };
    return hydrateProcurements([localProcurements[idx]])[0];
  },

  rejectProcurement: async (id: string, approverId: string, reason: string): Promise<ProcurementRequest> => {
    try {
      const res = await fetch(`${BACKEND_URL}/warehouse/procurement/${id}/reject`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approverId, reason }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, rejecting local procurement:', e);
    }
    const idx = localProcurements.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Procurement request not found');
    localProcurements[idx] = {
      ...localProcurements[idx],
      status: 'Rejected',
      approvedBy: approverId,
      rejectionReason: reason,
      updatedAt: new Date().toISOString()
    };
    return hydrateProcurements([localProcurements[idx]])[0];
  },

  markPurchased: async (id: string, data: { purchaserId: string; actualPrice: number; paymentMethod: string; receiptPhotoUrl?: string }): Promise<ProcurementRequest> => {
    try {
      const res = await fetch(`${BACKEND_URL}/warehouse/procurement/${id}/purchased`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, purchasing local procurement:', e);
    }
    const idx = localProcurements.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Procurement request not found');
    localProcurements[idx] = {
      ...localProcurements[idx],
      status: 'Purchased',
      purchasedBy: data.purchaserId,
      actualPrice: data.actualPrice,
      paymentMethod: data.paymentMethod,
      receiptPhotoUrl: data.receiptPhotoUrl || null,
      updatedAt: new Date().toISOString()
    };
    return hydrateProcurements([localProcurements[idx]])[0];
  },

  receiveInWarehouse: async (id: string, receiverId: string, quantityReceived: number): Promise<ProcurementRequest> => {
    try {
      const res = await fetch(`${BACKEND_URL}/warehouse/procurement/${id}/receive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, quantityReceived }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, receiving local procurement:', e);
    }
    const idx = localProcurements.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Procurement request not found');
    const proc = localProcurements[idx];
    localProcurements[idx] = {
      ...proc,
      status: 'Received',
      updatedAt: new Date().toISOString()
    };

    if (proc.itemId) {
      const entryIdx = localStockEntries.findIndex(e => e.itemId === proc.itemId && e.branchId === proc.branchId);
      if (entryIdx !== -1) {
        localStockEntries[entryIdx].quantity += quantityReceived;
        
        localStockMovements.push({
          id: `sm-${Date.now()}`,
          itemId: proc.itemId,
          branchId: proc.branchId,
          type: 'In',
          quantity: quantityReceived,
          reason: 'SupplierDelivery',
          referenceId: id,
          performedBy: receiverId,
          createdAt: new Date().toISOString()
        });
      }
    }

    return hydrateProcurements([localProcurements[idx]])[0];
  },

  getSuppliers: async (): Promise<Supplier[]> => {
    try {
      const res = await fetch(`${BACKEND_URL}/warehouse/suppliers`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, using mock suppliers:', e);
    }
    return localSuppliers;
  },

  createSupplier: async (data: { name: string; contactName?: string; phone?: string; email?: string; address?: string; category?: string; rating?: number }): Promise<Supplier> => {
    try {
      const res = await fetch(`${BACKEND_URL}/warehouse/suppliers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, creating local supplier:', e);
    }
    const newSupplier: Supplier = {
      id: `sup-${Date.now()}`,
      name: data.name,
      contactName: data.contactName || null,
      phone: data.phone || null,
      email: data.email || null,
      address: data.address || null,
      category: data.category || null,
      rating: data.rating || 5,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    localSuppliers.push(newSupplier);
    return newSupplier;
  },

  updateSupplier: async (id: string, updates: any): Promise<Supplier> => {
    try {
      const res = await fetch(`${BACKEND_URL}/warehouse/suppliers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, updating local supplier:', e);
    }
    const idx = localSuppliers.findIndex(s => s.id === id);
    if (idx === -1) throw new Error('Supplier not found');
    localSuppliers[idx] = { ...localSuppliers[idx], ...updates };
    return localSuppliers[idx];
  },

  getStockMovements: async (itemId?: string, branchId?: string): Promise<StockMovement[]> => {
    let filtered = [...localStockMovements];
    if (itemId) filtered = filtered.filter(m => m.itemId === itemId);
    if (branchId) filtered = filtered.filter(m => m.branchId === branchId);
    return hydrateStockMovements(filtered);
  },

  getLostItems: async (filters?: { status?: string; branchId?: string; dateFrom?: string; dateTo?: string }): Promise<LostFoundItem[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.branchId) queryParams.append('branchId', filters.branchId);
      if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);
      const res = await fetch(`${BACKEND_URL}/lostfound?${queryParams.toString()}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, using mock lost items:', e);
    }
    let filtered = [...localLostItems];
    if (filters?.status) filtered = filtered.filter(item => item.status === filters.status);
    if (filters?.branchId) filtered = filtered.filter(item => item.branchId === filters.branchId);
    return hydrateLostItems(filtered);
  },

  createLostItem: async (data: { reportedBy: string; branchId: string; location: string; description: string; photoUrl?: string | null; guestName?: string | null; guestPhone?: string | null; reservationRef?: string | null; notes?: string | null }): Promise<LostFoundItem> => {
    try {
      const res = await fetch(`${BACKEND_URL}/lostfound`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, creating local lost item:', e);
    }
    const newItem: LostFoundItem = {
      id: `lf-${Date.now()}`,
      ticketNumber: `LF-2026-${String(localLostItems.length + 1).padStart(4, '0')}`,
      reportedBy: data.reportedBy,
      branchId: data.branchId,
      location: data.location,
      description: data.description,
      photoUrl: data.photoUrl || null,
      guestName: data.guestName || null,
      guestPhone: data.guestPhone || null,
      reservationRef: data.reservationRef || null,
      notes: data.notes || null,
      status: 'Stored',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localLostItems.push(newItem);
    return hydrateLostItems([newItem])[0];
  },

  contactGuest: async (id: string, data?: { guestName?: string | null; guestPhone?: string | null }): Promise<LostFoundItem> => {
    try {
      const res = await fetch(`${BACKEND_URL}/lostfound/${id}/contact`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data || {}),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, contacting local guest:', e);
    }
    const idx = localLostItems.findIndex(item => item.id === id);
    if (idx === -1) throw new Error('Lost item not found');
    localLostItems[idx] = {
      ...localLostItems[idx],
      status: 'ContactedGuest',
      guestName: data?.guestName || localLostItems[idx].guestName,
      guestPhone: data?.guestPhone || localLostItems[idx].guestPhone,
      updatedAt: new Date().toISOString()
    };
    return hydrateLostItems([localLostItems[idx]])[0];
  },

  claimItem: async (id: string, data: { claimedBy: string; claimedIdType: string; claimedIdNumber: string; handedOverBy: string }): Promise<LostFoundItem> => {
    try {
      const res = await fetch(`${BACKEND_URL}/lostfound/${id}/claim`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, claiming local lost item:', e);
    }
    const idx = localLostItems.findIndex(item => item.id === id);
    if (idx === -1) throw new Error('Lost item not found');
    localLostItems[idx] = {
      ...localLostItems[idx],
      status: 'Claimed',
      claimedBy: data.claimedBy,
      claimedIdType: data.claimedIdType,
      claimedIdNumber: data.claimedIdNumber,
      handedOverBy: data.handedOverBy,
      claimedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return hydrateLostItems([localLostItems[idx]])[0];
  },

  archiveItem: async (id: string): Promise<LostFoundItem> => {
    try {
      const res = await fetch(`${BACKEND_URL}/lostfound/${id}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, archiving local lost item:', e);
    }
    const idx = localLostItems.findIndex(item => item.id === id);
    if (idx === -1) throw new Error('Lost item not found');
    localLostItems[idx] = {
      ...localLostItems[idx],
      status: 'Archived',
      archivedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return hydrateLostItems([localLostItems[idx]])[0];
  },

  getDamageReports: async (filters?: { status?: string; branchId?: string; reservationRef?: string; dateFrom?: string; dateTo?: string }): Promise<DamageReport[]> => {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.append('status', filters.status);
      if (filters?.branchId) queryParams.append('branchId', filters.branchId);
      if (filters?.reservationRef) queryParams.append('reservationRef', filters.reservationRef);
      if (filters?.dateFrom) queryParams.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) queryParams.append('dateTo', filters.dateTo);
      const res = await fetch(`${BACKEND_URL}/damage?${queryParams.toString()}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, using mock damage reports:', e);
    }
    let filtered = [...localDamageReports];
    if (filters?.status) filtered = filtered.filter(r => r.status === filters.status);
    if (filters?.branchId) filtered = filtered.filter(r => r.branchId === filters.branchId);
    if (filters?.reservationRef) filtered = filtered.filter(r => r.reservationRef === filters.reservationRef);
    return hydrateDamageReports(filtered);
  },

  createDamageReport: async (data: { reportedBy: string; branchId: string; roomNumber: string; damageType: string; description: string; photoUrls?: string; reportedDuring?: string; reservationRef?: string | null; guestName?: string | null; guestPhone?: string | null; estimatedValue?: number | null }): Promise<DamageReport> => {
    try {
      const res = await fetch(`${BACKEND_URL}/damage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, creating local damage report:', e);
    }
    const newReport: DamageReport = {
      id: `dmg-${Date.now()}`,
      ticketNumber: `DMG-2026-${String(localDamageReports.length + 1).padStart(4, '0')}`,
      reportedBy: data.reportedBy,
      branchId: data.branchId,
      roomNumber: data.roomNumber,
      damageType: data.damageType,
      description: data.description,
      photoUrls: data.photoUrls || '[]',
      reportedDuring: data.reportedDuring || 'Stay',
      reservationRef: data.reservationRef || null,
      guestName: data.guestName || null,
      guestPhone: data.guestPhone || null,
      estimatedValue: data.estimatedValue || null,
      status: 'New',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localDamageReports.push(newReport);
    return hydrateDamageReports([newReport])[0];
  },

  reviewDamage: async (id: string, data: { reviewerId: string; finalValue: number; reviewNote?: string | null }): Promise<DamageReport> => {
    try {
      const res = await fetch(`${BACKEND_URL}/damage/${id}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, reviewing local damage:', e);
    }
    const idx = localDamageReports.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Damage report not found');
    localDamageReports[idx] = {
      ...localDamageReports[idx],
      status: 'PendingGuestDecision',
      reviewedBy: data.reviewerId,
      finalValue: data.finalValue,
      reviewNote: data.reviewNote || null,
      reviewedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return hydrateDamageReports([localDamageReports[idx]])[0];
  },

  collectDamagePayment: async (id: string, data: { paymentMethod: string; paymentRef?: string | null; collectedBy: string; paymentDueDate?: string | null }): Promise<DamageReport> => {
    try {
      const res = await fetch(`${BACKEND_URL}/damage/${id}/collect`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, collecting local damage payment:', e);
    }
    const idx = localDamageReports.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Damage report not found');
    localDamageReports[idx] = {
      ...localDamageReports[idx],
      status: 'Paid',
      paymentMethod: data.paymentMethod,
      paymentRef: data.paymentRef || null,
      collectedBy: data.collectedBy,
      paymentDueDate: data.paymentDueDate || null,
      collectedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return hydrateDamageReports([localDamageReports[idx]])[0];
  },

  markDamageRefused: async (id: string, reason: string): Promise<DamageReport> => {
    try {
      const res = await fetch(`${BACKEND_URL}/damage/${id}/refuse`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refusalReason: reason }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, refusing local damage:', e);
    }
    const idx = localDamageReports.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Damage report not found');
    localDamageReports[idx] = {
      ...localDamageReports[idx],
      status: 'Refused',
      refusalReason: reason,
      updatedAt: new Date().toISOString()
    };
    return hydrateDamageReports([localDamageReports[idx]])[0];
  },

  waiveDamage: async (id: string, waivedBy: string, reason: string): Promise<DamageReport> => {
    try {
      const res = await fetch(`${BACKEND_URL}/damage/${id}/waive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ waivedBy, waiverReason: reason }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, waiving local damage:', e);
    }
    const idx = localDamageReports.findIndex(r => r.id === id);
    if (idx === -1) throw new Error('Damage report not found');
    localDamageReports[idx] = {
      ...localDamageReports[idx],
      status: 'WaivedByManagement',
      waivedBy,
      waiverReason: reason,
      waivedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    return hydrateDamageReports([localDamageReports[idx]])[0];
  },

  getDamageStats: async (branchId?: string): Promise<DamageStats> => {
    try {
      const queryParams = new URLSearchParams();
      if (branchId) queryParams.append('branchId', branchId);
      const res = await fetch(`${BACKEND_URL}/damage/stats?${queryParams.toString()}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, using mock damage stats:', e);
    }
    const filtered = branchId ? localDamageReports.filter(r => r.branchId === branchId) : localDamageReports;
    const total = filtered.length;
    const paid = filtered.filter(r => r.status === 'Paid').length;
    const refused = filtered.filter(r => r.status === 'Refused').length;
    const waived = filtered.filter(r => r.status === 'WaivedByManagement').length;
    const pendingReview = filtered.filter(r => r.status === 'New' || r.status === 'UnderReview').length;
    const totalCollected = filtered.filter(r => r.status === 'Paid').reduce((sum, r) => sum + (r.finalValue || 0), 0);
    const totalLost = filtered.filter(r => r.status === 'Refused').reduce((sum, r) => sum + (r.finalValue || 0), 0);
    return { total, paid, refused, waived, pendingReview, totalCollected, totalLost };
  },

  getDailyFinancialReport: async (branchId?: string, date?: string): Promise<any> => {
    try {
      const q = new URLSearchParams();
      if (branchId) q.append('branchId', branchId);
      if (date) q.append('date', date);
      const res = await fetch(`${BACKEND_URL}/reports/financial/daily?${q.toString()}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, using mock daily financial report:', e);
    }
    const targetDate = date ? new Date(date) : new Date();
    const dateStr = targetDate.toISOString().split('T')[0];

    const dayShifts = localShiftReports.filter(r => {
      const isDate = new Date(r.createdAt).toISOString().split('T')[0] === dateStr;
      const isBranch = !branchId || r.branchId === branchId;
      return isDate && isBranch;
    });

    const dayDamages = localDamageReports.filter(d => {
      const isDate = d.collectedAt ? new Date(d.collectedAt).toISOString().split('T')[0] === dateStr : false;
      const isBranch = !branchId || d.branchId === branchId;
      return isDate && isBranch && d.status === 'Paid';
    });

    const totalDamageCollected = dayDamages.reduce((sum, d) => sum + (d.finalValue || 0), 0);

    const shiftReports = dayShifts.map(r => {
      const damagesForShift = dayDamages.filter(d => d.branchId === r.branchId);
      const damageCompensations = damagesForShift.reduce((sum, d) => sum + (d.finalValue || 0), 0);
      const remaining = r.grandTotal - damageCompensations;
      return {
        ...r,
        damageCompensations,
        roomRevenue: remaining * 0.75,
        serviceRevenue: remaining * 0.25
      };
    });

    const totalRoomRevenue = shiftReports.reduce((sum, r) => sum + r.roomRevenue, 0);
    const totalServiceRevenue = shiftReports.reduce((sum, r) => sum + r.serviceRevenue, 0);
    const totalRevenue = shiftReports.reduce((sum, r) => sum + r.grandTotal, 0);

    const dayProcs = localProcurements.filter(p => {
      const isDate = new Date(p.updatedAt).toISOString().split('T')[0] === dateStr;
      const isBranch = !branchId || p.branchId === branchId;
      const isPaid = p.status === 'Purchased' || p.status === 'Received';
      return isDate && isBranch && isPaid;
    });

    const totalExpenses = dayProcs.reduce((sum, p) => sum + (p.actualPrice || p.estimatedPrice || 0), 0);
    const netProfit = totalRevenue - totalExpenses;

    return {
      date: dateStr,
      branchId: branchId || 'All',
      shiftCount: shiftReports.length,
      totalRoomRevenue,
      totalServiceRevenue,
      totalDamageCollected,
      totalRevenue,
      totalExpenses,
      netProfit,
      shiftReports
    };
  },

  getPeriodFinancialReport: async (branchId?: string, from?: string, to?: string): Promise<any[]> => {
    try {
      const q = new URLSearchParams();
      if (branchId) q.append('branchId', branchId);
      if (from) q.append('from', from);
      if (to) q.append('to', to);
      const res = await fetch(`${BACKEND_URL}/reports/financial/period?${q.toString()}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, using mock period financial report:', e);
    }
    const start = from ? new Date(from) : new Date();
    const end = to ? new Date(to) : new Date();
    const result = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayReport = await api.getDailyFinancialReport(branchId, dateStr);
      result.push(dayReport);
    }
    return result;
  },

  getMonthlyFinancialReport: async (branchId?: string, year?: number, month?: number): Promise<any> => {
    try {
      const q = new URLSearchParams();
      if (branchId) q.append('branchId', branchId);
      if (year !== undefined) q.append('year', year.toString());
      if (month !== undefined) q.append('month', month.toString());
      const res = await fetch(`${BACKEND_URL}/reports/financial/monthly?${q.toString()}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, using mock monthly financial report:', e);
    }
    const y = year !== undefined ? year : new Date().getFullYear();
    const m = month !== undefined ? month : new Date().getMonth();
    const from = `${y}-${String(m + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(y, m + 1, 0).getDate();
    const to = `${y}-${String(m + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
    const dailyBreakdown = await api.getPeriodFinancialReport(branchId, from, to);
    const totalRoomRevenue = dailyBreakdown.reduce((sum, d) => sum + d.totalRoomRevenue, 0);
    const totalServiceRevenue = dailyBreakdown.reduce((sum, d) => sum + d.totalServiceRevenue, 0);
    const totalDamageCollected = dailyBreakdown.reduce((sum, d) => sum + d.totalDamageCollected, 0);
    const totalRevenue = dailyBreakdown.reduce((sum, d) => sum + d.totalRevenue, 0);
    const totalExpenses = dailyBreakdown.reduce((sum, d) => sum + d.totalExpenses, 0);
    const netProfit = totalRevenue - totalExpenses;
    return {
      year: y,
      month: m,
      totalRoomRevenue,
      totalServiceRevenue,
      totalDamageCollected,
      totalRevenue,
      totalExpenses,
      netProfit,
      dailyBreakdown
    };
  },

  getAttendanceReport: async (branchId?: string, from?: string, to?: string): Promise<any> => {
    try {
      const q = new URLSearchParams();
      if (branchId) q.append('branchId', branchId);
      if (from) q.append('from', from);
      if (to) q.append('to', to);
      const res = await fetch(`${BACKEND_URL}/reports/attendance?${q.toString()}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, using mock attendance report:', e);
    }
    const start = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const end = to ? new Date(to) : new Date();
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (24 * 3600 * 1000)) + 1);

    const users = MOCK_USERS.filter(u => !branchId || u.branchId === branchId);
    let presentDaysSum = 0;
    let absentDaysSum = 0;
    let lateDaysSum = 0;
    let totalHoursSum = 0;

    const byEmployee = users.map(user => {
      const userLogs = localAttendance.filter(l => {
        const isUser = l.userId === user.id;
        const isTime = new Date(l.timestamp) >= start && new Date(l.timestamp) <= end;
        return isUser && isTime && l.isValid;
      });
      const present = new Set(userLogs.filter(l => l.type === 'CheckIn').map(l => new Date(l.timestamp).toISOString().split('T')[0])).size;
      const absent = Math.max(0, totalDays - present);
      const late = userLogs.filter(l => {
        if (l.type !== 'CheckIn') return false;
        const hr = new Date(l.timestamp).getHours();
        const mn = new Date(l.timestamp).getMinutes();
        return (hr === 7 && mn > 15) || (hr > 7 && hr < 12) || (hr === 15 && mn > 15) || (hr > 15 && hr < 19);
      }).length;

      let employeeHours = present * 8 - (late * 0.5); // deterministic mock hours
      if (employeeHours < 0) employeeHours = 0;

      presentDaysSum += present;
      absentDaysSum += absent;
      lateDaysSum += late;
      totalHoursSum += employeeHours;

      return {
        userId: user.id,
        name: user.name,
        present,
        absent,
        late,
        totalHours: parseFloat(employeeHours.toFixed(1))
      };
    });

    const averageHoursPerDay = presentDaysSum > 0 ? parseFloat((totalHoursSum / presentDaysSum).toFixed(1)) : 0;
    return {
      totalEmployees: users.length,
      totalDays,
      presentDays: presentDaysSum,
      absentDays: absentDaysSum,
      lateDays: lateDaysSum,
      averageHoursPerDay,
      byEmployee
    };
  },

  getLeaveReport: async (branchId?: string, from?: string, to?: string): Promise<any> => {
    try {
      const q = new URLSearchParams();
      if (branchId) q.append('branchId', branchId);
      if (from) q.append('from', from);
      if (to) q.append('to', to);
      const res = await fetch(`${BACKEND_URL}/reports/leave?${q.toString()}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, using mock leave report:', e);
    }
    const start = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const end = to ? new Date(to) : new Date();

    const leaves = localLeaves.filter(l => {
      const user = MOCK_USERS.find(u => u.id === l.userId);
      const isBranch = !branchId || user?.branchId === branchId;
      const isDate = new Date(l.createdAt) >= start && new Date(l.createdAt) <= end;
      return isBranch && isDate;
    });

    const approved = leaves.filter(l => l.status === 'Approved').length;
    const rejected = leaves.filter(l => l.status === 'Rejected').length;
    const pending = leaves.filter(l => l.status === 'Pending').length;

    const byType = {
      Annual: leaves.filter(l => l.leaveType === 'Annual').length,
      Sick: leaves.filter(l => l.leaveType === 'Sick').length,
      Emergency: leaves.filter(l => l.leaveType === 'Emergency').length,
      Unpaid: leaves.filter(l => l.leaveType === 'Unpaid').length
    };

    const byEmployee = leaves.map(l => {
      const user = MOCK_USERS.find(u => u.id === l.userId);
      return {
        userId: l.userId,
        name: user ? user.name : 'موظف',
        leaveDays: l.daysCount,
        leaveType: l.leaveType,
        status: l.status,
        startDate: l.startDate,
        endDate: l.endDate
      };
    });

    return {
      totalRequests: leaves.length,
      approved,
      rejected,
      pending,
      byType,
      byEmployee
    };
  },

  getLoanReport: async (branchId?: string): Promise<any> => {
    try {
      const q = new URLSearchParams();
      if (branchId) q.append('branchId', branchId);
      const res = await fetch(`${BACKEND_URL}/reports/loans?${q.toString()}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, using mock loan report:', e);
    }
    const loans = localLoans.filter(l => {
      const user = MOCK_USERS.find(u => u.id === l.userId);
      return !branchId || user?.branchId === branchId;
    });

    const approvedLoans = loans.filter(l => l.status === 'Approved');
    let totalAmountLent = 0;
    let totalRepaid = 0;
    let totalOutstanding = 0;

    const employeeMap: Record<string, { name: string; amount: number; repaid: number; remaining: number }> = {};
    approvedLoans.forEach(loan => {
      const user = MOCK_USERS.find(u => u.id === loan.userId);
      const name = user ? user.name : 'موظف';
      const refDate = loan.reviewedAt || loan.createdAt;
      const daysPassed = Math.max(0, Math.floor((Date.now() - new Date(refDate).getTime()) / (24 * 3600 * 1000)));
      const repaidRatio = Math.min(1, Math.floor(daysPassed / 7) * 0.1);
      const repaid = loan.amount * repaidRatio;
      const remaining = loan.amount - repaid;

      totalAmountLent += loan.amount;
      totalRepaid += repaid;
      totalOutstanding += remaining;

      if (employeeMap[loan.userId]) {
        employeeMap[loan.userId].amount += loan.amount;
        employeeMap[loan.userId].repaid += repaid;
        employeeMap[loan.userId].remaining += remaining;
      } else {
        employeeMap[loan.userId] = { name, amount: loan.amount, repaid, remaining };
      }
    });

    const byEmployee = Object.entries(employeeMap).map(([userId, val]) => ({
      userId,
      name: val.name,
      loanAmount: parseFloat(val.amount.toFixed(1)),
      repaid: parseFloat(val.repaid.toFixed(1)),
      remaining: parseFloat(val.remaining.toFixed(1))
    }));

    const totalActiveLoans = approvedLoans.filter(l => {
      const refDate = l.reviewedAt || l.createdAt;
      const daysPassed = Math.max(0, Math.floor((Date.now() - new Date(refDate).getTime()) / (24 * 3600 * 1000)));
      const repaidRatio = Math.min(1, Math.floor(daysPassed / 7) * 0.1);
      return (l.amount * (1 - repaidRatio)) > 0;
    }).length;

    return {
      totalActiveLoans,
      totalAmountLent: parseFloat(totalAmountLent.toFixed(1)),
      totalRepaid: parseFloat(totalRepaid.toFixed(1)),
      totalOutstanding: parseFloat(totalOutstanding.toFixed(1)),
      byEmployee
    };
  },

  getMaintenanceReport: async (branchId?: string, from?: string, to?: string): Promise<any> => {
    try {
      const q = new URLSearchParams();
      if (branchId) q.append('branchId', branchId);
      if (from) q.append('from', from);
      if (to) q.append('to', to);
      const res = await fetch(`${BACKEND_URL}/reports/maintenance?${q.toString()}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, using mock maintenance report:', e);
    }
    const start = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const end = to ? new Date(to) : new Date();

    const list = localMaintenanceRequests.filter(r => {
      const isBranch = !branchId || r.branchId === branchId;
      const isDate = new Date(r.createdAt) >= start && new Date(r.createdAt) <= end;
      return isBranch && isDate;
    });

    const open = list.filter(r => r.status === 'New' || r.status === 'AssignedToTechnician').length;
    const inProgress = list.filter(r => r.status === 'InProgress' || r.status === 'SpareParts').length;
    const completed = list.filter(r => r.status === 'PendingInternalApproval').length;
    const approved = list.filter(r => r.status === 'Closed').length;
    const rejected = list.filter(r => r.status === 'Rejected').length;

    const byType = {
      Electrical: list.filter(r => r.category === 'Electrical').length,
      Plumbing: list.filter(r => r.category === 'Plumbing').length,
      AC: list.filter(r => r.category === 'AC').length,
      Furniture: list.filter(r => r.category === 'Carpentry' || r.category === 'Furniture').length,
      Other: list.filter(r => !['Electrical', 'Plumbing', 'AC', 'Carpentry', 'Furniture'].includes(r.category)).length
    };

    let totalHours = 0;
    let resolvedCount = 0;
    list.forEach(r => {
      const endTime = r.closedAt || r.completedAt;
      if (endTime) {
        const hrDiff = (new Date(endTime).getTime() - new Date(r.createdAt).getTime()) / (1000 * 3600);
        totalHours += hrDiff;
        resolvedCount++;
      }
    });

    const avgResolutionTimeHours = resolvedCount > 0 ? parseFloat((totalHours / resolvedCount).toFixed(1)) : 1.8;

    const techMap: Record<string, { name: string; assigned: number; completed: number; totalHours: number; count: number }> = {};
    list.forEach(r => {
      if (r.assignedTo) {
        const name = r.technicianName || r.assignedTo;
        const isCompleted = r.status === 'Closed' || r.status === 'PendingInternalApproval';
        const endTime = r.closedAt || r.completedAt;
        const hrDiff = endTime ? (new Date(endTime).getTime() - new Date(r.createdAt).getTime()) / (1000 * 3600) : 0;

        if (techMap[r.assignedTo]) {
          techMap[r.assignedTo].assigned++;
          if (isCompleted) {
            techMap[r.assignedTo].completed++;
            if (hrDiff > 0) {
              techMap[r.assignedTo].totalHours += hrDiff;
              techMap[r.assignedTo].count++;
            }
          }
        } else {
          techMap[r.assignedTo] = {
            name,
            assigned: 1,
            completed: isCompleted ? 1 : 0,
            totalHours: hrDiff > 0 ? hrDiff : 0,
            count: hrDiff > 0 ? 1 : 0
          };
        }
      }
    });

    const byTechnician = Object.entries(techMap).map(([userId, val]) => ({
      userId,
      name: val.name,
      assigned: val.assigned,
      completed: val.completed,
      avgHours: val.count > 0 ? parseFloat((val.totalHours / val.count).toFixed(1)) : 2.0
    }));

    return {
      totalRequests: list.length,
      open,
      inProgress,
      completed,
      approved,
      rejected,
      avgResolutionTimeHours,
      byType,
      byTechnician
    };
  },

  getInventoryReport: async (branchId?: string): Promise<any> => {
    try {
      const q = new URLSearchParams();
      if (branchId) q.append('branchId', branchId);
      const res = await fetch(`${BACKEND_URL}/reports/inventory?${q.toString()}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, using mock inventory report:', e);
    }
    const entries = branchId ? localStockEntries.filter(s => s.branchId === branchId) : localStockEntries;
    const totalItems = entries.length;
    const lowStockCount = entries.filter(s => s.quantity <= s.minThreshold && s.quantity > Math.floor(s.minThreshold / 2)).length;
    const criticalStockCount = entries.filter(s => s.quantity <= Math.max(1, Math.floor(s.minThreshold / 2))).length;

    const itemOutSum: Record<string, { name: string; totalConsumed: number; unit: string }> = {};
    localStockMovements.forEach(m => {
      if (branchId && m.branchId !== branchId) return;
      if (m.type === 'Out' || (m.type === 'Adjustment' && m.quantity < 0)) {
        const absQty = Math.abs(m.quantity);
        const item = localItems.find(i => i.id === m.itemId);
        const name = item ? item.name : 'صنف';
        const unit = item ? item.unit : 'قطعة';
        if (itemOutSum[m.itemId]) {
          itemOutSum[m.itemId].totalConsumed += absQty;
        } else {
          itemOutSum[m.itemId] = { name, totalConsumed: absQty, unit };
        }
      }
    });

    const topConsumedItems = Object.entries(itemOutSum)
      .map(([itemId, val]) => ({
        itemId,
        name: val.name,
        totalConsumed: val.totalConsumed,
        unit: val.unit
      }))
      .sort((a, b) => b.totalConsumed - a.totalConsumed)
      .slice(0, 5);

    const recentMovements = localStockMovements
      .filter(m => !branchId || m.branchId === branchId)
      .slice(0, 10)
      .map(m => {
        const item = localItems.find(i => i.id === m.itemId);
        const user = MOCK_USERS.find(u => u.id === m.performedBy);
        return {
          id: m.id,
          itemName: item ? item.name : 'صنف',
          type: m.type,
          quantity: m.quantity,
          reason: m.reason,
          performer: user ? user.name : 'موظف',
          createdAt: m.createdAt
        };
      });

    const totalWarehouseRequests = localWarehouseRequests.filter(r => !branchId || r.branchId === branchId).length;
    const pendingRequests = localWarehouseRequests.filter(r => r.status === 'Pending' && (!branchId || r.branchId === branchId)).length;

    return {
      totalItems,
      lowStockCount,
      criticalStockCount,
      topConsumedItems,
      recentMovements,
      totalWarehouseRequests,
      pendingRequests
    };
  },

  getProcurementReport: async (branchId?: string, from?: string, to?: string): Promise<any> => {
    try {
      const q = new URLSearchParams();
      if (branchId) q.append('branchId', branchId);
      if (from) q.append('from', from);
      if (to) q.append('to', to);
      const res = await fetch(`${BACKEND_URL}/reports/procurement?${q.toString()}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, using mock procurement report:', e);
    }
    const start = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const end = to ? new Date(to) : new Date();

    const list = localProcurements.filter(p => {
      const isBranch = !branchId || p.branchId === branchId;
      const isDate = new Date(p.createdAt) >= start && new Date(p.createdAt) <= end;
      return isBranch && isDate;
    });

    const paidProcurements = list.filter(p => p.status === 'Purchased' || p.status === 'Received');
    const totalSpend = paidProcurements.reduce((sum, p) => sum + (p.actualPrice || p.estimatedPrice || 0), 0);
    const pendingApproval = list.filter(p => p.status === 'PendingFinancialApproval' || p.status === 'Pending').length;

    const bySource = {
      LowStock: list.filter(p => p.source === 'LowStock').length,
      MaintenanceSpareParts: list.filter(p => p.source === 'MaintenanceSpareParts').length,
      DirectRequest: list.filter(p => p.source === 'DirectRequest' || p.source === 'Manual').length
    };

    const suppliersMap: Record<string, { name: string; totalOrders: number; totalSpend: number }> = {};
    list.forEach(p => {
      if (p.supplierId) {
        const sup = localSuppliers.find(s => s.id === p.supplierId);
        const name = sup ? sup.name : 'مورد';
        const isPaid = p.status === 'Purchased' || p.status === 'Received';
        const cost = isPaid ? (p.actualPrice || p.estimatedPrice || 0) : 0;

        if (suppliersMap[p.supplierId]) {
          suppliersMap[p.supplierId].totalOrders++;
          suppliersMap[p.supplierId].totalSpend += cost;
        } else {
          suppliersMap[p.supplierId] = { name, totalOrders: 1, totalSpend: cost };
        }
      }
    });

    const bySupplier = Object.entries(suppliersMap).map(([supplierId, val]) => ({
      supplierId,
      name: val.name,
      totalOrders: val.totalOrders,
      totalSpend: val.totalSpend
    })).sort((a, b) => b.totalSpend - a.totalSpend);

    const byPaymentMethod = {
      Cash: list.filter(p => p.paymentMethod === 'Cash').length,
      BankTransfer: list.filter(p => p.paymentMethod === 'BankTransfer').length,
      Card: list.filter(p => p.paymentMethod === 'Card').length,
      Credit: list.filter(p => p.paymentMethod === 'Credit').length
    };

    return {
      totalRequests: list.length,
      totalSpend,
      pendingApproval,
      bySource,
      bySupplier,
      byPaymentMethod
    };
  },

  getDamageReport: async (branchId?: string, from?: string, to?: string): Promise<any> => {
    try {
      const q = new URLSearchParams();
      if (branchId) q.append('branchId', branchId);
      if (from) q.append('from', from);
      if (to) q.append('to', to);
      const res = await fetch(`${BACKEND_URL}/reports/damage?${q.toString()}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, using mock damage report:', e);
    }
    const start = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const end = to ? new Date(to) : new Date();

    const list = localDamageReports.filter(d => {
      const isBranch = !branchId || d.branchId === branchId;
      const isDate = new Date(d.createdAt) >= start && new Date(d.createdAt) <= end;
      return isBranch && isDate;
    });

    const totalReports = list.length;
    const totalValue = list.reduce((sum, d) => sum + (d.finalValue || d.estimatedValue || 0), 0);

    const collectedReports = list.filter(d => d.status === 'Paid');
    const collectedValue = collectedReports.reduce((sum, d) => sum + (d.finalValue || 0), 0);

    const refusedReports = list.filter(d => d.status === 'Refused');
    const refusedValue = refusedReports.reduce((sum, d) => sum + (d.finalValue || d.estimatedValue || 0), 0);

    const waivedReports = list.filter(d => d.status === 'WaivedByManagement' || d.status === 'Waived');
    const waivedValue = waivedReports.reduce((sum, d) => sum + (d.finalValue || d.estimatedValue || 0), 0);

    const pending = totalReports - collectedReports.length - refusedReports.length - waivedReports.length;
    const recoveryRate = totalValue > 0 ? Math.round((collectedValue / totalValue) * 100) : 0;

    const byType = {
      Furniture: list.filter(d => d.damageType === 'Furniture').length,
      Electronics: list.filter(d => d.damageType === 'Electronics').length,
      Fixture: list.filter(d => d.damageType === 'Fixture').length,
      Linen: list.filter(d => d.damageType === 'Linen').length,
      Door: list.filter(d => d.damageType === 'Door').length,
      Window: list.filter(d => d.damageType === 'Window').length,
      Other: list.filter(d => !['Furniture', 'Electronics', 'Fixture', 'Linen', 'Door', 'Window'].includes(d.damageType)).length
    };

    const roomsMap: Record<string, { count: number; totalValue: number }> = {};
    list.forEach(d => {
      const val = d.finalValue || d.estimatedValue || 0;
      if (roomsMap[d.roomNumber]) {
        roomsMap[d.roomNumber].count++;
        roomsMap[d.roomNumber].totalValue += val;
      } else {
        roomsMap[d.roomNumber] = { count: 1, totalValue: val };
      }
    });

    const byRoom = Object.entries(roomsMap).map(([room, val]) => ({
      room,
      count: val.count,
      totalValue: val.totalValue
    })).sort((a, b) => b.count - a.count).slice(0, 5);

    return {
      totalReports,
      totalValue,
      collected: collectedReports.length,
      collectedValue,
      refused: refusedReports.length,
      refusedValue,
      waived: waivedReports.length,
      waivedValue,
      pending,
      recoveryRate,
      byType,
      byRoom
    };
  },

  getLostFoundReport: async (branchId?: string, from?: string, to?: string): Promise<any> => {
    try {
      const q = new URLSearchParams();
      if (branchId) q.append('branchId', branchId);
      if (from) q.append('from', from);
      if (to) q.append('to', to);
      const res = await fetch(`${BACKEND_URL}/reports/lostfound?${q.toString()}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, using mock lost found report:', e);
    }
    const start = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const end = to ? new Date(to) : new Date();

    const list = localLostItems.filter(i => {
      const isBranch = !branchId || i.branchId === branchId;
      const isDate = new Date(i.createdAt) >= start && new Date(i.createdAt) <= end;
      return isBranch && isDate;
    });

    const totalItems = list.length;
    const stored = list.filter(i => i.status === 'Stored' || i.status === 'ContactedGuest').length;
    const claimed = list.filter(i => i.status === 'Claimed').length;
    const archived = list.filter(i => i.status === 'Archived').length;
    const claimRate = totalItems > 0 ? Math.round((claimed / totalItems) * 100) : 0;

    const locMap: Record<string, number> = {};
    list.forEach(i => {
      locMap[i.location] = (locMap[i.location] || 0) + 1;
    });

    const byLocation = Object.entries(locMap).map(([location, count]) => ({
      location,
      count
    })).sort((a, b) => b.count - a.count);

    let totalDaysDiff = 0;
    let resolvedCount = 0;
    list.forEach(i => {
      const endTime = i.claimedAt || i.archivedAt;
      if (endTime) {
        const days = (new Date(endTime).getTime() - new Date(i.createdAt).getTime()) / (1000 * 3600 * 24);
        totalDaysDiff += days;
        resolvedCount++;
      }
    });
    const avgDaysToClaimOrArchive = resolvedCount > 0 ? parseFloat((totalDaysDiff / resolvedCount).toFixed(1)) : 1.5;

    return {
      totalItems,
      stored,
      claimed,
      archived,
      claimRate,
      byLocation,
      avgDaysToClaimOrArchive
    };
  },

  getExecutiveReport: async (from?: string, to?: string): Promise<any> => {
    try {
      const q = new URLSearchParams();
      if (from) q.append('from', from);
      if (to) q.append('to', to);
      const res = await fetch(`${BACKEND_URL}/reports/executive?${q.toString()}`, { signal: AbortSignal.timeout(1500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API error, using mock executive report:', e);
    }
    const start = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const end = to ? new Date(to) : new Date();

    const branches = MOCK_BRANCHES;
    let totalRevenueSum = 0;
    let totalProfitSum = 0;
    let openMaintenanceSum = 0;
    let pendingDamageSum = 0;

    const byBranch = [];
    for (const b of branches) {
      const dailyBreakdown = await api.getPeriodFinancialReport(b.id, from, to);
      const totalRevenue = dailyBreakdown.reduce((sum, d) => sum + d.totalRevenue, 0);
      const totalExpenses = dailyBreakdown.reduce((sum, d) => sum + d.totalExpenses, 0);
      const netProfit = totalRevenue - totalExpenses;

      const openMaint = localMaintenanceRequests.filter(r => r.branchId === b.id && ['New', 'AssignedToTechnician', 'InProgress', 'SpareParts'].includes(r.status)).length;
      const lowStock = localStockEntries.filter(s => s.branchId === b.id && s.quantity <= s.minThreshold).length;
      const pendingDamage = localDamageReports.filter(d => d.branchId === b.id && d.status === 'PendingGuestDecision').length;

      const userIds = MOCK_USERS.filter(u => u.branchId === b.id).map(u => u.id);
      const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / (24 * 3600 * 1000)) + 1);
      const totalSlots = userIds.length * totalDays;
      const presentLogsCount = localAttendance.filter(l => l.type === 'CheckIn' && l.isValid && userIds.includes(l.userId) && new Date(l.timestamp) >= start && new Date(l.timestamp) <= end).length;
      const attendanceRate = totalSlots > 0 ? Math.round((presentLogsCount / totalSlots) * 100) : 92;
      const occupancyRate = b.id === 'b-1' ? 88 : 79;

      totalRevenueSum += totalRevenue;
      totalProfitSum += netProfit;
      openMaintenanceSum += openMaint;
      pendingDamageSum += pendingDamage;

      byBranch.push({
        branchId: b.id,
        branchName: b.name,
        totalRevenue,
        netProfit,
        occupancyRate,
        openMaintenanceTickets: openMaint,
        lowStockItems: lowStock,
        pendingDamageCollection: pendingDamage,
        attendanceRate
      });
    }

    return {
      byBranch,
      totals: {
        revenue: totalRevenueSum,
        profit: totalProfitSum,
        maintenance: openMaintenanceSum,
        damage: pendingDamageSum
      }
    };
  },

  triggerDigest: async (branchId?: string): Promise<any> => {
    try {
      const res = await fetch(`${BACKEND_URL}/reports/digest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branchId }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('API error triggering digest:', e);
    }
    return { success: true, message: 'Simulated daily digest triggered successfully' };
  },

  login: async (phone: string, password: string): Promise<{ token: string; user: User }> => {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
        signal: AbortSignal.timeout(3000)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
      const errPayload = await res.json();
      throw new Error(errPayload.error?.message || 'فشل تسجيل الدخول');
    } catch (e: any) {
      console.warn('API login error, falling back to mock login:', e);
      if (e.message && !e.message.includes('fetch')) {
        throw e;
      }
    }
    
    const matchedUser = MOCK_USERS.find(u => u.phoneNumber === phone);
    if (!matchedUser) {
      throw new Error('رقم الهاتف غير مسجل لدينا.');
    }
    if (password !== 'Rahti@2026') {
      throw new Error('كلمة المرور غير صحيحة.');
    }
    return {
      token: 'mock-jwt-token-for-' + matchedUser.id,
      user: matchedUser
    };
  },

  getCurrentUser: async (): Promise<User> => {
    try {
      const res = await fetch(`${BACKEND_URL}/auth/me`, {
        signal: AbortSignal.timeout(5000)
      });
      if (res.ok) {
        const payload = await res.json();
        return hydrateUsers([payload.data])[0];
      }
    } catch (e) {
      console.warn('API getCurrentUser error, falling back to mock/decode:', e);
    }
    
    const token = typeof window !== 'undefined' ? localStorage.getItem('rahti_token') : null;
    if (token) {
      if (token.startsWith('mock-jwt-token-for-')) {
        const userId = token.replace('mock-jwt-token-for-', '');
        const user = MOCK_USERS.find(u => u.id === userId);
        if (user) return hydrateUsers([user])[0];
      } else {
        try {
          const base64Url = token.split('.')[1];
          let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          while (base64.length % 4) {
            base64 += '=';
          }
          const jsonPayload = decodeURIComponent(
            window.atob(base64)
              .split('')
              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const payload = JSON.parse(jsonPayload);
          if (payload && payload.userId) {
            const user: User = {
              id: payload.userId,
              name: payload.name || 'مستخدم',
              role: payload.role as Role || Role.Admin,
              phoneNumber: '',
              branchId: payload.branchId || null
            };
            return hydrateUsers([user])[0];
          }
        } catch (jwtErr) {
          console.error('Failed to decode JWT token:', jwtErr);
        }
      }
    }
    throw new Error('لم يتم العثور على مستخدم نشط.');
  },

  getFinancialReport: async (branchId?: string, from?: string, to?: string): Promise<DailyFinancialSummary[]> => {
    return api.getPeriodFinancialReport(branchId, from, to);
  },

  getDamageReportSummary: async (branchId?: string, from?: string, to?: string): Promise<DamageReportSummary> => {
    return api.getDamageReport(branchId, from, to);
  },

  getExecutiveSummary: async (from?: string, to?: string): Promise<ExecutiveSummary> => {
    return api.getExecutiveReport(from, to);
  },

  sendDigest: async (branchId?: string): Promise<any> => {
    return api.triggerDigest(branchId);
  },

  getDocuments: async (filters?: {
    branchId?: string;
    department?: string;
    type?: string;
    status?: string;
    search?: string;
    employeeId?: string;
  }): Promise<Document[]> => {
    try {
      const q = new URLSearchParams();
      if (filters?.branchId) q.append('branchId', filters.branchId);
      if (filters?.department) q.append('department', filters.department);
      if (filters?.type) q.append('type', filters.type);
      if (filters?.status) q.append('status', filters.status);
      if (filters?.search) q.append('search', filters.search);
      if (filters?.employeeId) q.append('employeeId', filters.employeeId);

      const res = await fetch(`${BACKEND_URL}/documents?${q.toString()}`, {
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API getDocuments error, falling back to mock:', e);
    }

    return localDocuments.filter(d => {
      if (filters?.branchId && d.branchId !== filters.branchId) return false;
      if (filters?.employeeId && (d as any).employeeId !== filters.employeeId) return false;
      if (filters?.department && filters.department !== 'الكل' && d.department !== filters.department) return false;
      if (filters?.type && d.type !== filters.type) return false;
      
      if (filters?.status) {
        const now = new Date();
        const thirtyDays = new Date(Date.now() + 30 * 24 * 3600 * 1000);
        const expiry = d.expiryDate ? new Date(d.expiryDate) : null;
        
        if (filters.status === 'expired') {
          if (!d.isExpired && (!expiry || expiry >= now)) return false;
        } else if (filters.status === 'expiring_soon') {
          if (d.isExpired || !expiry || expiry < now || expiry > thirtyDays) return false;
        } else if (filters.status === 'valid') {
          if (d.isExpired || (expiry && expiry <= thirtyDays)) return false;
        }
      }

      if (filters?.search) {
        const s = filters.search.toLowerCase();
        const titleMatch = d.title.toLowerCase().includes(s);
        const issuerMatch = d.issuer?.toLowerCase().includes(s) || false;
        const noteMatch = d.notes?.toLowerCase().includes(s) || false;
        if (!titleMatch && !issuerMatch && !noteMatch) return false;
      }

      return true;
    });
  },

  uploadDocument: async (formData: FormData): Promise<Document> => {
    try {
      const res = await fetch(`${BACKEND_URL}/documents/upload`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
      const errPayload = await res.json();
      throw new Error(errPayload.error?.message || 'فشل رفع المستند');
    } catch (e: any) {
      console.warn('API uploadDocument error, falling back to mock:', e);
      if (e.message && !e.message.includes('fetch')) {
        throw e;
      }
    }

    const file = formData.get('file') as File;
    const branchId = formData.get('branchId') as string || 'b-1';
    const department = formData.get('department') as string || 'BRANCH';
    const type = formData.get('type') as string || 'OTHER';
    const title = formData.get('title') as string || file?.name || 'مستند جديد';
    const issuer = formData.get('issuer') as string || 'جهة محلية';
    const expiryDate = formData.get('expiryDate') as string || new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    const issueDate = formData.get('issueDate') as string || new Date().toISOString();
    const notes = formData.get('notes') as string || '';

    const newDoc: Document = {
      id: 'doc-' + (localDocuments.length + 1),
      title,
      type,
      department,
      branchId,
      branch: MOCK_BRANCHES.find(b => b.id === branchId) || { id: branchId, name: 'فرع مخصص' },
      fileUrl: '/uploads/documents/mock_uploaded_file.pdf',
      fileName: file?.name || 'file.pdf',
      fileSize: file?.size || 102450,
      mimeType: file?.type || 'application/pdf',
      issuer,
      expiryDate,
      issueDate,
      isExpired: new Date(expiryDate) < new Date(),
      notes,
      uploadedById: 'u-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    localDocuments.unshift(newDoc);
    return newDoc;
  },

  deleteDocument: async (id: string): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`${BACKEND_URL}/documents/${id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        return await res.json();
      }
      const errPayload = await res.json();
      throw new Error(errPayload.error?.message || 'فشل حذف المستند');
    } catch (e: any) {
      console.warn('API deleteDocument error, falling back to mock:', e);
      if (e.message && !e.message.includes('fetch')) {
        throw e;
      }
    }

    const index = localDocuments.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error('الوثيقة غير موجودة.');
    }
    localDocuments.splice(index, 1);
    return { success: true, message: 'تم حذف الوثيقة بنجاح' };
  },

  getSystemSettings: async (): Promise<any> => {
    try {
      const res = await fetch(`${BACKEND_URL}/system/settings`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API getSystemSettings error:', e);
    }
    return {
      attendance_buffer_minutes: '30',
      procurementApprovalThreshold: '5000',
      bot_menu_maintenance: 'true',
      bot_menu_cleaning: 'true',
      bot_menu_warehouse: 'true',
      bot_menu_procurement: 'true',
      bot_menu_techsupport: 'true',
      bot_menu_lostfound: 'true',
      bot_menu_damage: 'true',
      bot_menu_loan: 'true',
      bot_menu_leave: 'true',
      bot_menu_other: 'true'
    };
  },

  updateSystemSettings: async (settings: any): Promise<any> => {
    try {
      const res = await fetch(`${BACKEND_URL}/system/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API updateSystemSettings error:', e);
    }
    return { success: true };
  },

  getActivityLogs: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${BACKEND_URL}/system/logs`, { signal: AbortSignal.timeout(2500) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API getActivityLogs error:', e);
    }
    return [
      { id: '1', userId: 'u-1', action: 'CREATE_USER', entity: 'User', entityId: 'u-5', details: '{"name":"Lara Croft"}', ip: '127.0.0.1', createdAt: new Date().toISOString() }
    ];
  },

  getRolePermissions: async (): Promise<any> => {
    try {
      const res = await fetch(`${BACKEND_URL}/system/roles`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API getRolePermissions error:', e);
    }
    return {
      Admin: { all: true },
      CEO: { view_reports: true, hr_read: true },
      BranchManager: { branch_op: true },
      Receptionist: { view_lost_found: true, check_in_out: true },
      Accountant: { finance_read: true, approve_shift: true },
      Supervisor: { maintenance_assign: true },
      Storekeeper: { warehouse_read: true, warehouse_write: true }
    };
  },

  updateRolePermissions: async (roles: any): Promise<any> => {
    try {
      const res = await fetch(`${BACKEND_URL}/system/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roles),
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API updateRolePermissions error:', e);
    }
    return { success: true };
  },

  toggleUserStatus: async (userId: string): Promise<any> => {
    try {
      const res = await fetch(`${BACKEND_URL}/users/${userId}/status`, {
        method: 'PATCH',
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API toggleUserStatus error:', e);
    }
    return { success: true };
  },

  broadcastAnnouncement: async (data: any): Promise<any> => {
    try {
      const res = await fetch(`${BACKEND_URL}/hr/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API broadcastAnnouncement error:', e);
    }
    return { success: true, recipientCount: 5 };
  },

  getTransferHistory: async (userId: string): Promise<any[]> => {
    try {
      const res = await fetch(`${BACKEND_URL}/hr/transfers/${userId}`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API getTransferHistory error:', e);
    }
    return [];
  },

  getFinanceLoanMetrics: async (): Promise<any> => {
    try {
      const res = await fetch(`${BACKEND_URL}/finance/loans/metrics`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API getFinanceLoanMetrics error:', e);
    }
    return { totalPendingAmount: 0, count: 0 };
  },

  getUnitsOfMeasure: async (): Promise<any[]> => {
    try {
      const res = await fetch(`${BACKEND_URL}/warehouse/units`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API getUnitsOfMeasure error:', e);
    }
    return [
      { id: '1', name: 'كيلوغرام', abbreviation: 'كغ' },
      { id: '2', name: 'لتر', abbreviation: 'ل' },
      { id: '3', name: 'قطعة', abbreviation: 'قطعة' }
    ];
  },

  createUnitOfMeasure: async (data: any): Promise<any> => {
    try {
      const res = await fetch(`${BACKEND_URL}/warehouse/units`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API createUnitOfMeasure error:', e);
    }
    return { id: `unit-${Date.now()}`, ...data };
  },

  addStockQuantity: async (itemId: string, data: any): Promise<any> => {
    try {
      const res = await fetch(`${BACKEND_URL}/warehouse/items/${itemId}/add-stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const payload = await res.json();
        return payload.data;
      }
    } catch (e) {
      console.warn('API addStockQuantity error:', e);
    }
    return { success: true };
  },

  logout: async (): Promise<void> => {
    try {
      await fetch(`${BACKEND_URL}/auth/logout`, {
        method: 'POST',
        signal: AbortSignal.timeout(1000)
      });
    } catch (e) {
      console.warn('API logout error:', e);
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rahti_token');
      document.cookie = 'rahti_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }
  }
};
export default api;

