'use client';

import React, { useState, useEffect } from 'react';
import { api, LeaveRequest, User } from '@/utils/api';
import { useRole } from '@/components/RoleContext';
import { Plus, Check, X } from 'lucide-react';

export default function LeavesPage() {
  const { user } = useRole();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [leaveType, setLeaveType] = useState('سنوية');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [leavesData, usersData] = await Promise.all([api.getLeaves(), api.getUsers()]);
      setLeaves(Array.isArray(leavesData) ? leavesData : []);
      setEmployees(Array.isArray(usersData) ? usersData : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if ((api as any).createLeaveRequest) {
        await (api as any).createLeaveRequest({
          userId: selectedUserId || user?.id,
          leaveType,
          startDate,
          endDate,
          reason
        });
      }
      const emp = employees.find((u) => u.id === selectedUserId);
      setLeaves((prev: any) => [
        {
          id: `LV-${Date.now()}`,
          userId: selectedUserId,
          user: emp ? { name: emp.name } : { name: user?.name || 'موظف' },
          leaveType,
          startDate,
          endDate,
          status: 'PENDING'
        },
        ...prev
      ]);
      setIsModalOpen(false);
      setSelectedUserId('');
      setStartDate('');
      setEndDate('');
      setReason('');
    } catch (e) {
      console.error(e);
    }
  };

  const handleLeaveStatus = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      if ((api as any).updateLeaveStatus) {
        await (api as any).updateLeaveStatus(id, status);
      }
      setLeaves((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 dir-rtl text-right">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الإجازات والاستئذانات</h1>
          <p className="text-gray-500 text-sm">تقديم واعتماد طلبات الإجازات السنوية والمرضية والاضطرارية</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          طلب إجازة جديد
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold">الموظف</th>
              <th className="p-4 font-semibold">نوع الإجازة</th>
              <th className="p-4 font-semibold">تاريخ البداية</th>
              <th className="p-4 font-semibold">تاريخ النهاية</th>
              <th className="p-4 font-semibold">الحالة</th>
              <th className="p-4 font-semibold">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {leaves.map((leave: any) => (
              <tr key={leave.id} className="hover:bg-gray-50/50">
                <td className="p-4 font-medium text-gray-900">{leave.user?.name || leave.userId}</td>
                <td className="p-4 text-gray-700">{leave.leaveType || leave.type || 'سنوية'}</td>
                <td className="p-4 text-gray-600">{new Date(leave.startDate).toLocaleDateString('ar-SA')}</td>
                <td className="p-4 text-gray-600">{new Date(leave.endDate).toLocaleDateString('ar-SA')}</td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      leave.status === 'APPROVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : leave.status === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {leave.status === 'APPROVED' ? 'مقبولة' : leave.status === 'PENDING' ? 'قيد الانتظار' : 'مرفوضة'}
                  </span>
                </td>
                <td className="p-4">
                  {leave.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleLeaveStatus(leave.id, 'APPROVED')}
                        className="p-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg"
                        title="اعتماد الإجازة"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleLeaveStatus(leave.id, 'REJECTED')}
                        className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg"
                        title="رفض الإجازة"
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
              <h3 className="text-lg font-bold text-gray-900">تقديم طلب إجازة جديد</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateLeave} className="space-y-4">
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
                <label className="block text-xs font-medium text-gray-700 mb-1">نوع الإجازة</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="سنوية">إجازة سنوية</option>
                  <option value="مرضية">إجازة مرضية</option>
                  <option value="اضطرارية">إجازة اضطرارية</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">تاريخ البداية</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">تاريخ النهاية</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    required
                  />
                </div>
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
