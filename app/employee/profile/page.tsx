'use client';

import { useEffect, useState, useRef } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Building,
  Calendar,
  Droplet,
  CreditCard,
  Building2,
  FileText,
  Save,
  Plus,
  X,
  Trash2,
  Edit2,
  Users,
  GraduationCap,
  Briefcase,
  Camera,
  Shield,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchUserProfile,
  updateUserProfile,
  updateFamilyDetails,
  updateQualificationDetails,
  updateExperienceDetails,
  clearUserError,
  FamilyMember,
  Qualification,
  Experience,
  BankAccount,
} from '@/store/actions/userActions';
import { useAccess } from '@/lib/access';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const RELATIONS = [
  { label: 'Spouse',   value: 'SPOUSE' },
  { label: 'Father',   value: 'FATHER' },
  { label: 'Mother',   value: 'MOTHER' },
  { label: 'Son',      value: 'CHILD' },
  { label: 'Daughter', value: 'CHILD' },
  { label: 'Brother',  value: 'SIBLING' },
  { label: 'Sister',   value: 'SIBLING' },
  { label: 'Other',    value: 'OTHER' },
];

// Map display label → Prisma enum value
const toEnumRelation = (label: string): string => {
  const found = RELATIONS.find((r) => r.label === label);
  return found ? found.value : label.toUpperCase();
};

// Map Prisma enum value → display label
const toLabelRelation = (value: string): string => {
  const found = RELATIONS.find((r) => r.value === value);
  return found ? found.label : value;
};

const SECTION_ICONS: Record<string, React.ElementType> = {
  personal: User,
  family: Users,
  qualifications: GraduationCap,
  experience: Briefcase,
};

export default function EmployeeProfilePage() {
  const dispatch = useAppDispatch();
  const { profile, profileLoading, saving, error } = useAppSelector((s) => s.user);
  const [userId, setUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'personal' | 'family' | 'qualifications' | 'experience'>('personal');

  // Personal Info form
  const [personalForm, setPersonalForm] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    bloodGroup: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    pinCode: '',
    panNumber: '',
    aadhaarNumber: '',
    photoUrl: null as File | null,
    photoPreview: '',
  });

  // Family members
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const familyMembersRef = useRef<FamilyMember[]>([]);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [editingFamily, setEditingFamily] = useState<FamilyMember | null>(null);
  const [familyForm, setFamilyForm] = useState<FamilyMember>({
    relation: 'Spouse',
    name: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    occupation: '',
    isDependent: false,
  });

  // Qualifications
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const qualificationsRef = useRef<Qualification[]>([]);
  const [showQualModal, setShowQualModal] = useState(false);
  const [editingQual, setEditingQual] = useState<Qualification | null>(null);
  const [qualForm, setQualForm] = useState<Qualification>({
    degree: '',
    institution: '',
    fieldOfStudy: '',
    startYear: new Date().getFullYear(),
    endYear: new Date().getFullYear(),
    grade: '',
  });

  // Experience
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const experiencesRef = useRef<Experience[]>([]);
  const [showExpModal, setShowExpModal] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [expForm, setExpForm] = useState<Experience>({
    companyName: '',
    designation: '',
    jobTitle: '',
    startDate: '',
    endDate: '',
    isCurrent: false,
    responsibilities: '',
    description: '',
  });

  // Bank Accounts
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [showBankModal, setShowBankModal] = useState(false);
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null);
  const [bankForm, setBankForm] = useState<BankAccount>({
    bankName: '',
    accountNumber: '',
    ifsc: '',
    accountHolderName: '',
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserId(user.id);
      dispatch(fetchUserProfile(user.id));
    }
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setPersonalForm({
        name: profile.name || '',
        phone: profile.phone || '',
        dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : '',
        bloodGroup: profile.bloodGroup || '',
        addressLine1: profile.addressLine1 || '',
        addressLine2: profile.addressLine2 || '',
        city: profile.city || '',
        state: profile.state || '',
        country: profile.country || '',
        pinCode: profile.pinCode || '',
        panNumber: profile.panNumber || '',
        aadhaarNumber: profile.aadhaarNumber || '',
        photoUrl: null,
        photoPreview: profile.photoUrl || '',
      });
      // Convert enum relations to display labels when loading from API
      const fm = (profile.familyMembers || []).map((m) => ({ ...m, relation: toLabelRelation(m.relation) }));
      const qual = profile.qualifications || [];
      const exp = profile.experiences || [];
      setFamilyMembers(fm);
      familyMembersRef.current = fm;
      setQualifications(qual);
      qualificationsRef.current = qual;
      setExperiences(exp);
      experiencesRef.current = exp;
      // Parse bankDetails JSON string into bankAccounts array
      if (profile.bankDetails) {
        try {
          const parsed = JSON.parse(profile.bankDetails);
          setBankAccounts(Array.isArray(parsed) ? parsed : []);
        } catch {
          setBankAccounts([]);
        }
      } else {
        setBankAccounts([]);
      }
    }
  }, [profile]);

  // ── Personal Info ──────────────────────────────────────────────────────────

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setPersonalForm((prev) => ({ ...prev, photoUrl: file, photoPreview: preview }));
    }
  };

  const handlePersonalSave = async () => {
    if (!personalForm.name.trim()) { alert('Name is required'); return; }
    const bankDetailsJson = bankAccounts.length > 0 ? JSON.stringify(bankAccounts) : null;
    const result = await dispatch(updateUserProfile({
      name: personalForm.name,
      phone: personalForm.phone || null,
      dateOfBirth: personalForm.dateOfBirth || null,
      bloodGroup: personalForm.bloodGroup || null,
      addressLine1: personalForm.addressLine1 || null,
      addressLine2: personalForm.addressLine2 || null,
      city: personalForm.city || null,
      state: personalForm.state || null,
      country: personalForm.country || null,
      pinCode: personalForm.pinCode || null,
      panNumber: personalForm.panNumber || null,
      aadhaarNumber: personalForm.aadhaarNumber || null,
      bankDetails: bankDetailsJson,
      photoUrl: personalForm.photoUrl,
    }));
    if (updateUserProfile.fulfilled.match(result)) {
      alert('Profile updated successfully');
      if (userId) dispatch(fetchUserProfile(userId));
    }
  };

  // ── Family Members ─────────────────────────────────────────────────────────

  const openFamilyModal = (member?: FamilyMember) => {
    if (member) {
      setEditingFamily(member);
      setFamilyForm(member);
    } else {
      setEditingFamily(null);
      setFamilyForm({ relation: 'Spouse', name: '', dateOfBirth: '', phone: '', email: '', occupation: '', isDependent: false });
    }
    setShowFamilyModal(true);
  };

  const handleFamilySave = () => {
    if (!familyForm.name.trim()) { alert('Name is required'); return; }
    let updated: FamilyMember[];
    if (editingFamily) {
      updated = familyMembers.map((m) => (m === editingFamily ? familyForm : m));
    } else {
      updated = [...familyMembers, familyForm];
    }
    setFamilyMembers(updated);
    familyMembersRef.current = updated;
    setShowFamilyModal(false);
  };

  const handleFamilySubmit = async () => {
    // Convert display labels to Prisma enum values before sending
    const payload = familyMembersRef.current.map((m) => ({
      ...m,
      relation: toEnumRelation(m.relation),
    }));
    const result = await dispatch(updateFamilyDetails(payload));
    if (updateFamilyDetails.fulfilled.match(result)) {
      alert('Family details saved successfully');
    } else {
      alert((result.payload as string) || 'Failed to save family details');
    }
  };

  const handleDeleteFamily = (member: FamilyMember) => {
    if (!confirm('Remove this family member?')) return;
    const updated = familyMembers.filter((m) => m !== member);
    setFamilyMembers(updated);
    familyMembersRef.current = updated;
  };

  // ── Qualifications ────────────────────────────────────────────────────────

  const openQualModal = (qual?: Qualification) => {
    if (qual) {
      setEditingQual(qual);
      setQualForm(qual);
    } else {
      setEditingQual(null);
      setQualForm({ degree: '', institution: '', fieldOfStudy: '', startYear: new Date().getFullYear(), endYear: new Date().getFullYear(), grade: '' });
    }
    setShowQualModal(true);
  };

  const handleQualSave = () => {
    if (!qualForm.degree.trim() || !qualForm.institution.trim()) { alert('Degree and Institution are required'); return; }
    let updated: Qualification[];
    if (editingQual) {
      updated = qualifications.map((q) => (q === editingQual ? qualForm : q));
    } else {
      updated = [...qualifications, qualForm];
    }
    setQualifications(updated);
    qualificationsRef.current = updated;
    setShowQualModal(false);
  };

  const handleQualSubmit = async () => {
    const result = await dispatch(updateQualificationDetails(qualificationsRef.current));
    if (updateQualificationDetails.fulfilled.match(result)) {
      alert('Qualifications saved successfully');
    } else {
      alert((result.payload as string) || 'Failed to save qualifications');
    }
  };

  const handleDeleteQual = (qual: Qualification) => {
    if (!confirm('Remove this qualification?')) return;
    const updated = qualifications.filter((q) => q !== qual);
    setQualifications(updated);
    qualificationsRef.current = updated;
  };

  // ── Experience ─────────────────────────────────────────────────────────────

  const openExpModal = (exp?: Experience) => {
    if (exp) {
      setEditingExp(exp);
      setExpForm(exp);
    } else {
      setEditingExp(null);
      setExpForm({ companyName: '', designation: '', jobTitle: '', startDate: '', endDate: '', isCurrent: false, responsibilities: '', description: '' });
    }
    setShowExpModal(true);
  };

  const handleExpSave = () => {
    if (!expForm.companyName.trim() || !(expForm.designation?.trim() || expForm.jobTitle?.trim())) { alert('Company and Designation are required'); return; }
    let updated: Experience[];
    if (editingExp) {
      updated = experiences.map((e) => (e === editingExp ? expForm : e));
    } else {
      updated = [...experiences, expForm];
    }
    setExperiences(updated);
    experiencesRef.current = updated;
    setShowExpModal(false);
  };

  const handleExpSubmit = async () => {
    const payload = experiencesRef.current.map((e) => ({
      companyName: e.companyName,
      jobTitle: e.jobTitle ?? e.designation ?? null,
      startDate: e.startDate ?? null,
      endDate: e.endDate ?? null,
      isCurrent: e.isCurrent ?? false,
      description: e.description ?? e.responsibilities ?? null,
    }));
    const result = await dispatch(updateExperienceDetails(payload));
    if (updateExperienceDetails.fulfilled.match(result)) {
      alert('Experience saved successfully');
    } else {
      alert((result.payload as string) || 'Failed to save experience');
    }
  };

  const handleDeleteExp = (exp: Experience) => {
    if (!confirm('Remove this experience?')) return;
    const updated = experiences.filter((e) => e !== exp);
    setExperiences(updated);
    experiencesRef.current = updated;
  };

  // ── Bank Accounts ──────────────────────────────────────────────────────────

  const openBankModal = (bank?: BankAccount) => {
    if (bank) {
      setEditingBank(bank);
      setBankForm(bank);
    } else {
      setEditingBank(null);
      setBankForm({ bankName: '', accountNumber: '', ifsc: '', accountHolderName: '' });
    }
    setShowBankModal(true);
  };

  const handleBankSave = () => {
    if (!bankForm.bankName.trim()) { alert('Bank name is required'); return; }
    if (!bankForm.accountNumber.trim()) { alert('Account number is required'); return; }
    if (!bankForm.ifsc.trim()) { alert('IFSC code is required'); return; }
    if (!bankForm.accountHolderName.trim()) { alert('Account holder name is required'); return; }
    let updated: BankAccount[];
    if (editingBank) {
      updated = bankAccounts.map((b) => (b === editingBank ? bankForm : b));
    } else {
      updated = [...bankAccounts, bankForm];
    }
    setBankAccounts(updated);
    setShowBankModal(false);
  };

  const handleDeleteBank = (bank: BankAccount) => {
    if (!confirm('Remove this bank account?')) return;
    setBankAccounts((prev) => prev.filter((b) => b !== bank));
  };

  const TABS = [
    { key: 'personal', label: 'Personal Info', icon: User },
    { key: 'family', label: 'Family Details', icon: Users },
    { key: 'qualifications', label: 'Qualifications', icon: GraduationCap },
    { key: 'experience', label: 'Experience', icon: Briefcase },
  ] as const;

  const SectionIcon = SECTION_ICONS[activeTab];

  return (
    <div className="w-full p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-gray-600 mt-1">View and manage your personal information</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => dispatch(clearUserError())}><X className="w-4 h-4" /></button>
        </div>
      )}

      {profileLoading ? (
        <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0445AD]" /></div>
      ) : profile ? (
        <>
          {/* Profile Card Header */}
          <div className="bg-white rounded-2xl border-2 border-gray-100 p-6 mb-6">
            <div className="flex items-center gap-6">
              {/* Avatar / Photo */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-full bg-[#0445AD] flex items-center justify-center text-white text-3xl font-bold overflow-hidden border-4 border-gray-100">
                  {personalForm.photoPreview ? (
                    <img src={personalForm.photoPreview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    (profile.name || 'U').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-[#0445AD] text-white rounded-full flex items-center justify-center hover:bg-[#033591] transition shadow"
                  title="Change Photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                <p className="text-gray-500 flex items-center gap-1 mt-1"><Mail className="w-4 h-4" /> {profile.email}</p>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                  {profile.department && (
                    <span className="flex items-center gap-1"><Building className="w-4 h-4 text-gray-400" /> {profile.department.name}</span>
                  )}
                  {profile.designation && (
                    <span className="flex items-center gap-1"><FileText className="w-4 h-4 text-gray-400" /> {profile.designation.name}</span>
                  )}
                  {profile.manager && (
                    <span className="flex items-center gap-1"><Shield className="w-4 h-4 text-gray-400" /> Reports to: {profile.manager.name}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex gap-4 border-b-2 border-gray-200 overflow-x-auto">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`px-6 py-3 font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                    activeTab === key ? 'text-[#0445AD] border-b-2 border-[#0445AD]' : 'text-gray-500 hover:text-[#0445AD]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Personal Info Tab ── */}
          {activeTab === 'personal' && (
            <div className="bg-white rounded-2xl border-2 border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2"><User className="w-5 h-5 text-[#0445AD]" /> Personal Information</h3>
                <button
                  onClick={handlePersonalSave}
                  disabled={saving}
                  className="px-5 py-2.5 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-[#033591] transition flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <FormField label="Full Name *" icon={User}>
                    <input value={personalForm.name} onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })} className="field-input" />
                  </FormField>
                  <FormField label="Phone" icon={Phone}>
                    <input value={personalForm.phone} onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })} className="field-input" />
                  </FormField>
                  <FormField label="Date of Birth" icon={Calendar}>
                    <input type="date" value={personalForm.dateOfBirth} onChange={(e) => setPersonalForm({ ...personalForm, dateOfBirth: e.target.value })} className="field-input" />
                  </FormField>
                  <FormField label="Blood Group" icon={Droplet}>
                    <select value={personalForm.bloodGroup} onChange={(e) => setPersonalForm({ ...personalForm, bloodGroup: e.target.value })} className="field-input">
                      <option value="">Select</option>
                      {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </FormField>
                  <FormField label="PAN Number" icon={FileText}>
                    <input value={personalForm.panNumber} onChange={(e) => setPersonalForm({ ...personalForm, panNumber: e.target.value })} className="field-input uppercase" placeholder="ABCDE1234F" />
                  </FormField>
                  <FormField label="Aadhaar Number" icon={FileText}>
                    <input value={personalForm.aadhaarNumber} onChange={(e) => setPersonalForm({ ...personalForm, aadhaarNumber: e.target.value })} className="field-input" placeholder="1234 5678 9012" maxLength={14} />
                  </FormField>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><MapPin className="w-4 h-4" /> Address</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField label="Address Line 1">
                      <input value={personalForm.addressLine1} onChange={(e) => setPersonalForm({ ...personalForm, addressLine1: e.target.value })} className="field-input" />
                    </FormField>
                    <FormField label="Address Line 2">
                      <input value={personalForm.addressLine2} onChange={(e) => setPersonalForm({ ...personalForm, addressLine2: e.target.value })} className="field-input" />
                    </FormField>
                    <FormField label="City">
                      <input value={personalForm.city} onChange={(e) => setPersonalForm({ ...personalForm, city: e.target.value })} className="field-input" />
                    </FormField>
                    <FormField label="State">
                      <input value={personalForm.state} onChange={(e) => setPersonalForm({ ...personalForm, state: e.target.value })} className="field-input" />
                    </FormField>
                    <FormField label="Country">
                      <input value={personalForm.country} onChange={(e) => setPersonalForm({ ...personalForm, country: e.target.value })} className="field-input" />
                    </FormField>
                    <FormField label="Pin Code">
                      <input value={personalForm.pinCode} onChange={(e) => setPersonalForm({ ...personalForm, pinCode: e.target.value })} className="field-input" />
                    </FormField>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-gray-700 flex items-center gap-2"><CreditCard className="w-4 h-4" /> Bank Accounts</p>
                    <button
                      onClick={() => openBankModal()}
                      className="px-3 py-1.5 bg-[#0445AD] text-white text-xs rounded-lg font-semibold hover:bg-[#033591] transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Account
                    </button>
                  </div>
                  {bankAccounts.length === 0 ? (
                    <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl text-center">
                      <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No bank accounts added</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bankAccounts.map((b, i) => (
                        <div key={i} className="flex items-start justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Building2 className="w-4 h-4 text-gray-400" />
                              <span className="font-semibold text-sm">{b.bankName}</span>
                              <span className="text-gray-300">·</span>
                              <span className="text-sm text-gray-600">{b.accountHolderName}</span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                              <span>Acc: {b.accountNumber}</span>
                              <span>IFSC: {b.ifsc}</span>
                            </div>
                          </div>
                          <div className="flex gap-1 ml-4">
                            <button onClick={() => openBankModal(b)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDeleteBank(b)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Family Details Tab ── */}
          {activeTab === 'family' && (
            <div className="bg-white rounded-2xl border-2 border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2"><Users className="w-5 h-5 text-[#0445AD]" /> Family Members</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => openFamilyModal()}
                    className="px-4 py-2 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-[#033591] transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                  <button
                    onClick={handleFamilySubmit}
                    disabled={saving || familyMembers.length === 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save All'}
                  </button>
                </div>
              </div>
              <div className="p-6">
                {familyMembers.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No family members added yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {familyMembers.map((m, i) => (
                      <div key={i} className="flex items-start justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">{m.relation}</span>
                            <span className="font-semibold">{m.name}</span>
                            {m.isDependent && <span className="px-2 py-0.5 bg-red-50 text-red-500 text-xs rounded-full">Dependent</span>}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            {m.dateOfBirth && <span>DOB: {new Date(m.dateOfBirth).toLocaleDateString()}</span>}
                            {m.phone && <span>Ph: {m.phone}</span>}
                            {m.email && <span>Email: {m.email}</span>}
                            {m.occupation && <span>Occupation: {m.occupation}</span>}
                          </div>
                        </div>
                        <div className="flex gap-1 ml-4">
                          <button onClick={() => openFamilyModal(m)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteFamily(m)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Qualifications Tab ── */}
          {activeTab === 'qualifications' && (
            <div className="bg-white rounded-2xl border-2 border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2"><GraduationCap className="w-5 h-5 text-[#0445AD]" /> Educational Qualifications</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => openQualModal()}
                    className="px-4 py-2 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-[#033591] transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                  <button
                    onClick={handleQualSubmit}
                    disabled={saving || qualifications.length === 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save All'}
                  </button>
                </div>
              </div>
              <div className="p-6">
                {qualifications.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No qualifications added yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {qualifications.map((q, i) => (
                      <div key={i} className="flex items-start justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{q.degree}</span>
                            <span className="text-gray-400">—</span>
                            <span className="text-gray-600">{q.institution}</span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span>Field: {q.fieldOfStudy}</span>
                            <span>{q.startYear} – {q.endYear}</span>
                            {q.grade && <span>Grade: {q.grade}</span>}
                          </div>
                        </div>
                        <div className="flex gap-1 ml-4">
                          <button onClick={() => openQualModal(q)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteQual(q)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Experience Tab ── */}
          {activeTab === 'experience' && (
            <div className="bg-white rounded-2xl border-2 border-gray-100">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-lg flex items-center gap-2"><Briefcase className="w-5 h-5 text-[#0445AD]" /> Work Experience</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => openExpModal()}
                    className="px-4 py-2 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-[#033591] transition flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Add
                  </button>
                  <button
                    onClick={handleExpSubmit}
                    disabled={saving || experiences.length === 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save All'}
                  </button>
                </div>
              </div>
              <div className="p-6">
                {experiences.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No work experience added yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {experiences.map((e, i) => (
                      <div key={i} className="flex items-start justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">{e.designation}</span>
                            <span className="text-gray-400">at</span>
                            <span className="text-gray-700">{e.companyName}</span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                            <span>{e.startDate ? new Date(e.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '-'} – {e.endDate ? new Date(e.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present'}</span>
                          </div>
                          {e.responsibilities && (
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{e.responsibilities}</p>
                          )}
                        </div>
                        <div className="flex gap-1 ml-4">
                          <button onClick={() => openExpModal(e)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteExp(e)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-8 bg-white rounded-xl border-2 border-gray-100 text-center">
          <User className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Profile not found</p>
        </div>
      )}

      {/* ── Family Modal ── */}
      {showFamilyModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-lg">{editingFamily ? 'Edit Family Member' : 'Add Family Member'}</h2>
              <button onClick={() => setShowFamilyModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Relation *</label>
                <select value={familyForm.relation} onChange={(e) => setFamilyForm({ ...familyForm, relation: e.target.value })} className="field-input">
                  {RELATIONS.map((r) => <option key={r.value} value={r.label}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Name *</label>
                <input value={familyForm.name} onChange={(e) => setFamilyForm({ ...familyForm, name: e.target.value })} className="field-input" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Date of Birth</label>
                <input type="date" value={familyForm.dateOfBirth ?? ""} onChange={(e) => setFamilyForm({ ...familyForm, dateOfBirth: e.target.value })} className="field-input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Phone</label>
                  <input value={familyForm.phone ?? ""} onChange={(e) => setFamilyForm({ ...familyForm, phone: e.target.value })} className="field-input" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Email</label>
                  <input type="email" value={familyForm.email ?? ""} onChange={(e) => setFamilyForm({ ...familyForm, email: e.target.value })} className="field-input" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Occupation</label>
                <input value={familyForm.occupation ?? ""} onChange={(e) => setFamilyForm({ ...familyForm, occupation: e.target.value })} className="field-input" />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setFamilyForm({ ...familyForm, isDependent: !familyForm.isDependent })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${familyForm.isDependent ? 'bg-green-500' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${familyForm.isDependent ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm font-medium">Is Dependent</span>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowFamilyModal(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition">Cancel</button>
              <button onClick={handleFamilySave} className="px-5 py-2.5 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-[#033591] transition">{editingFamily ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Qualification Modal ── */}
      {showQualModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-lg">{editingQual ? 'Edit Qualification' : 'Add Qualification'}</h2>
              <button onClick={() => setShowQualModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Degree *</label>
                <input value={qualForm.degree} onChange={(e) => setQualForm({ ...qualForm, degree: e.target.value })} className="field-input" placeholder="B.Tech, MBA, etc." />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Institution *</label>
                <input value={qualForm.institution} onChange={(e) => setQualForm({ ...qualForm, institution: e.target.value })} className="field-input" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Field of Study</label>
                <input value={qualForm.fieldOfStudy} onChange={(e) => setQualForm({ ...qualForm, fieldOfStudy: e.target.value })} className="field-input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Start Year *</label>
                  <input type="number" value={qualForm.startYear} onChange={(e) => setQualForm({ ...qualForm, startYear: parseInt(e.target.value) })} className="field-input" min={1950} max={2100} />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">End Year *</label>
                  <input type="number" value={qualForm.endYear} onChange={(e) => setQualForm({ ...qualForm, endYear: parseInt(e.target.value) })} className="field-input" min={1950} max={2100} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Grade / CGPA</label>
                <input value={qualForm.grade} onChange={(e) => setQualForm({ ...qualForm, grade: e.target.value })} className="field-input" placeholder="8.5 CGPA, First Class, etc." />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowQualModal(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition">Cancel</button>
              <button onClick={handleQualSave} className="px-5 py-2.5 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-[#033591] transition">{editingQual ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bank Account Modal ── */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-lg">{editingBank ? 'Edit Bank Account' : 'Add Bank Account'}</h2>
              <button onClick={() => setShowBankModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Bank Name *</label>
                <input
                  value={bankForm.bankName}
                  onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                  className="field-input"
                  placeholder="e.g., HDFC Bank"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Account Holder Name *</label>
                <input
                  value={bankForm.accountHolderName}
                  onChange={(e) => setBankForm({ ...bankForm, accountHolderName: e.target.value })}
                  className="field-input"
                  placeholder="Full name as per bank records"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Account Number *</label>
                <input
                  value={bankForm.accountNumber}
                  onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  className="field-input"
                  placeholder="Enter account number"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">IFSC Code *</label>
                <input
                  value={bankForm.ifsc}
                  onChange={(e) => setBankForm({ ...bankForm, ifsc: e.target.value.toUpperCase() })}
                  className="field-input uppercase"
                  placeholder="e.g., HDFC0001234"
                  maxLength={11}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowBankModal(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition">Cancel</button>
              <button onClick={handleBankSave} className="px-5 py-2.5 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-[#033591] transition">{editingBank ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Experience Modal ── */}
      {showExpModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-lg">{editingExp ? 'Edit Experience' : 'Add Experience'}</h2>
              <button onClick={() => setShowExpModal(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Company Name *</label>
                <input value={expForm.companyName} onChange={(e) => setExpForm({ ...expForm, companyName: e.target.value })} className="field-input" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Designation *</label>
                <input value={expForm.designation ?? ''} onChange={(e) => setExpForm({ ...expForm, designation: e.target.value })} className="field-input" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Start Date *</label>
                  <input type="date" value={expForm.startDate ?? ''} onChange={(e) => setExpForm({ ...expForm, startDate: e.target.value })} className="field-input" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">End Date</label>
                  <input type="date" value={expForm.endDate ?? ''} onChange={(e) => setExpForm({ ...expForm, endDate: e.target.value })} className="field-input" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Responsibilities / Description</label>
                <textarea value={expForm.responsibilities ?? ''} onChange={(e) => setExpForm({ ...expForm, responsibilities: e.target.value })} rows={3} className="field-input resize-none" placeholder="Key responsibilities and achievements..." />
              </div>
                          </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={() => setShowExpModal(false)} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition">Cancel</button>
              <button onClick={handleExpSave} className="px-5 py-2.5 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-[#033591] transition">{editingExp ? 'Update' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .field-input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          transition: border-color 0.15s;
          outline: none;
        }
        .field-input:focus {
          border-color: #0445AD;
          background: #fff;
        }
      `}</style>
    </div>
  );
}

// ── Helper Component ─────────────────────────────────────────────────────────

function FormField({ label, icon: Icon, children }: { label: string; icon?: React.ElementType; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        {label}
      </label>
      {children}
    </div>
  );
}
