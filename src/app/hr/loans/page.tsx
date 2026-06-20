'use client';

import React, { useState, useEffect } from 'react';
import { api, User, LoanRequest } from '../../../utils/api';
import { useRole } from '../../../components/RoleContext';
import { Role } from '../../../types_local';
import { Plus, Landmark, Users, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function HRLoansPage() {
  const { role: currentRole } = useRole();
  const [users, setUsers] = useState<User[]>([]);
  const [loans, setLoans] = useState<LoanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [selectedUserId, setSelectedUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [repaymentMonths, setRepaymentMonths] = useState(1);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Filtering State
  const [statusFilter, setStatusFilter] = useState('All');

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersData, loansData] = await Promise.all([
        api.getUsers(),
        api.getLoanRequests()
      ]);
      setUsers(usersData);
      setLoans(loansData);
      if (usersData.length > 0) {
        setSelectedUserId(usersData[0].id);
      }
    } catch (error) {
      console.error('Failed to load HR loans data:', error);
      showToast('خطأ أثناء تحميل كشوف الموظفين والقروض', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      setFormError('الرجاء اختيار الموظف');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('الرجاء إدخال مبلغ صحيح أكبر من الصفر');
      return;
    }
    if (!reason.trim()) {
      setFormError('الرجاء إدخال سبب تقديم السلفة');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const newLoan = await api.createLoanRequest({
        userId: selectedUserId,
        amount: parsedAmount,
        reason: reason.trim(),
        repaymentMonths
      });

      setLoans([newLoan, ...loans]);
      showToast('تم إرسال طلب السلفة بنجاح وتحويله للمدير المالي للمراجعة.');
      
      // Reset Form
      setAmount('');
      setReason('');
      setRepaymentMonths(1);
    } catch (error: any) {
      setFormError(error?.message || 'فشل تقديم طلب السلفة، يرجى المحاولة لاحقاً.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLoans = loans.filter(loan => {
    if (statusFilter === 'All') return true;
    return loan.status === statusFilter;
  });

  const translateStatus = (statusStr: string) => {
    switch (statusStr) {
      case 'Pending': return 'معلق / بانتظار المالية';
      case 'Approved': return 'تمت الموافقة والصرف';
      case 'Rejected': return 'مرفوض من المالية';
      default: return statusStr;
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

      {/* Header Banner */}
      <div className="bg-brand-teal-dark text-white p-6 rounded-xl border border-brand-secondary/35 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-brand-secondary/10 blur-2xl"></div>
        <div>
          <h1 className="text-base font-bold tracking-wide uppercase font-sans">بوابة السلف والقروض الذكية</h1>
          <p className="text-xs text-white/70 mt-1">
            تقديم طلبات القروض المالية للموظفين ومتابعة حالة الدفع والاعتمادات المالية بالتنسيق مع الإدارة المالية.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Right side: Request Form */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-brand-secondary/20 p-6 shadow-sm h-fit">
          <h3 className="text-xs font-bold text-brand-teal-dark border-b pb-3 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-brand-primary" />
            طلب سلفة مالية جديدة
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded">
                ⚠️ {formError}
              </div>
            )}

            {/* Employee selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-teal-dark block">الموظف المعني:</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-semibold"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({translateStatus(u.role)})</option>
                ))}
              </select>
            </div>

            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-teal-dark block">مبلغ السلفة المطلوب (ريال):</label>
              <input
                type="number"
                required
                placeholder="مثال: 3000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-bold"
              />
            </div>

            {/* Repayment Months */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-teal-dark block">مدة السداد والأقساط:</label>
              <select
                value={repaymentMonths}
                onChange={(e) => setRepaymentMonths(parseInt(e.target.value, 10))}
                className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-semibold"
              >
                {[1, 2, 3, 4, 5, 6, 8, 10, 12].map(m => (
                  <option key={m} value={m}>على مدار {m} شهر</option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-teal-dark block">سبب وتفاصيل طلب السلفة:</label>
              <textarea
                required
                rows={3}
                placeholder="مثال: ظروف عائلية طارئة / سداد إيجار..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white py-2.5 rounded transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'جاري إرسال الطلب...' : 'إرسال طلب السلفة'}
            </button>
          </form>
        </div>

        {/* Left side: Tracking Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-brand-secondary/20 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 mb-6 gap-4">
              <div>
                <h3 className="text-xs font-bold text-brand-teal-dark">متابعة طلبات السلف والقروض</h3>
                <p className="text-[10px] text-muted mt-1">قائمة بجميع السلف المقدمة وحالة المراجعة المالية والاعتمادات.</p>
              </div>

              {/* Status filtering */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted font-bold ml-1">تصفية:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs bg-brand-cream border border-brand-secondary/30 rounded p-1.5 text-brand-teal-dark font-semibold focus:outline-none"
                >
                  <option value="All">الكل</option>
                  <option value="Pending">قيد الانتظار</option>
                  <option value="Approved">تم الاعتماد</option>
                  <option value="Rejected">مرفوضة</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20 text-xs text-muted italic">جاري تحميل سجلات القروض الموظفين...</div>
            ) : filteredLoans.length === 0 ? (
              <div className="text-center py-20 text-xs text-muted italic">لا توجد طلبات سلف تطابق التصفية المحددة.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-brand-cream-dark border-b border-brand-secondary/20 text-brand-teal-dark text-xs font-bold">
                      <th className="px-4 py-3">اسم الموظف</th>
                      <th className="px-4 py-3 text-center">المبلغ المطلوب</th>
                      <th className="px-4 py-3 text-center">مدة السداد</th>
                      <th className="px-4 py-3">السبب</th>
                      <th className="px-4 py-3">تاريخ التقديم</th>
                      <th className="px-4 py-3 text-center">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-cream-dark text-xs text-brand-teal-dark/95">
                    {filteredLoans.map((loan) => {
                      const matchedUser = users.find(u => u.id === loan.userId);
                      return (
                        <tr key={loan.id} className="hover:bg-brand-cream/10 transition-colors">
                          <td className="px-4 py-3 font-bold">{matchedUser ? matchedUser.name : 'موظف غير معروف'}</td>
                          <td className="px-4 py-3 text-center font-extrabold text-brand-primary">{loan.amount} ريال</td>
                          <td className="px-4 py-3 text-center text-muted font-medium">{loan.repaymentMonths || 1} شهر</td>
                          <td className="px-4 py-3 max-w-[150px] truncate" title={loan.reason}>{loan.reason}</td>
                          <td className="px-4 py-3 text-muted">{new Date(loan.createdAt).toLocaleDateString('ar-SA')}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                              loan.status === 'Approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                              loan.status === 'Rejected' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                              'bg-amber-50 border-amber-200 text-amber-800'
                            }`}>
                              {loan.status === 'Approved' ? 'معتمد ومصروف' :
                               loan.status === 'Rejected' ? 'مرفوض' : 'معلق للمراجعة'}
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

      </div>

    </div>
  );
}
