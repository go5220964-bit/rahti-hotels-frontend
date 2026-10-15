'use client';

import React, { useState, useEffect } from 'react';
import { api, MaintenanceTask, Branch, User } from '@/utils/api';
import { useRole } from '@/components/RoleContext';
import { Plus, RotateCw, UserCheck, CheckCircle2, Play, X } from 'lucide-react';

export default function MaintenancePage() {
  const { user } = useRole();
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedBranch, setSelectedBranch] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [branchId, setBranchId] = useState('');
  const [technicianId, setTechnicianId] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [tasksData, branchesData, usersData] = await Promise.all([
        api.getMaintenanceTasks(),
        api.getBranches(),
        api.getUsers()
      ]);
      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setBranches(Array.isArray(branchesData) ? branchesData : []);
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

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if ((api as any).createMaintenanceTask) {
        await (api as any).createMaintenanceTask({
          title,
          description,
          roomNumber,
          priority,
          branchId: branchId || user?.branchId || branches[0]?.id,
          assignedToUserId: technicianId || undefined
        });
      }
      setIsCreateModalOpen(false);
      setTitle('');
      setDescription('');
      setRoomNumber('');
      setPriority('MEDIUM');
      setTechnicianId('');
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAssignTechnician = async (taskId: string, newTechId: string) => {
    try {
      if ((api as any).assignMaintenanceTicket) {
        await (api as any).assignMaintenanceTicket(taskId, newTechId);
      }
      const techUser = employees.find((u) => u.id === newTechId);
      setTasks((prev) =>
        prev.map((t: any) =>
          t.id === taskId ? { ...t, assignedToUserId: newTechId, assignedToUser: techUser } : t
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => {
    try {
      if ((api as any).updateMaintenanceTicketStatus) {
        await (api as any).updateMaintenanceTicketStatus(taskId, newStatus);
      }
      setTasks((prev) =>
        prev.map((t: any) => (t.id === taskId ? { ...t, status: newStatus } : t))
      );
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchBranch = selectedBranch === 'ALL' || t.branchId === selectedBranch;
    const matchStatus = selectedStatus === 'ALL' || t.status === selectedStatus;
    return matchBranch && matchStatus;
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 dir-rtl text-right">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الصيانة والمهام الفنية</h1>
          <p className="text-gray-500 text-sm">متابعة طلبات إصلاح الأعطال وتعيين الفنيين وإغلاق البلاغات</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          طلب صيانة جديد
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
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
            <option value="PENDING">معلقة</option>
            <option value="IN_PROGRESS">قيد التنفيذ</option>
            <option value="COMPLETED">مكتملة</option>
          </select>
        </div>
        <button onClick={loadData} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-right text-sm">
          <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold">عنوان العطل / الوصف</th>
              <th className="p-4 font-semibold">الفرع / الغرفة</th>
              <th className="p-4 font-semibold">الأولوية</th>
              <th className="p-4 font-semibold">الفني المسؤول</th>
              <th className="p-4 font-semibold">الحالة</th>
              <th className="p-4 font-semibold">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredTasks.map((task: any) => (
              <tr key={task.id} className="hover:bg-gray-50/50">
                <td className="p-4">
                  <div className="font-semibold text-gray-900">{task.title}</div>
                  <div className="text-xs text-gray-500">{task.description}</div>
                </td>
                <td className="p-4">
                  <div className="text-gray-900">{task.branch?.name || task.branchId}</div>
                  <div className="text-xs text-gray-500">غرفة: {task.roomNumber || 'عام'}</div>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      task.priority === 'HIGH'
                        ? 'bg-red-100 text-red-800'
                        : task.priority === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {task.priority === 'HIGH' ? 'عالية' : task.priority === 'MEDIUM' ? 'متوسطة' : 'منخفضة'}
                  </span>
                </td>
                <td className="p-4">
                  <select
                    value={task.assignedToUser?.id || task.technician?.id || task.assignedToUserId || ''}
                    onChange={(e) => handleAssignTechnician(task.id, e.target.value)}
                    className="border border-gray-300 rounded-lg px-2.5 py-1 text-xs bg-white"
                  >
                    <option value="">تعيين فني...</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      task.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : task.status === 'IN_PROGRESS'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {task.status === 'COMPLETED'
                      ? 'مكتملة'
                      : task.status === 'IN_PROGRESS'
                      ? 'قيد التنفيذ'
                      : 'معلقة'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {task.status === 'PENDING' && (
                      <button
                        onClick={() => handleStatusChange(task.id, 'IN_PROGRESS')}
                        className="text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5" />
                        بدء الإصلاح
                      </button>
                    )}
                    {task.status !== 'COMPLETED' && (
                      <button
                        onClick={() => handleStatusChange(task.id, 'COMPLETED')}
                        className="text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        إغلاق البلاغ
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">فتح بلاغ صيانة جديد</h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">عنوان العطل</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="مثال: عطل تكييف أو إضاءة"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">رقم الغرفة / المرفق</label>
                  <input
                    type="text"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="305"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">الأولوية</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="LOW">منخفضة</option>
                    <option value="MEDIUM">متوسطة</option>
                    <option value="HIGH">عالية / طارئة</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">الفني المسؤول (اختياري)</label>
                <select
                  value={technicianId}
                  onChange={(e) => setTechnicianId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">تعيين لاحقاً...</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">تفاصيل العطل</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  حفظ البلاغ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
