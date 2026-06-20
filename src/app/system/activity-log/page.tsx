'use client';

import React, { useState, useEffect } from 'react';
import { api, User } from '@/utils/api';
import { useRole } from '@/components/RoleContext';
import { Role } from '@/types_local';
import { ClipboardList, RotateCw, Search, Eye, X } from 'lucide-react';

export default function SystemActivityLogPage() {
  const { role: currentRole } = useRole();
  const [logs, setLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDetails, setSelectedDetails] = useState<any | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [logsData, usersData] = await Promise.all([
        api.getActivityLogs(),
        api.getUsers()
      ]);
      setLogs(logsData || []);
      setUsers(usersData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentRole !== Role.Admin) return;
    loadData();
  }, [currentRole]);

  if (currentRole !== Role.Admin) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl text-center font-bold" dir="rtl">
        ⚠️ عذراً، هذه الصفحة مخصصة لمدير النظام فقط.
      </div>
    );
  }

  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : `مستخدم (#${userId.slice(-4)})`;
  };

  const translateAction = (action: string) => {
    switch (action) {
      case 'CREATE_USER': return 'إضافة مستخدم جديد';
      case 'UPDATE_USER': return 'تعديل مستخدم';
      case 'TRANSFER_EMPLOYEE': return 'نقل موظف لفرع آخر';
      case 'BROADCAST_ANNOUNCEMENT': return 'بث تعميم إداري';
      case 'CREATE_UNIT_OF_MEASURE': return 'إضافة وحدة قياس';
      case 'ADD_STOCK': return 'إضافة كمية مخزون';
      case 'SUBMIT_LOAN_REQUEST': return 'تقديم طلب سلفة';
      case 'REVIEW_LOAN_REQUEST': return 'مراجعة/اعتماد سلفة';
      case 'CREATE_DOCUMENT': return 'إضافة مستند';
      case 'DELETE_DOCUMENT': return 'حذف مستند';
      case 'SUBMIT_MAINTENANCE': return 'تقديم بلاغ صيانة';
      default: return action;
    }
  };

  const filteredLogs = logs.filter(log => {
    const userName = getUserName(log.userId).toLowerCase();
    const actionName = (log.action || '').toLowerCase();
    const translated = translateAction(log.action).toLowerCase();
    const entity = (log.entity || '').toLowerCase();
    const s = searchTerm.toLowerCase();

    return userName.includes(s) || actionName.includes(s) || translated.includes(s) || entity.includes(s);
  });

  return (
    <div className="space-y-8 animate-fade-in text-right" dir="rtl">
      {/* Header Panel */}
      <div className="bg-white p-6 rounded-2xl border border-brand-secondary/15 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-brand-teal-dark flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-brand-primary" />
            <span>سجل الأنشطة والعمليات</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1.5">
            سجل كامل بجميع عمليات التعديل، الحذف، والإنشاء التي تحدث عبر مختلف الأنظمة الفرعية من قبل المستخدمين.
          </p>
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full shrink-0">
          <input
            type="text"
            placeholder="بحث في العمليات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-10 py-2.5 text-xs bg-slate-50 border border-brand-secondary/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
          />
          <Search className="w-4 h-4 text-slate-400 absolute top-3.5 right-3.5" />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-brand-secondary/15 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center gap-3">
            <RotateCw className="w-8 h-8 text-brand-primary animate-spin" />
            <span>جاري تحميل سجل النشاط...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            لا توجد سجلات مطابقة للبحث أو مسجلة في المنظومة.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold select-none">
                  <th className="p-4">المسؤول</th>
                  <th className="p-4">العملية</th>
                  <th className="p-4">الجدول / الكيان</th>
                  <th className="p-4 font-mono">ID السجل</th>
                  <th className="p-4">عنوان IP</th>
                  <th className="p-4">التوقيت والتاريخ</th>
                  <th className="p-4 text-center">التفاصيل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 font-semibold text-slate-700">
                    <td className="p-4">
                      <div className="font-extrabold text-slate-900">{getUserName(log.userId)}</div>
                      <div className="text-[9px] text-slate-400 font-mono mt-0.5">UID: {log.userId.slice(-6).toUpperCase()}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-brand-cream text-brand-teal-dark px-2.5 py-1 rounded border border-brand-secondary/20 text-[10px] font-extrabold">
                        {translateAction(log.action)}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 font-mono">{log.entity}</td>
                    <td className="p-4 text-slate-500 font-mono text-[10px]">{log.entityId}</td>
                    <td className="p-4 text-slate-500 font-mono">{log.ip || '127.0.0.1'}</td>
                    <td className="p-4 text-slate-500 font-mono">
                      {new Date(log.createdAt).toLocaleString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </td>
                    <td className="p-4 text-center">
                      {log.details && (
                        <button
                          onClick={() => {
                            try {
                              setSelectedDetails(JSON.parse(log.details));
                            } catch {
                              setSelectedDetails(log.details);
                            }
                          }}
                          className="p-1.5 bg-slate-100 hover:bg-brand-primary/10 text-slate-600 hover:text-brand-primary rounded transition"
                          title="عرض تفاصيل العملية"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details modal */}
      {selectedDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-brand-secondary/25 overflow-hidden animate-in zoom-in duration-200 text-right p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h2 className="text-sm font-black text-brand-teal-dark">تفاصيل العملية الدقيقة (Payload)</h2>
              <button onClick={() => setSelectedDetails(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] overflow-auto max-h-96 text-left dir-ltr">
              <pre>{JSON.stringify(selectedDetails, null, 2)}</pre>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedDetails(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-lg transition"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
