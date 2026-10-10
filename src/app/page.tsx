'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRole } from '../components/RoleContext';
import { Role } from '../types_local';
import { 
  api, 
  User, 
  AttendanceLog, 
  ShiftReport, 
  RequestItem, 
  LoanRequest, 
  LeaveRequest,
  MaintenanceRequest
} from '../utils/api';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  FileText, 
  DollarSign, 
  AlertTriangle, 
  ArrowLeftRight, 
  PlusCircle, 
  ExternalLink,
  ClipboardList,
  Wrench,
  UserCheck,
  AlertCircle
} from 'lucide-react';

export default function Home() {
  const { role: currentRole, user } = useRole();
  const [users, setUsers] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<AttendanceLog[]>([]);
  const [shiftReports, setShiftReports] = useState<ShiftReport[]>([]);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loans, setLoans] = useState<LoanRequest[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [mntRequests, setMntRequests] = useState<MaintenanceRequest[]>([]);
  const [workloads, setWorkloads] = useState<any[]>([]);
  const [warehouseStats, setWarehouseStats] = useState<any>({ totalItems: 0, lowStockItems: 0, outOfStockItems: 0, pendingRequests: 0 });
  const [stockEntries, setStockEntries] = useState<any[]>([]);
  const [warehouseRequests, setWarehouseRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickTechAssign, setQuickTechAssign] = useState<{ [key: string]: string }>({});


  const translateRole = (roleStr: string) => {
    switch (roleStr) {
      case 'Admin': return 'مدير النظام';
      case 'CEO': return 'الرئيس التنفيذي';
      case 'FinanceManager': return 'المدير المالي';
      case 'Technician': return 'فني صيانة';
      case 'WarehouseManager': return 'أمين المستودع';
      case 'Receptionist': return 'موظف استقبال';
      case 'Accountant': return 'محاسب';
      case 'BranchManager': return 'مدير الفرع';
      case 'MaintenanceSupervisor': return 'مشرف الصيانة';
      case 'ProcurementOfficer': return 'مسؤول المشتريات';
      case 'HousekeepingStaff': return 'عامل نظافة';
      default: return roleStr;
    }
  };

  const getUserName = (roleStr: string) => {
    if (user?.name) return user.name;
    return translateRole(roleStr);
  };

  const getUserBranch = (roleStr: string) => {
    switch (roleStr) {
      case 'Admin':
      case 'CEO':
      case 'FinanceManager':
      case 'Accountant':
      case 'ProcurementOfficer':
        return 'الإدارة العامة';
      case 'WarehouseManager':
        return 'المستودع الرئيسي';
      default:
        return 'فرع طريق السيل';
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        api.getUsers(),
        api.getTodayAttendance(),
        api.getShiftReports(),
        api.getRequests(),
        api.getLoanRequests(),
        api.getLeaveRequests(),
        api.getMaintenanceRequests(),
        api.getTechnicianWorkload(),
        api.getWarehouseStats(),
        api.getBranchStock('cmv1309b20000y5dimezw4ukr'),
        api.getWarehouseRequests()
      ]);

      const val = (idx: number, fallback: any = []) => 
        results[idx].status === 'fulfilled' ? (results[idx] as PromiseFulfilledResult<any>).value : fallback;

      setUsers(val(0, []));
      setAttendance(val(1, []));
      setShiftReports(val(2, []));
      setRequests(val(3, []));
      setLoans(val(4, []));
      setLeaves(val(5, []));
      setMntRequests(val(6, []));
      setWorkloads(val(7, []));
      setWarehouseStats(val(8, { totalItems: 0, lowStockItems: 0, outOfStockItems: 0, pendingRequests: 0 }));
      setStockEntries(val(9, []));
      setWarehouseRequests(val(10, []));
    } catch (e) {
      console.error('Error loading dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);

  const handleApproveShiftReport = async (id: string) => {
    const activeUser = users.find(u => u.role === currentRole) || { id: 'u-1' };
    if (confirm('هل أنت متأكد من اعتماد هذا التقرير المالي؟')) {
      try {
        await api.approveShiftReport(id, activeUser.id);
        alert('تم اعتماد التقرير المالي بنجاح.');
        loadData();
      } catch (e) {
        alert('حدث خطأ أثناء الاعتماد.');
      }
    }
  };

  const handleRejectShiftReport = async (id: string) => {
    const activeUser = users.find(u => u.role === currentRole) || { id: 'u-1' };
    const reason = prompt('الرجاء إدخال سبب الرفض (إلزامي):');
    if (reason === null) return;
    if (!reason.trim()) {
      alert('سبب الرفض إلزامي لإتمام العملية.');
      return;
    }
    try {
      await api.rejectShiftReport(id, activeUser.id, reason);
      alert('تم تسجيل رفض التقرير.');
      loadData();
    } catch (e) {
      alert('حدث خطأ أثناء معالجة الرفض.');
    }
  };

  const handleApproveLoan = async (id: string) => {
    const activeUser = users.find(u => u.role === currentRole) || { id: 'u-1' };
    if (confirm('هل أنت متأكد من الموافقة على طلب السلفة هذا؟')) {
      try {
        await api.reviewLoanRequest(id, activeUser.id, 'Approved', 'تمت الموافقة من المحاسب');
        alert('تمت الموافقة على السلفة بنجاح.');
        loadData();
      } catch (e) {
        alert('حدث خطأ أثناء الموافقة.');
      }
    }
  };

  const handleRejectLoan = async (id: string) => {
    const activeUser = users.find(u => u.role === currentRole) || { id: 'u-1' };
    const note = prompt('الرجاء إدخال سبب الرفض (إلزامي):');
    if (note === null) return;
    if (!note.trim()) {
      alert('سبب الرفض إلزامي لإتمام العملية.');
      return;
    }
    try {
      await api.reviewLoanRequest(id, activeUser.id, 'Rejected', note);
      alert('تم رفض السلفة بنجاح.');
      loadData();
    } catch (e) {
      alert('حدث خطأ أثناء الرفض.');
    }
  };

  const handleApproveLeave = async (id: string) => {
    const activeUser = users.find(u => u.role === currentRole) || { id: 'u-1' };
    if (confirm('هل أنت متأكد من الموافقة على طلب الإجازة؟')) {
      try {
        await api.reviewLeaveRequest(id, activeUser.id, 'Approved', 'موافق من مدير الفرع');
        alert('تمت الموافقة على الإجازة بنجاح.');
        loadData();
      } catch (e) {
        alert('حدث خطأ أثناء معالجة الطلب.');
      }
    }
  };

  const handleRejectLeave = async (id: string) => {
    const activeUser = users.find(u => u.role === currentRole) || { id: 'u-1' };
    const note = prompt('الرجاء إدخال سبب الرفض (إلزامي):');
    if (note === null) return;
    if (!note.trim()) {
      alert('سبب الرفض إلزامي لإتمام العملية.');
      return;
    }
    try {
      await api.reviewLeaveRequest(id, activeUser.id, 'Rejected', note);
      alert('تم رفض طلب الإجازة.');
      loadData();
    } catch (e) {
      alert('حدث خطأ أثناء الرفض.');
    }
  };

  const handleQuickAssign = async (id: string, technicianId: string) => {
    if (!technicianId) {
      alert('يرجى اختيار فني أولاً');
      return;
    }
    try {
      const supervisor = users.find(u => u.role === currentRole) || users[0];
      await api.assignTechnician(id, technicianId, supervisor?.id);
      alert('تم تعيين الفني بنجاح وإرسال إشعار له.');
      loadData();
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء تعيين الفني.');
    }
  };

  const handleApproveWarehouseRequest = async (id: string, requestedQty: number) => {
    const activeUser = users.find(u => u.role === currentRole) || { id: 'u-6' };
    if (confirm('هل أنت متأكد من صرف الكمية المطلوبة بالكامل؟')) {
      try {
        await api.approveWarehouseRequest(id, activeUser.id, requestedQty);
        alert('تم صرف الطلب بنجاح وتحديث المخزون.');
        loadData();
      } catch (e) {
        alert('حدث خطأ أثناء صرف الطلب.');
      }
    }
  };

  const handleRejectWarehouseRequest = async (id: string) => {
    const activeUser = users.find(u => u.role === currentRole) || { id: 'u-6' };
    const reason = prompt('الرجاء إدخال سبب الرفض (إلزامي):');
    if (reason === null) return;
    if (!reason.trim()) {
      alert('سبب الرفض إلزامي لإتمام العملية.');
      return;
    }
    try {
      await api.rejectWarehouseRequest(id, activeUser.id, reason);
      alert('تم تسجيل رفض الطلب بنجاح.');
      loadData();
    } catch (e) {
      alert('حدث خطأ أثناء معالجة الرفض.');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-brand-teal-dark">جاري تحميل لوحة التحكم...</p>
      </div>
    );
  }

  // Get active branch ID for simulated logged-in receptionist/manager
  const loggedInBranchName = getUserBranch(currentRole);
  const loggedInBranch = users.find(u => u.role === currentRole)?.branch || { id: 'b-1', name: 'Sail Road Branch' };
  const loggedInBranchId = loggedInBranch.id;

  // -------------------------------------------------------------
  // RENDERING COMPONENT ACCORDING TO USER ROLE
  // -------------------------------------------------------------
  
  if (currentRole === Role.Admin || currentRole === Role.CEO) {
    // -------------------------------------------------------------
    // ADMIN / CEO DASHBOARD
    // -------------------------------------------------------------
    const activeEmployeesCount = users.length;
    const presentTodayCount = attendance.filter(a => a.type === 'CheckIn' && a.isValid).length;
    const pendingShiftReportsCount = shiftReports.filter(r => r.status === 'PendingAccountant' || r.status === 'PendingFinance').length;
    const pendingRequestsCount = requests.filter(r => r.status === 'Pending').length + loans.filter(l => l.status === 'Pending').length + leaves.filter(l => l.status === 'Pending').length;

    // Combine recent activities across the system
    const activities: { label: string; time: string; type: string }[] = [];
    attendance.slice(-3).forEach(a => {
      activities.push({
        label: `${a.user?.name || 'موظف'} - سجل بصمة ${a.type === 'CheckIn' ? 'دخول' : 'خروج'} ${a.isValid ? 'بنجاح' : 'خارج النطاق'}`,
        time: a.timestamp,
        type: 'attendance'
      });
    });
    shiftReports.slice(-3).forEach(r => {
      activities.push({
        label: `تقرير وردية جديد مقدم بواسطة ${r.reporter?.name || 'موظف'} - الحالة: ${r.status}`,
        time: r.createdAt,
        type: 'shift'
      });
    });
    loans.slice(-2).forEach(l => {
      activities.push({
        label: `طلب سلفة جديدة بقيمة ${l.amount} ريال للموظف ${l.user?.name || ''} - الحالة: ${l.status}`,
        time: l.createdAt,
        type: 'loan'
      });
    });
    leaves.slice(-2).forEach(l => {
      activities.push({
        label: `طلب إجازة ${l.leaveType === 'Annual' ? 'سنوية' : 'مرضية'} للموظف ${l.user?.name || ''} - الحالة: ${l.status}`,
        time: l.createdAt,
        type: 'leave'
      });
    });

    // Sort activities by time descending
    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    const recentActivities = activities.slice(0, 10);

    return (
      <div className="space-y-8 animate-fade-in text-right" dir="rtl">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-brand-teal-dark to-brand-primary p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl font-bold">مرحباً بك، {getUserName(currentRole)} 👋</h1>
            <p className="text-xs text-white/80 mt-1.5">أنت في لوحة تحكم {translateRole(currentRole)}. لديك كامل صلاحيات المراقبة والإدارة.</p>
          </div>
          <div className="absolute top-1/2 left-6 -translate-y-1/2 opacity-15">
            <ClipboardList className="w-24 h-24 text-white" />
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">إجمالي موظفي النظام</span>
              <span className="text-2xl font-extrabold text-brand-teal-dark mt-1 block">{activeEmployeesCount}</span>
            </div>
            <div className="p-3 bg-brand-primary/10 rounded-lg text-brand-primary">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">الحضور اليومي</span>
              <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">{presentTodayCount}</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">تقفيلات مالية معلقة</span>
              <span className="text-2xl font-extrabold text-amber-700 mt-1 block">{pendingShiftReportsCount}</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">طلبات معلقة للمراجعة</span>
              <span className="text-2xl font-extrabold text-brand-secondary mt-1 block">{pendingRequestsCount}</span>
            </div>
            <div className="p-3 bg-brand-cream rounded-lg text-brand-secondary">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions Links Grid */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-brand-secondary/15 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-brand-teal-dark border-b border-slate-100 pb-3">روابط وإجراءات سريعة</h2>
            <div className="grid grid-cols-1 gap-2.5">
              <Link href="/employees" className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-brand-primary hover:bg-slate-50 transition text-xs font-semibold text-slate-700 group">
                <span className="group-hover:text-brand-primary transition">إدارة الموظفين والصلاحيات</span>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-brand-primary transition" />
              </Link>
              <Link href="/attendance" className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-brand-primary hover:bg-slate-50 transition text-xs font-semibold text-slate-700 group">
                <span className="group-hover:text-brand-primary transition">سجل البصمة الجغرافية اليومي</span>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-brand-primary transition" />
              </Link>
              <Link href="/shifts" className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-brand-primary hover:bg-slate-50 transition text-xs font-semibold text-slate-700 group">
                <span className="group-hover:text-brand-primary transition">إدارة وتعديل الورديات</span>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-brand-primary transition" />
              </Link>
              <Link href="/leaves" className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-brand-primary hover:bg-slate-50 transition text-xs font-semibold text-slate-700 group">
                <span className="group-hover:text-brand-primary transition">اعتمادات وتعديل أرصدة الإجازات</span>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-brand-primary transition" />
              </Link>
              <Link href="/loans" className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-brand-primary hover:bg-slate-50 transition text-xs font-semibold text-slate-700 group">
                <span className="group-hover:text-brand-primary transition">سجل طلبات السلف المالية</span>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-brand-primary transition" />
              </Link>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-brand-secondary/15 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-brand-teal-dark border-b border-slate-100 pb-3">سجل النشاط العام للنظام (آخر 10 أحداث)</h2>
            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[350px] space-y-1">
              {recentActivities.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">لا توجد عمليات مسجلة اليوم.</p>
              ) : (
                recentActivities.map((act, index) => (
                  <div key={index} className="flex items-start justify-between py-3 text-xs">
                    <div className="flex items-start gap-2.5">
                      <span className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                        act.type === 'attendance' ? 'bg-blue-400' :
                        act.type === 'shift' ? 'bg-amber-400' :
                        act.type === 'loan' ? 'bg-pink-400' : 'bg-teal-400'
                      }`}></span>
                      <span className="text-slate-700 font-semibold leading-relaxed">{act.label}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold font-mono pr-2 shrink-0">
                      {new Date(act.time).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentRole === Role.Accountant) {
    // -------------------------------------------------------------
    // ACCOUNTANT DASHBOARD
    // -------------------------------------------------------------
    const todayReports = shiftReports.filter(r => {
      const todayStr = new Date().toISOString().split('T')[0];
      return r.createdAt.startsWith(todayStr);
    });
    const approvedReportsCount = shiftReports.filter(r => r.status === 'Approved').length;
    const rejectedReportsCount = shiftReports.filter(r => r.status === 'Rejected').length;
    const pendingProcurementCount = requests.filter(r => r.requestType === 'Procurement' && r.approvalStatus === 'Pending_Finance').length;

    // Filter pending shift reports needing Accountant review
    const pendingShiftReports = shiftReports.filter(r => r.status === 'PendingAccountant');
    const pendingLoanRequests = loans.filter(l => l.status === 'Pending');

    return (
      <div className="space-y-8 animate-fade-in text-right" dir="rtl">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-brand-teal-dark to-brand-primary p-6 rounded-2xl text-white shadow-lg">
          <h1 className="text-2xl font-bold">مرحباً بك، {getUserName(currentRole)} 👋</h1>
          <p className="text-xs text-white/80 mt-1.5">أنت في لوحة تحكم {translateRole(currentRole)}. يرجى مراجعة تقفيلات الورديات المرفوعة اليوم ومطابقتها مالياً.</p>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">تقفيلات اليوم المرفوعة</span>
              <span className="text-2xl font-extrabold text-brand-teal-dark mt-1 block">{todayReports.length}</span>
            </div>
            <div className="p-3 bg-brand-primary/10 rounded-lg text-brand-primary">
              <ClipboardList className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">التقارير المعتمدة</span>
              <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">{approvedReportsCount}</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">التقارير المرفوضة</span>
              <span className="text-2xl font-extrabold text-rose-700 mt-1 block">{rejectedReportsCount}</span>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">مشتريات تنتظر التعميد المالي</span>
              <span className="text-2xl font-extrabold text-brand-secondary mt-1 block">{pendingProcurementCount}</span>
            </div>
            <div className="p-3 bg-brand-cream rounded-lg text-brand-secondary">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Pending Shift Reports Table (Approve/Reject inline) */}
        <div className="bg-white p-6 rounded-xl border border-brand-secondary/15 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-brand-teal-dark">📋 تقارير الورديات المعلقة المرفوعة من موظفي الاستقبال</h2>
            <Link href="/shift-reports" className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1">
              عرض الكل
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingShiftReports.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200">لا توجد تقارير ورديات معلقة للمراجعة والاعتماد حالياً.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold select-none">
                    <th className="p-3">الموظف</th>
                    <th className="p-3">الفرع</th>
                    <th className="p-3">الوردية</th>
                    <th className="p-3">صافي الكاش</th>
                    <th className="p-3">مدى + فيزا</th>
                    <th className="p-3">الإجمالي النهائي</th>
                    <th className="p-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingShiftReports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50/50 font-semibold text-slate-700">
                      <td className="p-3">{report.reporter?.name}</td>
                      <td className="p-3">
                        {report.branch?.name === 'Sail Road Branch' ? 'فرع طريق السيل' :
                         report.branch?.name === 'Beachside Resort Branch' ? 'فرع منتجع الشاطئ' :
                         report.branch?.name}
                      </td>
                      <td className="p-3">
                        <span className="bg-brand-cream text-brand-teal-dark px-2 py-0.5 rounded text-[10px] border border-brand-secondary/20">
                          {report.shiftLabel}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-900">{report.cashNet} ر.س</td>
                      <td className="p-3 font-mono text-slate-900">{report.mada + report.visa}  ر.س</td>
                      <td className="p-3 font-mono text-emerald-800 font-extrabold">{report.grandTotal} ر.س</td>
                      <td className="p-3 flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleApproveShiftReport(report.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded transition"
                        >
                          اعتماد ✅
                        </button>
                        <button
                          onClick={() => handleRejectShiftReport(report.id)}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded transition"
                        >
                          رفض ❌
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pending Loan Requests (Approve/Reject inline) */}
        <div className="bg-white p-6 rounded-xl border border-brand-secondary/15 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-brand-teal-dark">💰 طلبات السلف المالية بانتظار المراجعة والاعتماد</h2>
            <Link href="/loans" className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1">
              سجل السلف
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingLoanRequests.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200">لا توجد طلبات سلف معلقة حالياً.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold select-none">
                    <th className="p-3">الموظف</th>
                    <th className="p-3">المبلغ</th>
                    <th className="p-3">السبب</th>
                    <th className="p-3">تاريخ التقديم</th>
                    <th className="p-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingLoanRequests.map((loan) => (
                    <tr key={loan.id} className="hover:bg-slate-50/50 font-semibold text-slate-700">
                      <td className="p-3">{loan.user?.name}</td>
                      <td className="p-3 font-mono font-extrabold text-brand-teal-dark">{loan.amount} ر.س</td>
                      <td className="p-3 text-slate-500">{loan.reason}</td>
                      <td className="p-3 text-slate-400 font-mono">
                        {new Date(loan.createdAt).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="p-3 flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleApproveLoan(loan.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded transition"
                        >
                          موافقة ✅
                        </button>
                        <button
                          onClick={() => handleRejectLoan(loan.id)}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded transition"
                        >
                          رفض ❌
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentRole === Role.BranchManager) {
    // -------------------------------------------------------------
    // BRANCH MANAGER DASHBOARD
    // -------------------------------------------------------------
    const branchUsers = users.filter(u => u.branchId === loggedInBranchId);
    const presentToday = attendance.filter(a => a.branchId === loggedInBranchId && a.type === 'CheckIn' && a.isValid);
    const pendingLeaves = leaves.filter(l => l.status === 'Pending' && l.user?.branchId === loggedInBranchId);
    const pendingMaintenance = requests.filter(r => r.branchId === loggedInBranchId && r.requestType === 'Maintenance' && r.status === 'Pending');

    const todayAttendanceLogs = attendance.filter(a => a.branchId === loggedInBranchId);

    return (
      <div className="space-y-8 animate-fade-in text-right" dir="rtl">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-brand-teal-dark to-brand-primary p-6 rounded-2xl text-white shadow-lg">
          <h1 className="text-2xl font-bold">مرحباً بك، {getUserName(currentRole)} 👋</h1>
          <p className="text-xs text-white/80 mt-1.5">أنت في لوحة تحكم مدير الفرع لـ *{loggedInBranchName}*. تتبع البصمة اليومية للموظفين واعتمد إجازاتهم.</p>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">موظفو فرعك</span>
              <span className="text-2xl font-extrabold text-brand-teal-dark mt-1 block">{branchUsers.length}</span>
            </div>
            <div className="p-3 bg-brand-primary/10 rounded-lg text-brand-primary">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">الحضور اليوم بالفرع</span>
              <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">{presentToday.length}</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">طلبات الإجازات المعلقة</span>
              <span className="text-2xl font-extrabold text-amber-700 mt-1 block">{pendingLeaves.length}</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">بلاغات الصيانة بالفرع</span>
              <span className="text-2xl font-extrabold text-rose-700 mt-1 block">{pendingMaintenance.length}</span>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Today's Attendance Table */}
        <div className="bg-white p-6 rounded-xl border border-brand-secondary/15 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-brand-teal-dark">📍 سجل البصمة والحضور الجغرافي لليوم بفرعك</h2>
            <Link href="/attendance" className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1">
              إدارة Geofence
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {todayAttendanceLogs.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200">لم يقم أي موظف بتسجيل البصمة اليوم بالفرع بعد.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold select-none">
                    <th className="p-3">الموظف</th>
                    <th className="p-3">نوع البصمة</th>
                    <th className="p-3">الموقع</th>
                    <th className="p-3">المسافة الفعلية</th>
                    <th className="p-3">التوقيت</th>
                    <th className="p-3">حالة البصمة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {todayAttendanceLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 font-semibold text-slate-700">
                      <td className="p-3">{log.user?.name}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.type === 'CheckIn' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-orange-50 text-orange-700 border border-orange-200'
                        }`}>
                          {log.type === 'CheckIn' ? 'دخول 📥' : 'خروج 📤'}
                        </span>
                      </td>
                      <td className="p-3 font-mono text-slate-400 text-[10px]">{log.lat.toFixed(5)}, {log.lng.toFixed(5)}</td>
                      <td className="p-3 text-slate-500 font-mono">{log.distanceMeters.toFixed(0)} متر</td>
                      <td className="p-3 text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] ${
                          log.isValid ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${log.isValid ? 'bg-emerald-600' : 'bg-rose-600'}`}></span>
                          {log.isValid ? 'بصمة صحيحة' : 'خارج النطاق المسموح'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pending Leave Requests */}
        <div className="bg-white p-6 rounded-xl border border-brand-secondary/15 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-brand-teal-dark">🏖️ طلبات إجازات الموظفين بالفرع بانتظار موافقتك</h2>
            <Link href="/leaves" className="text-xs font-semibold text-brand-primary hover:underline flex items-center gap-1">
              شاشة الإجازات
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {pendingLeaves.length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center bg-slate-50/50 rounded-lg border border-dashed border-slate-200">لا توجد طلبات إجازات معلقة لفرعك حالياً.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold select-none">
                    <th className="p-3">الموظف</th>
                    <th className="p-3">النوع</th>
                    <th className="p-3">المدة</th>
                    <th className="p-3">السبب</th>
                    <th className="p-3 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-50/50 font-semibold text-slate-700">
                      <td className="p-3">{leave.user?.name}</td>
                      <td className="p-3">
                        <span className="bg-brand-cream text-brand-teal-dark px-2 py-0.5 rounded text-[10px] border border-brand-secondary/20">
                          {leave.leaveType === 'Annual' ? 'سنوية 🏖️' :
                           leave.leaveType === 'Sick' ? 'مرضية 🤒' :
                           leave.leaveType === 'Emergency' ? 'طارئة 🚨' : 'بدون راتب ❌'}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="text-slate-900 font-bold">{leave.daysCount} أيام</span>
                        <span className="text-[10px] text-slate-400 font-mono block">من {leave.startDate} إلى {leave.endDate}</span>
                      </td>
                      <td className="p-3 text-slate-500">{leave.reason}</td>
                      <td className="p-3 flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleApproveLeave(leave.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded transition"
                        >
                          اعتماد ✅
                        </button>
                        <button
                          onClick={() => handleRejectLeave(leave.id)}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded transition"
                        >
                          رفض ❌
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentRole === Role.Receptionist) {
    // -------------------------------------------------------------
    // RECEPTIONIST DASHBOARD
    // -------------------------------------------------------------
    const activeUser = users.find(u => u.role === currentRole) || { id: 'u-5' };
    const myReports = shiftReports.filter(r => r.reporterId === activeUser.id);
    const myLastReports = myReports.slice(-5).reverse();

    // Check if receptionist checked in today
    const myTodayCheckIn = attendance.find(a => a.userId === activeUser.id && a.type === 'CheckIn');

    return (
      <div className="space-y-8 animate-fade-in text-right" dir="rtl">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-brand-teal-dark to-brand-primary p-6 rounded-2xl text-white shadow-lg flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">مرحباً بك، {getUserName(currentRole)} 👋</h1>
            <p className="text-xs text-white/80 mt-1.5">فرع العمل المخصص: *{loggedInBranchName}*.</p>
          </div>
          <Link href="/shift-reports" className="bg-brand-secondary hover:bg-brand-secondary-dark text-brand-teal-dark font-extrabold text-xs px-4 py-3 rounded-lg flex items-center gap-2 shadow transition">
            <PlusCircle className="w-4.5 h-4.5" />
            إرسال تقفيلة وردية جديدة
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Today's Shift status */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-brand-secondary/15 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-brand-teal-dark border-b border-slate-100 pb-3">📍 حالة البصمة والوردية اليومية</h2>
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">حضور الوردية اليوم</span>
                {myTodayCheckIn ? (
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    تم تسجيل الدخول بنجاح عند:
                    <span className="font-mono">{new Date(myTodayCheckIn.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-xs mt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    لم يتم تسجيل الدخول بعد اليوم عبر البوت الجغرافي.
                  </div>
                )}
              </div>

              <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold uppercase">إحصائيات إجمالية لتقاريرك</span>
                <div className="grid grid-cols-2 gap-3 mt-1.5 text-center">
                  <div className="p-2.5 bg-brand-primary/10 rounded-lg">
                    <span className="text-[9px] font-bold text-brand-primary block">الإجمالي المرفوع</span>
                    <span className="text-lg font-extrabold text-brand-teal-dark block mt-0.5">{myReports.length}</span>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-lg">
                    <span className="text-[9px] font-bold text-emerald-600 block">المعتمد نهائياً</span>
                    <span className="text-lg font-extrabold text-emerald-700 block mt-0.5">
                      {myReports.filter(r => r.status === 'Approved').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Last 5 reports table */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-brand-secondary/15 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-brand-teal-dark border-b border-slate-100 pb-3">📋 آخر 5 تقارير تقفيلات مالية مرفوعة بواسطتك</h2>
            {myLastReports.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center bg-slate-50/50 border border-slate-150 border-dashed rounded-lg">لم تقم برفع أي تقرير تقفيلة وردية بعد.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold select-none">
                      <th className="p-3">الوردية</th>
                      <th className="p-3">التاريخ</th>
                      <th className="p-3">الإجمالي النهائي</th>
                      <th className="p-3">حالة المراجعة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myLastReports.map((report) => (
                      <tr key={report.id} className="hover:bg-slate-50/50 font-semibold text-slate-700">
                        <td className="p-3">
                          <span className="bg-brand-cream text-brand-teal-dark px-2.5 py-0.5 rounded text-[10px] border border-brand-secondary/20">
                            {report.shiftLabel}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 font-mono">
                          {new Date(report.createdAt).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="p-3 font-mono font-extrabold text-slate-900">{report.grandTotal} ر.س</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            report.status === 'Approved' ? 'bg-emerald-50 text-emerald-800' :
                            report.status === 'Rejected' ? 'bg-rose-50 text-rose-800' :
                            'bg-amber-50 text-amber-800'
                          }`}>
                            {report.status === 'Approved' ? 'معتمدة ✅' :
                             report.status === 'Rejected' ? 'مرفوضة ❌' : 'قيد المراجعة ⏳'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentRole === Role.MaintenanceSupervisor) {
    const statsNew = mntRequests.filter(r => r.status === 'New').length;
    const statsInProgress = mntRequests.filter(r => ['AssignedToTechnician', 'InProgress', 'Rejected'].includes(r.status)).length;
    const statsPending = mntRequests.filter(r => r.status === 'PendingInternalApproval').length;
    
    const statsClosedToday = mntRequests.filter(r => {
      if (r.status !== 'Closed' || !r.closedAt) return false;
      const closedDate = new Date(r.closedAt);
      const today = new Date();
      return closedDate.getDate() === today.getDate() &&
             closedDate.getMonth() === today.getMonth() &&
             closedDate.getFullYear() === today.getFullYear();
    }).length;

    const activeRequests = mntRequests.filter(r => ['New', 'AssignedToTechnician', 'InProgress', 'SpareParts', 'Rejected'].includes(r.status));
    const technicians = users.filter(u => u.role === Role.Technician);

    return (
      <div className="space-y-8 animate-fade-in text-right" dir="rtl">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-brand-teal-dark to-brand-primary p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">مرحباً بك، {getUserName(currentRole)} 👋</h1>
              <p className="text-xs text-white/80 mt-1.5">أنت في لوحة تحكم مشرف الصيانة. يمكنك متابعة الأعطال وتعيين الفنيين.</p>
            </div>
            <Link 
              href="/maintenance" 
              className="bg-brand-secondary hover:bg-brand-secondary-dark text-brand-teal-dark font-extrabold text-xs px-4 py-3 rounded-lg flex items-center gap-2 shadow transition max-w-max"
            >
              <Wrench className="w-4.5 h-4.5" />
              عرض جميع البلاغات
            </Link>
          </div>
          <div className="absolute top-1/2 left-6 -translate-y-1/2 opacity-15">
            <Wrench className="w-24 h-24 text-white" />
          </div>
        </div>

        {/* 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">بلاغات جديدة</span>
              <span className="text-2xl font-extrabold text-amber-600 mt-1 block">{statsNew}</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">قيد العمل والمتابعة</span>
              <span className="text-2xl font-extrabold text-blue-600 mt-1 block">{statsInProgress}</span>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">بانتظار التأكيد</span>
              <span className="text-2xl font-extrabold text-orange-600 mt-1 block">{statsPending}</span>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg text-orange-600">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">تم إغلاقها اليوم</span>
              <span className="text-2xl font-extrabold text-emerald-700 mt-1 block">{statsClosedToday}</span>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
              <CheckCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active/Open Requests Table */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-brand-secondary/15 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-brand-teal-dark border-b border-slate-100 pb-3 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-brand-primary" />
              <span>البلاغات النشطة والمعلقة</span>
            </h2>

            {activeRequests.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center bg-slate-50/50 border border-slate-150 border-dashed rounded-lg">
                لا توجد بلاغات صيانة مفتوحة حالياً.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold select-none">
                      <th className="p-3">رقم البلاغ</th>
                      <th className="p-3">الفئة والموقع</th>
                      <th className="p-3">الأولوية</th>
                      <th className="p-3">الحالة</th>
                      <th className="p-3">الإجراء السريع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/50 font-semibold text-slate-700">
                        <td className="p-3 text-brand-teal-dark font-black">#{req.ticketNumber}</td>
                        <td className="p-3">
                          <div className="text-xs font-bold text-slate-800">
                            {req.category === 'Electrical' ? 'كهرباء ⚡' :
                             req.category === 'Plumbing' ? 'سباكة 🚿' :
                             req.category === 'AC' ? 'تكييف ❄️' :
                             req.category === 'Carpentry' ? 'نجارة 🪚' :
                             req.category === 'Cleaning' ? 'نظافة 🧹' : 'عام 🔧'}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{req.location}</div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            req.priority === 'Urgent' ? 'bg-rose-50 text-rose-800' :
                            req.priority === 'High' ? 'bg-orange-50 text-orange-800' :
                            req.priority === 'Normal' ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'
                          }`}>
                            {req.priority === 'Urgent' ? 'عاجل جداً' :
                             req.priority === 'High' ? 'عالية' :
                             req.priority === 'Normal' ? 'عادية' : 'منخفضة'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            req.status === 'New' ? 'bg-gray-100 text-gray-700' :
                            req.status === 'AssignedToTechnician' ? 'bg-blue-50 text-blue-700' :
                            req.status === 'InProgress' ? 'bg-sky-50 text-sky-700' :
                            req.status === 'PendingInternalApproval' ? 'bg-amber-50 text-amber-700' :
                            req.status === 'SpareParts' ? 'bg-purple-50 text-purple-700' : 'bg-rose-50 text-rose-700'
                          }`}>
                            {req.status === 'New' ? 'جديد' :
                             req.status === 'AssignedToTechnician' ? 'تم التعيين' :
                             req.status === 'InProgress' ? 'قيد التنفيذ' :
                             req.status === 'PendingInternalApproval' ? 'بانتظار التأكيد' :
                             req.status === 'SpareParts' ? 'بانتظار قطع الغيار' : 'مرفوض'}
                          </span>
                        </td>
                        <td className="p-3">
                          {['New', 'Rejected'].includes(req.status) ? (
                            <div className="flex items-center gap-2">
                              <select
                                value={quickTechAssign[req.id] || ''}
                                onChange={(e) => setQuickTechAssign({
                                  ...quickTechAssign,
                                  [req.id]: e.target.value
                                })}
                                className="px-2 py-1 text-[10px] bg-slate-50 border border-slate-200 rounded font-semibold focus:outline-none"
                              >
                                <option value="">اختر الفني</option>
                                {technicians.map(t => (
                                  <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleQuickAssign(req.id, quickTechAssign[req.id])}
                                className="bg-brand-primary hover:bg-brand-primary-light text-white px-2.5 py-1 rounded text-[10px] font-extrabold shadow-sm active:scale-95"
                              >
                                تعيين
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium">
                              الفني: {req.technicianName || 'غير معين'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Technician Workload Summary */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-brand-secondary/15 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-brand-teal-dark border-b border-slate-100 pb-3 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-brand-primary" />
              <span>ضغط العمل على الفنيين</span>
            </h2>

            {workloads.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">لا يوجد فنيين مسجلين حالياً.</p>
            ) : (
              <div className="space-y-3">
                {workloads.map((tech) => (
                  <div key={tech.id} className="p-3 rounded-xl border border-slate-150 bg-slate-50/50 flex items-center justify-between text-xs font-semibold text-slate-700">
                    <div>
                      <div className="font-bold text-slate-800">{tech.name}</div>
                      <div className="text-[9px] text-slate-400 font-medium mt-0.5">{tech.phoneNumber}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-extrabold text-brand-teal-dark">
                        {tech.openTicketsCount} بلاغات مفتوحة
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                        tech.isAvailable ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'
                      }`}>
                        {tech.isAvailable ? 'متوفر' : 'مشغول'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (currentRole === Role.WarehouseManager) {
    const lowStockAlerts = stockEntries.filter(e => e.quantity <= e.minThreshold);
    const pendingWHRequests = warehouseRequests.filter(r => r.status === 'Pending');

    return (
      <div className="space-y-8 animate-fade-in text-right" dir="rtl">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-brand-teal-dark to-brand-primary p-6 rounded-2xl text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">مرحباً بك، {getUserName(currentRole)} 👋</h1>
              <p className="text-xs text-white/80 mt-1.5">أنت في لوحة تحكم أمين المستودع. تابع مستويات المخزون واعتمد طلبات الصرف.</p>
            </div>
            <Link 
              href="/warehouse" 
              className="bg-brand-secondary hover:bg-brand-secondary-hover text-brand-teal-dark font-extrabold text-xs px-4 py-3 rounded-lg flex items-center gap-2 shadow transition max-w-max"
            >
              <ClipboardList className="w-4.5 h-4.5" />
              لوحة إدارة المخازن كاملة
            </Link>
          </div>
          <div className="absolute top-1/2 left-6 -translate-y-1/2 opacity-15">
            <ClipboardList className="w-24 h-24 text-white" />
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">إجمالي أصناف المستودع</span>
              <span className="text-2xl font-extrabold text-brand-teal-dark mt-1 block">{warehouseStats.totalItems}</span>
            </div>
            <div className="p-3 bg-brand-primary/10 rounded-lg text-brand-primary">
              <ClipboardList className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">طلبات صرف معلقة</span>
              <span className="text-2xl font-extrabold text-amber-700 mt-1 block">{warehouseStats.pendingRequests}</span>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">أصناف منخفضة المخزون</span>
              <span className="text-2xl font-extrabold text-rose-700 mt-1 block">{warehouseStats.lowStockItems}</span>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-brand-secondary/15 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-slate-400 block">أصناف نفدت تماماً</span>
              <span className="text-2xl font-extrabold text-slate-700 mt-1 block">{warehouseStats.outOfStockItems}</span>
            </div>
            <div className="p-3 bg-slate-100 rounded-lg text-slate-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending requests */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-brand-secondary/15 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-brand-teal-dark border-b border-slate-100 pb-3 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-brand-primary" />
              <span>طلبات صرف المواد المعلقة</span>
            </h2>

            {pendingWHRequests.length === 0 ? (
              <p className="text-xs text-slate-400 py-12 text-center bg-slate-50/50 border border-slate-150 border-dashed rounded-lg">
                لا توجد طلبات صرف معلقة حالياً.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold select-none">
                      <th className="p-3">رقم الطلب</th>
                      <th className="p-3">المادة المطلوبة</th>
                      <th className="p-3">الكمية</th>
                      <th className="p-3">المقدم</th>
                      <th className="p-3 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingWHRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/50 font-semibold text-slate-700">
                        <td className="p-3 text-brand-teal-dark font-black">#{req.ticketNumber}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{req.item?.name}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{req.purpose}</div>
                        </td>
                        <td className="p-3 font-mono font-extrabold text-slate-900">{req.quantityRequested} {req.item?.unit}</td>
                        <td className="p-3">
                          <div className="text-slate-700">{req.requester?.name}</div>
                          <div className="text-[9px] text-slate-400">{req.branch?.name === 'Sail Road Branch' ? 'طريق السيل' : 'منتجع الشاطئ'}</div>
                        </td>
                        <td className="p-3 flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleApproveWarehouseRequest(req.id, req.quantityRequested)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded transition"
                          >
                            صرف كامل ✅
                          </button>
                          <button
                            onClick={() => handleRejectWarehouseRequest(req.id)}
                            className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-3 py-1.5 rounded transition"
                          >
                            رفض ❌
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Low Stock Alerts */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-brand-secondary/15 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-brand-teal-dark border-b border-slate-100 pb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <span>تنبيهات انخفاض المخزون</span>
            </h2>

            {lowStockAlerts.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">كل مستويات المواد بالمستودع آمنة وممتازة.</p>
            ) : (
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {lowStockAlerts.map((entry) => (
                  <div key={entry.id} className="p-3 rounded-xl border border-rose-150 bg-rose-50/10 flex items-center justify-between text-xs font-semibold">
                    <div>
                      <div className="font-bold text-slate-800">{entry.item?.name}</div>
                      <div className="text-[9px] text-slate-400 font-medium mt-0.5">الحد الأدنى المطلوب: {entry.minThreshold} {entry.item?.unit}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-xs font-black text-rose-700">
                        {entry.quantity} {entry.item?.unit}
                      </span>
                      <span className="bg-rose-100 text-rose-800 text-[8px] font-bold px-1.5 py-0.5 rounded border border-rose-200">
                        منخفض
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // GENERIC DASHBOARD (WarehouseManager, etc.)
  // -------------------------------------------------------------
  return (
    <div className="space-y-8 animate-fade-in text-right" dir="rtl">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-brand-teal-dark to-brand-primary p-6 rounded-2xl text-white shadow-lg flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مرحباً بك، {getUserName(currentRole)} 👋</h1>
          <p className="text-xs text-white/80 mt-1.5">أنت مسجل بصفتك: *{translateRole(currentRole)}* في فرع: *{loggedInBranchName}*.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl border border-brand-secondary/15 shadow-sm text-center max-w-2xl mx-auto space-y-4">
        <ClipboardList className="w-16 h-16 text-brand-primary mx-auto opacity-80" />
        <h2 className="text-base font-bold text-brand-teal-dark">موقع راحتي لإدارة العمليات</h2>
        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
          يرجى استخدام القائمة الجانبية للتنقل بين الأقسام المصرح لك بالدخول إليها وفقاً لدورك الوظيفي وصلاحياتك المحددة من الإدارة.
        </p>
      </div>
    </div>
  );
}
