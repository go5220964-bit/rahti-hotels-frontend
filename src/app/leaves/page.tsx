'use client';

import React, { useState, useEffect } from 'react';
import { api, LeaveRequest, User } from '../../utils/api';
import { useRole } from '../../components/RoleContext';
import { Role } from '../../types_local';
import { Calendar, CheckCircle2, XCircle, AlertCircle, User as UserIcon, RefreshCw, SlidersHorizontal, Check, X, ShieldAlert, ChevronDown, ChevronUp, Scale, Edit3 } from 'lucide-react';

export default function LeavesPage() {
  const { role: currentRole } = useRole();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [dateFromFilter, setDateFromFilter] = useState<string>('');
  const [dateToFilter, setDateToFilter] = useState<string>('');

  // UI Panels state
  const [isBalancesExpanded, setIsBalancesExpanded] = useState(false);

  // Review Modal State
  const [selectedLeave, setSelectedLeave] = useState<LeaveRequest | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'Approved' | 'Rejected'>('Approved');
  const [reviewNote, setReviewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Adjust Balance Modal State
  const [adjustingUser, setAdjustingUser] = useState<User | null>(null);
  const [annualBalanceInput, setAnnualBalanceInput] = useState<number>(21);
  const [sickBalanceInput, setSickBalanceInput] = useState<number>(14);

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const isAdmin = currentRole === Role.Admin;
  const isManagerOrAdmin = currentRole === Role.BranchManager || currentRole === Role.Admin;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [leavesData, usersData] = await Promise.all([
        api.getLeaveRequests(),
        api.getUsers()
      ]);
      setLeaves(leavesData);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to load data:', error);
      showToast('خطأ أثناء تحميل البيانات من الخادم', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManagerOrAdmin || !selectedLeave) return;

    if (reviewStatus === 'Rejected' && !reviewNote.trim()) {
      setModalError('الرجاء إدخال سبب الرفض (ملاحظة المراجع إجبارية في حال الرفض)');
      return;
    }

    setIsSubmitting(true);
    setModalError('');

    try {
      const reviewer = users.find(u => u.role === currentRole);
      const reviewerId = reviewer ? reviewer.id : 'u-1'; // fallback

      const updatedLeave = await api.reviewLeaveRequest(
        selectedLeave.id,
        reviewerId,
        reviewStatus,
        reviewStatus === 'Rejected' ? reviewNote.trim() : reviewNote.trim() || undefined
      );

      // Refresh data to update balances and list
      await loadData();
      setSelectedLeave(null);
      setReviewNote('');
      setReviewStatus('Approved');
      showToast(`تم تحديث حالة طلب الإجازة بنجاح.`);
    } catch (error: any) {
      console.error('Failed to review leave:', error);
      setModalError(error?.message || 'حدث خطأ أثناء حفظ القرار على الخادم.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdjustBalanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !adjustingUser) return;

    setIsSubmitting(true);
    try {
      await api.adjustLeaveBalance(adjustingUser.id, {
        annualLeaveBalance: annualBalanceInput,
        sickLeaveBalance: sickBalanceInput
      });
      // Refresh data
      await loadData();
      setAdjustingUser(null);
      showToast(`تم تعديل رصيد إجازات الموظف ${adjustingUser.name} بنجاح.`);
    } catch (error: any) {
      console.error('Failed to adjust balances:', error);
      showToast(error?.message || 'فشل في حفظ التعديلات على الرصيد.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getReviewerName = (reviewerId: string | null | undefined) => {
    if (!reviewerId) return '-';
    if (reviewerId === 'system') return 'النظام';
    const reviewer = users.find(u => u.id === reviewerId);
    return reviewer ? reviewer.name : reviewerId;
  };

  const getBranchName = (userObj: User | undefined) => {
    if (!userObj?.branch) return '-';
    const name = userObj.branch.name;
    return name === 'Sail Road Branch' ? 'فرع طريق السيل' :
           name === 'Beachside Resort Branch' ? 'فرع منتجع الشاطئ' :
           name;
  };

  const translateLeaveType = (type: string) => {
    switch (type) {
      case 'Annual': return 'سنوية';
      case 'Sick': return 'مرضية';
      case 'Emergency': return 'طارئة';
      case 'Unpaid': return 'بدون راتب';
      default: return type;
    }
  };

  // Stats calculation
  const pendingCount = leaves.filter(l => l.status === 'Pending').length;
  const rejectedCount = leaves.filter(l => l.status === 'Rejected').length;
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const approvedThisMonth = leaves.filter(l => {
    if (l.status !== 'Approved') return false;
    const start = new Date(l.startDate);
    return start.getMonth() === currentMonth && start.getFullYear() === currentYear;
  }).length;

  const totalApprovedDays = leaves
    .filter(l => l.status === 'Approved')
    .reduce((sum, l) => sum + l.daysCount, 0);

  // Filtered Leaves
  const filteredLeaves = leaves.filter(leave => {
    if (typeFilter !== 'all' && leave.leaveType !== typeFilter) {
      return false;
    }
    if (statusFilter !== 'all' && leave.status !== statusFilter) {
      return false;
    }
    if (employeeFilter !== 'all' && leave.userId !== employeeFilter) {
      return false;
    }
    
    const leaveDate = new Date(leave.startDate);
    leaveDate.setHours(0, 0, 0, 0);

    if (dateFromFilter) {
      const fromDate = new Date(dateFromFilter);
      fromDate.setHours(0, 0, 0, 0);
      if (leaveDate < fromDate) return false;
    }
    if (dateToFilter) {
      const toDate = new Date(dateToFilter);
      toDate.setHours(0, 0, 0, 0);
      if (leaveDate > toDate) return false;
    }

    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300 rtl" dir="rtl">
      
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

      {/* Header Banner */}
      <div className="bg-brand-teal-dark text-white p-6 rounded-xl border border-brand-secondary/35 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-brand-secondary/10 blur-2xl"></div>
        <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-brand-secondary/40"></div>
        <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-brand-secondary/40"></div>

        <div>
          <h1 className="text-base font-bold tracking-wide uppercase font-sans">طلبات إجازات الموظفين</h1>
          <p className="text-xs text-white/70 mt-1 font-sans">
            إدارة وتتبع طلبات الإجازات (السنوية، المرضية، الطارئة) ومراجعة رصيد الأيام المتاح لكل موظف وتعديله.
          </p>
        </div>

        <button 
          onClick={loadData}
          className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 transition-all rounded-md text-xs font-medium border border-white/10"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          تحديث البيانات
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Card 1: Pending */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1 bg-amber-500 h-full"></div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-xs font-semibold">طلبات معلقة</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-2 font-sans">{pendingCount}</h3>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 2: Approved This Month */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1 bg-emerald-500 h-full"></div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-xs font-semibold">معتمدة هذا الشهر</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-2 font-sans">{approvedThisMonth}</h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 3: Rejected */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1 bg-rose-500 h-full"></div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-xs font-semibold">مرفوضة</p>
              <h3 className="text-2xl font-bold text-rose-600 mt-2 font-sans">{rejectedCount}</h3>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 4: Total Approved Days */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1 bg-brand-teal-dark h-full"></div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-xs font-semibold">إجمالي الأيام المعتمدة</p>
              <h3 className="text-2xl font-bold text-brand-teal-dark mt-2 font-sans">
                {totalApprovedDays} <span className="text-xs font-normal text-gray-500">يوم</span>
              </h3>
            </div>
            <div className="p-3 bg-brand-teal-dark/5 rounded-lg text-brand-teal-dark">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Employee Balances Panel (Collapsible) */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <button 
          onClick={() => setIsBalancesExpanded(!isBalancesExpanded)}
          className="w-full p-5 flex justify-between items-center bg-gray-50 hover:bg-gray-100/60 transition-all focus:outline-none"
        >
          <div className="flex items-center gap-2.5">
            <Scale className="w-4 h-4 text-brand-teal-dark" />
            <h3 className="text-xs font-bold text-gray-800 font-sans">أرصدة إجازات الموظفين المتبقية</h3>
          </div>
          {isBalancesExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {isBalancesExpanded && (
          <div className="p-5 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {users.map((u) => (
                <div key={u.id} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-bold text-gray-800 text-xs">{u.name}</h4>
                      <p className="text-[10px] text-gray-400">{u.role} | {getBranchName(u)}</p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setAdjustingUser(u);
                          setAnnualBalanceInput(u.annualLeaveBalance ?? 21);
                          setSickBalanceInput(u.sickLeaveBalance ?? 14);
                        }}
                        className="p-1.5 text-gray-400 hover:text-brand-teal-dark bg-gray-50 hover:bg-gray-100 rounded-lg transition-all"
                        title="تعديل الرصيد يدوياً"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-50 text-center text-xs">
                    <div className="bg-amber-50/40 p-2 rounded-lg border border-amber-100/30">
                      <p className="text-gray-400 text-[10px] font-bold">رصيد سنوي</p>
                      <p className="text-amber-700 font-extrabold mt-1 font-sans">{u.annualLeaveBalance ?? 21} يوم</p>
                    </div>
                    <div className="bg-emerald-50/40 p-2 rounded-lg border border-emerald-100/30">
                      <p className="text-gray-400 text-[10px] font-bold">رصيد مرضي</p>
                      <p className="text-emerald-700 font-extrabold mt-1 font-sans">{u.sickLeaveBalance ?? 14} يوم</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters Area */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-50 text-gray-700">
          <SlidersHorizontal className="w-4 h-4 text-brand-teal-dark" />
          <span className="text-xs font-bold font-sans">تصفية وفلترة الإجازات</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Leave Type Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400">نوع الإجازة</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-brand-secondary focus:outline-none"
            >
              <option value="all">كل الأنواع</option>
              <option value="Annual">سنوية</option>
              <option value="Sick">مرضية</option>
              <option value="Emergency">طارئة</option>
              <option value="Unpaid">بدون راتب</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400">الحالة</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-brand-secondary focus:outline-none"
            >
              <option value="all">كل الحالات</option>
              <option value="Pending">معلق</option>
              <option value="Approved">معتمد</option>
              <option value="Rejected">مرفوض</option>
            </select>
          </div>

          {/* Employee Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400">الموظف</label>
            <select
              value={employeeFilter}
              onChange={(e) => setEmployeeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-brand-secondary focus:outline-none"
            >
              <option value="all">كل الموظفين</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
              ))}
            </select>
          </div>

          {/* Date From Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400">تاريخ البداية (من)</label>
            <input
              type="date"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-brand-secondary focus:outline-none"
            />
          </div>

          {/* Date To Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400">تاريخ البداية (إلى)</label>
            <input
              type="date"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-brand-secondary focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50 flex justify-between items-center">
          <h3 className="text-xs font-bold text-gray-800 font-sans">سجل الإجازات والتراخيص</h3>
          <span className="text-[10px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-bold">
            عدد النتائج: {filteredLeaves.length}
          </span>
        </div>

        {loading ? (
          <div className="p-20 text-center text-gray-400 text-xs font-semibold">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-brand-teal-dark" />
            جاري تحميل البيانات...
          </div>
        ) : filteredLeaves.length === 0 ? (
          <div className="p-20 text-center text-gray-400 text-xs font-medium">
            لا توجد أي طلبات إجازة مطابقة للفلاتر المحددة.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 text-gray-400 uppercase font-bold text-[10px] border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">الموظف</th>
                  <th className="px-6 py-4">الفرع</th>
                  <th className="px-6 py-4">نوع الإجازة</th>
                  <th className="px-6 py-4">من تاريخ</th>
                  <th className="px-6 py-4">إلى تاريخ</th>
                  <th className="px-6 py-4">الأيام</th>
                  <th className="px-6 py-4">السبب</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4">المراجع</th>
                  <th className="px-6 py-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600 font-medium">
                {filteredLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-gray-50/50 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-teal-dark/5 flex items-center justify-center text-brand-teal-dark">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{leave.user?.name || '-'}</p>
                          <p className="text-[10px] text-gray-400">{leave.user?.role || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getBranchName(leave.user)}</td>
                    <td className="px-6 py-4 font-bold text-gray-700">{translateLeaveType(leave.leaveType)}</td>
                    <td className="px-6 py-4 font-sans text-gray-400 text-[11px]">
                      {new Date(leave.startDate).toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 font-sans text-gray-400 text-[11px]">
                      {new Date(leave.endDate).toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 font-bold text-brand-teal-dark font-sans">{leave.daysCount} أيام</td>
                    <td className="px-6 py-4 max-w-xs truncate" title={leave.reason}>{leave.reason}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        leave.status === 'Pending' 
                          ? 'bg-amber-50 text-amber-700' 
                          : leave.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          leave.status === 'Pending' 
                            ? 'bg-amber-500' 
                            : leave.status === 'Approved'
                            ? 'bg-emerald-500'
                            : 'bg-rose-500'
                        }`}></span>
                        {leave.status === 'Pending' ? 'معلق' : leave.status === 'Approved' ? 'معتمد' : 'مرفوض'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-700">
                      <div>
                        <p className="font-semibold text-gray-700">{getReviewerName(leave.reviewedBy)}</p>
                        {leave.reviewNote && (
                          <p className="text-[10px] text-rose-500 max-w-[150px] truncate font-bold" title={leave.reviewNote}>
                            السبب: {leave.reviewNote}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {leave.status === 'Pending' ? (
                        isManagerOrAdmin ? (
                          <button
                            onClick={() => {
                              setSelectedLeave(leave);
                              setModalError('');
                            }}
                            className="px-3.5 py-1.5 bg-brand-teal-dark hover:bg-brand-teal-dark/95 text-white rounded-lg font-bold text-[11px] shadow-sm transition-all"
                          >
                            مراجعة القرار
                          </button>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">انتظار المراجعة</span>
                        )
                      ) : (
                        <span className="text-[10px] text-gray-400 font-bold flex items-center justify-center gap-1">
                          {leave.status === 'Approved' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <X className="w-3.5 h-3.5 text-rose-500" />
                          )}
                          مكتمل
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

      {/* Leave Review Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 bg-brand-teal-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-brand-teal-dark text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-brand-secondary" />
                <h3 className="text-xs font-bold font-sans">مراجعة طلب الإجازة</h3>
              </div>
              <button 
                onClick={() => setSelectedLeave(null)}
                className="text-white/70 hover:text-white transition-all focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleReviewSubmit} className="p-6 space-y-5">
              {/* Employee & Leave details */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-xs border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">الموظف:</span>
                  <span className="text-gray-800 font-bold">{selectedLeave.user?.name} ({selectedLeave.user?.role})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">نوع الإجازة:</span>
                  <span className="text-gray-800 font-bold">{translateLeaveType(selectedLeave.leaveType)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">الفترة:</span>
                  <span className="text-gray-800 font-bold font-sans">
                    من {new Date(selectedLeave.startDate).toLocaleDateString('ar-EG')} إلى {new Date(selectedLeave.endDate).toLocaleDateString('ar-EG')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">المدة المطلوبة:</span>
                  <span className="text-brand-teal-dark font-extrabold">{selectedLeave.daysCount} أيام</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-gray-400 font-bold mb-1">السبب:</p>
                  <p className="text-gray-700 italic bg-white p-2 rounded border border-gray-100">{selectedLeave.reason}</p>
                </div>
              </div>

              {/* Status Radio Buttons */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400">القرار الإداري</label>
                <div className="grid grid-cols-2 gap-4">
                  {/* Approve */}
                  <label className={`flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${
                    reviewStatus === 'Approved'
                      ? 'border-emerald-500 bg-emerald-50/20 text-emerald-800 font-bold'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}>
                    <input
                      type="radio"
                      name="reviewStatus"
                      value="Approved"
                      checked={reviewStatus === 'Approved'}
                      onChange={() => setReviewStatus('Approved')}
                      className="sr-only"
                    />
                    <CheckCircle2 className={`w-4 h-4 ${reviewStatus === 'Approved' ? 'text-emerald-500' : 'text-gray-400'}`} />
                    موافقة واعتماد
                  </label>

                  {/* Reject */}
                  <label className={`flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${
                    reviewStatus === 'Rejected'
                      ? 'border-rose-500 bg-rose-50/20 text-rose-800 font-bold'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}>
                    <input
                      type="radio"
                      name="reviewStatus"
                      value="Rejected"
                      checked={reviewStatus === 'Rejected'}
                      onChange={() => setReviewStatus('Rejected')}
                      className="sr-only"
                    />
                    <XCircle className={`w-4 h-4 ${reviewStatus === 'Rejected' ? 'text-rose-500' : 'text-gray-400'}`} />
                    رفض الإجازة
                  </label>
                </div>
              </div>

              {/* Note Textarea */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 flex justify-between">
                  <span>ملاحظة المراجع / سبب الرفض</span>
                  {reviewStatus === 'Rejected' && <span className="text-rose-500 font-bold">مطلوب *</span>}
                </label>
                <textarea
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder={reviewStatus === 'Approved' ? 'أدخل ملاحظات اعتماد اختيارية...' : 'الرجاء إدخال سبب رفض طلب الإجازة...'}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-brand-secondary focus:outline-none"
                />
              </div>

              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-[11px] font-bold flex gap-2 items-center">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-brand-teal-dark hover:bg-brand-teal-dark/95 text-white font-bold rounded-lg text-xs shadow-sm transition-all disabled:opacity-55"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'تأكيد القرار'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLeave(null)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-lg text-xs transition-all"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Balance Modal (Admin Only) */}
      {adjustingUser && (
        <div className="fixed inset-0 bg-brand-teal-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-brand-teal-dark text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-brand-secondary" />
                <h3 className="text-xs font-bold font-sans">تعديل رصيد الإجازات المتبقي يدوياً</h3>
              </div>
              <button 
                onClick={() => setAdjustingUser(null)}
                className="text-white/70 hover:text-white transition-all focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAdjustBalanceSubmit} className="p-6 space-y-5">
              <div className="text-xs text-gray-500">
                أنت تقوم بتعديل الرصيد يدوياً للموظف <span className="font-bold text-gray-800">{adjustingUser.name}</span>. سيؤدي هذا لتجاوز الحدود المعرفة مسبقاً بقواعد البيانات وتثبيت الأرصدة الجديدة للموظف.
              </div>

              {/* Annual Balance Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400">رصيد الإجازات السنوية (أيام)</label>
                <input
                  type="number"
                  min="0"
                  value={annualBalanceInput}
                  onChange={(e) => setAnnualBalanceInput(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-brand-secondary focus:outline-none"
                />
              </div>

              {/* Sick Balance Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400">رصيد الإجازات المرضية (أيام)</label>
                <input
                  type="number"
                  min="0"
                  value={sickBalanceInput}
                  onChange={(e) => setSickBalanceInput(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-brand-secondary focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-brand-teal-dark hover:bg-brand-teal-dark/95 text-white font-bold rounded-lg text-xs shadow-sm transition-all disabled:opacity-55"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'تعديل وحفظ الأرصدة'}
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustingUser(null)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-lg text-xs transition-all"
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
