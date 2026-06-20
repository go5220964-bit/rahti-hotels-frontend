'use client';

import React, { useState } from 'react';
import { Calculator, AlertCircle, Percent, ShieldAlert } from 'lucide-react';
import { useRole } from '../../../components/RoleContext';
import { Role } from '../../../types_local';

export default function CommissionsPage() {
  const { role: currentRole } = useRole();
  
  // Calculator inputs
  const [empName, setEmpName] = useState('');
  const [baseSalary, setBaseSalary] = useState('');
  const [commissionRate, setCommissionRate] = useState('');
  const [salesAmount, setSalesAmount] = useState('');

  // Result state
  const [calculatedCommission, setCalculatedCommission] = useState<number | null>(null);
  const [totalPayout, setTotalPayout] = useState<number | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const salary = parseFloat(baseSalary);
    const rate = parseFloat(commissionRate);
    const sales = parseFloat(salesAmount);

    if (isNaN(salary) || isNaN(rate) || isNaN(sales)) {
      alert('الرجاء إدخال قيم رقمية صحيحة');
      return;
    }

    const comm = sales * (rate / 100);
    const total = salary + comm;

    setCalculatedCommission(comm);
    setTotalPayout(total);
  };

  const isFinance = currentRole === Role.Admin || currentRole === Role.CEO || currentRole === Role.FinanceManager || currentRole === Role.Accountant;

  if (!isFinance) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 bg-rose-50/50 rounded-xl border border-rose-200" dir="rtl">
        <ShieldAlert className="w-12 h-12 text-rose-600 mb-3" />
        <h2 className="text-sm font-bold text-rose-900">🔒 عذراً، غير مصرح بالدخول</h2>
        <p className="text-xs text-rose-700/80 mt-1 max-w-sm">حاسبة العمولات المالية مخصصة للرئيس التنفيذي والمدير المالي والشركاء الماليين فقط.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 text-right" dir="rtl">
      
      {/* Header Banner with "قيد التطوير" Badge */}
      <div className="bg-brand-teal-dark text-white p-6 rounded-xl border border-brand-secondary/35 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-brand-secondary/10 blur-2xl"></div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-wide uppercase font-sans">حاسبة عمولات ومكافآت الموظفين</h1>
            <span className="bg-amber-500 text-brand-teal-dark font-extrabold text-[9px] px-2 py-0.5 rounded shadow-sm">
              قيد التطوير
            </span>
          </div>
          <p className="text-xs text-white/70 mt-1">
            احتساب عمولات الحجوزات ونسب الإشغال المستحقة لمشرفي الفروع وموظفي الاستقبال بناءً على البيانات المالية.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Inputs Form */}
        <form onSubmit={handleCalculate} className="md:col-span-1 bg-white rounded-xl border border-brand-secondary/20 p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-brand-teal-dark border-b pb-3 mb-4 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-brand-primary" />
            بيانات الاحتساب المالي
          </h3>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-teal-dark block">اسم الموظف:</label>
            <input
              type="text"
              required
              placeholder="مثال: مراد عبد الرحمن"
              value={empName}
              onChange={(e) => setEmpName(e.target.value)}
              className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-teal-dark block">الراتب الأساسي (ريال):</label>
            <input
              type="number"
              required
              placeholder="مثال: 5000"
              value={baseSalary}
              onChange={(e) => setBaseSalary(e.target.value)}
              className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-teal-dark block">نسبة عمولة المبيعات / الاستبقاء (%):</label>
            <div className="relative">
              <Percent className="absolute left-3 top-3 w-4 h-4 text-muted" />
              <input
                type="number"
                step="0.01"
                required
                placeholder="مثال: 5"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg pl-9 p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-bold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-brand-teal-dark block">مبيعات / حجوزات الفرع المحققة (ريال):</label>
            <input
              type="number"
              required
              placeholder="مثال: 20000"
              value={salesAmount}
              onChange={(e) => setSalesAmount(e.target.value)}
              className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary font-bold"
            />
          </div>

          <button
            type="submit"
            className="w-full text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white py-2.5 rounded transition-all cursor-pointer shadow-md"
          >
            احسب الآن
          </button>
        </form>

        {/* Right Side: Results Display */}
        <div className="md:col-span-2 bg-white rounded-xl border border-brand-secondary/20 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-brand-teal-dark border-b pb-3 mb-6">تقرير الاحتساب التقديري للعمولة</h3>

            {calculatedCommission !== null && totalPayout !== null ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-brand-cream/15 p-4 rounded-lg border border-brand-secondary/20">
                    <span className="text-[10px] text-muted font-bold block">مبلغ العمولة المحتسب:</span>
                    <span className="text-lg font-extrabold text-brand-primary mt-1 block">{calculatedCommission.toFixed(2)} ريال</span>
                  </div>

                  <div className="bg-brand-cream/15 p-4 rounded-lg border border-brand-secondary/20">
                    <span className="text-[10px] text-muted font-bold block">إجمالي المستحقات (راتب + عمولة):</span>
                    <span className="text-lg font-extrabold text-emerald-800 mt-1 block">{totalPayout.toFixed(2)} ريال</span>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">تنبيه النظام المالي:</span>
                    <span className="block mt-0.5 text-[10px] text-amber-800">
                      هذا النموذج حاسبة تقديرية تمثيلية. سيتم دمجها مع الحجوزات ونسب الحوافز التلقائية للفرع فور اكتمال مرحلة الربط المالي.
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-xs text-muted italic">الرجاء ملء حقول الاحتساب من القائمة الجانبية لعرض التقديرات المالية للعمولات.</div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
