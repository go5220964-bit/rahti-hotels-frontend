'use client';

import React, { useState, useEffect } from 'react';
import { api, User, LoanRequest } from '../../../utils/api';
import { useRole } from '../../../components/RoleContext';
import { Role } from '../../../types_local';
import { Landmark, TrendingUp, AlertCircle, Check, X, ShieldAlert } from 'lucide-react';

export default function FinanceLoansPage() {
  const { role: currentRole } = useRole();
  const [loans, setLoans] = useState<LoanRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [metrics, setMetrics] = useState({ totalPendingAmount: 0, count: 0 });
  const [loading, setLoading] = useState(true);

  // Review state
  const [reviewNote, setReviewNote] = useState('');
  const [activeLoanId, setActiveLoanId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [loansData, usersData, metricsData] = await Promise.all([
        api.getLoanRequests(),
        api.getUsers(),
        api.getFinanceLoanMetrics()
      ]);
      setLoans(loansData);
      setUsers(usersData);
      setMetrics(metricsData);
    } catch (error) {
      console.error('Failed to load finance loans data:', error);
      showToast('خطأ أثناء تحميل كشوفات المالية والسلف', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleReview = async (loanId: string, status: 'Approved' | 'Rejected') => {
    setIsSubmitting(true);
    try {
      // Find current user id if we can, or send 'system' / 'finance'
      const reviewerId = 'finance-manager';
      await api.reviewLoanRequest(loanId, reviewerId, status, reviewNote);
      
      showToast(status === 'Approved' ? 'تم اعتماد صرف السلفة للموظف بنجاح.' : 'تم رفض طلب السلفة وحفظ الملاحظات.');
      setReviewNote('');
      setActiveLoanId(null);

      // Reload data to refresh lists and metrics
      await loadData();
    } catch (error: any) {
      showToast(error?.message || 'خطأ أثناء معالجة الطلب', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFinance = currentRole === Role.Admin || currentRole === Role.CEO || currentRole === Role.FinanceManager || currentRole === Role.Accountant;

  if (!isFinance) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-rose-50/50 rounded-xl border border-rose-200">
        <ShieldAlert className="w-12 h-12 text-rose-600 mb-3" />
        <h2 className="text-sm font-bold text-rose-900">🔒 عذراً، غير مصرح بالدخول</h2>
        <p className="text-xs text-rose-700/80 mt-1 max-w-sm">صفحة مراجعة السلف المالية والاعتمادات مخصصة للمدير المالي والمحاسبين فقط.</p>
      </div>
    );
  }

  const pendingLoans = loans.filter(l => l.status === 'Pending');
  const pastLoans = loans.filter(l => l.status !== 'Pending');

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

      {/* Header Banner */}
      <div className="bg-brand-teal-dark text-white p-6 rounded-xl border border-brand-secondary/35 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-brand-secondary/10 blur-2xl"></div>
        <div>
          <h1 className="text-base font-bold tracking-wide uppercase font-sans">اعتمادات السلف والذمم المالية</h1>
          <p className="text-xs text-white/70 mt-1">
            مراجعة طلبات السلف المقدمة من موظفي الفروع، تخصيص ميزانيات الصرف، واعتماد أو رفض الطلبات المعلقة.
          </p>
        </div>
      </div>

      {/* Metrics Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl border border-brand-secondary/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-muted font-bold block">إجمالي مبالغ السلف المعلقة:</span>
            <span className="text-lg font-extrabold text-brand-primary mt-1 block">{metrics.totalPendingAmount} ريال</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-brand-secondary/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-muted font-bold block">عدد الطلبات بانتظار المراجعة:</span>
            <span className="text-lg font-extrabold text-amber-700 mt-1 block">{metrics.count} طلب معلق</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-700">
            <Landmark className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Pending Loans Table */}
      <div className="bg-white rounded-xl border border-brand-secondary/20 shadow-sm overflow-hidden">
        <div className="bg-brand-cream-dark p-4 border-b border-brand-secondary/25">
          <h3 className="text-xs font-bold text-brand-teal-dark">طلبات السلف المعلقة بانتظار الاعتماد</h3>
        </div>

        {loading ? (
          <div className="text-center py-12 text-xs text-muted italic">جاري تحميل بيانات السلف...</div>
        ) : pendingLoans.length === 0 ? (
          <div className="text-center py-12 text-xs text-muted italic flex flex-col items-center gap-2 justify-center">
            <Check className="w-8 h-8 text-emerald-600 bg-emerald-50 rounded-full p-1" />
            <span>لا توجد طلبات سلف معلقة بحاجة لمراجعة حالياً.</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-brand-cream-dark/60 border-b border-brand-secondary/20 text-brand-teal-dark text-xs font-bold">
                  <th className="px-6 py-4">اسم الموظف</th>
                  <th className="px-6 py-4">الدور / الصلاحية</th>
                  <th className="px-6 py-4 text-center">المبلغ</th>
                  <th className="px-6 py-4 text-center">الأقساط</th>
                  <th className="px-6 py-4">السبب</th>
                  <th className="px-6 py-4">تاريخ التقديم</th>
                  <th className="px-6 py-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-cream-dark text-xs text-brand-teal-dark/95">
                {pendingLoans.map((loan) => {
                  const employee = users.find(u => u.id === loan.userId);
                  const isReviewing = activeLoanId === loan.id;
                  
                  return (
                    <React.Fragment key={loan.id}>
                      <tr className="hover:bg-brand-cream/10 transition-colors">
                        <td className="px-6 py-4 font-bold">{employee ? employee.name : 'موظف غير معروف'}</td>
                        <td className="px-6 py-4 text-muted">{employee ? translateRole(employee.role) : ''}</td>
                        <td className="px-6 py-4 text-center font-extrabold text-brand-primary">{loan.amount} ريال</td>
                        <td className="px-6 py-4 text-center text-muted font-medium">{loan.repaymentMonths || 1} شهر</td>
                        <td className="px-6 py-4 max-w-[200px] truncate" title={loan.reason}>{loan.reason}</td>
                        <td className="px-6 py-4 text-muted">{new Date(loan.createdAt).toLocaleDateString('ar-SA')}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setActiveLoanId(isReviewing ? null : loan.id);
                                setReviewNote('');
                              }}
                              className="bg-brand-primary text-white text-[10px] font-bold px-3 py-1.5 rounded hover:bg-brand-primary-hover transition-colors cursor-pointer"
                            >
                              مراجعة واعتماد
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Review Panel Drawer row */}
                      {isReviewing && (
                        <tr className="bg-brand-cream/10">
                          <td colSpan={7} className="px-6 py-4 border-y border-brand-secondary/20">
                            <div className="flex flex-col sm:flex-row gap-4 items-end justify-between">
                              <div className="flex-1 space-y-1.5 text-right w-full">
                                <label className="text-[10px] font-bold text-brand-teal-dark block">ملاحظات المراجعة والتدقيق المالي (اختياري):</label>
                                <input
                                  type="text"
                                  placeholder="اكتب ملاحظة الاعتماد أو سبب الرفض هنا..."
                                  value={reviewNote}
                                  onChange={(e) => setReviewNote(e.target.value)}
                                  className="w-full text-xs bg-white border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
                                />
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleReview(loan.id, 'Rejected')}
                                  disabled={isSubmitting}
                                  className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-4 py-2.5 rounded transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  رفض الطلب
                                </button>
                                <button
                                  onClick={() => handleReview(loan.id, 'Approved')}
                                  disabled={isSubmitting}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-4 py-2.5 rounded transition-all cursor-pointer flex items-center gap-1 disabled:opacity-50"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  اعتماد وصرف
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* History Log */}
      <div className="bg-white rounded-xl border border-brand-secondary/20 shadow-sm overflow-hidden">
        <div className="bg-brand-cream-dark p-4 border-b border-brand-secondary/25">
          <h3 className="text-xs font-bold text-brand-teal-dark">سجل القرارات والطلبات السابقة</h3>
        </div>

        {pastLoans.length === 0 ? (
          <div className="text-center py-10 text-xs text-muted italic">لا توجد طلبات سلف سابقة مؤرشفة.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-brand-cream-dark/60 border-b border-brand-secondary/20 text-brand-teal-dark text-xs font-bold">
                  <th className="px-6 py-4">اسم الموظف</th>
                  <th className="px-6 py-4 text-center">المبلغ</th>
                  <th className="px-6 py-4 text-center">فترة السداد</th>
                  <th className="px-6 py-4">السبب</th>
                  <th className="px-6 py-4">تاريخ المراجعة</th>
                  <th className="px-6 py-4">ملاحظة القرار</th>
                  <th className="px-6 py-4 text-center">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-cream-dark text-xs text-brand-teal-dark/95">
                {pastLoans.map((loan) => {
                  const employee = users.find(u => u.id === loan.userId);
                  return (
                    <tr key={loan.id} className="hover:bg-brand-cream/10 transition-colors">
                      <td className="px-6 py-4 font-bold">{employee ? employee.name : 'موظف غير معروف'}</td>
                      <td className="px-6 py-4 text-center font-extrabold text-brand-primary">{loan.amount} ريال</td>
                      <td className="px-6 py-4 text-center text-muted font-medium">{loan.repaymentMonths || 1} شهر</td>
                      <td className="px-6 py-4 max-w-[150px] truncate" title={loan.reason}>{loan.reason}</td>
                      <td className="px-6 py-4 text-muted">{loan.reviewedAt ? new Date(loan.reviewedAt).toLocaleDateString('ar-SA') : ''}</td>
                      <td className="px-6 py-4 text-muted max-w-[150px] truncate" title={loan.reviewNote || ''}>{loan.reviewNote || '-'}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                          loan.status === 'Approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                          'bg-rose-50 border-rose-200 text-rose-800'
                        }`}>
                          {loan.status === 'Approved' ? 'موافق عليها' : 'مرفوضة'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

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
    default: return roleStr;
  }
};
