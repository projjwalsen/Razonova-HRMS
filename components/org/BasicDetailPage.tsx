"use client";

import { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchIndustries,
  fetchCountries,
  fetchStates,
} from "@/store/actions/metaActions";
import {
  createOrganization,
  fetchOrganizationByTenant,
  updateOrganization,
  clearOrganizationError,
} from "@/store/actions/organizationActions";
import { useRouter } from "next/navigation";

const companySizes = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
];

export default function BasicDetailsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { industries, countries, states, loading: metaLoading } = useAppSelector(
    (state) => state.meta
  );
  const { organization, loading: orgLoading, error: orgError } = useAppSelector(
    (state) => state.organization
  );

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [formError, setFormError] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const [form, setForm] = useState({
    name: "",
    industry: "",
    companySize: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    country: "",
    pinCode: "",
  });

  useEffect(() => {
    dispatch(fetchIndustries());
    dispatch(fetchCountries());
    dispatch(fetchOrganizationByTenant());
  }, [dispatch]);

  useEffect(() => {
    if (organization) {
      setForm({
        name: organization.name || "",
        industry: organization.industry || "",
        companySize: organization.companySize || "",
        addressLine1: organization.addressLine1 || "",
        addressLine2: organization.addressLine2 || "",
        city: organization.city || "",
        state: organization.state || "",
        country: organization.country || "",
        pinCode: organization.pinCode || "",
      });
      if (organization.logoUrl) {
        setLogoPreview(organization.logoUrl);
      }
      setIsEditMode(true);
    }
  }, [organization]);

  useEffect(() => {
    if (form.country) {
      dispatch(fetchStates(form.country));
    }
  }, [form.country, dispatch]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    dispatch(clearOrganizationError());
    setFormError("");
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    setFormError("");

    if (!form.name || !form.industry || !form.companySize || !form.country || !form.state || !form.city || !form.pinCode || !form.addressLine1) {
      setFormError("Please fill in all required fields");
      return;
    }

    const payload = {
      name: form.name,
      logo: logoFile,
      industry: form.industry,
      companySize: form.companySize,
      addressLine1: form.addressLine1,
      addressLine2: form.addressLine2,
      city: form.city,
      state: form.state,
      country: form.country,
      pinCode: form.pinCode,
    };

    let result;
    if (isEditMode && organization?.id) {
      result = await dispatch(updateOrganization({ id: organization.id, ...payload }));
    } else {
      result = await dispatch(createOrganization(payload));
    }

    
  };

  const handleCancel = () => {
    if (organization) {
      setForm({
        name: organization.name || "",
        industry: organization.industry || "",
        companySize: organization.companySize || "",
        addressLine1: organization.addressLine1 || "",
        addressLine2: organization.addressLine2 || "",
        city: organization.city || "",
        state: organization.state || "",
        country: organization.country || "",
        pinCode: organization.pinCode || "",
      });
      setLogoPreview(organization.logoUrl || null);
    }
  };

  return (
    <div className="h-full p-6">
      <div className="w-full">
        <h2 className="text-base font-bold text-gray-800 mb-5 tracking-tight">
          {isEditMode ? "Organization Details" : "Create Organization"}
        </h2>

        {(orgError || formError) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {orgError || formError}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {/* Logo */}
            <FormRow label="Logo">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-24 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#1a3a8f]/50 hover:bg-[#1a3a8f]/2 transition group"
              >
                {logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="h-16 w-auto object-contain rounded"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveLogo();
                      }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <>
                    <svg className="w-6 h-6 text-gray-300 group-hover:text-[#1a3a8f]/50 mb-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs text-gray-400 group-hover:text-[#1a3a8f]/60 transition">
                      Upload the Logo
                    </span>
                  </>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </FormRow>

            {/* Organization Name */}
            <FormRow label="Organization Name" required>
              <Input
                name="name"
                placeholder="Enter Organization Name"
                value={form.name}
                onChange={handleChange}
              />
            </FormRow>

            {/* Industry */}
            <FormRow label="Industry" required>
              <div className="relative">
                <select
                  name="industry"
                  value={form.industry}
                  onChange={handleChange}
                  disabled={metaLoading}
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a8f]/20 focus:border-[#1a3a8f] transition pr-8 disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>
                    {metaLoading ? "Loading..." : "Select Industry"}
                  </option>
                  {industries.map((ind) => (
                    <option key={ind.id} value={ind.id}>
                      {ind.name}
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </FormRow>

            {/* Company Size */}
            <FormRow label="Company Size" required>
              <div className="relative">
                <select
                  name="companySize"
                  value={form.companySize}
                  onChange={handleChange}
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a8f]/20 focus:border-[#1a3a8f] transition pr-8"
                >
                  <option value="" disabled>Select Company Size</option>
                  {companySizes.map((size) => (
                    <option key={size} value={size}>
                      {size} employees
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </FormRow>

            {/* Country */}
            <FormRow label="Country" required>
              <div className="relative">
                <select
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  disabled={metaLoading}
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a8f]/20 focus:border-[#1a3a8f] transition pr-8 disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>
                    {metaLoading ? "Loading..." : "Select Country"}
                  </option>
                  {countries.map((c) => (
                    <option key={c.isoCode} value={c.isoCode}>
                      {c.flag} {c.name}
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </FormRow>

            {/* State */}
            <FormRow label="State" required>
              <div className="relative">
                <select
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  disabled={!form.country || metaLoading}
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a8f]/20 focus:border-[#1a3a8f] transition pr-8 disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>
                    {!form.country ? "Select Country First" : metaLoading ? "Loading..." : "Select State"}
                  </option>
                  {states.map((s) => (
                    <option key={s.isoCode} value={s.isoCode}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </FormRow>

            {/* City */}
            <FormRow label="City" required>
              <Input
                name="city"
                placeholder="Enter City"
                value={form.city}
                onChange={handleChange}
              />
            </FormRow>

            {/* Pin Code */}
            <FormRow label="Pin Code" required>
              <Input
                name="pinCode"
                placeholder="Enter Pin Code"
                value={form.pinCode}
                onChange={handleChange}
              />
            </FormRow>

            {/* Primary Address */}
            <FormRow label="Primary Address" alignTop required>
              <div className="flex flex-col gap-2.5">
                <Input
                  name="addressLine1"
                  placeholder="Address Line 1"
                  value={form.addressLine1}
                  onChange={handleChange}
                />
                <Input
                  name="addressLine2"
                  placeholder="Address Line 2 (Optional)"
                  value={form.addressLine2}
                  onChange={handleChange}
                />
              </div>
            </FormRow>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            {isEditMode && (
              <button
                onClick={handleCancel}
                disabled={orgLoading}
                className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:text-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={orgLoading}
              className="px-5 py-2.5 text-sm font-bold text-white bg-[#1a3a8f] rounded-lg hover:bg-[#122d75] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {orgLoading ? "Saving..." : isEditMode ? "Update" : "Create Organization"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FormRowProps {
  label: string;
  required?: boolean;
  alignTop?: boolean;
  children: React.ReactNode;
}

function FormRow({ label, required, alignTop, children }: FormRowProps) {
  return (
    <div className={`flex flex-col sm:flex-row ${alignTop ? "sm:items-start" : "sm:items-center"} gap-3 px-6 py-4`}>
      <div className="w-full sm:w-44 shrink-0">
        <span className="text-sm font-medium text-gray-600">
          {label}
          {required && <span className="text-[#1a3a8f] ml-0.5">*</span>}
        </span>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
}

function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-[#1a3a8f]/20 focus:border-[#1a3a8f] transition ${className}`}
    />
  );
}
