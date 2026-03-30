"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCountries } from "@/store/actions/metaActions";
import { fetchSettings, saveSettings, GeneralSettings } from "@/store/actions/settingsActions";

const timeFormats = [
  { value: "12h", label: "12-hour (AM/PM)" },
  { value: "24h", label: "24-hour" },
];

const nameFormats = [
  { value: "firstName_lastName", label: "First Name Last Name" },
  { value: "lastName_firstName", label: "Last Name, First Name" },
  { value: "firstName", label: "First Name Only" },
];

const dateFormats = [
  { value: "dd-MM-yyyy", label: "01-01-2025" },
  { value: "dd/MM/yyyy", label: "01/01/2025" },
  { value: "MM/dd/yyyy", label: "01/01/2025" },
  { value: "yyyy-MM-dd", label: "2025-01-01" },
  { value: "dd-MM-yyyy", label: "01-01-2025" },
];

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const { countries, loading: metaLoading } = useAppSelector((state) => state.meta);
  const { settings, loading, saving, error } = useAppSelector((state) => state.settings);

  const [form, setForm] = useState<GeneralSettings>({
    country: "",
    timezone: "",
    timeFormat: "12h",
    nameFormat: "firstName_lastName",
    dateFormat: "dd-MMM-yyyy",
  });

  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    dispatch(fetchCountries());
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    if (settings?.settings) {
      const generalSettings = settings.settings.find((s) => s.key === "general");
      if (generalSettings?.value) {
        setForm(generalSettings.value);
      }
    }
  }, [settings]);

  const selectedCountry = countries.find((c) => c.isoCode === form.country);
  const timezones = selectedCountry?.timezones || [];

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    const country = countries.find((c) => c.isoCode === countryCode);

    let defaultTimezone = "";
    if (country?.timezones && country.timezones.length > 0) {
      const indiaTimezone = country.timezones.find((tz) => tz.zoneName === "Asia/Kolkata");
      defaultTimezone = indiaTimezone?.zoneName || country.timezones[0].zoneName;
    }

    setForm((prev) => ({
      ...prev,
      country: countryCode,
      timezone: defaultTimezone,
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    setSuccessMessage("");
    const result = await dispatch(saveSettings(form));
    if (saveSettings.fulfilled.match(result)) {
      setSuccessMessage("Settings saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  return (
    <div className="h-full p-6">
      <div className="max-w-3xl">
        <h2 className="text-base font-bold text-gray-800 mb-5 tracking-tight">
          Organization Settings
        </h2>

        {(error || successMessage) && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              error
                ? "bg-red-50 border border-red-200 text-red-600"
                : "bg-green-50 border border-green-200 text-green-600"
            }`}
          >
            {error || successMessage}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            <FormRow label="Country" required>
              <div className="relative">
                <select
                  name="country"
                  value={form.country}
                  onChange={handleCountryChange}
                  disabled={metaLoading || loading}
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a8f]/20 focus:border-[#1a3a8f] transition pr-8 disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>
                    {metaLoading ? "Loading..." : "Select Country"}
                  </option>
                  {countries.map((country) => (
                    <option key={country.isoCode} value={country.isoCode}>
                      {country.flag} {country.name}
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </FormRow>

            <FormRow label="Timezone" required>
              <div className="relative">
                <select
                  name="timezone"
                  value={form.timezone}
                  onChange={handleChange}
                  disabled={!form.country || metaLoading}
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a8f]/20 focus:border-[#1a3a8f] transition pr-8 disabled:bg-gray-50 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>
                    {!form.country ? "Select Country First" : metaLoading ? "Loading..." : "Select Timezone"}
                  </option>
                  {timezones.map((tz) => (
                    <option key={tz.zoneName} value={tz.zoneName}>
                      {tz.gmtOffsetName} - {tz.zoneName.replace("_", " ")}
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </FormRow>

            <FormRow label="Time Format" required>
              <div className="relative">
                <select
                  name="timeFormat"
                  value={form.timeFormat}
                  onChange={handleChange}
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a8f]/20 focus:border-[#1a3a8f] transition pr-8"
                >
                  {timeFormats.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </FormRow>

            <FormRow label="Name Format" required>
              <div className="relative">
                <select
                  name="nameFormat"
                  value={form.nameFormat}
                  onChange={handleChange}
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a8f]/20 focus:border-[#1a3a8f] transition pr-8"
                >
                  {nameFormats.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </FormRow>

            <FormRow label="Date Format" required>
              <div className="relative">
                <select
                  name="dateFormat"
                  value={form.dateFormat}
                  onChange={handleChange}
                  className="w-full appearance-none border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#1a3a8f]/20 focus:border-[#1a3a8f] transition pr-8"
                >
                  {dateFormats.map((format) => (
                    <option key={format.value} value={format.value}>
                      {format.label}
                    </option>
                  ))}
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </FormRow>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
            <button
              onClick={handleSubmit}
              disabled={saving || loading}
              className="px-5 py-2.5 text-sm font-bold text-white bg-[#1a3a8f] rounded-lg hover:bg-[#122d75] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Settings"}
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
  children: React.ReactNode;
}

function FormRow({ label, required, children }: FormRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4">
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
