'use client';

import React, { useState, useEffect } from 'react';
import { api } from '../../../utils/api';
import { Plus, Settings, FileSpreadsheet } from 'lucide-react';

interface UnitOfMeasure {
  id: string;
  name: string;
  abbreviation: string;
  createdAt?: string;
}

export default function UnitsOfMeasurePage() {
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [unitName, setUnitName] = useState('');
  const [abbreviation, setAbbreviation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const unitsData = await api.getUnitsOfMeasure();
      setUnits(unitsData);
    } catch (error) {
      console.error('Failed to load units:', error);
      showToast('خطأ أثناء تحميل وحدات القياس والمقاييس', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitName.trim()) {
      setFormError('الرجاء إدخال اسم وحدة القياس');
      return;
    }
    if (!abbreviation.trim()) {
      setFormError('الرجاء إدخال اختصار وحدة القياس');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      const newUnit = await api.createUnitOfMeasure({
        name: unitName.trim(),
        abbreviation: abbreviation.trim()
      });

      setUnits([...units, newUnit]);
      showToast(`تمت إضافة وحدة القياس "${newUnit.name}" بنجاح.`);
      
      // Reset Form
      setUnitName('');
      setAbbreviation('');
    } catch (error: any) {
      setFormError(error?.message || 'خطأ أثناء حفظ وحدة القياس الجديدة.');
    } finally {
      setIsSubmitting(false);
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
          <h1 className="text-base font-bold tracking-wide uppercase font-sans">إدارة وحدات القياس (UoM)</h1>
          <p className="text-xs text-white/70 mt-1">
            تعريف وحدات التعبئة والتجزئة للمستودعات (مثل: كرتون، لتر، قطعة) لتسهيل حسابات كميات المخزون وتوريد المشتريات.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Right side: Add form */}
        <div className="md:col-span-1 bg-white rounded-xl border border-brand-secondary/20 p-6 shadow-sm h-fit">
          <h3 className="text-xs font-bold text-brand-teal-dark border-b pb-3 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-brand-primary" />
            تعريف وحدة قياس جديدة
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold rounded">
                ⚠️ {formError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-teal-dark block">اسم الوحدة:</label>
              <input
                type="text"
                required
                placeholder="مثال: كرتون / لتر / قطعة"
                value={unitName}
                onChange={(e) => setUnitName(e.target.value)}
                className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-teal-dark block">اختصار الوحدة:</label>
              <input
                type="text"
                required
                placeholder="مثال: ل / كرتونة / قطعتين"
                value={abbreviation}
                onChange={(e) => setAbbreviation(e.target.value)}
                className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white py-2.5 rounded transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ الوحدة'}
            </button>
          </form>
        </div>

        {/* Left side: List Table */}
        <div className="md:col-span-2 bg-white rounded-xl border border-brand-secondary/20 p-6 shadow-sm">
          <div className="border-b pb-3 mb-6">
            <h3 className="text-xs font-bold text-brand-teal-dark">وحدات القياس المسجلة بالنظام</h3>
            <p className="text-[10px] text-muted mt-1">تستخدم هذه الوحدات تلقائياً عند إنشاء الأصناف وتوريد الكميات بالمستودعات.</p>
          </div>

          {loading ? (
            <div className="text-center py-20 text-xs text-muted italic">جاري تحميل وحدات القياس...</div>
          ) : units.length === 0 ? (
            <div className="text-center py-20 text-xs text-muted italic">لا توجد وحدات قياس مسجلة حالياً.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-brand-cream-dark border-b border-brand-secondary/20 text-brand-teal-dark text-xs font-bold">
                    <th className="px-6 py-4">اسم وحدة القياس</th>
                    <th className="px-6 py-4">الاختصار بالتقارير</th>
                    <th className="px-6 py-4">تاريخ الإنشاء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-cream-dark text-xs text-brand-teal-dark/95">
                  {units.map((unit) => (
                    <tr key={unit.id} className="hover:bg-brand-cream/10 transition-colors">
                      <td className="px-6 py-4 font-bold">{unit.name}</td>
                      <td className="px-6 py-4 font-mono font-medium text-brand-primary">{unit.abbreviation}</td>
                      <td className="px-6 py-4 text-muted">
                        {unit.createdAt ? new Date(unit.createdAt).toLocaleDateString('ar-SA') : 'تلقائي (أساسي)'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
