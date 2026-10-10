'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api, User, Branch } from '../../../utils/api';
import { useRole } from '../../../components/RoleContext';
import { Role } from '../../../types_local';
import { 
  ArrowRight, User as UserIcon, Building2, Phone, Mail, 
  ToggleLeft, ToggleRight, FileText, Landmark, Clock, Plus, Trash2, Calendar
} from 'lucide-react';

export default function EmployeeDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { role: currentRole } = useRole();

  const [user, setUser] = useState<User | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [transfers, setTransfers] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loans, setLoans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'transfers' | 'documents' | 'loans'>('details');

  // Basic Details Edit State
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [isUpdatingDetails, setIsUpdatingDetails] = useState(false);

  // Transfer Modal State
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [targetBranchId, setTargetBranchId] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  // Document Upload State
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('ID_CARD');
  const [docIssuer, setDocIssuer] = useState('');
  const [docExpiryDate, setDocExpiryDate] = useState('');
  const [docIssueDate, setDocIssueDate] = useState('');
  const [docNotes, setDocNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const canManage = currentRole === Role.Admin || currentRole === Role.CEO;
  const canTransfer = currentRole === Role.Admin || currentRole === Role.CEO || currentRole === Role.BranchManager;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const [userData, branchesData] = await Promise.all([
        api.getUser(id),
        api.getBranches()
      ]);
      setUser(userData);
      setBranches(branchesData);
      setEditEmail(userData.email || '');
      setEditPhone(userData.phoneNumber || '');

      // Load related data in parallel
      const [transfersData, docsData, loansData] = await Promise.all([
        api.getTransferHistory(id),
        api.getDocuments({ employeeId: id }),
        api.getLoanRequests({ userId: id })
      ]);
      setTransfers(transfersData);
      setDocuments(docsData);
      setLoans(loansData);
    } catch (error) {
      console.error('Failed to load profile data:', error);
      showToast('خطأ أثناء تحميل بيانات الملف الشخصي للموظف', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const handleToggleBot = async () => {
    if (!user) return;
    try {
      const newStatus = !user.botEnabled;
      const updated = await api.updateUser(user.id, { botEnabled: newStatus });
      setUser({ ...user, botEnabled: updated.botEnabled });
      showToast(newStatus ? 'تم تفعيل ربط الواتساب للموظف' : 'تم إيقاف ربط الواتساب للموظف');
    } catch (error) {
      showToast('فشل تعديل حالة البوت للواتساب', 'error');
    }
  };

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsUpdatingDetails(true);
    try {
      const updated = await api.updateUser(user.id, {
        email: editEmail || null,
        phoneNumber: editPhone
      });
      setUser({ ...user, email: updated.email, phoneNumber: updated.phoneNumber });
      showToast('تم تحديث بيانات الاتصال بنجاح');
    } catch (error: any) {
      showToast(error?.message || 'فشل تحديث البيانات الأساسية', 'error');
    } finally {
      setIsUpdatingDetails(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !targetBranchId) return;
    setIsTransferring(true);
    try {
      const updated = await api.transferBranch(user.id, targetBranchId, transferReason);
      const matchedBranch = branches.find(b => b.id === targetBranchId);
      setUser({ ...user, branchId: targetBranchId, branch: matchedBranch });
      
      // Reload transfers list
      const transfersData = await api.getTransferHistory(user.id);
      setTransfers(transfersData);
      
      setIsTransferModalOpen(false);
      setTransferReason('');
      showToast(`تم نقل الموظف بنجاح إلى فرع ${matchedBranch?.name || ''}`);
    } catch (error: any) {
      showToast(error?.message || 'فشل عملية نقل الموظف', 'error');
    } finally {
      setIsTransferring(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !user) {
      showToast('الرجاء اختيار ملف الوثيقة لرفعها', 'error');
      return;
    }
    setIsUploadingDoc(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', docTitle || selectedFile.name);
      formData.append('type', docType);
      formData.append('department', 'HR');
      formData.append('branchId', user.branchId);
      formData.append('employeeId', user.id);
      formData.append('issuer', docIssuer);
      formData.append('expiryDate', docExpiryDate);
      formData.append('issueDate', docIssueDate);
      formData.append('notes', docNotes);

      await api.uploadDocument(formData);
      showToast('تم رفع الوثيقة بنجاح وجاري استخراج البيانات بالذكاء الاصطناعي');
      
      // Reload documents tab
      const docsData = await api.getDocuments({ employeeId: user.id });
      setDocuments(docsData);

      // Reset Form
      setDocTitle('');
      setDocIssuer('');
      setDocExpiryDate('');
      setDocIssueDate('');
      setDocNotes('');
      setSelectedFile(null);
      setIsDocModalOpen(false);
    } catch (error: any) {
      showToast(error?.message || 'فشل رفع الوثيقة', 'error');
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذه الوثيقة؟')) return;
    try {
      await api.deleteDocument(docId);
      setDocuments(documents.filter(d => d.id !== docId));
      showToast('تم حذف الوثيقة بنجاح');
    } catch (error: any) {
      showToast(error?.message || 'فشل حذف الوثيقة', 'error');
    }
  };

  const translateRole = (roleStr: string) => {
    switch (roleStr) {
      case 'Admin': return 'مدير النظام';
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

  const translateDocType = (typeStr: string) => {
    switch (typeStr) {
      case 'LICENSE': return 'رخصة تشغيل';
      case 'CONTRACT': return 'عقد عمل';
      case 'ID_CARD': return 'بطاقة هوية / إقامة';
      case 'CERTIFICATE': return 'شهادة صحية / مهنية';
      case 'INSURANCE': return 'تأمين طبي';
      case 'HEALTH_PERMIT': return 'تصريح بلدي صحي';
      case 'FIRE_PERMIT': return 'تصريح الدفاع المدني';
      default: return 'مستند آخر';
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case 'Pending': return 'قيد المراجعة';
      case 'Approved': return 'تمت الموافقة';
      case 'Rejected': return 'مرفوض';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xs text-muted italic">جاري تحميل بيانات الملف الشخصي للموظف...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-sm font-bold text-rose-800">⚠️ خطأ: لم يتم العثور على الموظف.</h2>
        <Link href="/employees" className="text-xs text-brand-primary hover:underline mt-4 inline-block">
          العودة لقائمة الموظفين
        </Link>
      </div>
    );
  }

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

      {/* Navigation Header */}
      <div className="flex items-center gap-2 text-xs text-muted">
        <Link href="/employees" className="hover:text-brand-teal-dark">إدارة الموظفين</Link>
        <ArrowRight className="w-3 h-3 rotate-180" />
        <span className="text-brand-teal-dark font-semibold">{user.name}</span>
      </div>

      {/* Main Profile Header Banner */}
      <div className="bg-brand-teal-dark text-white p-6 rounded-xl border border-brand-secondary/35 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-brand-secondary/10 blur-2xl"></div>
        
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand-secondary/20 flex items-center justify-center text-brand-secondary text-2xl font-extrabold shrink-0 border-2 border-brand-secondary/30">
            {user.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className="text-lg font-bold">{user.name}</h1>
            <p className="text-xs text-brand-secondary font-medium mt-1">
              {translateRole(user.role)} • {user.employeeType === 'Mobile' ? 'طاقم متنقل' : 'ثابت بالفرع'}
            </p>
          </div>
        </div>

        {canTransfer && (
          <button
            onClick={() => {
              setTargetBranchId(user.branchId || '');
              setIsTransferModalOpen(true);
            }}
            className="text-xs font-bold bg-brand-secondary hover:bg-brand-secondary-hover text-brand-teal-dark px-4 py-2.5 rounded border border-brand-secondary transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            <Building2 className="w-4 h-4" />
            نقل الموظف لفرع آخر
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-brand-secondary/20">
        <button
          onClick={() => setActiveTab('details')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'details' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-muted hover:text-brand-teal-dark'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          البيانات الأساسية للبوت
        </button>

        <button
          onClick={() => setActiveTab('transfers')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'transfers' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-muted hover:text-brand-teal-dark'
          }`}
        >
          <Building2 className="w-4 h-4" />
          سجل النقل بين الفروع
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'documents' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-muted hover:text-brand-teal-dark'
          }`}
        >
          <FileText className="w-4 h-4" />
          وثائق ومستندات الموظف
        </button>

        <button
          onClick={() => setActiveTab('loans')}
          className={`px-5 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'loans' 
              ? 'border-brand-primary text-brand-primary' 
              : 'border-transparent text-muted hover:text-brand-teal-dark'
          }`}
        >
          <Landmark className="w-4 h-4" />
          السلف والقروض المعلقة
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-brand-secondary/20 p-6 shadow-sm min-h-[300px]">
        
        {/* Tab 1: Details */}
        {activeTab === 'details' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Col: Contact Info Update */}
            <form onSubmit={handleUpdateDetails} className="space-y-4">
              <h3 className="text-xs font-bold text-brand-teal-dark border-b pb-2 mb-4">تعديل معلومات الموظف</h3>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-teal-dark">البريد الإلكتروني:</label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 w-4 h-4 text-muted" />
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    placeholder="example@rahtihotels.com"
                    className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg pr-9 p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-brand-teal-dark">رقم الهاتف للواتساب:</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    required
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="+966500000000"
                    dir="ltr"
                    className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg pr-9 p-2.5 text-brand-teal-dark text-left font-mono focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isUpdatingDetails}
                  className="text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white px-5 py-2.5 rounded transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUpdatingDetails ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>

            {/* Right Col: Bot Status Toggle */}
            <div className="bg-brand-cream/20 p-5 rounded-xl border border-brand-secondary/20 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-bold text-brand-teal-dark border-b pb-2 mb-4">بوابة الواتساب والذكاء الاصطناعي</h3>
                <p className="text-xs text-muted leading-relaxed">
                  يسمح هذا الخيار للموظف بالتواصل مع النظام الذكي وإرسال كشوف الحضور والانصراف، ورفع البلاغات من خلال الواتساب مباشرة.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-brand-secondary/25 pt-4 mt-6">
                <div>
                  <span className="text-xs font-bold text-brand-teal-dark block">ربط بوت الواتساب للموظف</span>
                  <span className="text-[10px] text-muted block mt-0.5">الحالة الحالية: {user.botEnabled ? 'متصل ونشط' : 'معطل ومغلق'}</span>
                </div>
                <button
                  onClick={handleToggleBot}
                  className="text-brand-primary hover:scale-105 transition-transform cursor-pointer"
                >
                  {user.botEnabled ? (
                    <ToggleRight className="w-12 h-12" />
                  ) : (
                    <ToggleLeft className="w-12 h-12 text-muted" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Transfers */}
        {activeTab === 'transfers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-xs font-bold text-brand-teal-dark">الفرع الحالي: {user.branch?.name === 'Sail Road Branch' ? 'فرع طريق السيل' : user.branch?.name || 'غير محدد'}</h3>
                <p className="text-[10px] text-muted mt-1">تتبع كافة تحركات ونقل الموظف بين فروع منشأة فنادق راحتي.</p>
              </div>
            </div>

            {transfers.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted italic">لا يوجد سجل نقل مسجل لهذا الموظف سابقاً.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-brand-cream-dark border-b border-brand-secondary/20 text-brand-teal-dark text-xs font-bold">
                      <th className="px-4 py-3">من فرع</th>
                      <th className="px-4 py-3">إلى فرع</th>
                      <th className="px-4 py-3">تاريخ النقل</th>
                      <th className="px-4 py-3">سبب النقل</th>
                      <th className="px-4 py-3">بواسطة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-cream-dark text-xs text-brand-teal-dark/90">
                    {transfers.map((t) => (
                      <tr key={t.id} className="hover:bg-brand-cream/10 transition-colors">
                        <td className="px-4 py-3 font-semibold">{t.fromBranch?.name || 'غير محدد'}</td>
                        <td className="px-4 py-3 font-semibold text-brand-primary">{t.toBranch?.name}</td>
                        <td className="px-4 py-3 text-muted">{new Date(t.transferDate).toLocaleDateString('ar-SA')}</td>
                        <td className="px-4 py-3">{t.reason}</td>
                        <td className="px-4 py-3 text-muted">{t.createdBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Documents */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-xs font-bold text-brand-teal-dark">وثائق الهوية وعقود العمل</h3>
                <p className="text-[10px] text-muted mt-1">تخزين ومراجعة رخص الموظفين وعقودهم التي يتم مراجعتها وتدقيقها بالذكاء الاصطناعي.</p>
              </div>
              <button
                onClick={() => setIsDocModalOpen(true)}
                className="text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white px-3 py-2 rounded transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                رفع وثيقة جديدة
              </button>
            </div>

            {documents.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted italic">لا توجد وثائق مسجلة باسم هذا الموظف.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="border border-brand-secondary/25 p-4 rounded-lg bg-brand-cream/5 flex flex-col justify-between hover:border-brand-primary/45 transition-colors">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="bg-brand-primary/10 text-brand-primary text-[10px] font-extrabold px-2 py-0.5 rounded">
                          {translateDocType(doc.type)}
                        </span>
                        {canManage && (
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-rose-500 hover:text-rose-700 transition-colors p-1"
                            title="حذف المستند"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-brand-teal-dark mt-2.5">{doc.title}</h4>
                      <p className="text-[10px] text-muted mt-1">مصدر الوثيقة: {doc.issuer || 'غير محدد'}</p>
                      
                      {doc.expiryDate && (
                        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-brand-primary" />
                          <span>انتهاء: {new Date(doc.expiryDate).toLocaleDateString('ar-SA')}</span>
                          {doc.isExpired ? (
                            <span className="bg-rose-100 text-rose-800 text-[8px] font-bold px-1.5 rounded mr-1">منتهية</span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-800 text-[8px] font-bold px-1.5 rounded mr-1">صالحة</span>
                          )}
                        </div>
                      )}
                      {doc.notes && <p className="text-[10px] text-muted mt-2 bg-brand-cream/20 p-2 rounded border border-brand-secondary/15">{doc.notes}</p>}
                    </div>

                    <div className="border-t border-brand-secondary/20 pt-3 mt-4 flex justify-between items-center text-[10px]">
                      <span className="text-muted">الحجم: {(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                      <a
                        href={doc.fileUrl.startsWith('http') ? doc.fileUrl : `http://localhost:3000${doc.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-primary hover:underline font-bold"
                      >
                        معاينة الملف
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Loans */}
        {activeTab === 'loans' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="text-xs font-bold text-brand-teal-dark">كشف السلف والذمم المالية للموظف</h3>
                <p className="text-[10px] text-muted mt-1">تتبع كافة السلف المالية والقروض المقدمة من الموظف للفرع.</p>
              </div>
            </div>

            {loans.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted italic">لا توجد طلبات سلف مالية مسجلة باسم هذا الموظف.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="bg-brand-cream-dark border-b border-brand-secondary/20 text-brand-teal-dark text-xs font-bold">
                      <th className="px-4 py-3">المبلغ المطلوب</th>
                      <th className="px-4 py-3">السبب</th>
                      <th className="px-4 py-3">فترة السداد</th>
                      <th className="px-4 py-3">تاريخ التقديم</th>
                      <th className="px-4 py-3 text-center">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-cream-dark text-xs text-brand-teal-dark/90">
                    {loans.map((loan) => (
                      <tr key={loan.id} className="hover:bg-brand-cream/10 transition-colors">
                        <td className="px-4 py-3 font-extrabold text-brand-primary">{loan.amount} ريال</td>
                        <td className="px-4 py-3">{loan.reason}</td>
                        <td className="px-4 py-3 text-muted">{loan.repaymentMonths || 1} أشهر</td>
                        <td className="px-4 py-3 text-muted">{new Date(loan.createdAt).toLocaleDateString('ar-SA')}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${
                            loan.status === 'Approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
                            loan.status === 'Rejected' ? 'bg-rose-50 border-rose-200 text-rose-800' :
                            'bg-amber-50 border-amber-200 text-amber-800'
                          }`}>
                            {translateStatus(loan.status)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Modal 1: Transfer Branch Modal */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-teal-dark/60 backdrop-blur-sm animate-in fade-in duration-200 text-right" dir="rtl">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-brand-secondary/30 overflow-hidden flex flex-col">
            
            <div className="bg-brand-teal-dark text-white p-5 border-b border-brand-secondary/20 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-secondary">نقل الموظف لفرع آخر</h3>
                <p className="text-[10px] text-white/60 mt-1">تحديد الفرع الجديد وتوثيق مبررات النقل الإداري.</p>
              </div>
            </div>

            <form onSubmit={handleTransfer} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-teal-dark block">الفرع المستهدف:</label>
                <select
                  required
                  value={targetBranchId}
                  onChange={(e) => setTargetBranchId(e.target.value)}
                  className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
                >
                  <option value="" disabled>اختر الفرع...</option>
                  {branches.filter(b => b.id !== user.branchId).map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-teal-dark block">سبب النقل والمبررات:</label>
                <textarea
                  required
                  rows={3}
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="اكتب سبب النقل، مثلاً: نقل كفاءة لتغطية النقص..."
                  className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="text-xs font-bold border border-brand-secondary/40 text-brand-teal-dark px-4 py-2 rounded hover:bg-brand-cream transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isTransferring}
                  className="text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded transition-all cursor-pointer disabled:opacity-50"
                >
                  {isTransferring ? 'جاري الإجراء...' : 'نقل الآن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Upload Document Modal */}
      {isDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-teal-dark/60 backdrop-blur-sm animate-in fade-in duration-200 text-right" dir="rtl">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-brand-secondary/30 overflow-hidden flex flex-col">
            
            <div className="bg-brand-teal-dark text-white p-5 border-b border-brand-secondary/20 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-brand-secondary">رفع مستند جديد للموظف</h3>
                <p className="text-[10px] text-white/60 mt-1">إرفاق المستند وتفاصيله، سيقوم الذكاء الاصطناعي بمراجعته وتدقيق البيانات تلقائياً.</p>
              </div>
            </div>

            <form onSubmit={handleUploadDocument} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-teal-dark block">عنوان الوثيقة:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: عقد عمل مراد - 2026"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-teal-dark block">نوع الوثيقة:</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none"
                  >
                    <option value="ID_CARD">بطاقة هوية / إقامة (ID_CARD)</option>
                    <option value="CONTRACT">عقد عمل (CONTRACT)</option>
                    <option value="INSURANCE">تأمين طبي (INSURANCE)</option>
                    <option value="CERTIFICATE">شهادة صحية (CERTIFICATE)</option>
                    <option value="LICENSE">رخصة تشغيل (LICENSE)</option>
                    <option value="OTHER">أخرى (OTHER)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-teal-dark block">الجهة المصدرة للوثيقة:</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: وزارة الموارد البشرية"
                    value={docIssuer}
                    onChange={(e) => setDocIssuer(e.target.value)}
                    className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-teal-dark block">تاريخ الإصدار:</label>
                  <input
                    type="date"
                    required
                    value={docIssueDate}
                    onChange={(e) => setDocIssueDate(e.target.value)}
                    className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-brand-teal-dark block">تاريخ الانتهاء:</label>
                  <input
                    type="date"
                    required
                    value={docExpiryDate}
                    onChange={(e) => setDocExpiryDate(e.target.value)}
                    className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-teal-dark block">ملاحظات إضافية:</label>
                <textarea
                  rows={2}
                  value={docNotes}
                  onChange={(e) => setDocNotes(e.target.value)}
                  placeholder="ملاحظات حول الوثيقة..."
                  className="w-full text-xs bg-brand-cream border border-brand-secondary/35 rounded-lg p-2.5 text-brand-teal-dark focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-brand-teal-dark block">ملف الوثيقة (PDF أو صورة):</label>
                <input
                  type="file"
                  required
                  accept=".pdf, image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setSelectedFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-xs text-brand-teal-dark focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(false)}
                  className="text-xs font-bold border border-brand-secondary/40 text-brand-teal-dark px-4 py-2 rounded hover:bg-brand-cream transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isUploadingDoc}
                  className="text-xs font-bold bg-brand-primary hover:bg-brand-primary-hover text-white px-4 py-2 rounded transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUploadingDoc ? 'جاري الرفع...' : 'رفع المستند'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
