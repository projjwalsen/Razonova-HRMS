'use client';

import { WEEK_DAYS } from './AttendanceTabs';

interface ConfigForm {
  checkInTime: string;
  checkOutTime: string;
  graceMinutes: number;
  halfDayMinutes: number;
  fullDayMinutes: number;
  workingDays?: string[];
}

interface Props {
  configForm: ConfigForm;
  setConfigForm: (f: ConfigForm) => void;
  saving: boolean;
  onSave: () => void;
  canEdit?: boolean;
}

export default function ConfigTab({ configForm, setConfigForm, saving, onSave, canEdit = true }: Props) {
  const toggleWorkingDay = (day: string) => {
    if (!canEdit) return;
    const current = configForm.workingDays || [];
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day].sort(
          (a, b) => WEEK_DAYS.findIndex((w) => w.value === a) - WEEK_DAYS.findIndex((w) => w.value === b)
        );
    setConfigForm({ ...configForm, workingDays: updated });
  };

  return (
    <div className="attendance-item">
      <div className="p-8 bg-white rounded-2xl border-2 border-gray-100">
        <h2 className="text-2xl font-bold font-['Montserrat'] mb-6">Attendance Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-semibold mb-2">Check In Time</label>
            <input
              type="time"
              value={configForm.checkInTime}
              onChange={(e) => setConfigForm({ ...configForm, checkInTime: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Check Out Time</label>
            <input
              type="time"
              value={configForm.checkOutTime}
              onChange={(e) => setConfigForm({ ...configForm, checkOutTime: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Grace Minutes</label>
            <input
              type="number"
              value={configForm.graceMinutes}
              onChange={(e) => setConfigForm({ ...configForm, graceMinutes: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Half Day Minutes</label>
            <input
              type="number"
              value={configForm.halfDayMinutes}
              onChange={(e) => setConfigForm({ ...configForm, halfDayMinutes: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">Full Day Minutes</label>
            <input
              type="number"
              value={configForm.fullDayMinutes}
              onChange={(e) => setConfigForm({ ...configForm, fullDayMinutes: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-[#0445AD]"
            />
          </div>
        </div>
        <div className="mt-6">
          <div className="mb-6">
            <label className="block text-sm font-semibold mb-3">
              Working Days
              <span className="text-xs font-normal text-gray-400 ml-2">Selected days are treated as working days</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {WEEK_DAYS.map(({ label, value }) => {
                const isSelected = (configForm.workingDays || []).includes(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleWorkingDay(value)}
                    className={`w-14 h-14 rounded-xl font-semibold text-sm transition-all duration-200 border-2 ${
                      isSelected
                        ? 'bg-[#0445AD] text-white border-[#0445AD] shadow-md scale-105'
                        : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-[#0445AD] hover:text-[#0445AD]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {(configForm.workingDays || []).length === 0 && (
              <p className="text-xs text-red-500 mt-2">At least one working day must be selected</p>
            )}
          </div>
          <button
            onClick={onSave}
            disabled={saving || (configForm.workingDays || []).length === 0 || !canEdit}
            className="px-8 py-3 bg-[#0445AD] text-white rounded-lg font-semibold hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : canEdit ? 'Save Configuration' : 'View Only — No Edit Permission'}
          </button>
        </div>
      </div>
    </div>
  );
}
