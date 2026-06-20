'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useRole } from '../../components/RoleContext';
import { Role } from '../../types_local';
import { 
  api, 
  ItemCategory, 
  Item, 
  StockEntry, 
  StockMovement, 
  WarehouseRequest, 
  Supplier, 
  ProcurementRequest 
} from '../../utils/api';
import { 
  Package, 
  ClipboardList, 
  Truck, 
  Users, 
  Plus, 
  ArrowLeftRight, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  TrendingUp,
  Search,
  Filter,
  DollarSign,
  FileText
} from 'lucide-react';
import { Suspense } from 'react';

function WarehousePageContent({ defaultTab }: { defaultTab?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role: currentRole } = useRole();

  // Tab State
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<string>(defaultTab || 'stock');

  useEffect(() => {
    if (tabParam) {
      if (['stock', 'requests', 'procurement', 'suppliers', 'movements'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    } else if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [tabParam, defaultTab]);

  // Data States
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [stock, setStock] = useState<StockEntry[]>([]);
  const [requests, setRequests] = useState<WarehouseRequest[]>([]);
  const [procurements, setProcurements] = useState<ProcurementRequest[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [stats, setStats] = useState<any>({ totalItems: 0, lowStockItems: 0, outOfStockItems: 0, pendingRequests: 0 });
  const [loading, setLoading] = useState<boolean>(true);

  // Filter States
  const [selectedBranch, setSelectedBranch] = useState<string>('b-1');
  const [itemSearch, setItemSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [requestStatusFilter, setRequestStatusFilter] = useState<string>('All');
  const [procurementStatusFilter, setProcurementStatusFilter] = useState<string>('All');

  // Modal States
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isAdjustStockOpen, setIsAdjustStockOpen] = useState(false);
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const [isPartialApproveOpen, setIsPartialApproveOpen] = useState(false);
  const [isReviewProcurementOpen, setIsReviewProcurementOpen] = useState(false);
  const [isPurchaseProcurementOpen, setIsPurchaseProcurementOpen] = useState(false);
  
  // New Stock Addition Modal States
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [addStockItemId, setAddStockItemId] = useState('');
  const [addStockItemName, setAddStockItemName] = useState('');
  const [addStockQty, setAddStockQty] = useState('');
  const [addStockInvoiceNo, setAddStockInvoiceNo] = useState('');
  const [addStockNotes, setAddStockNotes] = useState('');
  const [isSubmittingStock, setIsSubmittingStock] = useState(false);

  // Selection States for Forms
  const [selectedRequest, setSelectedRequest] = useState<WarehouseRequest | null>(null);
  const [selectedProcurement, setSelectedProcurement] = useState<ProcurementRequest | null>(null);

  // Form Inputs
  const [newItemName, setNewItemName] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('قطعة');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');

  const [adjustItemId, setAdjustItemId] = useState('');
  const [adjustQty, setAdjustQty] = useState<number>(0);
  const [adjustType, setAdjustType] = useState<'In' | 'Out' | 'Transfer' | 'Adjustment'>('Adjustment');
  const [adjustReason, setAdjustReason] = useState('إدخال تسوية مخزنية');
  const [adjustNote, setAdjustNote] = useState('');

  const [partialQty, setPartialQty] = useState<number>(0);

  const [supplierName, setSupplierName] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierEmail, setSupplierEmail] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');
  const [supplierCategory, setSupplierCategory] = useState('');

  const [reviewEstimatedPrice, setReviewEstimatedPrice] = useState<number>(0);
  const [reviewSupplierId, setReviewSupplierId] = useState('');
  const [reviewPaymentMethod, setReviewPaymentMethod] = useState('Cash');
  const [reviewNote, setReviewNote] = useState('');

  const [purchaseActualPrice, setPurchaseActualPrice] = useState<number>(0);
  const [purchasePaymentMethod, setPurchasePaymentMethod] = useState('Cash');
  const [purchasePhotoUrl, setPurchasePhotoUrl] = useState('');

  // Fetch Data function
  const loadData = async () => {
    setLoading(true);
    try {
      const branchId = selectedBranch;
      const [catsList, itemsList, stockList, reqsList, procsList, supsList, movesList, statsData] = await Promise.all([
        api.getWarehouseCategories(),
        api.getWarehouseItems(),
        api.getBranchStock(branchId),
        api.getWarehouseRequests(),
        api.getProcurements(),
        api.getSuppliers(),
        api.getStockMovements(undefined, branchId),
        api.getWarehouseStats(branchId)
      ]);

      setCategories(catsList || []);
      setItems(itemsList || []);
      setStock(stockList || []);
      setRequests(reqsList || []);
      setProcurements(procsList || []);
      setSuppliers(supsList || []);
      setMovements(movesList || []);
      setStats(statsData || { totalItems: 0, lowStockItems: 0, outOfStockItems: 0, pendingRequests: 0 });
    } catch (e) {
      console.error('Error loading warehouse data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedBranch]);

  // Operations
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim() || !newItemCategory) {
      alert('الرجاء إدخال اسم الصنف والفئة');
      return;
    }
    try {
      await api.createWarehouseItem({
        name: newItemName,
        unit: newItemUnit,
        categoryId: newItemCategory,
        description: newItemDesc
      });
      alert('تم إضافة الصنف بنجاح في المستودع.');
      setIsAddItemOpen(false);
      // Reset form
      setNewItemName('');
      setNewItemCategory('');
      setNewItemDesc('');
      loadData();
    } catch (e) {
      alert('خطأ أثناء إضافة الصنف');
    }
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItemId || adjustQty <= 0) {
      alert('الرجاء اختيار الصنف وتحديد الكمية بشكل صحيح');
      return;
    }
    try {
      const activeUser = { id: 'u-6' }; // Marcus Vance (WarehouseManager)
      await api.adjustStock({
        itemId: adjustItemId,
        branchId: selectedBranch,
        quantity: adjustQty,
        type: adjustType,
        reason: adjustReason,
        performedBy: activeUser.id,
        note: adjustNote
      });
      alert('تمت تسوية وتحديث المخزون بنجاح.');
      setIsAdjustStockOpen(false);
      setAdjustQty(0);
      setAdjustNote('');
      loadData();
    } catch (e) {
      alert('خطأ أثناء تسوية المخزون');
    }
  };

  const handleApproveWHRFull = async (id: string, requestedQty: number) => {
    if (!confirm('هل أنت متأكد من صرف كامل الكمية المطلوبة؟')) return;
    try {
      const activeUser = { id: 'u-6' };
      await api.approveWarehouseRequest(id, activeUser.id, requestedQty);
      alert('تم صرف طلب الصرف بالكامل وتحديث مستويات المخزون.');
      loadData();
    } catch (e) {
      alert('خطأ أثناء اعتماد الصرف');
    }
  };

  const handleApproveWHRPartial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || partialQty <= 0 || partialQty > selectedRequest.quantityRequested) {
      alert('الرجاء تحديد كمية صرف صحيحة لا تتجاوز الكمية المطلوبة');
      return;
    }
    try {
      const activeUser = { id: 'u-6' };
      await api.approveWarehouseRequest(selectedRequest.id, activeUser.id, partialQty);
      alert('تم الصرف الجزئي للمواد بنجاح.');
      setIsPartialApproveOpen(false);
      setSelectedRequest(null);
      setPartialQty(0);
      loadData();
    } catch (e) {
      alert('خطأ أثناء الصرف الجزئي');
    }
  };

  const handleRejectWHR = async (id: string) => {
    const reason = prompt('الرجاء كتابة سبب رفض طلب الصرف (إلزامي):');
    if (reason === null) return;
    if (!reason.trim()) {
      alert('سبب الرفض مطلوب لإتمام العملية.');
      return;
    }
    try {
      const activeUser = { id: 'u-6' };
      await api.rejectWarehouseRequest(id, activeUser.id, reason);
      alert('تم رفض طلب الصرف وتسجيل السبب.');
      loadData();
    } catch (e) {
      alert('خطأ أثناء رفض طلب الصرف');
    }
  };

  const handleOpenAddStockModal = (itemId: string, itemName: string) => {
    setAddStockItemId(itemId);
    setAddStockItemName(itemName);
    setAddStockQty('');
    setAddStockInvoiceNo('');
    setAddStockNotes('');
    setIsAddStockModalOpen(true);
  };

  const handleAddStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseInt(addStockQty, 10);
    if (isNaN(qty) || qty <= 0) {
      alert('الرجاء إدخال كمية صحيحة أكبر من الصفر');
      return;
    }
    setIsSubmittingStock(true);
    try {
      await api.addStockQuantity(addStockItemId, {
        quantity: qty,
        notes: addStockNotes,
        supplierInvoiceNo: addStockInvoiceNo
      });
      alert(`تم إضافة ${qty} بنجاح إلى رصيد صنف "${addStockItemName}".`);
      setIsAddStockModalOpen(false);
      loadData();
    } catch (error: any) {
      alert(error?.message || 'خطأ أثناء إضافة الكمية للمخزون');
    } finally {
      setIsSubmittingStock(false);
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierName.trim()) {
      alert('الرجاء إدخال اسم المورد');
      return;
    }
    try {
      await api.createSupplier({
        name: supplierName,
        contactName: supplierContact,
        phone: supplierPhone,
        email: supplierEmail,
        address: supplierAddress,
        category: supplierCategory,
        rating: 5
      });
      alert('تم تسجيل المورد الجديد بنجاح.');
      setIsAddSupplierOpen(false);
      setSupplierName('');
      setSupplierContact('');
      setSupplierPhone('');
      loadData();
    } catch (e) {
      alert('خطأ أثناء إضافة المورد');
    }
  };

  const handleReviewProcurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProcurement || reviewEstimatedPrice <= 0 || !reviewSupplierId) {
      alert('الرجاء إدخال السعر التقديري واختيار المورد المناسب للطلب');
      return;
    }
    try {
      const activeUser = { id: 'u-7' }; // ProcurementOfficer
      await api.reviewProcurement(selectedProcurement.id, {
        reviewerId: activeUser.id,
        estimatedPrice: reviewEstimatedPrice,
        supplierId: reviewSupplierId,
        paymentMethod: reviewPaymentMethod,
        note: reviewNote
      });
      alert('تم مراجعة وتسعير طلب الشراء وإرساله للاعتماد المالي.');
      setIsReviewProcurementOpen(false);
      setSelectedProcurement(null);
      setReviewEstimatedPrice(0);
      setReviewNote('');
      loadData();
    } catch (e) {
      alert('خطأ أثناء مراجعة وتسعير الطلب');
    }
  };

  const handleApproveFinanceProcurement = async (id: string) => {
    if (!confirm('هل أنت متأكد من الموافقة المالية والتعميد على هذا الطلب؟')) return;
    try {
      const activeUser = { id: 'u-3' }; // FinanceManager/Accountant
      await api.financiallyApproveProcurement(id, activeUser.id, 'معتمد للصرف الفوري للمشتريات');
      alert('تم تعميد الطلب مالياً بنجاح.');
      loadData();
    } catch (e) {
      alert('خطأ أثناء الاعتماد المالي');
    }
  };

  const handleRejectProcurement = async (id: string) => {
    const reason = prompt('الرجاء إدخال سبب الرفض المالي للطلب (إلزامي):');
    if (reason === null) return;
    if (!reason.trim()) {
      alert('سبب الرفض مطلوب لإتمام العملية.');
      return;
    }
    try {
      const activeUser = { id: 'u-3' };
      await api.rejectProcurement(id, activeUser.id, reason);
      alert('تم رفض طلب الشراء مالياً.');
      loadData();
    } catch (e) {
      alert('خطأ أثناء الرفض المالي');
    }
  };

  const handlePurchaseProcurement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProcurement || purchaseActualPrice <= 0) {
      alert('الرجاء إدخال السعر الفعلي لعملية الشراء');
      return;
    }
    try {
      const activeUser = { id: 'u-7' };
      await api.markPurchased(selectedProcurement.id, {
        purchaserId: activeUser.id,
        actualPrice: purchaseActualPrice,
        paymentMethod: purchasePaymentMethod,
        receiptPhotoUrl: purchasePhotoUrl || undefined
      });
      alert('تم إثبات عملية الشراء للطلب بنجاح.');
      setIsPurchaseProcurementOpen(false);
      setSelectedProcurement(null);
      setPurchaseActualPrice(0);
      setPurchasePhotoUrl('');
      loadData();
    } catch (e) {
      alert('خطأ أثناء تسجيل عملية الشراء');
    }
  };

  const handleReceiveInWarehouse = async (id: string, qtyNeeded: number) => {
    if (!confirm('هل تم استلام المواد وفحصها بالكامل وإضافتها للرفوف؟')) return;
    try {
      const activeUser = { id: 'u-6' }; // WarehouseManager
      await api.receiveInWarehouse(id, activeUser.id, qtyNeeded);
      alert('تم إثبات استلام المواد بالمخزن وزيادة كميات الصنف تلقائياً.');
      loadData();
    } catch (e) {
      alert('خطأ أثناء إثبات الاستلام');
    }
  };

  const translateWHRStatus = (status: string) => {
    switch (status) {
      case 'Pending': return 'قيد الانتظار ⏳';
      case 'Approved': return 'تم الصرف بالكامل ✅';
      case 'Rejected': return 'مرفوض ❌';
      case 'PartiallyApproved': return 'صرف جزئي ⚠️';
      default: return status;
    }
  };

  const translateProcurementStatus = (status: string) => {
    switch (status) {
      case 'Pending': return 'بانتظار التسعير والمراجعة ⏳';
      case 'ReviewedByProcurement': return 'بانتظار التعميد المالي 💳';
      case 'FinanciallyApproved': return 'معتمد وبانتظار الشراء 🛒';
      case 'Purchased': return 'تم الشراء وبانتظار الاستلام 🚚';
      case 'Received': return 'تم الاستلام وإضافته للمخزن ✅';
      case 'Rejected': return 'مرفوض ❌';
      default: return status;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-right" dir="rtl">
      
      {/* Header Panel */}
      <div className="bg-white p-6 rounded-2xl border border-brand-secondary/15 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-teal-dark flex items-center gap-2.5">
            <Package className="w-6 h-6 text-brand-primary" />
            <span>نظام المستودعات</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5">
            مراقبة الأصناف، وتدقيق طلبات الصرف للفروع، وإدارة طلبات الشراء.
          </p>
        </div>

        {/* Branch Switcher (for managers) */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-semibold shrink-0">فرع العمل الحالي:</span>
          <select 
            value={selectedBranch} 
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3.5 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg text-slate-800 font-extrabold focus:outline-none"
          >
            <option value="b-1">فرع طريق السيل (مكة)</option>
            <option value="b-2">فرع منتجع الشاطئ (جدة)</option>
          </select>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex border-b border-brand-secondary/15 overflow-x-auto gap-2">
        <button
          onClick={() => { setActiveTab('stock'); router.push('/warehouse'); }}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-bold transition shrink-0 ${
            activeTab === 'stock'
              ? 'border-brand-primary text-brand-primary bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>المخزون والأصناف</span>
        </button>

        <button
          onClick={() => { setActiveTab('requests'); router.push('/warehouse?tab=requests'); }}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-bold transition shrink-0 ${
            activeTab === 'requests'
              ? 'border-brand-primary text-brand-primary bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>طلبات صرف الفروع</span>
        </button>

        <button
          onClick={() => { setActiveTab('procurement'); router.push('/procurement'); }}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-bold transition shrink-0 ${
            activeTab === 'procurement'
              ? 'border-brand-primary text-brand-primary bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>دورة طلبات الشراء (Procurement)</span>
        </button>


        <button
          onClick={() => { setActiveTab('movements'); router.push('/warehouse/movements'); }}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-bold transition shrink-0 ${
            activeTab === 'movements'
              ? 'border-brand-primary text-brand-primary bg-white'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>حركة وسجلات المخزن</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-400">جاري مطابقة ومزامنة السجلات اللوجستية...</p>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* TAB 1: STOCK & ITEMS */}
          {activeTab === 'stock' && (
            <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">إجمالي أصناف الفرع</span>
                    <span className="text-2xl font-extrabold text-brand-teal-dark mt-1 block">{stats.totalItems}</span>
                  </div>
                  <div className="p-3 bg-brand-primary/10 rounded-lg text-brand-primary">
                    <Package className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">الأصناف منخفضة المخزون</span>
                    <span className="text-2xl font-extrabold text-rose-600 mt-1 block">{stats.lowStockItems}</span>
                  </div>
                  <div className="p-3 bg-rose-50 rounded-lg text-rose-500">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 block">طلبات صرف معلقة</span>
                    <span className="text-2xl font-extrabold text-amber-700 mt-1 block">{stats.pendingRequests}</span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg text-amber-500">
                    <Clock className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Controls & Search */}
              <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <input
                      type="text"
                      placeholder="البحث عن صنف مخزني..."
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      className="w-full pl-3 pr-9 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3.5 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none"
                  >
                    <option value="">كل الفئات</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsAdjustStockOpen(true)}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs px-4.5 py-2.5 rounded-lg flex items-center gap-2 border border-slate-250 transition"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    <span>تسوية أو تعديل مخزون</span>
                  </button>

                  <button
                    onClick={() => setIsAddItemOpen(true)}
                    className="bg-brand-primary hover:bg-brand-primary-hover text-white font-extrabold text-xs px-4.5 py-2.5 rounded-lg flex items-center gap-2 transition shadow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة صنف جديد</span>
                  </button>
                </div>
              </div>

              {/* Items Table */}
              <div className="bg-white rounded-xl border border-brand-secondary/15 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold select-none">
                        <th className="p-4">اسم الصنف</th>
                        <th className="p-4">الفئة</th>
                        <th className="p-4">وحدة القياس</th>
                        <th className="p-4">الكمية المتوفرة</th>
                        <th className="p-4">الحد الأدنى</th>
                        <th className="p-4">الحالة</th>
                        <th className="p-4">مؤشر السعة</th>
                        <th className="p-4 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {stock
                        .filter(entry => {
                          const item = items.find(i => i.id === entry.itemId);
                          if (!item) return false;
                          const matchesSearch = item.name.includes(itemSearch);
                          const matchesCat = selectedCategory ? item.categoryId === selectedCategory : true;
                          return matchesSearch && matchesCat;
                        })
                        .map(entry => {
                          const item = items.find(i => i.id === entry.itemId);
                          const isLow = entry.quantity <= entry.minThreshold;
                          const fillPercent = Math.min(100, (entry.quantity / entry.maxCapacity) * 100);

                          return (
                            <tr key={entry.id} className="hover:bg-slate-50/50 font-semibold text-slate-700">
                              <td className="p-4 font-bold text-slate-900">{item?.name}</td>
                              <td className="p-4">
                                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] border border-slate-200">
                                  {item?.category?.name || 'عام'}
                                </span>
                              </td>
                              <td className="p-4 text-slate-400 font-bold">{item?.unit}</td>
                              <td className={`p-4 font-mono font-bold text-sm ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
                                {entry.quantity} {item?.unit}
                              </td>
                              <td className="p-4 text-slate-400 font-mono">{entry.minThreshold} {item?.unit}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  entry.quantity === 0
                                    ? 'bg-rose-50 text-rose-800'
                                    : isLow
                                    ? 'bg-amber-50 text-amber-800'
                                    : 'bg-emerald-50 text-emerald-800'
                                }`}>
                                  {entry.quantity === 0 ? 'نفذ المخزون ❌' : isLow ? 'مخزون منخفض ⚠️' : 'متوفر ومستقر ✅'}
                                </span>
                              </td>
                              <td className="p-4 max-w-xs">
                                <div className="flex items-center gap-2">
                                  <div className="w-24 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                                    <div 
                                      className={`h-full rounded-full ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                                      style={{ width: `${fillPercent}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-400">{fillPercent.toFixed(0)}%</span>
                                </div>
                              </td>
                              <td className="p-4 text-center">
                                <button
                                  onClick={() => handleOpenAddStockModal(entry.itemId, item?.name || '')}
                                  className="bg-brand-teal-dark hover:bg-brand-primary text-white text-[10px] font-bold px-2.5 py-1.5 rounded transition cursor-pointer"
                                >
                                  إضافة كمية
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WAREHOUSE REQUESTS (WHR) */}
          {activeTab === 'requests' && (
            <div className="space-y-6">
              {/* Filter */}
              <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center gap-3">
                <span className="text-xs text-slate-500 font-semibold">حالة الطلبات:</span>
                <select
                  value={requestStatusFilter}
                  onChange={(e) => setRequestStatusFilter(e.target.value)}
                  className="px-3.5 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none font-bold"
                >
                  <option value="All">عرض الكل</option>
                  <option value="Pending">قيد الانتظار المعلقة</option>
                  <option value="Approved">تم الصرف بالكامل</option>
                  <option value="PartiallyApproved">صرف جزئي</option>
                  <option value="Rejected">المرفوضة</option>
                </select>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl border border-brand-secondary/15 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold select-none">
                        <th className="p-4">رقم التذكرة</th>
                        <th className="p-4">المادة المطلوبة</th>
                        <th className="p-4">المقدم والفرع</th>
                        <th className="p-4">الكمية المطلوبة</th>
                        <th className="p-4">الكمية المنصرفة</th>
                        <th className="p-4">سبب الطلب</th>
                        <th className="p-4">تاريخ التقديم</th>
                        <th className="p-4">الحالة</th>
                        <th className="p-4 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {requests
                        .filter(r => requestStatusFilter === 'All' ? true : r.status === requestStatusFilter)
                        .map(req => {
                          const isPending = req.status === 'Pending';
                          return (
                            <tr key={req.id} className="hover:bg-slate-50/50 font-semibold text-slate-700">
                              <td className="p-4 text-brand-teal-dark font-black">#{req.ticketNumber}</td>
                              <td className="p-4 font-bold text-slate-900">{req.item?.name}</td>
                              <td className="p-4">
                                <div className="text-slate-800">{req.requester?.name}</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">{req.branch?.name === 'Sail Road Branch' ? 'فرع مكة' : 'فرع جدة'}</div>
                              </td>
                              <td className="p-4 font-mono font-bold">{req.quantityRequested} {req.item?.unit}</td>
                              <td className="p-4 font-mono text-emerald-700 font-extrabold">{req.quantityIssued} {req.item?.unit}</td>
                              <td className="p-4 text-slate-500 max-w-xs truncate">{req.purpose || '--'}</td>
                              <td className="p-4 text-slate-400 font-mono">{new Date(req.createdAt).toLocaleDateString('ar-EG')}</td>
                              <td className="p-4">
                                <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold ${
                                  req.status === 'Pending' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                                  req.status === 'Approved' ? 'bg-emerald-50 text-emerald-800 border border-emerald-250' :
                                  req.status === 'PartiallyApproved' ? 'bg-orange-50 text-orange-800 border border-orange-200' :
                                  'bg-rose-50 text-rose-800 border border-rose-200'
                                }`}>
                                  {translateWHRStatus(req.status)}
                                </span>
                              </td>
                              <td className="p-4">
                                {isPending ? (
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => handleApproveWHRFull(req.id, req.quantityRequested)}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded transition text-[10px] shadow-sm"
                                    >
                                      صرف كامل ✅
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedRequest(req);
                                        setPartialQty(req.quantityRequested);
                                        setIsPartialApproveOpen(true);
                                      }}
                                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-3 py-1.5 rounded transition text-[10px] shadow-sm"
                                    >
                                      صرف جزئي ⚠️
                                    </button>
                                    <button
                                      onClick={() => handleRejectWHR(req.id)}
                                      className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded transition text-[10px] shadow-sm"
                                    >
                                      رفض ❌
                                    </button>
                                  </div>
                                ) : (
                                  <div className="text-center text-[10px] text-slate-400 font-medium">
                                    المعلق بالاعتماد: {req.approver?.name || '--'}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PROCUREMENT PIPELINE */}
          {activeTab === 'procurement' && (
            <div className="space-y-6">
              {/* Filter */}
              <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center gap-3">
                <span className="text-xs text-slate-500 font-semibold">حالة طلب الشراء:</span>
                <select
                  value={procurementStatusFilter}
                  onChange={(e) => setProcurementStatusFilter(e.target.value)}
                  className="px-3.5 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none font-bold"
                >
                  <option value="All">عرض الكل</option>
                  <option value="Pending">تحت المراجعة والتسعير</option>
                  <option value="ReviewedByProcurement">بانتظار الموافقة المالية</option>
                  <option value="FinanciallyApproved">معتمد وجاهز للشراء</option>
                  <option value="Purchased">تم الشراء وفي طريق التوصيل</option>
                  <option value="Received">مستلم بالمخزن بالكامل</option>
                  <option value="Rejected">مرفوض</option>
                </select>
              </div>

              {/* Pipeline Grid Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {procurements
                  .filter(p => procurementStatusFilter === 'All' ? true : p.status === procurementStatusFilter)
                  .map(proc => {
                    const isPending = proc.status === 'Pending';
                    const isReviewed = proc.status === 'ReviewedByProcurement';
                    const isApproved = proc.status === 'FinanciallyApproved';
                    const isPurchased = proc.status === 'Purchased';
                    const isReceived = proc.status === 'Received';
                    const isRejected = proc.status === 'Rejected';

                    return (
                      <div 
                        key={proc.id} 
                        className={`bg-white rounded-xl border p-5 shadow-sm flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:shadow-md ${
                          isLowStockSource(proc.source) ? 'border-rose-100' : 'border-brand-secondary/15'
                        }`}
                      >
                        {/* Decorative tag for Source type */}
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black font-mono text-brand-teal-dark bg-brand-cream border border-brand-secondary/35 px-2 py-0.5 rounded">
                            #{proc.ticketNumber}
                          </span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                            proc.source === 'LowStock' ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-purple-50 text-purple-800 border border-purple-200'
                          }`}>
                            {proc.source === 'LowStock' ? 'نقص بالمخزون' : 'صيانة قطع غيار'}
                          </span>
                        </div>

                        {/* Title details */}
                        <div>
                          <h3 className="font-extrabold text-sm text-slate-900">{proc.itemName}</h3>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs text-slate-500">الكمية المطلوبة:</span>
                            <span className="text-xs font-black text-slate-800">{proc.quantityNeeded} {proc.unit}</span>
                          </div>
                        </div>

                        {/* Middle price / supplier details if filled */}
                        {(proc.estimatedPrice || proc.supplier) && (
                          <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100 flex flex-col gap-1.5 text-xs text-slate-600">
                            {proc.supplier && (
                              <div className="flex justify-between items-center">
                                <span>المورد المقترح:</span>
                                <span className="font-bold text-slate-800">{proc.supplier.name}</span>
                              </div>
                            )}
                            {proc.estimatedPrice && (
                              <div className="flex justify-between items-center">
                                <span>السعر المقدر:</span>
                                <span className="font-extrabold text-blue-900">{proc.estimatedPrice} ر.س</span>
                              </div>
                            )}
                            {proc.actualPrice && (
                              <div className="flex justify-between items-center text-emerald-800 font-extrabold">
                                <span>السعر الفعلي:</span>
                                <span>{proc.actualPrice} ر.س</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Notes */}
                        {proc.rejectionReason && (
                          <div className="bg-rose-50 text-rose-800 text-[10px] p-2.5 rounded border border-rose-100 font-bold">
                            سبب الرفض: {proc.rejectionReason}
                          </div>
                        )}

                        {/* Status Label */}
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="text-slate-400 font-semibold">حالة التدفق الحالية:</span>
                          <span className="font-extrabold text-slate-700">{translateProcurementStatus(proc.status)}</span>
                        </div>

                        {/* Actions */}
                        <div className="border-t border-slate-100 pt-3.5 mt-auto flex flex-wrap gap-2">
                          
                          {/* 1. Procurement Officer Review step */}
                          {isPending && currentRole === Role.ProcurementOfficer && (
                            <button
                              onClick={() => {
                                setSelectedProcurement(proc);
                                setReviewEstimatedPrice(500);
                                setIsReviewProcurementOpen(true);
                              }}
                              className="w-full bg-brand-primary hover:bg-brand-primary-hover text-white font-bold text-xs py-2 rounded-lg transition"
                            >
                              دراسة الطلب وتسعيره 🔎
                            </button>
                          )}

                          {/* 2. Accountant / Finance Manager Approve step */}
                          {isReviewed && (currentRole === Role.FinanceManager || currentRole === Role.Accountant || currentRole === Role.Admin) && (
                            <div className="flex w-full gap-2">
                              <button
                                onClick={() => handleApproveFinanceProcurement(proc.id)}
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-lg transition"
                              >
                                تعميد واعتماد مالي ✅
                              </button>
                              <button
                                onClick={() => handleRejectProcurement(proc.id)}
                                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition"
                              >
                                رفض
                              </button>
                            </div>
                          )}

                          {/* 3. Procurement Officer Purchase step */}
                          {isApproved && currentRole === Role.ProcurementOfficer && (
                            <button
                              onClick={() => {
                                setSelectedProcurement(proc);
                                setPurchaseActualPrice(proc.estimatedPrice || 0);
                                setIsPurchaseProcurementOpen(true);
                              }}
                              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 rounded-lg transition"
                            >
                              إثبات عملية الشراء والفاتورة 🛒
                            </button>
                          )}

                          {/* 4. Warehouse Manager Receive step */}
                          {isPurchased && currentRole === Role.WarehouseManager && (
                            <button
                              onClick={() => handleReceiveInWarehouse(proc.id, proc.quantityNeeded)}
                              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 rounded-lg transition shadow"
                            >
                              إثبات استلام وتنزيل بالرفوف 🚚
                            </button>
                          )}

                          {!isPending && !isReviewed && !isApproved && !isPurchased && (
                            <div className="text-[10px] text-slate-400 text-center w-full py-1.5 select-none italic">
                              {isReceived ? '✓ اكتملت دورة الطلب بنجاح' : isRejected ? '⚠ تم إغلاق الطلب بالرفض' : 'في انتظار الموظف المختص...'}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}


          {/* TAB 5: STOCK MOVEMENTS */}
          {activeTab === 'movements' && (
            <div className="bg-white p-6 rounded-xl border border-brand-secondary/15 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-brand-teal-dark border-b border-slate-100 pb-3">📋 سجل العمليات وحركة المواد المخزنية التاريخية</h2>
              
              {movements.length === 0 ? (
                <p className="text-xs text-slate-400 py-12 text-center">لا توجد سجلات حركة مواد للمستودع حالياً.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold select-none">
                        <th className="p-3">اسم المادة</th>
                        <th className="p-3">نوع الحركة</th>
                        <th className="p-3">الكمية</th>
                        <th className="p-3">سبب التحديث</th>
                        <th className="p-3">المشرف المسؤول</th>
                        <th className="p-3">ملاحظات</th>
                        <th className="p-3">تاريخ الحركة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {movements.map((move) => (
                        <tr key={move.id} className="hover:bg-slate-50/50 font-semibold text-slate-700">
                          <td className="p-3 font-bold text-slate-800">{move.item?.name}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              move.type === 'In' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                              move.type === 'Out' ? 'bg-rose-50 text-rose-800 border border-rose-200' :
                              move.type === 'Transfer' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                              'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}>
                              {move.type === 'In' ? 'إدخال مخزني 📥' :
                               move.type === 'Out' ? 'صرف مادة 📤' :
                               move.type === 'Transfer' ? 'نقل بين الفروع 🚚' : 'تسوية يدوية ⚙️'}
                            </span>
                          </td>
                          <td className={`p-3 font-mono font-bold ${move.quantity > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                            {move.quantity > 0 ? `+${move.quantity}` : move.quantity} {move.item?.unit}
                          </td>
                          <td className="p-3 text-slate-600">{move.reason}</td>
                          <td className="p-3 text-slate-800">{move.performer?.name || '--'}</td>
                          <td className="p-3 text-slate-400 font-medium">{move.note || '--'}</td>
                          <td className="p-3 text-slate-400 font-mono">
                            {new Date(move.createdAt).toLocaleString('ar-EG', { dateStyle: 'short', timeStyle: 'short' })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>
      )}

      {/* MODAL 1: ADD NEW ITEM */}
      {isAddItemOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateItem} className="bg-white rounded-2xl max-w-md w-full border border-brand-secondary/25 overflow-hidden animate-in zoom-in duration-200 text-right p-6 space-y-4">
            <h2 className="text-sm font-black text-brand-teal-dark border-b border-slate-100 pb-3">إضافة صنف مخزني جديد للمستودعات</h2>
            
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold">اسم الصنف:</label>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none focus:border-brand-primary"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold">وحدة القياس:</label>
                <select
                  value={newItemUnit}
                  onChange={(e) => setNewItemUnit(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none"
                >
                  <option value="قطعة">قطعة</option>
                  <option value="علبة">علبة</option>
                  <option value="لتر">لتر</option>
                  <option value="كيلو">كيلو</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold">الفئة:</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none"
                  required
                >
                  <option value="">اختر الفئة</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold">الوصف والتفاصيل:</label>
              <textarea
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none h-16"
              />
            </div>

            <div className="flex gap-3 justify-end pt-3">
              <button
                type="submit"
                className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                تأكيد الإضافة
              </button>
              <button
                type="button"
                onClick={() => setIsAddItemOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: ADJUST STOCK */}
      {isAdjustStockOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAdjustStock} className="bg-white rounded-2xl max-w-md w-full border border-brand-secondary/25 overflow-hidden animate-in zoom-in duration-200 text-right p-6 space-y-4">
            <h2 className="text-sm font-black text-brand-teal-dark border-b border-slate-100 pb-3">تسوية أو تعديل كميات صنف بالمخزن</h2>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold">الصنف المراد تعديله:</label>
              <select
                value={adjustItemId}
                onChange={(e) => setAdjustItemId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none"
                required
              >
                <option value="">اختر الصنف</option>
                {items.map(i => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold">نوع الحركة:</label>
                <select
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none"
                >
                  <option value="Adjustment">تسوية يدوية</option>
                  <option value="In">إدخال كمية</option>
                  <option value="Out">صرف كمية</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold">الكمية:</label>
                <input
                  type="number"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none"
                  min="1"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold">سبب التحديث:</label>
              <input
                type="text"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold">ملاحظات إضافية:</label>
              <textarea
                value={adjustNote}
                onChange={(e) => setAdjustNote(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none h-16"
              />
            </div>

            <div className="flex gap-3 justify-end pt-3">
              <button
                type="submit"
                className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                تأكيد التعديل
              </button>
              <button
                type="button"
                onClick={() => setIsAdjustStockOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: PARTIAL APPROVE */}
      {isPartialApproveOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleApproveWHRPartial} className="bg-white rounded-2xl max-w-sm w-full border border-brand-secondary/25 overflow-hidden animate-in zoom-in duration-200 text-right p-6 space-y-4">
            <h2 className="text-sm font-black text-brand-teal-dark border-b border-slate-100 pb-3">اعتماد صرف جزئي للمواد</h2>
            
            <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
              <div>الصنف المطلوب: <span className="font-bold text-slate-800">{selectedRequest.item?.name}</span></div>
              <div>الكمية المطلوبة بالأساس: <span className="font-bold text-slate-800">{selectedRequest.quantityRequested}</span></div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold">الكمية المنصرفة فعلياً:</label>
              <input
                type="number"
                value={partialQty}
                onChange={(e) => setPartialQty(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none"
                min="1"
                max={selectedRequest.quantityRequested}
                required
              />
            </div>

            <div className="flex gap-3 justify-end pt-3">
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                صرف جزئي
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPartialApproveOpen(false);
                  setSelectedRequest(null);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}


      {/* MODAL 5: REVIEW & PRICE PROCUREMENT */}
      {isReviewProcurementOpen && selectedProcurement && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleReviewProcurement} className="bg-white rounded-2xl max-w-md w-full border border-brand-secondary/25 overflow-hidden animate-in zoom-in duration-200 text-right p-6 space-y-4">
            <h2 className="text-sm font-black text-brand-teal-dark border-b border-slate-100 pb-3">تسعير ومراجعة طلب الشراء</h2>

            <div className="space-y-1 text-xs text-slate-600">
              <div>المادة المطلوبة للشراء: <span className="font-bold text-slate-800">{selectedProcurement.itemName}</span></div>
              <div>الكمية المطلوبة: <span className="font-bold text-slate-800">{selectedProcurement.quantityNeeded} {selectedProcurement.unit}</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold">السعر التقديري الإجمالي:</label>
                <input
                  type="number"
                  value={reviewEstimatedPrice}
                  onChange={(e) => setReviewEstimatedPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold">المورد المقترح:</label>
                <select
                  value={reviewSupplierId}
                  onChange={(e) => setReviewSupplierId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none"
                  required
                >
                  <option value="">اختر مورد</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold">طريقة الدفع المقترحة:</label>
              <select
                value={reviewPaymentMethod}
                onChange={(e) => setReviewPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none"
              >
                <option value="Cash">كاش / نقد</option>
                <option value="BankTransfer">تحويل بنكي</option>
                <option value="CreditCard">بطاقة ائتمان</option>
                <option value="Postpaid">آجل</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold">ملاحظات حول عرض السعر:</label>
              <textarea
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none h-16"
              />
            </div>

            <div className="flex gap-3 justify-end pt-3">
              <button
                type="submit"
                className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                تأكيد وإرسال للاعتماد المالي
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsReviewProcurementOpen(false);
                  setSelectedProcurement(null);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 6: MARK PURCHASED PROCUREMENT */}
      {isPurchaseProcurementOpen && selectedProcurement && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handlePurchaseProcurement} className="bg-white rounded-2xl max-w-md w-full border border-brand-secondary/25 overflow-hidden animate-in zoom-in duration-200 text-right p-6 space-y-4">
            <h2 className="text-sm font-black text-brand-teal-dark border-b border-slate-100 pb-3">إثبات عملية شراء وتوريد المواد</h2>

            <div className="space-y-1 text-xs text-slate-600">
              <div>الصنف: <span className="font-bold text-slate-800">{selectedProcurement.itemName}</span></div>
              <div>المورد المعتمد: <span className="font-bold text-slate-800">{selectedProcurement.supplier?.name}</span></div>
              <div>السعر المقدر مسبقاً: <span className="font-extrabold text-blue-900">{selectedProcurement.estimatedPrice} ر.س</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold">السعر الفعلي للشراء:</label>
                <input
                  type="number"
                  value={purchaseActualPrice}
                  onChange={(e) => setPurchaseActualPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none"
                  min="0.01"
                  step="0.01"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold">طريقة الدفع الفعلية:</label>
                <select
                  value={purchasePaymentMethod}
                  onChange={(e) => setPurchasePaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none"
                >
                  <option value="Cash">كاش / نقد</option>
                  <option value="BankTransfer">تحويل بنكي</option>
                  <option value="CreditCard">بطاقة ائتمان</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold">رابط صورة الفاتورة / الإيصال:</label>
              <input
                type="text"
                value={purchasePhotoUrl}
                onChange={(e) => setPurchasePhotoUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none"
                placeholder="https://..."
              />
            </div>

            <div className="flex gap-3 justify-end pt-3">
              <button
                type="submit"
                className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                تأكيد تسجيل الشراء
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPurchaseProcurementOpen(false);
                  setSelectedProcurement(null);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 7: ADD STOCK FOR ITEM */}
      {isAddStockModalOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddStockSubmit} className="bg-white rounded-2xl max-w-md w-full border border-brand-secondary/25 overflow-hidden animate-in zoom-in duration-200 text-right p-6 space-y-4">
            <h2 className="text-sm font-black text-brand-teal-dark border-b border-slate-100 pb-3">إضافة كمية جديدة للمخزون</h2>

            <div className="space-y-1 text-xs text-slate-600">
              <div>الصنف المستهدف: <span className="font-bold text-slate-800">{addStockItemName}</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold">الكمية المضافة:</label>
                <input
                  type="number"
                  value={addStockQty}
                  onChange={(e) => setAddStockQty(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none"
                  min="1"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-500 font-bold">رقم فاتورة المورد:</label>
                <input
                  type="text"
                  value={addStockInvoiceNo}
                  onChange={(e) => setAddStockInvoiceNo(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none"
                  placeholder="مثال: INV-9082"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold">ملاحظات التوريد:</label>
              <textarea
                value={addStockNotes}
                onChange={(e) => setAddStockNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-brand-secondary/20 rounded-lg focus:outline-none h-16"
                placeholder="اكتب أي تفاصيل أخرى حول عملية الاستلام..."
              />
            </div>

            <div className="flex gap-3 justify-end pt-3">
              <button
                type="submit"
                disabled={isSubmittingStock}
                className="bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-bold px-4 py-2 rounded-lg transition disabled:opacity-50"
              >
                {isSubmittingStock ? 'جاري التوريد...' : 'تأكيد التوريد'}
              </button>
              <button
                type="button"
                onClick={() => setIsAddStockModalOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg transition"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}

// Helpers
function isLowStockSource(source: string) {
  return source === 'LowStock';
}

export default function WarehousePage({ defaultTab }: { defaultTab?: string }) {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3">
        <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-400 font-sans">جاري تحميل المستودع...</p>
      </div>
    }>
      <WarehousePageContent defaultTab={defaultTab} />
    </Suspense>
  );
}
