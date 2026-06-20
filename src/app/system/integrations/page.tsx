'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import { useRole } from '@/components/RoleContext';
import { Role } from '@/types_local';
import { Link2, RotateCw, Save, Key, Globe, MessageSquare, Clock } from 'lucide-react';

export default function SystemIntegrationsPage() {
  const { role: currentRole } = useRole();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Settings states
  const [whatsappToken, setWhatsappToken] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [attendanceBuffer, setAttendanceBuffer] = useState('30');

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await api.getSystemSettings();
      // data is an array of { id, key, value }
      const waToken = data.find((s: any) => s.key === 'whatsapp_token')?.value || '';
      const webUrl = data.find((s: any) => s.key === 'webhook_url')?.value || '';
      const gemKey = data.find((s: any) => s.key === 'gemini_api_key')?.value || '';
      const attBuf = data.find((s: any) => s.key === 'attendance_buffer_minutes')?.value || '30';

      setWhatsappToken(waToken);
      setWebhookUrl(webUrl);
      setGeminiApiKey(gemKey);
      setAttendanceBuffer(attBuf);
    } catch (e) {
      console.error(e);
      showToast('خطأ أثناء تحميل إعدادات الربط', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentRole !== Role.Admin) return;
    loadSettings();
  }, [currentRole]);

  if (currentRole !== Role.Admin) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-xl text-center font-bold" dir="rtl">
        ⚠️ عذراً، هذه الصفحة مخصصة لمدير النظام فقط.
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const settingsPayload = [
        { key: 'whatsapp_token', value: whatsappToken },
        { key: 'webhook_url', value: webhookUrl },
        { key: 'gemini_api_key', value: geminiApiKey },
        { key: 'attendance_buffer_minutes', value: attendanceBuffer }
      ];
      await api.updateSystemSettings(settingsPayload);
      showToast('تم حفظ إعدادات الربط والتكامل بنجاح');
    } catch (e) {
      console.error(e);
      showToast('فشل حفظ إعدادات الربط', 'error');
    } finally {
      setSaving(false);
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
          <Link2 className="w-6 h-6 text-brand-primary" />
          <span>إعدادات الربط الخارجي والذكاء الاصطناعي</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1.5">
          تهيئة مفاتيح الربط البرمجية (API Keys) للخدمات الخارجية مثل تطبيق الواتساب، وبوت الذكاء الاصطناعي Gemini، وعناوين التنبيهات (Webhooks).
        </p>
      </div>

      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-brand-secondary/15 shadow-sm text-center text-xs text-slate-400 flex flex-col items-center gap-3">
          <RotateCw className="w-8 h-8 text-brand-primary animate-spin" />
          <span>جاري تحميل إعدادات الربط...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="bg-white rounded-2xl border border-brand-secondary/15 shadow-sm p-8 max-w-2xl space-y-6">
          
          {/* Section 1: WhatsApp Bot */}
          <div className="space-y-4">
            <h2 className="text-xs font-black text-brand-teal-dark flex items-center gap-2 pb-2 border-b border-slate-100">
              <MessageSquare className="w-4 h-4 text-brand-primary" />
              <span>ربط وتفعيل رسائل الواتساب (WhatsApp Bot API)</span>
            </h2>
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold">رمز المصادقة (WhatsApp API Token):</label>
              <input
                type="text"
                value={whatsappToken}
                onChange={(e) => setWhatsappToken(e.target.value)}
                placeholder="أدخل الرمز المميز للربط مع WhatsApp Business"
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-brand-secondary/20 rounded-xl focus:outline-none font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold">عنوان استقبال البيانات (Webhook URL):</label>
              <input
                type="url"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://example.com/api/whatsapp-webhook"
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-brand-secondary/20 rounded-xl focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Section 2: Gemini AI */}
          <div className="space-y-4 pt-4">
            <h2 className="text-xs font-black text-brand-teal-dark flex items-center gap-2 pb-2 border-b border-slate-100">
              <Key className="w-4 h-4 text-brand-primary" />
              <span>محرك الذكاء الاصطناعي (Gemini AI Key)</span>
            </h2>
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold">مفتاح API الخاص بـ Gemini (Gemini API Key):</label>
              <input
                type="password"
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-brand-secondary/20 rounded-xl focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Section 3: Attendance Buffer */}
          <div className="space-y-4 pt-4">
            <h2 className="text-xs font-black text-brand-teal-dark flex items-center gap-2 pb-2 border-b border-slate-100">
              <Clock className="w-4 h-4 text-brand-primary" />
              <span>إعدادات الحضور والانصراف (Attendance Config)</span>
            </h2>
            <div className="space-y-1">
              <label className="text-xs text-slate-500 font-bold">فترة سماح مطابقة الوردية بالدقائق (Shift Matching Buffer):</label>
              <div className="flex items-center gap-2.5 max-w-xs">
                <input
                  type="number"
                  min="0"
                  value={attendanceBuffer}
                  onChange={(e) => setAttendanceBuffer(e.target.value)}
                  className="w-24 px-4 py-2.5 text-xs bg-slate-50 border border-brand-secondary/20 rounded-xl focus:outline-none font-bold"
                  required
                />
                <span className="text-xs font-bold text-slate-500">دقائق (قبل/بعد الوردية)</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                تستخدم لمطابقة وقت بصمة الموظف مع الوردية المعينة له تلقائياً (بحد أقصى ± دقيقة).
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="bg-brand-primary hover:bg-brand-primary-hover text-white font-extrabold text-xs px-6 py-3 rounded-lg flex items-center gap-2 transition shadow disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'جاري الحفظ...' : 'حفظ جميع الإعدادات'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
