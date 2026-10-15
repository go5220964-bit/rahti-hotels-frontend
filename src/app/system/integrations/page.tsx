'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  CheckCircle2,
  QrCode,
  Smartphone,
  LogOut,
  X,
  Wifi,
  WifiOff
} from 'lucide-react';

interface WhatsAppLiveStatus {
  isConnected: boolean;
  isConnecting: boolean;
  connectedNumber: string | null;
  hasQr: boolean;
  qrCodeDataUrl?: string | null;
}

interface IntegrationConfig {
  id: string;
  badge: string;
  badgeColor: string;
  statusText: string;
  title: string;
  description: string;
  buttonLabel: string;
  apiKey: string;
  endpointUrl: string;
}

const BACKEND_ROOT_URL = (
  process.env.NEXT_PUBLIC_API_URL || 'https://rahti-hotels-backend.onrender.com/api'
).replace(/\/api\/?$/, '');

const INITIAL_INTEGRATIONS: IntegrationConfig[] = [
  {
    id: 'gemini',
    badge: 'AI',
    badgeColor: 'bg-purple-50 text-purple-600',
    statusText: 'متصل (Gemini 2.5)',
    title: 'محرك الذكاء الاصطناعي (Google Gemini)',
    description: 'تحليل رسائل الموظفين وتلخيص تقارير مجموعات الواتساب تلقائياً',
    buttonLabel: 'تعديل مفتاح Gemini API',
    apiKey: 'GEMINI_API_KEY_ACTIVE',
    endpointUrl: 'https://generativelanguage.googleapis.com'
  },
  {
    id: 'shamous',
    badge: 'شموس',
    badgeColor: 'bg-emerald-50 text-emerald-600',
    statusText: 'متصل',
    title: 'نظام شموس الأمني',
    description: 'إرسال بيانات النزلاء وحركات التسكين تلقائياً للجهات الأمنية',
    buttonLabel: 'تعديل مفاتيح API',
    apiKey: 'SHAMOUS_LIVE_TOKEN',
    endpointUrl: 'https://api.shamous.gov.sa/v1'
  },
  {
    id: 'zatca',
    badge: 'زكاة',
    badgeColor: 'bg-blue-50 text-blue-600',
    statusText: 'مرحلة 2 (ZATCA)',
    title: 'الفوترة الإلكترونية (ZATCA)',
    description: 'ربط الفواتير الضريبية المباشرة والائتمانية مع هيئة الزكاة والضريبة والجمارك',
    buttonLabel: 'إدارة الشهادات الرقمية',
    apiKey: 'ZATCA_CSID_STAGE2',
    endpointUrl: 'https://gw-fatoora.zatca.gov.sa'
  }
];

export default function IntegrationsPage() {
  const [waStatus, setWaStatus] = useState<WhatsAppLiveStatus>({
    isConnected: false,
    isConnecting: false,
    connectedNumber: null,
    hasQr: false,
    qrCodeDataUrl: null
  });
  const [loadingWa, setLoadingWa] = useState<boolean>(true);
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);

  const [integrations, setIntegrations] = useState<IntegrationConfig[]>(INITIAL_INTEGRATIONS);
  const [editingItem, setEditingItem] = useState<IntegrationConfig | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const fetchWhatsAppStatus = useCallback(async () => {
    try {
      setLoadingWa(true);
      const res = await fetch(`${BACKEND_ROOT_URL}/whatsapp/status`);
      if (res.ok) {
        const data = await res.json();
        setWaStatus({
          isConnected: Boolean(data.isConnected),
          isConnecting: Boolean(data.isConnecting),
          connectedNumber: data.connectedNumber || null,
          hasQr: Boolean(data.hasQr),
          qrCodeDataUrl: data.qrCodeDataUrl || null
        });
      }
    } catch (e) {
      console.warn('Could not reach WhatsApp status endpoint:', e);
    } finally {
      setLoadingWa(false);
    }
  }, []);

  useEffect(() => {
    fetchWhatsAppStatus();
    const interval = setInterval(fetchWhatsAppStatus, 12000);
    return () => clearInterval(interval);
  }, [fetchWhatsAppStatus]);

  const handleDisconnectWhatsApp = async () => {
    try {
      await fetch(`${BACKEND_ROOT_URL}/whatsapp/logout`, { method: 'POST' });
      setSavedNotice('تم فصل جلسة الواتساب بنجاح، يمكنك مسح رمز QR جديد الآن');
      fetchWhatsAppStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIntegrations((prev) =>
      prev.map((item) => (item.id === editingItem.id ? editingItem : item))
    );
    setEditingItem(null);
    setSavedNotice('تم حفظ وتحديث إعدادات الربط بنجاح');
    setTimeout(() => setSavedNotice(null), 3500);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 dir-rtl text-right">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الربط والتكامل (Integrations)</h1>
          <p className="text-gray-500 text-sm">
            إدارة اتصال بوت الواتساب الميداني، الذكاء الاصطناعي Gemini، والمنصات الحكومية
          </p>
        </div>
        <button
          onClick={fetchWhatsAppStatus}
          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors flex items-center gap-2 text-xs font-medium px-3"
        >
          <RefreshCw className={`w-4 h-4 ${loadingWa ? 'animate-spin' : ''}`} />
          تحديث حالة الاتصال
        </button>
      </div>

      {savedNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {savedNotice}
        </div>
      )}

      {/* Live WhatsApp Bot Connection Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-emerald-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              بوت الواتساب الميداني (Baileys & Cloud Webhook)
            </span>
            {waStatus.isConnected ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                <Wifi className="w-3.5 h-3.5" />
                متصل ونشط {waStatus.connectedNumber ? `(${waStatus.connectedNumber}+)` : ''}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                <WifiOff className="w-3.5 h-3.5" />
                {waStatus.isConnecting ? 'جاري تهيئة رمز QR...' : 'غير مقترن — بانتظار مسح QR'}
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            ربط رقم الواتساب لاستقبال طلبات الموظفين، البصمة الجغرافية، وتلخيص القروبات
          </h2>
          <p className="text-xs text-gray-500">
            يدعم الأوامر التفاعلية (`قائمة`، `تسجيل حضور`، `صيانة`، `طلب سلفة`، `تقرير الوردية`) مع حفظ الجلسة تلقائياً في قاعدة البيانات لمنع الانقطاع.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setIsQrModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-2"
          >
            <QrCode className="w-4 h-4" />
            {waStatus.isConnected ? 'عرض حالة الاقتران / QR' : 'مسح رمز QR للربط الآن'}
          </button>
          {waStatus.isConnected && (
            <button
              onClick={handleDisconnectWhatsApp}
              className="bg-red-50 hover:bg-red-100 text-red-600 px-3 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              فصل الرقم
            </button>
          )}
        </div>
      </div>

      {/* Other Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {integrations.map((item) => (
          <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className={`px-3 py-1.5 rounded-lg font-bold text-xs ${item.badgeColor}`}>
                {item.badge}
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                {item.statusText}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{item.title}</h3>
              <p className="text-gray-500 text-xs mt-1">{item.description}</p>
            </div>
            <button
              onClick={() => setEditingItem({ ...item })}
              className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-medium rounded-lg transition-colors border border-gray-200"
            >
              {item.buttonLabel}
            </button>
          </div>
        ))}
      </div>

      {/* Modal: Live WhatsApp QR Scanner */}
      {isQrModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-gray-900">ربط بوت الواتساب عبر رمز QR</h3>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full h-[420px] rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
              <iframe
                src={`${BACKEND_ROOT_URL}/whatsapp/qr`}
                title="WhatsApp QR Scanner"
                className="w-full h-full border-0"
              />
            </div>

            <div className="flex justify-between items-center text-xs text-gray-500 pt-1">
              <span>افتح واتساب بالجوال ⬅️ الأجهزة المرتبطة ⬅️ ربط جهاز</span>
              <button
                onClick={() => setIsQrModalOpen(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit API Keys */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">{editingItem.title}</h3>
              <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  رابط نقطة الاتصال (Endpoint / Webhook)
                </label>
                <input
                  type="text"
                  value={editingItem.endpointUrl}
                  onChange={(e) => setEditingItem({ ...editingItem, endpointUrl: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  مفتاح الربط السري (API Key / Token)
                </label>
                <input
                  type="password"
                  value={editingItem.apiKey}
                  onChange={(e) => setEditingItem({ ...editingItem, apiKey: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                >
                  حفظ الإعدادات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
