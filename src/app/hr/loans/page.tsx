'use client';

import React, { useState, useEffect } from 'react';
import { api, LoanRequest, Branch, User } from '@/utils/api';
import { useRole } from '@/components/RoleContext';
import { Plus, RotateCw, Check, X } from 'lucide-react';

export default function HRLoansPage() {
  const { user } = useRole();
  const [loans, setLoans] = useState<LoanRequest[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [amount, setAmount] = useState('');
  const [installments, setInstallments] = useState('1');
  const [reason, setReason] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [loansData, branchData, userData] = await Promise.all([
        api.getLoans(),
        api.getBranches(),
        api.getUsers()
      ]);
      setLoans(Array.isArray(loansData) ? loansData : []);
      setBranches(Array.isArray(branchData) ? branchData : []);
      setEmployees(Array.isArray(userData) ? userData : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resolveEmployeeName = (loan: any): string => {
    if (loan.user?.name) return loan.user.name;
    if (loan.employee?.name) return loan.employee.name;
    if (loan.employeeName) return loan.employeeName;
    const matched = employees.find(
      (emp) => emp.id === loan.userId || emp.id === loan.employeeId
    );
    if (matched?.name) return matched.name;
    return user?.id === loan.userId && user?.name ? user.name : 'موظف بالفرع';
  };

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetUserId = selectedUserId || user?.id || employees[0]?.id || '';
    if (!targetUserId) return;

    try {
      await api.createLoanRequest({
        userId: targetUserId,
        amount: parseFloat(amount),
        installmentsCount: parseInt(installments, 10) || 1,
        reason: reason.trim()
      });
      setIsModalOpen(false);
      setSelectedUserId('');
      setAmount('');
      setInstallments('1');
      setReason('');
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleApproveLoan = async (id: string) => {
    try {
      await api.approveLoan(id);
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleRejectLoan = async (id: string) => {
    try {
      await api.rejectLoan(id, 'مرفوض من الإدارة');
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredLoans = loans.filter((loan: any) => {
    const empBranchId =
      loan.user?.branchId ||
      employees.find((u) => u.id === loan.userId)?.branchId;
    const matchBranch = selectedBranch === 'ALL' || empBranchId === selectedBranch;
    const matchStatus = selectedStatus === 'ALL' || loan.status === selectedStatus;
    return matchBranch && matchStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 dir-rtl text-right">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة السلف والقروض</h1>
          <p className="text-gray-500 text-sm">متابعة طلبات السلف والأقساط الشهرية للموظفين</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          تقديم طلب سلفة
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="ALL">جميع الفروع</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="PENDING">معلقة للمراجعة</option>
            <option value="APPROVED">مقبولة</option>
            <option value="REJECTED">مرفوضة</option>
          </select>
        </div>
        <button
          onClick={loadData}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold">الموظف</th>
              <th className="p-4 font-semibold">مبلغ السلفة</th>
              <th className="p-4 font-semibold">الأقساط</th>
              <th className="p-4 font-semibold">السبب</th>
              <th className="p-4 font-semibold">الحالة</th>
              <th className="p-4 font-semibold">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredLoans.map((loan: any) => (
              <tr key={loan.id} className="hover:bg-gray-50/50">
                <td className="p-4 font-medium text-gray-900">{resolveEmployeeName(loan)}</td>
                <td className="p-4 font-bold text-gray-900">{(loan.amount || 0).toLocaleString()} ر.س</td>
                <td className="p-4 text-gray-600">{loan.installmentsCount || loan.installments || 1} شهر</td>
                <td className="p-4 text-gray-500 text-xs max-w-xs truncate">{loan.reason || '-'}</td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      loan.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : loan.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {loan.status === 'PENDING'
                      ? 'معلقة للمراجعة'
                      : loan.status === 'APPROVED'
                      ? 'مقبولة'
                      : 'مرفوضة'}
                  </span>
                </td>
                <td className="p-4">
                  {loan.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveLoan(loan.id)}
                        className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg"
                        title="اعتماد السلفة"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRejectLoan(loan.id)}
                        className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg"
                        title="رفض السلفة"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">تقديم طلب سلفة جديد</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateLoan} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الموظف</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  required
                >
                  <option value="">اختر الموظف...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">مبلغ السلفة (ر.س)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">عدد الأقساط (بالأشهر)</label>
                <input
                  type="number"
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  min="1"
                  max="24"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">سبب السلفة</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                >
                  إرسال الطلب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
