'use client';

import React, { useState, useEffect } from 'react';
import { api, LoanRequest, User } from '../../utils/api';
import { useRole } from '../../components/RoleContext';
import { Role } from '../../types_local';
import { Coins, CheckCircle2, XCircle, AlertCircle, Calendar, User as UserIcon, RefreshCw, SlidersHorizontal, Check, X, ShieldAlert } from 'lucide-react';

export default function LoansPage() {
  const { role: currentRole } = useRole();
  const [loans, setLoans] = useState<LoanRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [dateFromFilter, setDateFromFilter] = useState<string>('');
  const [dateToFilter, setDateToFilter] = useState<string>('');

  // Modal State
  const [selectedLoan, setSelectedLoan] = useState<LoanRequest | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'Approved' | 'Rejected'>('Approved');
  const [reviewNote, setReviewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Toast Notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const isAccountantOrAdmin = currentRole === Role.Accountant || currentRole === Role.Admin;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [loansData, usersData] = await Promise.all([
        api.getLoanRequests(),
        api.getUsers()
      ]);
      setLoans(loansData);
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
    if (!isAccountantOrAdmin || !selectedLoan) return;

    if (reviewStatus === 'Rejected' && !reviewNote.trim()) {
      setModalError('الرجاء إدخال سبب الرفض (ملاحظة المراجع إجبارية في حال الرفض)');
      return;
    }

    setIsSubmitting(true);
    setModalError('');

    try {
      // Find current user's ID as the reviewer (mocked or from current users matching role)
      const reviewer = users.find(u => u.role === currentRole);
      const reviewerId = reviewer ? reviewer.id : 'u-3'; // fallback

      const updatedLoan = await api.reviewLoanRequest(
        selectedLoan.id,
        reviewerId,
        reviewStatus,
        reviewStatus === 'Rejected' ? reviewNote.trim() : reviewNote.trim() || undefined
      );

      // Update loans state
      setLoans(loans.map(l => l.id === selectedLoan.id ? updatedLoan : l));
      setSelectedLoan(null);
      setReviewNote('');
      setReviewStatus('Approved');
      showToast(`تم تحديث حالة طلب السلفة بنجاح.`);
    } catch (error: any) {
      console.error('Failed to review loan:', error);
      setModalError(error?.message || 'حدث خطأ أثناء حفظ القرار على الخادم.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getReviewerName = (reviewerId: string | null | undefined) => {
    if (!reviewerId) return '-';
    // Check if reviewerId is equal to 'system'
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

  // Stats calculation
  const pendingCount = loans.filter(l => l.status === 'Pending').length;
  const approvedTotal = loans
    .filter(l => l.status === 'Approved')
    .reduce((sum, l) => sum + l.amount, 0);
  const rejectedTotal = loans
    .filter(l => l.status === 'Rejected')
    .reduce((sum, l) => sum + l.amount, 0);

  // Filtered Loans
  const filteredLoans = loans.filter(loan => {
    // 1. Status Filter
    if (statusFilter !== 'all' && loan.status !== statusFilter) {
      return false;
    }
    // 2. Employee Filter
    if (employeeFilter !== 'all' && loan.userId !== employeeFilter) {
      return false;
    }
    // 3. Date Range Filters
    const loanDate = new Date(loan.createdAt);
    loanDate.setHours(0, 0, 0, 0);

    if (dateFromFilter) {
      const fromDate = new Date(dateFromFilter);
      fromDate.setHours(0, 0, 0, 0);
      if (loanDate < fromDate) return false;
    }
    if (dateToFilter) {
      const toDate = new Date(dateToFilter);
      toDate.setHours(0, 0, 0, 0);
      if (loanDate > toDate) return false;
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
          <h1 className="text-base font-bold tracking-wide uppercase font-sans">طلبات السلف المالية</h1>
          <p className="text-xs text-white/70 mt-1 font-sans">
            إدارة طلبات السلف النقدية المقدمة من الموظفين ومراجعتها واعتمادها من قبل المحاسب المالي أو الإدارة العامة.
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

        {/* Card 2: Approved Total */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1 bg-emerald-500 h-full"></div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-xs font-semibold">إجمالي السلف المعتمدة</p>
              <h3 className="text-2xl font-bold text-emerald-600 mt-2 font-sans">
                {approvedTotal.toLocaleString()} <span className="text-xs font-normal text-gray-500">ريال</span>
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Card 3: Rejected Total */}
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1 bg-rose-500 h-full"></div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-xs font-semibold">إجمالي المرفوضة</p>
              <h3 className="text-2xl font-bold text-rose-600 mt-2 font-sans">
                {rejectedTotal.toLocaleString()} <span className="text-xs font-normal text-gray-500">ريال</span>
              </h3>
            </div>
            <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Area */}
      <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-gray-50 text-gray-700">
          <SlidersHorizontal className="w-4 h-4 text-brand-teal-dark" />
          <span className="text-xs font-bold font-sans">تصفية وفلترة الطلبات</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400">حالة الطلب</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-brand-secondary focus:outline-none"
            >
              <option value="all">كل الحالات</option>
              <option value="Pending">معلق (بانتظار المراجعة)</option>
              <option value="Approved">معتمد</option>
              <option value="Rejected">مرفوض</option>
            </select>
          </div>

          {/* Employee Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400">الموظف صاحب الطلب</label>
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
            <label className="text-[10px] font-bold text-gray-400">من تاريخ</label>
            <input
              type="date"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-brand-secondary focus:outline-none"
            />
          </div>

          {/* Date To Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400">إلى تاريخ</label>
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
          <h3 className="text-xs font-bold text-gray-800 font-sans">سجل السلف والتذاكر</h3>
          <span className="text-[10px] bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-bold">
            عدد النتائج: {filteredLoans.length}
          </span>
        </div>

        {loading ? (
          <div className="p-20 text-center text-gray-400 text-xs font-semibold">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-3 text-brand-teal-dark" />
            جاري تحميل الطلبات...
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="p-20 text-center text-gray-400 text-xs font-medium">
            لا توجد أي طلبات مطابقة للفلاتر المحددة.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-gray-50 text-gray-400 uppercase font-bold text-[10px] border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">الموظف</th>
                  <th className="px-6 py-4">الفرع</th>
                  <th className="px-6 py-4">المبلغ المطلّوب</th>
                  <th className="px-6 py-4">السبب</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4">المراجع</th>
                  <th className="px-6 py-4">تاريخ الطلب</th>
                  <th className="px-6 py-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-600 font-medium">
                {filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-gray-50/50 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-brand-teal-dark/5 flex items-center justify-center text-brand-teal-dark">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-800">{loan.user?.name || '-'}</p>
                          <p className="text-[10px] text-gray-400">{loan.user?.role || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getBranchName(loan.user)}</td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {loan.amount.toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">ريال</span>
                    </td>
                    <td className="px-6 py-4 max-w-xs truncate" title={loan.reason}>
                      {loan.reason}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        loan.status === 'Pending' 
                          ? 'bg-amber-50 text-amber-700' 
                          : loan.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-rose-50 text-rose-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          loan.status === 'Pending' 
                            ? 'bg-amber-500' 
                            : loan.status === 'Approved'
                            ? 'bg-emerald-500'
                            : 'bg-rose-500'
                        }`}></span>
                        {loan.status === 'Pending' ? 'معلق' : loan.status === 'Approved' ? 'معتمد' : 'مرفوض'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-700">{getReviewerName(loan.reviewedBy)}</p>
                        {loan.reviewNote && (
                          <p className="text-[10px] text-rose-500 max-w-[150px] truncate" title={loan.reviewNote}>
                            السبب: {loan.reviewNote}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-sans text-gray-400 text-[11px]">
                      {new Date(loan.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {loan.status === 'Pending' ? (
                        isAccountantOrAdmin ? (
                          <button
                            onClick={() => {
                              setSelectedLoan(loan);
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
                          {loan.status === 'Approved' ? (
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

      {/* Review Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-brand-teal-dark/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-brand-teal-dark text-white p-5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-brand-secondary" />
                <h3 className="text-xs font-bold font-sans">مراجعة طلب السلفة المالية</h3>
              </div>
              <button 
                onClick={() => setSelectedLoan(null)}
                className="text-white/70 hover:text-white transition-all focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleReviewSubmit} className="p-6 space-y-5">
              {/* Employee & Request Info */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-xs border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">الموظف:</span>
                  <span className="text-gray-800 font-bold">{selectedLoan.user?.name} ({selectedLoan.user?.role})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">الفرع:</span>
                  <span className="text-gray-800 font-bold">{getBranchName(selectedLoan.user)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400 font-bold">المبلغ:</span>
                  <span className="text-gray-800 font-extrabold text-brand-teal-dark">{selectedLoan.amount} ريال</span>
                </div>
                <div className="pt-2 border-t border-gray-200">
                  <p className="text-gray-400 font-bold mb-1">السبب المعلن:</p>
                  <p className="text-gray-700 italic bg-white p-2 rounded border border-gray-100">{selectedLoan.reason}</p>
                </div>
              </div>

              {/* Status Radio Buttons */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400">القرار المالي</label>
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
                    رفض الطلب
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
                  placeholder={reviewStatus === 'Approved' ? 'أدخل ملاحظات اختيارية للاعتماد ماليّاً...' : 'الرجاء إدخال سبب رفض طلب السلفة...'}
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
                  onClick={() => setSelectedLoan(null)}
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
