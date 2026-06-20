'use client';

import React, { useState, useEffect } from 'react';
import { api, Branch } from '@/utils/api';
import { useRole } from '@/components/RoleContext';
import { Role } from '@/types_local';
import { Megaphone, RotateCw, Send, MessageSquare } from 'lucide-react';

export default function HRAnnouncementsPage() {
  const { role: currentRole } = useRole();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [branchId, setBranchId] = useState('all');
  const [sentViaWhatsApp, setSentViaWhatsApp] = useState(true);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadBranches = async () => {
    setLoading(true);
    try {
      const data = await api.getBranches();
      setBranches(data);
    } catch (e) {
      console.error(e);
      showToast('خطأ أثناء تحميل الفروع', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentRole !== Role.Admin && currentRole !== Role.CEO && currentRole !== Role.BranchManager) return;
    loadBranches();
  }, [currentRole]);

  if (currentRole !== Role.Admin && currentRole !== Role.CEO && currentRole !== Role.BranchManager) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl text-center font-bold" dir="rtl">
        ⚠️ عذراً، هذه الصفحة مخصصة لمدير النظام والرئيس التنفيذي ومدير الفرع فقط.
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      showToast('يرجى كتابة عنوان ونص التعميم الإداري', 'error');
      return;
    }

    setSending(true);
    try {
      const payload = {
        title: title.trim(),
        body: body.trim(),
        branchId,
        sentViaWhatsApp
      };
      const response = await api.broadcastAnnouncement(payload);
      showToast(`تم نشر وبث التعميم الإداري بنجاح إلى ${response.recipientCount || 0} موظف.`);
      setTitle('');
      setBody('');
      setBranchId('all');
    } catch (err) {
      console.error(err);
      showToast('فشل بث التعميم الإداري', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-right" dir="rtl">
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-lg text-white font-bold text-xs flex items-center gap-2.5 transition-all ${
          toast.type === 'success' ? 'bg-emerald-600 border border-emerald-500' : 'bg-rose-600 border border-rose-500'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Panel */}
      <div className="bg-white p-6 rounded-2xl border border-brand-secondary/15 shadow-sm">
        <h1 className="text-xl font-bold text-brand-teal-dark flex items-center gap-2.5">
          <Megaphone className="w-6 h-6 text-brand-primary" />
          <span>البلاغات والتعاميم الإدارية</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1.5">
          إنشاء ونشر التعاميم الإدارية الهامة للموظفين. يمكنك توجيه التعميم لفرع محدد أو جميع الفروع مع إرسال تنبيه فوري عبر واتساب.
        </p>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-brand-secondary/15 shadow-sm text-center text-xs text-slate-400 flex flex-col items-center gap-3">
          <RotateCw className="w-8 h-8 text-brand-primary animate-spin" />
          <span>جاري تحميل بيانات الفروع...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-brand-secondary/15 shadow-sm p-8 max-w-xl space-y-6">
          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-bold">عنوان التعميم الإداري:</label>
            <input
              type="text"
              placeholder="مثال: مواعيد العمل خلال عطلة العيد"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-brand-secondary/20 rounded-xl focus:outline-none font-bold"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-slate-500 font-bold">نص التعميم بالتفصيل:</label>
            <textarea
              rows={5}
              placeholder="اكتب هنا التفاصيل الإدارية والقرارات..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-brand-secondary/20 rounded-xl focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold">الفرع المستهدف بالتعميم:</label>
              <select
                value={branchId}
                onChange={(e) => setBranchId(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-brand-secondary/20 rounded-xl focus:outline-none font-bold"
              >
                <option value="all">جميع الفروع النشطة</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name === 'Sail Road Branch' ? 'فرع طريق السيل (مكة)' : b.name === 'Beachside Resort Branch' ? 'فرع منتجع الشاطئ (جدة)' : b.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col justify-end gap-1.5 py-1">
              <span className="text-xs text-slate-500 font-bold">طريقة التنبيه:</span>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="whatsAppPush"
                  checked={sentViaWhatsApp}
                  onChange={(e) => setSentViaWhatsApp(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-primary focus:ring-brand-primary cursor-pointer"
                />
                <label htmlFor="whatsAppPush" className="text-xs font-bold text-slate-600 flex items-center gap-1 cursor-pointer">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>إرسال إشعار فوري عبر بوت الواتساب للموظفين</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={sending}
              className="bg-brand-primary hover:bg-brand-primary-hover text-white font-extrabold text-xs px-6 py-3 rounded-lg flex items-center gap-2 transition shadow disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{sending ? 'جاري البث والارسال...' : 'بث التعميم الإداري'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
