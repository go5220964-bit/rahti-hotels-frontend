'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { MapPin, CheckCircle, XCircle, Loader2 } from 'lucide-react';

function CheckInContent() {
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  const type = searchParams.get('type') || 'CheckIn'; // 'CheckIn' | 'CheckOut'

  const [employeeName, setEmployeeName] = useState<string | null>(null);
  const [employeeRole, setEmployeeRole] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [apiSubmitting, setApiSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [details, setDetails] = useState<{ time?: string; distance?: number; branch?: string } | null>(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3000/api';

  useEffect(() => {
    if (!userId) {
      setLoadingProfile(false);
      setStatus('error');
      setMessage('خطأ: لم يتم تحديد معرف الموظف في الرابط.');
      return;
    }

    // Fetch user public profile (name & role only, no auth required)
    fetch(`${BACKEND_URL}/users/${userId}/public-profile`)
      .then(res => {
        if (!res.ok) throw new Error('فشل تحميل الملف الشخصي');
        return res.json();
      })
      .then(payload => {
        if (payload.success && payload.data) {
          setEmployeeName(payload.data.name);
          setEmployeeRole(payload.data.role);
        } else {
          throw new Error('بيانات الموظف غير صالحة');
        }
      })
      .catch(err => {
        console.error(err);
        setStatus('error');
        setMessage('فشل جلب بيانات الموظف. تأكد من أن الرابط صحيح أو تواصل مع الإدارة.');
      })
      .finally(() => {
        setLoadingProfile(false);
      });
  }, [userId, BACKEND_URL]);

  const translateRole = (roleStr?: string | null) => {
    if (!roleStr) return '';
    switch (roleStr) {
      case 'Admin': return 'مسؤول النظام';
      case 'CEO': return 'الرئيس التنفيذي';
      case 'FinanceManager': return 'المدير المالي';
      case 'Technician': return 'فني صيانة';
      case 'WarehouseManager': return 'أمين المستودع';
      case 'Receptionist': return 'موظف استقبال';
      case 'Accountant': return 'محاسب';
      case 'BranchManager': return 'مدير الفرع';
      case 'MaintenanceSupervisor': return 'مشرف الصيانة';
      case 'ProcurementOfficer': return 'مسؤول المشتريات';
      case 'HousekeepingSupervisor': return 'مشرف هاوسكيبنج';
      case 'HousekeepingStaff': return 'عامل نظافة';
      default: return roleStr;
    }
  };

  const handleRegisterAttendance = () => {
    if (!userId) return;

    if (!navigator.geolocation) {
      setStatus('error');
      setMessage('نظام تحديد المواقع (GPS) غير مدعوم في متصفحك الحالي. يرجى استخدام متصفح حديث أو تحديث إعدادات جهازك.');
      return;
    }

    setGpsLoading(true);
    setStatus('idle');
    setMessage('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setGpsLoading(false);
        setApiSubmitting(true);

        try {
          const endpoint = type === 'CheckOut' ? 'check-out' : 'check-in';
          const res = await fetch(`${BACKEND_URL}/attendance/${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, lat, lng })
          });

          const payload = await res.json();

          if (res.ok && payload.success) {
            setStatus('success');
            setMessage(`تم تسجيل ${type === 'CheckIn' ? 'حضورك' : 'انصرافك'} بنجاح!`);
            
            const timeStr = new Date(payload.data.log.timestamp).toLocaleTimeString('ar-EG', {
              hour: '2-digit',
              minute: '2-digit'
            });
            
            setDetails({
              time: timeStr,
              distance: Math.round(payload.data.distanceMeters),
              branch: payload.data.branchName === 'Sail Road Branch' ? 'فرع طريق السيل' :
                      payload.data.branchName === 'Beachside Resort Branch' ? 'فرع منتجع الشاطئ' :
                      payload.data.branchName
            });
          } else {
            setStatus('error');
            setMessage(payload.error?.message || 'فشل تسجيل البصمة الجغرافية. تأكد من تواجدك داخل نطاق الفرع.');
          }
        } catch (err: any) {
          console.error(err);
          setStatus('error');
          setMessage('حدث خطأ غير متوقع أثناء الاتصال بالخادم. يرجى المحاولة مرة أخرى.');
        } finally {
          setApiSubmitting(false);
        }
      },
      (error) => {
        setGpsLoading(false);
        console.error(error);
        setStatus('error');
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setMessage('❌ تم رفض إذن الوصول للموقع. يرجى السماح للمتصفح بالوصول للموقع الجغرافي لتسجيل الحضور.');
            break;
          case error.POSITION_UNAVAILABLE:
            setMessage('❌ إحداثيات الموقع غير متوفرة حالياً. تأكد من تشغيل الـ GPS بجهازك.');
            break;
          case error.TIMEOUT:
            setMessage('❌ انتهت مهلة طلب تحديد الموقع. يرجى المحاولة مرة أخرى في مكان مفتوح.');
            break;
          default:
            setMessage('❌ فشل تحديد موقع جهازك الجغرافي.');
        }
      },
      {
        enableHighAccuracy: true, // Force hardware GPS
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  if (loadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin" />
        <p className="text-sm font-semibold text-slate-500">جاري تحميل بيانات الموظف والتحقق من الرابط...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full mx-auto bg-white p-8 rounded-2xl shadow-xl border border-[#D4AF37]/15 space-y-6 relative overflow-hidden">
      {/* Decorative Gradient Top */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-teal-dark via-brand-primary to-brand-secondary"></div>
      
      {/* Header Info */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 border border-slate-100 text-[#1C2D42] mb-2 shadow-inner">
          <MapPin className="w-6 h-6 text-brand-primary" />
        </div>
        
        {employeeName ? (
          <>
            <h2 className="text-xl font-bold text-[#1C2D42]">{employeeName}</h2>
            <div className="text-xs font-semibold text-slate-400">
              {translateRole(employeeRole)}
            </div>
            <div className="inline-block px-3 py-1 bg-brand-cream border border-brand-secondary/20 rounded-full text-[11px] font-bold text-brand-teal-dark mt-2">
              طلب بصمة: {type === 'CheckIn' ? 'حضور الوردية 🌅' : 'انصراف من الوردية 🌃'}
            </div>
          </>
        ) : (
          <h2 className="text-lg font-bold text-rose-700">طلب تسجيل بصمة غير صالح</h2>
        )}
      </div>

      {status === 'idle' && employeeName && (
        <div className="space-y-4 text-center">
          <p className="text-xs text-slate-500 leading-relaxed">
            يستخدم هذا النظام تحديد الموقع الجغرافي الفعلي لجهازك لمطابقة حضورك مع النطاق المعتمد للفرع. يرجى الضغط على الزر أدناه والقبول بمشاركة إذن الموقع.
          </p>
          
          <button
            onClick={handleRegisterAttendance}
            disabled={gpsLoading || apiSubmitting}
            className="w-full py-4 px-6 bg-[#1C2D42] hover:bg-[#253952] text-white font-extrabold text-sm rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {gpsLoading || apiSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-brand-secondary" />
                <span>{gpsLoading ? 'جاري تحديد موقعك بدقة (GPS)...' : 'جاري التحقق والتسجيل بالخادم...'}</span>
              </>
            ) : (
              <span>تأكيد وتسجيل الموقع الفعلي</span>
            )}
          </button>
        </div>
      )}

      {/* Success View */}
      {status === 'success' && (
        <div className="bg-emerald-50/50 p-6 rounded-xl border border-emerald-100 space-y-4 text-center animate-in fade-in zoom-in duration-300">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-emerald-600 bg-emerald-50 rounded-full p-2" />
          </div>
          <h3 className="text-base font-black text-emerald-800">{message}</h3>
          
          {details && (
            <div className="text-xs text-slate-600 bg-white border border-emerald-100 rounded-lg p-4 space-y-2 text-right">
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400 font-medium">الفرع المكتشف:</span>
                <span className="font-bold text-slate-800">{details.branch}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-400 font-medium">وقت البصمة:</span>
                <span className="font-bold font-mono text-slate-800">{details.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">المسافة للفرع:</span>
                <span className="font-bold text-slate-800">{details.distance} متر</span>
              </div>
            </div>
          )}
          
          <p className="text-[10px] text-emerald-600 font-bold">بإمكانك إغلاق هذه الصفحة والعودة للواتساب الآن.</p>
        </div>
      )}

      {/* Error View */}
      {status === 'error' && (
        <div className="bg-rose-50/50 p-6 rounded-xl border border-rose-100 space-y-4 text-center animate-in fade-in zoom-in duration-300">
          <div className="flex justify-center">
            <XCircle className="w-16 h-16 text-rose-600 bg-rose-50 rounded-full p-2" />
          </div>
          <h3 className="text-sm font-bold text-rose-800 leading-relaxed whitespace-pre-line">{message}</h3>
          
          {employeeName && (
            <button
              onClick={handleRegisterAttendance}
              disabled={gpsLoading || apiSubmitting}
              className="w-full py-3 px-6 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {(gpsLoading || apiSubmitting) && <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />}
              إعادة محاولة تحديد الموقع
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function CheckInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FAF9F5] px-4 py-8 relative">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium text-xs">جاري تحميل الصفحة...</p>
        </div>
      }>
        <CheckInContent />
      </Suspense>
    </div>
  );
}
