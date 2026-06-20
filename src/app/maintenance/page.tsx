'use client';

import React, { useState, useEffect } from 'react';
import { api, MaintenanceRequest, User, Branch } from '../../utils/api';
import { useRole } from '../../components/RoleContext';
import { Role } from '../../types_local';
import {
  Wrench, CheckCircle2, XCircle, AlertCircle, Calendar, User as UserIcon,
  RefreshCw, SlidersHorizontal, Check, X, ShieldAlert, Eye, Plus, Search,
  Clock, MapPin, ClipboardList, Info, Image, MessageSquare, ChevronLeft
} from 'lucide-react';

export default function MaintenancePage() {
  const { role: currentRole } = useRole();
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [dateFromFilter, setDateFromFilter] = useState<string>('');
  const [dateToFilter, setDateToFilter] = useState<string>('');
  const [searchTicket, setSearchTicket] = useState<string>('');

  // Modals state
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [isNewRequestModalOpen, setIsNewRequestModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Modal actions inputs
  const [selectedTechId, setSelectedTechId] = useState<string>('');
  const [confirmActionType, setConfirmActionType] = useState<'approve' | 'reject'>('approve');
  const [confirmNote, setConfirmNote] = useState<string>('');
  const [confirmError, setConfirmError] = useState<string>('');

  // New Request form inputs
  const [newRequestBranchId, setNewRequestBranchId] = useState<string>('');
  const [newRequestCategory, setNewRequestCategory] = useState<string>('Electrical');
  const [newRequestLocation, setNewRequestLocation] = useState<string>('');
  const [newRequestDescription, setNewRequestDescription] = useState<string>('');
  const [newRequestPriority, setNewRequestPriority] = useState<string>('Normal');
  const [newRequestPhotoUrl, setNewRequestPhotoUrl] = useState<string>('');
  const [newRequestError, setNewRequestError] = useState<string>('');

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Role Checks
  const isAdminOrSupervisor = currentRole === Role.Admin || currentRole === Role.MaintenanceSupervisor;
  const isBranchManager = currentRole === Role.BranchManager;
  const isStaff = currentRole === Role.Admin || currentRole === Role.CEO || currentRole === Role.MaintenanceSupervisor || currentRole === Role.BranchManager;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [reqsData, branchesData, usersData] = await Promise.all([
        api.getMaintenanceRequests(),
        api.getBranches(),
        api.getUsers()
      ]);
      setRequests(reqsData);
      setBranches(branchesData);
      setUsers(usersData);
      // Filter technicians
      setTechnicians(usersData.filter(u => u.role === Role.Technician));

      if (branchesData.length > 0) {
        setNewRequestBranchId(branchesData[0].id);
      }
    } catch (error) {
      console.error('Failed to load maintenance data:', error);
      showToast('خطأ أثناء تحميل البيانات من الخادم', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStaff) return;
    if (!newRequestLocation.trim() || !newRequestDescription.trim()) {
      setNewRequestError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsSubmitting(true);
    setNewRequestError('');
    try {
      const activeUser = users.find(u => u.role === currentRole) || users[0];
      const newReq = await api.createMaintenanceRequest({
        reportedBy: activeUser ? activeUser.id : 'u-1',
        branchId: newRequestBranchId,
        category: newRequestCategory,
        location: newRequestLocation,
        description: newRequestDescription,
        priority: newRequestPriority,
        photoUrl: newRequestPhotoUrl || undefined
      });

      setRequests([newReq, ...requests]);
      setIsNewRequestModalOpen(false);
      showToast('تم إنشاء بلاغ الصيانة بنجاح');
      
      // Reset Form
      setNewRequestLocation('');
      setNewRequestDescription('');
      setNewRequestPhotoUrl('');
      setNewRequestCategory('Electrical');
      setNewRequestPriority('Normal');
    } catch (error: any) {
      console.error(error);
      setNewRequestError(error?.message || 'حدث خطأ أثناء حفظ البلاغ');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssignTechnician = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminOrSupervisor || !selectedRequest || !selectedTechId) return;

    setIsSubmitting(true);
    try {
      const supervisor = users.find(u => u.role === currentRole) || users[0];
      const updated = await api.assignTechnician(selectedRequest.id, selectedTechId, supervisor?.id);
      setRequests(requests.map(r => r.id === selectedRequest.id ? updated : r));
      setSelectedRequest(updated);
      setIsAssignModalOpen(false);
      showToast('تم تعيين الفني بنجاح وإرسال إشعار له');
    } catch (error: any) {
      console.error(error);
      showToast('فشل تعيين الفني: ' + (error?.message || 'خطأ غير معروف'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    if (confirmActionType === 'reject' && !confirmNote.trim()) {
      setConfirmError('يرجى كتابة سبب رفض العمل لتوجيهه للفني');
      return;
    }

    setIsSubmitting(true);
    setConfirmError('');
    try {
      const approver = users.find(u => u.role === currentRole) || users[0];
      let updated: MaintenanceRequest;

      if (confirmActionType === 'approve') {
        updated = await api.approveCompletion(selectedRequest.id, confirmNote || undefined, approver?.id);
        showToast('تم اعتماد إنجاز البلاغ وإغلاقه بنجاح');
      } else {
        updated = await api.rejectCompletion(selectedRequest.id, confirmNote, approver?.id);
        showToast('تم رفض إغلاق البلاغ وإعادته للفني مع التفاصيل', 'error');
      }

      setRequests(requests.map(r => r.id === selectedRequest.id ? updated : r));
      setSelectedRequest(updated);
      setIsConfirmModalOpen(false);
      setConfirmNote('');
    } catch (error: any) {
      console.error(error);
      setConfirmError(error?.message || 'حدث خطأ أثناء حفظ القرار');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResumeRequest = async (id: string) => {
    if (!isAdminOrSupervisor) return;
    setIsSubmitting(true);
    try {
      const supervisor = users.find(u => u.role === currentRole) || users[0];
      const updated = await api.resumeAfterParts(id, supervisor?.id);
      setRequests(requests.map(r => r.id === id ? updated : r));
      if (selectedRequest?.id === id) {
        setSelectedRequest(updated);
      }
      showToast('تم استئناف البلاغ بعد وصول قطع الغيار');
    } catch (error: any) {
      console.error(error);
      showToast('فشل الاستئناف: ' + (error?.message || 'خطأ غير معروف'), 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper functions for translation
  const getArabicStatus = (status: string) => {
    switch (status) {
      case 'New': return 'جديد';
      case 'AssignedToTechnician': return 'تم تعيين الفني';
      case 'InProgress': return 'قيد التنفيذ';
      case 'PendingInternalApproval': return 'بانتظار التأكيد';
      case 'SpareParts': return 'بانتظار قطع الغيار';
      case 'Rejected': return 'مرفوض';
      case 'Closed': return 'مغلق';
      default: return status;
    }
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'New': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'AssignedToTechnician': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'InProgress': return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'PendingInternalApproval': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'SpareParts': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Rejected': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Closed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getArabicPriority = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'عاجل جداً';
      case 'High': return 'عالية';
      case 'Normal': return 'عادية';
      case 'Low': return 'منخفضة';
      default: return priority;
    }
  };

  const getPriorityColorClass = (priority: string) => {
    switch (priority) {
      case 'Urgent': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Normal': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Low': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getArabicCategory = (category: string) => {
    switch (category) {
      case 'Electrical': return 'كهرباء ⚡';
      case 'Plumbing': return 'سباكة 🚿';
      case 'AC': return 'تكييف ❄️';
      case 'Carpentry': return 'نجارة 🪚';
      case 'Cleaning': return 'نظافة وتجهيز 🧹';
      case 'General': return 'عام 🔧';
      default: return category;
    }
  };

  const getArabicTimelineAction = (action: string) => {
    switch (action) {
      case 'Created': return 'إنشاء البلاغ';
      case 'Assigned': return 'تعيين الفني';
      case 'Started': return 'بدء العمل';
      case 'CompletionSubmitted': return 'تقديم تقرير الإنجاز';
      case 'Approved': return 'اعتماد وإغلاق البلاغ';
      case 'Rejected': return 'رفض الإنجاز وإعادة البلاغ';
      case 'Closed': return 'تأكيد وإغلاق البلاغ';
      case 'SparePartsRequested': return 'طلب قطع غيار وإيقاف البلاغ';
      default: return action;
    }
  };

  const getTimelineBadgeStyle = (action: string) => {
    switch (action) {
      case 'Created': return 'bg-gray-100 text-gray-700';
      case 'Assigned': return 'bg-blue-100 text-blue-700';
      case 'Started': return 'bg-sky-100 text-sky-700';
      case 'CompletionSubmitted': return 'bg-amber-100 text-amber-700';
      case 'Approved': case 'Closed': return 'bg-emerald-100 text-emerald-700';
      case 'Rejected': return 'bg-rose-100 text-rose-700';
      case 'SparePartsRequested': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Stats Calculations
  const statsNew = requests.filter(r => r.status === 'New').length;
  const statsInProgress = requests.filter(r => r.status === 'InProgress' || r.status === 'AssignedToTechnician').length;
  const statsPending = requests.filter(r => r.status === 'PendingInternalApproval').length;
  const statsUrgent = requests.filter(r => r.priority === 'Urgent' && r.status !== 'Closed').length;
  
  // Closed today helper
  const statsClosedToday = requests.filter(r => {
    if (r.status !== 'Closed' || !r.closedAt) return false;
    const closedDate = new Date(r.closedAt);
    const today = new Date();
    return closedDate.getDate() === today.getDate() &&
           closedDate.getMonth() === today.getMonth() &&
           closedDate.getFullYear() === today.getFullYear();
  }).length;

  // Filter logic
  const filteredRequests = requests.filter(req => {
    if (statusFilter !== 'all' && req.status !== statusFilter) return false;
    if (branchFilter !== 'all' && req.branchId !== branchFilter) return false;
    if (categoryFilter !== 'all' && req.category !== categoryFilter) return false;
    if (priorityFilter !== 'all' && req.priority !== priorityFilter) return false;
    
    // Ticket search
    if (searchTicket.trim() && !req.ticketNumber.toLowerCase().includes(searchTicket.toLowerCase().trim())) {
      return false;
    }

    // Dates
    const createdAt = new Date(req.createdAt);
    createdAt.setHours(0, 0, 0, 0);

    if (dateFromFilter) {
      const from = new Date(dateFromFilter);
      from.setHours(0, 0, 0, 0);
      if (createdAt < from) return false;
    }
    if (dateToFilter) {
      const to = new Date(dateToFilter);
      to.setHours(0, 0, 0, 0);
      if (createdAt > to) return false;
    }

    return true;
  });

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 left-4 z-50 p-4 rounded-xl shadow-2xl border text-sm font-semibold transition-all duration-300 transform scale-100 flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-rose-500" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-teal-dark tracking-wide">🛠️ إدارة بلاغات الصيانة</h1>
          <p className="text-sm text-gray-500 mt-1">تتبع دورة حياة بلاغات الأعطال في جميع فروع الفندق والتحكم في إنجازها</p>
        </div>
        {isStaff && (
          <button
            onClick={() => setIsNewRequestModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-xl text-sm font-extrabold hover:bg-brand-primary-light transition-all shadow-md active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>إنشاء بلاغ صيانة</span>
          </button>
        )}
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-amber-50/50 backdrop-blur-sm border border-amber-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-all">
          <span className="text-xs text-amber-800 font-extrabold">🟡 جديد</span>
          <span className="text-2xl font-black text-amber-900 mt-2">{statsNew}</span>
        </div>
        <div className="bg-blue-50/50 backdrop-blur-sm border border-blue-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-all">
          <span className="text-xs text-blue-800 font-extrabold">🔵 قيد التنفيذ</span>
          <span className="text-2xl font-black text-blue-900 mt-2">{statsInProgress}</span>
        </div>
        <div className="bg-orange-50/50 backdrop-blur-sm border border-orange-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-all">
          <span className="text-xs text-orange-800 font-extrabold">🟠 بانتظار التأكيد</span>
          <span className="text-2xl font-black text-orange-900 mt-2">{statsPending}</span>
        </div>
        <div className="bg-rose-50/50 backdrop-blur-sm border border-rose-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-all">
          <span className="text-xs text-rose-800 font-extrabold">🔴 عاجل</span>
          <span className="text-2xl font-black text-rose-900 mt-2">{statsUrgent}</span>
        </div>
        <div className="bg-emerald-50/50 backdrop-blur-sm border border-emerald-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-all col-span-2 md:col-span-1">
          <span className="text-xs text-emerald-800 font-extrabold">🟢 مغلق اليوم</span>
          <span className="text-2xl font-black text-emerald-900 mt-2">{statsClosedToday}</span>
        </div>
      </div>

      {/* Filters Area */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 border-b border-gray-100 pb-2">
          <SlidersHorizontal className="w-4 h-4 text-brand-primary" />
          <span>تصفية بلاغات الأعطال والبحث</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          {/* Ticket Number Search */}
          <div className="relative">
            <span className="absolute right-3 top-3.5 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="بحث برقم البلاغ..."
              value={searchTicket}
              onChange={(e) => setSearchTicket(e.target.value)}
              className="w-full pl-3 pr-9 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-1 focus:ring-brand-primary focus:border-brand-primary focus:outline-none transition-colors"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors font-semibold"
          >
            <option value="all">كل الحالات</option>
            <option value="New">جديد 🟡</option>
            <option value="AssignedToTechnician">تم التعيين 🔵</option>
            <option value="InProgress">قيد التنفيذ 🔵</option>
            <option value="PendingInternalApproval">بانتظار التأكيد 🟠</option>
            <option value="SpareParts">بانتظار قطع الغيار 🟣</option>
            <option value="Rejected">مرفوض 🔴</option>
            <option value="Closed">مغلق 🟢</option>
          </select>

          {/* Branch Filter */}
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors font-semibold"
          >
            <option value="all">كل الفروع</option>
            {branches.map(b => (
              <option key={b.id} value={b.id}>
                {b.name === 'Sail Road Branch' ? 'فرع طريق السيل' :
                 b.name === 'Beachside Resort Branch' ? 'فرع منتجع الشاطئ' : b.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors font-semibold"
          >
            <option value="all">كل الفئات</option>
            <option value="Electrical">كهرباء ⚡</option>
            <option value="Plumbing">سباكة 🚿</option>
            <option value="AC">تكييف ❄️</option>
            <option value="Carpentry">نجارة 🪚</option>
            <option value="Cleaning">نظافة وتجهيز 🧹</option>
            <option value="General">عام 🔧</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors font-semibold"
          >
            <option value="all">كل الأولويات</option>
            <option value="Urgent">عاجل جداً 🔴</option>
            <option value="High">عالية 🟠</option>
            <option value="Normal">عادية 🟡</option>
            <option value="Low">منخفضة 🟢</option>
          </select>

          {/* Refresh / Clear Button */}
          <button
            onClick={() => {
              setStatusFilter('all');
              setBranchFilter('all');
              setCategoryFilter('all');
              setPriorityFilter('all');
              setDateFromFilter('');
              setDateToFilter('');
              setSearchTicket('');
              loadData();
            }}
            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة ضبط الفلاتر</span>
          </button>
        </div>

        {/* Date Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 whitespace-nowrap">من تاريخ:</span>
            <input
              type="date"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 whitespace-nowrap">إلى تاريخ:</span>
            <input
              type="date"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-gray-400">جاري تحميل البيانات...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <ClipboardList className="w-16 h-16 text-gray-300" />
            <h3 className="text-base font-black text-gray-700">لا توجد بلاغات صيانة مطابقة</h3>
            <p className="text-xs text-gray-400 max-w-sm">قم بتغيير خيارات التصفية أو أنشئ بلاغ صيانة جديد للبدء في تتبعه</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-gray-50/75 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-extrabold text-gray-500 whitespace-nowrap">رقم البلاغ</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-gray-500 whitespace-nowrap">الفرع</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-gray-500 whitespace-nowrap">الفئة</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-gray-500 whitespace-nowrap">الموقع</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-gray-500 whitespace-nowrap">الوصف</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-gray-500 whitespace-nowrap">الأولوية</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-gray-500 whitespace-nowrap">الحالة</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-gray-500 whitespace-nowrap">الفني المعين</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-gray-500 whitespace-nowrap">تاريخ الرفع</th>
                  <th className="px-6 py-4 text-xs font-extrabold text-gray-500 whitespace-nowrap text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Ticket Number */}
                    <td className="px-6 py-4 text-xs font-black text-brand-teal-dark whitespace-nowrap">
                      #{req.ticketNumber}
                    </td>

                    {/* Branch */}
                    <td className="px-6 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">
                      {req.branchName === 'Sail Road Branch' ? 'فرع طريق السيل' :
                       req.branchName === 'Beachside Resort Branch' ? 'فرع منتجع الشاطئ' : req.branchName}
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4 text-xs font-bold text-gray-600 whitespace-nowrap">
                      {getArabicCategory(req.category)}
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">
                      {req.location}
                    </td>

                    {/* Description */}
                    <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate" title={req.description}>
                      {req.description}
                    </td>

                    {/* Priority */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full border ${getPriorityColorClass(req.priority)}`}>
                        {getArabicPriority(req.priority)}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getStatusColorClass(req.status)}`}>
                        {getArabicStatus(req.status)}
                      </span>
                    </td>

                    {/* Technician */}
                    <td className="px-6 py-4 text-xs font-bold text-gray-700 whitespace-nowrap">
                      {req.technicianName ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                          <span>{req.technicianName}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">لم يعين فني</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(req.createdAt).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Details Button */}
                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all"
                          title="تفاصيل بلاغ الصيانة"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>تفاصيل</span>
                        </button>

                        {/* Supervisor Actions */}
                        {isAdminOrSupervisor && req.status === 'New' && (
                          <button
                            onClick={() => {
                              setSelectedRequest(req);
                              setSelectedTechId('');
                              setIsAssignModalOpen(true);
                            }}
                            className="bg-brand-primary hover:bg-brand-primary-light text-white px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all shadow-sm"
                          >
                            تعيين فني
                          </button>
                        )}

                        {isAdminOrSupervisor && req.status === 'Rejected' && (
                          <button
                            onClick={() => {
                              setSelectedRequest(req);
                              setSelectedTechId(req.assignedTo || '');
                              setIsAssignModalOpen(true);
                            }}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all shadow-sm"
                          >
                            إعادة تعيين فني
                          </button>
                        )}

                        {isAdminOrSupervisor && req.status === 'SpareParts' && (
                          <button
                            onClick={() => handleResumeRequest(req.id)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all shadow-sm"
                            disabled={isSubmitting}
                          >
                            استئناف
                          </button>
                        )}

                        {/* Branch Manager Actions */}
                        {isBranchManager && req.status === 'PendingInternalApproval' && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => {
                                setSelectedRequest(req);
                                setConfirmActionType('approve');
                                setConfirmNote('');
                                setIsConfirmModalOpen(true);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1.5 rounded-lg text-[11px] font-extrabold transition-all"
                            >
                              تأكيد
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(req);
                                setConfirmActionType('reject');
                                setConfirmNote('');
                                setIsConfirmModalOpen(true);
                              }}
                              className="bg-rose-600 hover:bg-rose-700 text-white px-2 py-1.5 rounded-lg text-[11px] font-extrabold transition-all"
                            >
                              رفض
                            </button>
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

      {/* 1. Modal: Request Details */}
      {selectedRequest && !isAssignModalOpen && !isConfirmModalOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-black text-brand-teal-dark">بلاغ صيانة #{selectedRequest.ticketNumber}</h3>
                <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getStatusColorClass(selectedRequest.status)}`}>
                  {getArabicStatus(selectedRequest.status)}
                </span>
                <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${getPriorityColorClass(selectedRequest.priority)}`}>
                  {getArabicPriority(selectedRequest.priority)}
                </span>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-right">
              {/* Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div>
                  <span className="block text-[10px] font-bold text-gray-400">الفرع</span>
                  <span className="text-xs font-black text-gray-700 mt-1 block">
                    {selectedRequest.branchName === 'Sail Road Branch' ? 'فرع طريق السيل' :
                     selectedRequest.branchName === 'Beachside Resort Branch' ? 'فرع منتجع الشاطئ' : selectedRequest.branchName}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400">الفئة</span>
                  <span className="text-xs font-black text-gray-700 mt-1 block">{getArabicCategory(selectedRequest.category)}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400">الموقع المحدد</span>
                  <span className="text-xs font-black text-gray-700 mt-1 block">{selectedRequest.location}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-gray-400">مقدم البلاغ</span>
                  <span className="text-xs font-black text-gray-700 mt-1 block">{selectedRequest.reporterName || 'موظف بالفندق'}</span>
                </div>
              </div>

              {/* Description & Initial Photo */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-gray-700 flex items-center gap-1.5">
                  <ClipboardList className="w-4 h-4 text-brand-primary" />
                  <span>تفاصيل ووصف العطل</span>
                </h4>
                <p className="text-xs text-gray-600 bg-white border border-gray-100 p-3.5 rounded-xl leading-relaxed whitespace-pre-line">
                  {selectedRequest.description}
                </p>

                {selectedRequest.photoUrl && (
                  <div className="mt-3">
                    <span className="block text-[10px] font-bold text-gray-400 mb-1.5 flex items-center gap-1">
                      <Image className="w-3.5 h-3.5" />
                      <span>صورة العطل المرفقة:</span>
                    </span>
                    <div className="relative max-w-sm rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-1">
                      <img
                        src={selectedRequest.photoUrl}
                        alt="صورة العطل"
                        className="w-full max-h-56 object-cover rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Completion Section */}
              {selectedRequest.completedAt && (
                <div className="border-t border-dashed border-gray-200 pt-4 space-y-3">
                  <h4 className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>تقرير إنجاز الفني</span>
                  </h4>
                  <div className="bg-emerald-50/35 border border-emerald-100 rounded-xl p-3.5 space-y-2">
                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold border-b border-emerald-50 pb-1.5">
                      <span>الفني: {selectedRequest.technicianName}</span>
                      <span>التاريخ: {new Date(selectedRequest.completedAt).toLocaleString('ar-EG')}</span>
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      {selectedRequest.completionNote || 'لا توجد ملاحظات إضافية.'}
                    </p>
                    {selectedRequest.completionPhotoUrl && (
                      <div className="mt-2 pt-2 border-t border-emerald-50">
                        <span className="block text-[9px] font-bold text-gray-400 mb-1 flex items-center gap-1">
                          <Image className="w-3 h-3" />
                          <span>صورة العمل المنجز:</span>
                        </span>
                        <div className="relative max-w-xs rounded-lg overflow-hidden border border-emerald-200/40 p-0.5">
                          <img
                            src={selectedRequest.completionPhotoUrl}
                            alt="صورة الإنجاز"
                            className="w-full max-h-40 object-cover rounded"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rejection / Supervisor Notes */}
              {(selectedRequest.rejectionReason || selectedRequest.supervisorNote) && (
                <div className="border-t border-dashed border-gray-200 pt-4 space-y-3">
                  {selectedRequest.rejectionReason && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-black text-rose-800 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-rose-500" />
                        <span>سبب رفض الإغلاق السابق (تكرار الرفض: {selectedRequest.rejectionCount})</span>
                      </h4>
                      <p className="text-xs text-rose-800 bg-rose-50/50 border border-rose-100 p-3 rounded-xl">
                        {selectedRequest.rejectionReason}
                      </p>
                    </div>
                  )}
                  {selectedRequest.supervisorNote && (
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-black text-gray-700 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-brand-primary" />
                        <span>ملاحظات المشرف/المدير عند الإغلاق</span>
                      </h4>
                      <p className="text-xs text-gray-600 bg-gray-50 border border-gray-200/50 p-3 rounded-xl">
                        {selectedRequest.supervisorNote}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Lifecycle Actions timeline */}
              <div className="border-t border-gray-100 pt-5 space-y-3">
                <h4 className="text-xs font-black text-gray-700 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-brand-primary" />
                  <span>سجل الإجراءات والدورة الزمنية</span>
                </h4>

                <div className="relative border-r border-gray-100 mr-2.5 pr-4 space-y-4 py-2">
                  {(selectedRequest.timeline || []).map((t) => (
                    <div key={t.id} className="relative">
                      {/* Dot icon */}
                      <span className="absolute -right-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-brand-primary"></span>
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                        <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full max-w-max ${getTimelineBadgeStyle(t.action)}`}>
                          {getArabicTimelineAction(t.action)}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold">
                          {new Date(t.createdAt).toLocaleString('ar-EG')}
                        </span>
                      </div>

                      <div className="text-[11px] text-gray-500 mt-1 font-semibold flex items-center gap-2">
                        <span>بواسطة: {t.performerName}</span>
                        {t.note && <span className="text-gray-400 font-normal">| {t.note}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div className="p-6 border-t border-gray-100 flex justify-between gap-3 bg-gray-50/50">
              <div>
                {/* Embedded quick actions based on role */}
                {isAdminOrSupervisor && selectedRequest.status === 'New' && (
                  <button
                    onClick={() => setIsAssignModalOpen(true)}
                    className="bg-brand-primary hover:bg-brand-primary-light text-white px-4 py-2 rounded-xl text-xs font-extrabold transition-all"
                  >
                    تعيين فني
                  </button>
                )}
                {isAdminOrSupervisor && selectedRequest.status === 'Rejected' && (
                  <button
                    onClick={() => {
                      setSelectedTechId(selectedRequest.assignedTo || '');
                      setIsAssignModalOpen(true);
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-extrabold transition-all"
                  >
                    إعادة تعيين فني
                  </button>
                )}
                {isAdminOrSupervisor && selectedRequest.status === 'SpareParts' && (
                  <button
                    onClick={() => handleResumeRequest(selectedRequest.id)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold transition-all"
                    disabled={isSubmitting}
                  >
                    استئناف بعد وصول القطع
                  </button>
                )}
                {isBranchManager && selectedRequest.status === 'PendingInternalApproval' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setConfirmActionType('approve');
                        setConfirmNote('');
                        setIsConfirmModalOpen(true);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold transition-all"
                    >
                      ✅ اعتماد الإغلاق
                    </button>
                    <button
                      onClick={() => {
                        setConfirmActionType('reject');
                        setConfirmNote('');
                        setIsConfirmModalOpen(true);
                      }}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-extrabold transition-all"
                    >
                      ❌ رفض مع سبب
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-5 py-2 rounded-xl text-xs font-bold transition-all"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Modal: Assign Technician */}
      {isAssignModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-black text-brand-teal-dark">👷 تعيين فني صيانة للبلاغ #{selectedRequest.ticketNumber}</h3>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="w-8 h-8 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignTechnician} className="p-6 space-y-4 text-right">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">اختر الفني المناسب:</label>
                <select
                  required
                  value={selectedTechId}
                  onChange={(e) => setSelectedTechId(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none transition-all font-semibold"
                >
                  <option value="">-- اختر الفني --</option>
                  {technicians.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} (فني)
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-400 mt-2">
                  ملاحظة: سيتم إشعار الفني فوراً ببيانات بلاغ الصيانة عبر رسائل WhatsApp.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand-primary hover:bg-brand-primary-light text-white px-5 py-2 rounded-xl text-xs font-extrabold shadow-sm active:scale-95 transition-all"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'تأكيد التعيين'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Approve / Reject Completion */}
      {isConfirmModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-gray-100 flex flex-col">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-base font-black text-brand-teal-dark">
                {confirmActionType === 'approve' ? '✅ اعتماد وإغلاق بلاغ الصيانة' : '❌ رفض تقرير الإنجاز وإعادة البلاغ'}
              </h3>
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="w-8 h-8 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmAction} className="p-6 space-y-4 text-right">
              {confirmError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-800 text-xs font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <span>{confirmError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">
                  {confirmActionType === 'approve'
                    ? 'أضف ملاحظة الاعتماد (اختياري):'
                    : 'اذكر سبب الرفض بالتفصيل (مطلوب):'}
                </label>
                <textarea
                  rows={4}
                  value={confirmNote}
                  onChange={(e) => setConfirmNote(e.target.value)}
                  placeholder={
                    confirmActionType === 'approve'
                      ? 'مثال: تم التأكد من عمل المكيف بشكل ممتاز...'
                      : 'مثال: الباب ما زال يهتز عند الفتح، يرجى إعادة ضبط المفصلات...'
                  }
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all font-medium leading-relaxed"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2 rounded-xl text-xs font-extrabold shadow-sm active:scale-95 transition-all text-white ${
                    confirmActionType === 'approve'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isSubmitting ? 'جاري التحديث...' : confirmActionType === 'approve' ? 'اعتماد وإغلاق البلاغ' : 'رفض وإرجاع للفني'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal: Create New Maintenance Request Manual */}
      {isNewRequestModalOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-brand-teal-dark">🛠️ رفع بلاغ صيانة جديد (نيابة عن موظف)</h3>
              <button
                onClick={() => setIsNewRequestModalOpen(false)}
                className="w-8 h-8 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="p-6 overflow-y-auto space-y-4 text-right flex-1">
              {newRequestError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 text-rose-800 text-xs font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <span>{newRequestError}</span>
                </div>
              )}

              {/* Branch Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">الفرع التابع له العطل:</label>
                <select
                  required
                  value={newRequestBranchId}
                  onChange={(e) => setNewRequestBranchId(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none transition-all font-semibold"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name === 'Sail Road Branch' ? 'فرع طريق السيل' :
                       b.name === 'Beachside Resort Branch' ? 'فرع منتجع الشاطئ' : b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">فئة العطل:</label>
                <select
                  value={newRequestCategory}
                  onChange={(e) => setNewRequestCategory(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none transition-all font-semibold"
                >
                  <option value="Electrical">كهرباء ⚡</option>
                  <option value="Plumbing">سباكة 🚿</option>
                  <option value="AC">تكييف ❄️</option>
                  <option value="Carpentry">نجارة 🪚</option>
                  <option value="Cleaning">نظافة وتجهيز 🧹</option>
                  <option value="General">عام 🔧</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">مستوى الأولوية والخطورة:</label>
                <select
                  value={newRequestPriority}
                  onChange={(e) => setNewRequestPriority(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none transition-all font-semibold"
                >
                  <option value="Urgent">عاجل جداً 🔴</option>
                  <option value="High">عالية 🟠</option>
                  <option value="Normal">عادية 🟡</option>
                  <option value="Low">منخفضة 🟢</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">موقع العطل (رقم الغرفة أو وصف دقيق للمكان):</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: غرفة 204 أو اللوبي الرئيسي قرب المصاعد"
                  value={newRequestLocation}
                  onChange={(e) => setNewRequestLocation(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all font-medium"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">شرح تفصيلي للمشكلة:</label>
                <textarea
                  rows={4}
                  required
                  placeholder="يرجى كتابة تفاصيل المشكلة وما يحتاج إلى إصلاح..."
                  value={newRequestDescription}
                  onChange={(e) => setNewRequestDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary transition-all font-medium leading-relaxed"
                ></textarea>
              </div>

              {/* Photo Url */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">رابط صورة العطل (اختياري):</label>
                <input
                  type="text"
                  placeholder="رابط URL للصورة (e.g. https://...)"
                  value={newRequestPhotoUrl}
                  onChange={(e) => setNewRequestPhotoUrl(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none transition-all font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-brand-primary hover:bg-brand-primary-light text-white px-5 py-2.5 rounded-xl text-sm font-extrabold shadow-sm active:scale-95 transition-all"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'إرسال البلاغ صيانة'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsNewRequestModalOpen(false)}
                  className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
