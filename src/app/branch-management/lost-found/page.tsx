'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useRole } from '../../../components/RoleContext';
import { Role } from '../../../types_local';
import { api, LostFoundItem, DamageReport, Branch, User } from '../../../utils/api';
import { 
  Briefcase, 
  MapPin, 
  UserCheck, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Archive, 
  DollarSign, 
  Search, 
  Filter, 
  X, 
  RotateCw,
  Phone,
  User as UserIcon,
  CreditCard,
  FileText
} from 'lucide-react';

function LostFoundDashboard() {
  const { role: currentRole } = useRole();
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get('tab');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'lost-found' | 'damages'>(
    tabParam === 'damages' ? 'damages' : 'lost-found'
  );

  // Sync tab status with URL query param
  useEffect(() => {
    if (tabParam === 'damages') {
      setActiveTab('damages');
    } else {
      setActiveTab('lost-found');
    }
  }, [tabParam]);

  const handleTabChange = (tab: 'lost-found' | 'damages') => {
    setActiveTab(tab);
    router.replace(`/lost-found?tab=${tab}`);
  };

  // Data State
  const [lostItems, setLostItems] = useState<LostFoundItem[]>([]);
  const [damageReports, setDamageReports] = useState<DamageReport[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');
  const [lostStatusFilter, setLostStatusFilter] = useState<string>('');
  const [damageStatusFilter, setDamageStatusFilter] = useState<string>('');

  // Modals state
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedLostItem, setSelectedLostItem] = useState<LostFoundItem | null>(null);
  const [claimedBy, setClaimedBy] = useState('');
  const [claimedIdType, setClaimedIdType] = useState('NationalId');
  const [claimedIdNumber, setClaimedIdNumber] = useState('');

  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactGuestName, setContactGuestName] = useState('');
  const [contactGuestPhone, setContactGuestPhone] = useState('');

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedDamageReport, setSelectedDamageReport] = useState<DamageReport | null>(null);
  const [finalValue, setFinalValue] = useState<number>(0);
  const [reviewNote, setReviewNote] = useState('');

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentRef, setPaymentRef] = useState('');

  const [refusalModalOpen, setRefusalModalOpen] = useState(false);
  const [refusalReason, setRefusalReason] = useState('');

  const [waiverModalOpen, setWaiverModalOpen] = useState(false);
  const [waiverReason, setWaiverReason] = useState('');

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check roles
  const isManager = currentRole === Role.Admin || currentRole === Role.CEO || currentRole === Role.BranchManager;
  const isReceptionist = currentRole === Role.Receptionist;
  const canManageAll = currentRole === Role.Admin || currentRole === Role.CEO;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [allItems, allDamage, allBranches, allUsers] = await Promise.all([
        api.getLostItems(),
        api.getDamageReports(),
        api.getBranches(),
        api.getUsers()
      ]);

      setBranches(allBranches);
      setUsers(allUsers);

      // Find current user branch constraints
      const currentUser = allUsers.find(u => u.role === currentRole);
      if (currentUser && currentUser.branchId && !canManageAll) {
        setSelectedBranchId(currentUser.branchId);
        setLostItems(allItems.filter(item => item.branchId === currentUser.branchId));
        setDamageReports(allDamage.filter(dmg => dmg.branchId === currentUser.branchId));
      } else {
        setLostItems(allItems);
        setDamageReports(allDamage);
      }
    } catch (error) {
      console.error('Failed to load Lost & Found / Damage data:', error);
      showToast('خطأ أثناء تحميل البيانات من الخادم', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentRole]);

  // Apply filters locally or re-fetch
  const handleBranchChange = (branchId: string) => {
    setSelectedBranchId(branchId);
  };

  const filteredLostItems = lostItems.filter(item => {
    const matchesBranch = selectedBranchId ? item.branchId === selectedBranchId : true;
    const matchesStatus = lostStatusFilter ? item.status === lostStatusFilter : true;
    return matchesBranch && matchesStatus;
  });

  const filteredDamageReports = damageReports.filter(dmg => {
    const matchesBranch = selectedBranchId ? dmg.branchId === selectedBranchId : true;
    const matchesStatus = damageStatusFilter ? dmg.status === damageStatusFilter : true;
    return matchesBranch && matchesStatus;
  });

  // Dynamic Lost Items stats
  const lostStats = {
    stored: lostItems.filter(item => item.status === 'Stored').length,
    contacted: lostItems.filter(item => item.status === 'ContactedGuest').length,
    claimed: lostItems.filter(item => item.status === 'Claimed').length,
    archived: lostItems.filter(item => item.status === 'Archived').length
  };

  // Dynamic Damage Reports stats
  const damageStats = {
    newOrReview: damageReports.filter(dmg => dmg.status === 'New' || dmg.status === 'UnderReview').length,
    pendingDecision: damageReports.filter(dmg => dmg.status === 'PendingGuestDecision').length,
    paid: damageReports.filter(dmg => dmg.status === 'Paid').length,
    refused: damageReports.filter(dmg => dmg.status === 'Refused').length,
    waived: damageReports.filter(dmg => dmg.status === 'WaivedByManagement').length,
    totalCollected: damageReports.filter(dmg => dmg.status === 'Paid').reduce((sum, dmg) => sum + (dmg.finalValue || 0), 0)
  };

  // Lost & Found Actions
  const handleContactGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLostItem) return;
    if (!contactGuestName.trim() || !contactGuestPhone.trim()) {
      showToast('الرجاء إدخال اسم ورقم هاتف النزيل', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.contactGuest(selectedLostItem.id, {
        guestName: contactGuestName.trim(),
        guestPhone: contactGuestPhone.trim()
      });
      showToast('تم تحديث حالة الاتصال بالنزيل بنجاح');
      setContactModalOpen(false);
      loadData();
    } catch (error) {
      showToast('فشل تحديث حالة الاتصال', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClaimItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLostItem) return;
    if (!claimedBy.trim() || !claimedIdNumber.trim()) {
      showToast('الرجاء تعبئة بيانات المستلم بشكل كامل', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const activeUser = users.find(u => u.role === currentRole) || { id: 'u-3' };
      await api.claimItem(selectedLostItem.id, {
        claimedBy: claimedBy.trim(),
        claimedIdType,
        claimedIdNumber: claimedIdNumber.trim(),
        handedOverBy: activeUser.id
      });
      showToast(`تم تسليم المفقودات إلى "${claimedBy}" بنجاح وإغلاق التذكرة.`);
      setClaimModalOpen(false);
      setClaimedBy('');
      setClaimedIdNumber('');
      loadData();
    } catch (error) {
      showToast('فشل إتمام عملية التسليم', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchiveItem = async (id: string) => {
    if (!confirm('هل أنت متأكد من أرشفة هذا البلاغ؟ سيتم نقله للأرشيف التاريخي.')) return;
    try {
      await api.archiveItem(id);
      showToast('تمت أرشفة المفقود بنجاح');
      loadData();
    } catch (error) {
      showToast('فشل أرشفة المفقود', 'error');
    }
  };

  // Damage Actions
  const handleReviewDamage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDamageReport) return;
    if (finalValue <= 0) {
      showToast('الرجاء إدخال قيمة تعويض صالحة', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const activeUser = users.find(u => u.role === currentRole) || { id: 'u-10' };
      await api.reviewDamage(selectedDamageReport.id, {
        reviewerId: activeUser.id,
        finalValue,
        reviewNote: reviewNote.trim() || null
      });
      showToast('تم مراجعة بلاغ التلف وإرسال القيمة التقديرية للعميل');
      setReviewModalOpen(false);
      setReviewNote('');
      loadData();
    } catch (error) {
      showToast('فشل إرسال المراجعة', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCollectPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDamageReport) return;

    setIsSubmitting(true);
    try {
      const activeUser = users.find(u => u.role === currentRole) || { id: 'u-3' };
      await api.collectDamagePayment(selectedDamageReport.id, {
        paymentMethod,
        paymentRef: paymentRef.trim() || null,
        collectedBy: activeUser.id
      });
      showToast('تم تسجيل سداد قيمة التلف بنجاح وتوثيق العملية مالياً');
      setPaymentModalOpen(false);
      setPaymentRef('');
      loadData();
    } catch (error) {
      showToast('فشل تسجيل الدفع', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRefuseDamage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDamageReport) return;
    if (!refusalReason.trim()) {
      showToast('الرجاء إدخال سبب رفض النزيل', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.markDamageRefused(selectedDamageReport.id, refusalReason.trim());
      showToast('تم توثيق رفض العميل ورفع البلاغ للمتابعة الإدارية والقانونية');
      setRefusalModalOpen(false);
      setRefusalReason('');
      loadData();
    } catch (error) {
      showToast('فشل توثيق الرفض', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWaiveDamage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDamageReport) return;
    if (!waiverReason.trim()) {
      showToast('الرجاء إدخال مبرر التنازل المعتمد', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const activeUser = users.find(u => u.role === currentRole) || { id: 'u-10' };
      await api.waiveDamage(selectedDamageReport.id, activeUser.id, waiverReason.trim());
      showToast('تم التنازل عن قيمة التلف وإعفاء النزيل رسمياً');
      setWaiverModalOpen(false);
      setWaiverReason('');
      loadData();
    } catch (error) {
      showToast('فشل تسجيل التنازل', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const translateLostStatus = (status: string) => {
    switch (status) {
      case 'Stored': return 'مخزن بالمستودع';
      case 'ContactedGuest': return 'تم التواصل مع النزيل';
      case 'Claimed': return 'تم التسليم للنزيل';
      case 'Archived': return 'مؤرشف';
      default: return status;
    }
  };

  const translateDamageStatus = (status: string) => {
    switch (status) {
      case 'New': return 'جديد';
      case 'UnderReview': return 'قيد المراجعة والتقدير';
      case 'PendingGuestDecision': return 'بانتظار قرار النزيل';
      case 'Paid': return 'تم السداد';
      case 'Refused': return 'رفض السداد';
      case 'WaivedByManagement': return 'معفى / تنازل إداري';
      default: return status;
    }
  };

  const translateDamageType = (type: string) => {
    switch (type) {
      case 'Electronics': return 'أجهزة إلكترونية 📺';
      case 'Fixture': return 'تجهيزات ومثبتات 🪞';
      case 'Furniture': return 'أثاث خشب وعام 🪑';
      case 'Linen': return 'بياضات وشراشف 🛌';
      default: return type;
    }
  };

  const translateIdType = (type: string) => {
    switch (type) {
      case 'NationalId': return 'هوية وطنية';
      case 'Passport': return 'جواز سفر';
      case 'Iqama': return 'إقامة';
      case 'DrivingLicense': return 'رخصة قيادة';
      default: return type;
    }
  };

  const translatePaymentMethod = (method: string) => {
    switch (method) {
      case 'Cash': return 'نقداً 💵';
      case 'Mada': return 'مدى 💳';
      case 'Visa': return 'فيزا 💳';
      case 'Mastercard': return 'ماستركارد 💳';
      case 'BankTransfer': return 'تحويل بنكي 🏦';
      default: return method;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-right" dir="rtl">
      
      {/* Toast Notification */}
      {toast && (
        <div 
          className={`fixed bottom-5 left-5 z-50 px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 text-xs font-bold transition-all transform duration-300 translate-y-0 border ${
            toast.type === 'error' 
              ? 'bg-rose-50 border-rose-300 text-rose-800' 
              : 'bg-emerald-50 border-emerald-300 text-emerald-800'
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="bg-brand-teal-dark text-white p-6 rounded-xl border border-brand-secondary/35 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-brand-secondary/10 blur-2xl"></div>
        <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-brand-secondary/40"></div>
        <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-brand-secondary/40"></div>

        <div>
          <h1 className="text-lg font-bold tracking-wide font-sans">قسم المفقودات والتلفيات</h1>
          <p className="text-xs text-white/70 mt-1">
            إدارة المفقودات الشخصية للنزلاء وتسوية تقارير التلفيات داخل الغرف وتوثيق التعويضات المالية.
          </p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex bg-white/10 p-1 rounded-lg border border-white/10 shrink-0">
          <button
            onClick={() => handleTabChange('lost-found')}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'lost-found' 
                ? 'bg-brand-secondary text-brand-teal-dark shadow' 
                : 'text-white hover:bg-white/5'
            }`}
          >
            🔍 المفقودات (Lost & Found)
          </button>
          <button
            onClick={() => handleTabChange('damages')}
            className={`px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'damages' 
                ? 'bg-brand-secondary text-brand-teal-dark shadow' 
                : 'text-white hover:bg-white/5'
            }`}
          >
            ⚠️ بلاغات التلفيات (Damages)
          </button>
        </div>
      </div>

      {/* Filters & Actions Panel */}
      <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
          {/* Branch Select */}
          {canManageAll ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 shrink-0">تصفية حسب الفرع:</span>
              <select
                value={selectedBranchId}
                onChange={(e) => handleBranchChange(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none focus:border-brand-primary"
              >
                <option value="">جميع فروع فنادق راحتي</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name === 'Sail Road Branch' ? 'فرع طريق السيل' : b.name === 'Beachside Resort Branch' ? 'فرع منتجع الشاطئ' : b.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-brand-teal-dark font-extrabold bg-brand-cream/30 border border-brand-secondary/25 px-3 py-1.5 rounded-lg select-none">
              <MapPin className="w-3.5 h-3.5 text-brand-secondary" />
              <span>
                الفرع المقيد: {
                  branches.find(b => b.id === selectedBranchId)?.name === 'Sail Road Branch' 
                    ? 'فرع طريق السيل' 
                    : branches.find(b => b.id === selectedBranchId)?.name || 'تحت التحميل...'
                }
              </span>
            </div>
          )}

          {/* Tab Specific Filter */}
          {activeTab === 'lost-found' ? (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 shrink-0">الحالة:</span>
              <select
                value={lostStatusFilter}
                onChange={(e) => setLostStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none focus:border-brand-primary"
              >
                <option value="">كل حالات المفقودات</option>
                <option value="Stored">مخزن بالمستودع</option>
                <option value="ContactedGuest">تم التواصل مع النزيل</option>
                <option value="Claimed">تم التسليم</option>
                <option value="Archived">مؤرشف</option>
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-400 shrink-0">حالة السداد / التسوية:</span>
              <select
                value={damageStatusFilter}
                onChange={(e) => setDamageStatusFilter(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:outline-none focus:border-brand-primary"
              >
                <option value="">كل حالات التلفيات</option>
                <option value="New">جديد</option>
                <option value="UnderReview">قيد المراجعة</option>
                <option value="PendingGuestDecision">بانتظار قرار النزيل</option>
                <option value="Paid">تم السداد</option>
                <option value="Refused">رفض السداد</option>
                <option value="WaivedByManagement">معفى / إعفاء إداري</option>
              </select>
            </div>
          )}
        </div>

        <button 
          onClick={loadData}
          className="text-xs font-bold text-brand-teal-dark bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-lg border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCw className="w-3.5 h-3.5" />
          تحديث السجلات
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-muted italic flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
          <span>جاري تحميل السجلات والبيانات...</span>
        </div>
      ) : activeTab === 'lost-found' ? (
        <>
          {/* Lost & Found Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">مخزن بالأمانات</span>
                <span className="text-xl font-extrabold text-brand-teal-dark mt-1 block">{lostStats.stored}</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                <Briefcase className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">تم التواصل مع النزيل</span>
                <span className="text-xl font-extrabold text-blue-600 mt-1 block">{lostStats.contacted}</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">تم التسليم والاستلام</span>
                <span className="text-xl font-extrabold text-emerald-700 mt-1 block">{lostStats.claimed}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">بلاغات مؤرشفة (+30 يوم)</span>
                <span className="text-xl font-extrabold text-slate-500 mt-1 block">{lostStats.archived}</span>
              </div>
              <div className="p-3 bg-slate-100 rounded-lg text-slate-500">
                <Archive className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Lost & Found Table */}
          <div className="bg-white rounded-xl border border-brand-secondary/20 shadow-sm overflow-hidden">
            {filteredLostItems.length === 0 ? (
              <div className="text-center py-20 text-xs text-slate-400 italic">لا يوجد بلاغات مفقودات مطابقة للتصفية حالياً.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-brand-cream-dark border-b border-brand-secondary/20 text-brand-teal-dark text-xs font-bold">
                      <th className="px-6 py-4">رقم التذكرة</th>
                      <th className="px-6 py-4">الموقع المكتشف فيه</th>
                      <th className="px-6 py-4">الوصف والتفاصيل</th>
                      <th className="px-6 py-4">المبلغ عنه (الموظف)</th>
                      <th className="px-6 py-4">حالة البلاغ</th>
                      <th className="px-6 py-4">معلومات النزيل</th>
                      <th className="px-6 py-4 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-cream-dark text-xs text-brand-teal-dark/95">
                    {filteredLostItems.map((item) => (
                      <tr key={item.id} className="hover:bg-brand-cream/10 transition-colors">
                        <td className="px-6 py-4 font-black text-brand-teal-dark">#{item.ticketNumber}</td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                          {item.location}
                          <span className="block text-[10px] text-slate-400 font-medium font-sans">
                            {item.branch?.name === 'Sail Road Branch' ? 'فرع طريق السيل' : 'فرع منتجع الشاطئ'}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-xs leading-relaxed text-slate-600 font-medium">
                          {item.description}
                          {item.notes && (
                            <span className="block text-[10px] text-slate-400 font-sans italic mt-0.5">
                              ملاحظات: {item.notes}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">
                          {item.reporter?.name || 'فاطمة أحمد (عامل نظافة)'}
                          <span className="block text-[9px] text-slate-400">
                            {new Date(item.createdAt).toLocaleDateString('ar-EG')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                            item.status === 'Stored' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            item.status === 'ContactedGuest' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                            item.status === 'Claimed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            'bg-slate-50 text-slate-800 border-slate-200'
                          }`}>
                            {translateLostStatus(item.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {item.guestName ? (
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-800">{item.guestName}</div>
                              <div className="font-mono text-[10px] text-slate-500 dir-ltr text-right">{item.guestPhone}</div>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">لم يُربط بنزيل بعد</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Contact action */}
                            {item.status === 'Stored' && isReceptionist && (
                              <button
                                onClick={() => {
                                  setSelectedLostItem(item);
                                  setContactGuestName(item.guestName || '');
                                  setContactGuestPhone(item.guestPhone || '');
                                  setContactModalOpen(true);
                                }}
                                className="bg-brand-primary text-white text-[10px] font-bold px-2.5 py-1.5 rounded hover:bg-brand-primary-light transition cursor-pointer"
                              >
                                ربط واتصال 📞
                              </button>
                            )}

                            {/* Claim action */}
                            {['Stored', 'ContactedGuest'].includes(item.status) && isReceptionist && (
                              <button
                                onClick={() => {
                                  setSelectedLostItem(item);
                                  setClaimModalOpen(true);
                                }}
                                className="bg-brand-secondary text-brand-teal-dark text-[10px] font-black px-2.5 py-1.5 rounded hover:bg-brand-secondary-hover transition cursor-pointer"
                              >
                                تسليم للنزيل 🤝
                              </button>
                            )}

                            {/* Archive action */}
                            {item.status === 'Stored' && isManager && (
                              <button
                                onClick={() => handleArchiveItem(item.id)}
                                className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1.5 rounded hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
                              >
                                أرشفة 📥
                              </button>
                            )}

                            {/* Show details for claimed/archived */}
                            {['Claimed', 'Archived'].includes(item.status) && (
                              <div className="text-[10px] text-slate-400 font-semibold bg-slate-50 border border-slate-100 px-2 py-1 rounded">
                                {item.status === 'Claimed' 
                                  ? `مستلم من: ${item.claimedBy}` 
                                  : `أرشفة: ${new Date(item.archivedAt!).toLocaleDateString('ar-EG')}`
                                }
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Damage Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">بانتظار تقدير التعويض</span>
                <span className="text-xl font-extrabold text-amber-700 mt-1 block">{damageStats.newOrReview}</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">بانتظار سداد النزيل</span>
                <span className="text-xl font-extrabold text-blue-700 mt-1 block">{damageStats.pendingDecision}</span>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">تم سداد التعويضات المالية</span>
                <span className="text-xl font-extrabold text-emerald-700 mt-1 block">{damageStats.paid}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block">إجمالي التعويضات المحصلة</span>
                <span className="text-xl font-extrabold text-brand-teal-dark mt-1 block">{damageStats.totalCollected} ر.س</span>
              </div>
              <div className="p-3 bg-brand-primary/10 rounded-lg text-brand-primary">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Damages Table */}
          <div className="bg-white rounded-xl border border-brand-secondary/20 shadow-sm overflow-hidden">
            {filteredDamageReports.length === 0 ? (
              <div className="text-center py-20 text-xs text-slate-400 italic">لا يوجد بلاغات تلفيات مطابقة للتصفية حالياً.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-brand-cream-dark border-b border-brand-secondary/20 text-brand-teal-dark text-xs font-bold">
                      <th className="px-6 py-4">رقم البلاغ</th>
                      <th className="px-6 py-4">رقم الغرفة والفرع</th>
                      <th className="px-6 py-4">نوع التلف والوصف</th>
                      <th className="px-6 py-4">النزيل والحجز</th>
                      <th className="px-6 py-4">قيمة التعويض</th>
                      <th className="px-6 py-4">حالة الملف</th>
                      <th className="px-6 py-4 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-cream-dark text-xs text-brand-teal-dark/95">
                    {filteredDamageReports.map((dmg) => (
                      <tr key={dmg.id} className="hover:bg-brand-cream/10 transition-colors">
                        <td className="px-6 py-4 font-black text-brand-teal-dark">#{dmg.ticketNumber}</td>
                        <td className="px-6 py-4 font-bold text-slate-800">
                          {dmg.roomNumber}
                          <span className="block text-[10px] text-slate-400 font-medium font-sans">
                            {dmg.branch?.name === 'Sail Road Branch' ? 'فرع طريق السيل' : 'فرع منتجع الشاطئ'}
                          </span>
                        </td>
                        <td className="px-6 py-4 max-w-xs leading-relaxed text-slate-600 font-medium">
                          <span className="block text-slate-900 font-bold mb-0.5">{translateDamageType(dmg.damageType)}</span>
                          {dmg.description}
                          {dmg.reportedDuring === 'Checkout' ? (
                            <span className="inline-block mt-1 bg-rose-50 text-rose-800 text-[8px] font-black px-1.5 py-0.2 rounded border border-rose-200">أثناء المغادرة (Checkout)</span>
                          ) : (
                            <span className="inline-block mt-1 bg-amber-50 text-amber-800 text-[8px] font-black px-1.5 py-0.2 rounded border border-amber-200">أثناء الإقامة (Stay)</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">
                          {dmg.guestName ? (
                            <div className="space-y-0.5">
                              <div>{dmg.guestName}</div>
                              <div className="text-[10px] text-slate-400 font-sans">مرجع الحجز: {dmg.reservationRef || 'لا يوجد'}</div>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">غير متوفر</span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-900">
                          {dmg.finalValue !== null && dmg.finalValue !== undefined ? (
                            <span className="text-emerald-800 text-sm font-black">{dmg.finalValue} ر.س</span>
                          ) : dmg.estimatedValue ? (
                            <span className="text-slate-500">{dmg.estimatedValue} ر.س (تقديري)</span>
                          ) : (
                            <span className="text-rose-500 italic text-[10px]">لم يحدد بعد</span>
                          )}
                          {dmg.paymentMethod && (
                            <span className="block text-[9px] text-slate-400 font-sans mt-0.5 font-medium">
                              طريقة السداد: {translatePaymentMethod(dmg.paymentMethod)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                            dmg.status === 'New' ? 'bg-slate-50 text-slate-800 border-slate-200' :
                            dmg.status === 'UnderReview' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                            dmg.status === 'PendingGuestDecision' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                            dmg.status === 'Paid' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                            dmg.status === 'Refused' ? 'bg-rose-50 text-rose-800 border-rose-200' :
                            'bg-purple-50 text-purple-800 border-purple-200'
                          }`}>
                            {translateDamageStatus(dmg.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-xs">
                            {/* Manager Review */}
                            {['New', 'UnderReview'].includes(dmg.status) && isManager && (
                              <button
                                onClick={() => {
                                  setSelectedDamageReport(dmg);
                                  setFinalValue(dmg.estimatedValue || 0);
                                  setReviewNote(dmg.reviewNote || '');
                                  setReviewModalOpen(true);
                                }}
                                className="bg-brand-primary text-white text-[10px] font-bold px-2 py-1 rounded hover:bg-brand-primary-light transition cursor-pointer"
                              >
                                تقدير التعويض ✏️
                              </button>
                            )}

                            {/* Receptionist Collect Payment / Guest Decisions */}
                            {dmg.status === 'PendingGuestDecision' && isReceptionist && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedDamageReport(dmg);
                                    setPaymentModalOpen(true);
                                  }}
                                  className="bg-emerald-600 text-white text-[10px] font-black px-2 py-1 rounded hover:bg-emerald-700 transition cursor-pointer"
                                >
                                  تسجيل دفع 💵
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedDamageReport(dmg);
                                    setRefusalModalOpen(true);
                                  }}
                                  className="bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded hover:bg-rose-700 transition cursor-pointer"
                                >
                                  رفض السداد ❌
                                </button>
                              </>
                            )}

                            {/* Manager Waiver */}
                            {['New', 'UnderReview', 'PendingGuestDecision', 'Refused'].includes(dmg.status) && isManager && (
                              <button
                                onClick={() => {
                                  setSelectedDamageReport(dmg);
                                  setWaiverModalOpen(true);
                                }}
                                className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-1 rounded hover:bg-purple-200 border border-purple-200 transition cursor-pointer"
                              >
                                إعفاء / تنازل ⚖️
                              </button>
                            )}

                            {/* Non-actionable status placeholder */}
                            {['Paid', 'WaivedByManagement'].includes(dmg.status) && (
                              <div className="text-[10px] text-slate-400 font-semibold bg-slate-50 border border-slate-100 px-2 py-1 rounded select-none">
                                {dmg.status === 'Paid' 
                                  ? `تم التحصيل بواسطة: ${dmg.collectedBy ? users.find(u=>u.id===dmg.collectedBy)?.name || 'الاستقبال' : 'الاستقبال'}` 
                                  : `تم التنازل: ${dmg.waiverReason}`
                                }
                              </div>
                            )}

                            {dmg.status === 'Refused' && !isManager && (
                              <span className="text-[10px] text-rose-600 font-bold bg-rose-50 border border-rose-100 px-2 py-1 rounded">
                                النزيل يرفض السداد
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ========================================== */}
      {/* MODALS SECTION                             */}
      {/* ========================================== */}

      {/* 1. Contact / Bind Guest Modal */}
      {contactModalOpen && selectedLostItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-teal-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-brand-secondary/30 overflow-hidden flex flex-col">
            <div className="bg-brand-teal-dark text-white p-5 border-b border-brand-secondary/20 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-secondary">ربط النزيل والاتصال به</h3>
                <p className="text-[10px] text-white/60 mt-1">تعبئة بيانات النزيل لربط المفقود وإرسال رسالة واتساب آلية.</p>
              </div>
              <button onClick={() => setContactModalOpen(false)} className="text-white/60 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleContactGuest} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-teal-dark block">اسم النزيل بالكامل:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: خالد العتيبي"
                  value={contactGuestName}
                  onChange={(e) => setContactGuestName(e.target.value)}
                  className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-teal-dark block">رقم جوال النزيل (مربوط بالواتساب):</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: +966500000000"
                  value={contactGuestPhone}
                  onChange={(e) => setContactGuestPhone(e.target.value)}
                  className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary text-left font-mono"
                  dir="ltr"
                />
                <span className="text-[9px] text-slate-400 block mt-0.5">يرجى كتابة رقم الهاتف برمز الدولة ومفتاح الدولة الدولي.</span>
              </div>

              <div className="pt-4 border-t border-brand-cream-dark flex items-center justify-end gap-3">
                <button type="button" onClick={() => setContactGuestPhone('')} className="text-xs font-bold border border-brand-secondary/25 hover:bg-brand-cream-dark text-brand-teal-dark px-4 py-2 rounded transition-all cursor-pointer">إلغاء</button>
                <button type="submit" disabled={isSubmitting} className="text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white px-5 py-2 rounded border border-brand-primary transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
                  {isSubmitting && <RotateCw className="animate-spin w-3.5 h-3.5" />}
                  ربط النزيل والتواصل 📱
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Claim Item Modal */}
      {claimModalOpen && selectedLostItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-teal-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-brand-secondary/30 overflow-hidden flex flex-col">
            <div className="bg-brand-teal-dark text-white p-5 border-b border-brand-secondary/20 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-secondary">تسليم المفقودات للنزيل</h3>
                <p className="text-[10px] text-white/60 mt-1">توثيق هوية المستلم وإثبات الشخصية لإغلاق تذكرة الأمانات.</p>
              </div>
              <button onClick={() => setClaimModalOpen(false)} className="text-white/60 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleClaimItem} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-teal-dark block">اسم المستلم الفعلي:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أحمد عبد الله (أو النزيل نفسه)"
                  value={claimedBy}
                  onChange={(e) => setClaimedBy(e.target.value)}
                  className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-teal-dark block">نوع إثبات الشخصية:</label>
                  <select
                    value={claimedIdType}
                    onChange={(e) => setClaimedIdType(e.target.value)}
                    className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-medium"
                  >
                    <option value="NationalId">هوية وطنية</option>
                    <option value="Passport">جواز سفر</option>
                    <option value="Iqama">إقامة مقيم</option>
                    <option value="DrivingLicense">رخصة قيادة</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-teal-dark block">رقم إثبات الهوية:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: 1023456789"
                    value={claimedIdNumber}
                    onChange={(e) => setClaimedIdNumber(e.target.value)}
                    className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-brand-cream-dark flex items-center justify-end gap-3">
                <button type="button" onClick={() => setClaimModalOpen(false)} className="text-xs font-bold border border-brand-secondary/25 hover:bg-brand-cream-dark text-brand-teal-dark px-4 py-2 rounded transition-all cursor-pointer">إلغاء</button>
                <button type="submit" disabled={isSubmitting} className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
                  {isSubmitting && <RotateCw className="animate-spin w-3.5 h-3.5" />}
                  تأكيد تسليم الأمانة 🤝
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Review & Set Damage Compensation Value Modal */}
      {reviewModalOpen && selectedDamageReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-teal-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-brand-secondary/30 overflow-hidden flex flex-col">
            <div className="bg-brand-teal-dark text-white p-5 border-b border-brand-secondary/20 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-secondary">تقدير ومراجعة قيمة التعويض</h3>
                <p className="text-[10px] text-white/60 mt-1">تحديد القيمة النهائية للتعويض المالي عن التلفيات.</p>
              </div>
              <button onClick={() => setReviewModalOpen(false)} className="text-white/60 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewDamage} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-teal-dark block">قيمة التعويض النهائية (بالريال السعودي):</label>
                <input
                  type="number"
                  required
                  placeholder="مثال: 500"
                  value={finalValue || ''}
                  onChange={(e) => setFinalValue(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-mono text-left"
                  dir="ltr"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-teal-dark block">ملاحظات وقرار اللجنة الفنية / الإدارة:</label>
                <textarea
                  placeholder="أدخل مبررات تحديد القيمة وتفاصيل التلف..."
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary h-24 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-brand-cream-dark flex items-center justify-end gap-3">
                <button type="button" onClick={() => setReviewModalOpen(false)} className="text-xs font-bold border border-brand-secondary/25 hover:bg-brand-cream-dark text-brand-teal-dark px-4 py-2 rounded transition-all cursor-pointer">إلغاء</button>
                <button type="submit" disabled={isSubmitting} className="text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white px-5 py-2 rounded border border-brand-primary transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
                  {isSubmitting && <RotateCw className="animate-spin w-3.5 h-3.5" />}
                  اعتماد وإرسال القيمة ✏️
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Collect Damage Payment Modal */}
      {paymentModalOpen && selectedDamageReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-teal-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-brand-secondary/30 overflow-hidden flex flex-col">
            <div className="bg-brand-teal-dark text-white p-5 border-b border-brand-secondary/20 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-secondary">تسجيل تحصيل مبلغ التعويض</h3>
                <p className="text-[10px] text-white/60 mt-1">تحديد وسيلة السداد وتوثيق رقم السند المالي المرجعي.</p>
              </div>
              <button onClick={() => setPaymentModalOpen(false)} className="text-white/60 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCollectPayment} className="p-6 space-y-4">
              <div className="p-3 bg-emerald-50 rounded border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between">
                <span>المبلغ المطلوب تحصيله:</span>
                <span className="font-mono text-sm font-black">{selectedDamageReport.finalValue} ر.س</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-teal-dark block">طريقة الدفع وسداد القيمة:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-medium"
                >
                  <option value="Cash">نقداً</option>
                  <option value="Mada">بطاقة مدى</option>
                  <option value="Visa">فيزا كارد</option>
                  <option value="Mastercard">ماستركارد</option>
                  <option value="BankTransfer">تحويل بنكي</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-teal-dark block">رقم العملية / رقم السند المالي (إن وجد):</label>
                <input
                  type="text"
                  placeholder="مثال: TXN-102938"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-mono"
                />
              </div>

              <div className="pt-4 border-t border-brand-cream-dark flex items-center justify-end gap-3">
                <button type="button" onClick={() => setPaymentModalOpen(false)} className="text-xs font-bold border border-brand-secondary/25 hover:bg-brand-cream-dark text-brand-teal-dark px-4 py-2 rounded transition-all cursor-pointer">إلغاء</button>
                <button type="submit" disabled={isSubmitting} className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
                  {isSubmitting && <RotateCw className="animate-spin w-3.5 h-3.5" />}
                  تأكيد التحصيل والسداد ✅
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Refusal Reason Modal */}
      {refusalModalOpen && selectedDamageReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-teal-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-brand-secondary/30 overflow-hidden flex flex-col">
            <div className="bg-brand-teal-dark text-white p-5 border-b border-brand-secondary/20 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-secondary">توثيق رفض النزيل للسداد</h3>
                <p className="text-[10px] text-white/60 mt-1">كتابة مبررات النزيل للرفض لرفعها للمسؤولين.</p>
              </div>
              <button onClick={() => setRefusalModalOpen(false)} className="text-white/60 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRefuseDamage} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-teal-dark block">أسباب ومبررات الرفض المقدمة من العميل:</label>
                <textarea
                  required
                  placeholder="مثال: النزيل ينكر مسؤوليته ويدعي كسر الكرسي قبل استلامه للغرفة..."
                  value={refusalReason}
                  onChange={(e) => setRefusalReason(e.target.value)}
                  className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary h-24 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-brand-cream-dark flex items-center justify-end gap-3">
                <button type="button" onClick={() => setRefusalModalOpen(false)} className="text-xs font-bold border border-brand-secondary/25 hover:bg-brand-cream-dark text-brand-teal-dark px-4 py-2 rounded transition-all cursor-pointer">إلغاء</button>
                <button type="submit" disabled={isSubmitting} className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
                  {isSubmitting && <RotateCw className="animate-spin w-3.5 h-3.5" />}
                  توثيق ورفع التقرير ❌
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Waiver Damage Request Modal */}
      {waiverModalOpen && selectedDamageReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-teal-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-brand-secondary/30 overflow-hidden flex flex-col">
            <div className="bg-brand-teal-dark text-white p-5 border-b border-brand-secondary/20 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-secondary">إصدار قرار تنازل وإعفاء إداري</h3>
                <p className="text-[10px] text-white/60 mt-1">إعفاء النزيل من قيمة التلف بالكامل وتسويتها حسابياً.</p>
              </div>
              <button onClick={() => setWaiverModalOpen(false)} className="text-white/60 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleWaiveDamage} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-teal-dark block">مبررات التنازل والإعفاء الإداري (إلزامي):</label>
                <textarea
                  required
                  placeholder="مثال: نظراً لكون النزيل من كبار عملاء الفندق وتم الإعفاء كخدمة ضيافة بتكليف من الإدارة..."
                  value={waiverReason}
                  onChange={(e) => setWaiverReason(e.target.value)}
                  className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary h-24 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-brand-cream-dark flex items-center justify-end gap-3">
                <button type="button" onClick={() => setWaiverModalOpen(false)} className="text-xs font-bold border border-brand-secondary/25 hover:bg-brand-cream-dark text-brand-teal-dark px-4 py-2 rounded transition-all cursor-pointer">إلغاء</button>
                <button type="submit" disabled={isSubmitting} className="text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
                  {isSubmitting && <RotateCw className="animate-spin w-3.5 h-3.5" />}
                  اعتماد التنازل والإعفاء ⚖️
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-brand-teal-dark">جاري تحميل الصفحة...</p>
      </div>
    }>
      <LostFoundDashboard />
    </Suspense>
  );
}
