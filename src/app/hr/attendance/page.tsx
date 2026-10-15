'use client';

import React, { useState, useEffect } from 'react';
import { api, Branch } from '@/utils/api';
import { useRole } from '@/components/RoleContext';
import { Role } from '@/types_local';
import { RotateCw } from 'lucide-react';

export default function HRAttendanceGridPage() {
  const { role: currentRole, user } = useRole();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const isBranchManager = currentRole === Role.BranchManager;

  const formatBranchName = (name?: string) => {
    if (!name) return 'راحتي للشقق المخدومة';
    if (name === 'Beachside Resort Branch') return 'راحتي للشقق المخدومة';
    if (name === 'Sail Road Branch') return 'فرع طريق المطار';
    return name;
  };

  const loadBranches = async () => {
    try {
      const data = await api.getBranches();
      const list = Array.isArray(data) ? data : [];
      setBranches(list);
      if (list.length > 0) {
        const rahtiBranch = list.find((b) => b.name.includes('راحتي'));
        const defaultBranch = user?.branchId || rahtiBranch?.id || list[0].id;
        setSelectedBranch(defaultBranch);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadGridData = async () => {
    if (!selectedBranch) return;
    setLoading(true);
    try {
      const [usersData, logsData] = await Promise.all([
        api.getUsers(),
        (api as any).getAttendanceLogs ? (api as any).getAttendanceLogs() : Promise.resolve([])
      ]);

      const branchEmployees = (Array.isArray(usersData) ? usersData : []).filter(
        (u: any) => !selectedBranch || selectedBranch === 'ALL' || !u.branchId || u.branchId === selectedBranch
      );

      const allLogs = Array.isArray(logsData) ? logsData : [];
      const dayLogs = allLogs.filter((l: any) => {
        const logDate = (l.checkIn || l.date || l.createdAt || '').toString().split('T')[0];
        return !selectedDate || logDate === selectedDate;
      });

      const gridRows = branchEmployees.map((emp: any) => {
        const matchedLog = dayLogs.find((l: any) => l.userId === emp.id || l.employeeId === emp.id);
        return {
          id: emp.id,
          userName: emp.name || 'موظف',
          shiftName: emp.shiftName || 'الوردية الصباحية (08:00 - 16:00)',
          checkIn: matchedLog?.checkIn
            ? new Date(matchedLog.checkIn).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
            : '-',
          checkOut: matchedLog?.checkOut
            ? new Date(matchedLog.checkOut).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
            : '-',
          status: matchedLog?.status || 'ABSENT'
        };
      });

      setRecords(gridRows);
    } catch (e) {
      console.error(e);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    if (selectedBranch) {
      loadGridData();
    }
  }, [selectedBranch, selectedDate]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 dir-rtl text-right">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">سجل الحضور وانضباط الورديات</h1>
          <p className="text-gray-500 text-sm">متابعة دقيقة لبصمات الحضور والانصراف بالتزامن مع الجدول الزمني</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            disabled={isBranchManager && !!user?.branchId}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {formatBranchName(b.name)}
              </option>
            ))}
          </select>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          />
        </div>
        <button
          onClick={loadGridData}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">جاري تحميل سجل الحضور...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-right text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="p-4 font-semibold">الموظف</th>
                <th className="p-4 font-semibold">الوردية المحددة</th>
                <th className="p-4 font-semibold">وقت الحضور المسجل</th>
                <th className="p-4 font-semibold">وقت الانصراف المسجل</th>
                <th className="p-4 font-semibold">الحالة والتأخير</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    لا توجد سجلات حضور لهذا التاريخ والفرع
                  </td>
                </tr>
              ) : (
                records.map((rec, idx) => (
                  <tr key={rec.id || idx} className="hover:bg-gray-50/50">
                    <td className="p-4 font-medium text-gray-900">{rec.userName}</td>
                    <td className="p-4 text-gray-600">{rec.shiftName}</td>
                    <td className="p-4 font-mono text-gray-700">{rec.checkIn}</td>
                    <td className="p-4 font-mono text-gray-700">{rec.checkOut}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          rec.status === 'PRESENT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.status === 'LATE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {rec.status === 'PRESENT' ? 'حاضر' : rec.status === 'LATE' ? 'متأخر' : 'غائب'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
