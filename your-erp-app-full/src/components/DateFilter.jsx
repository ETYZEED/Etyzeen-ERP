import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, X } from 'lucide-react';

const DateFilter = ({ theme, selectedFilter, onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customRange, setCustomRange] = useState({ start: '', end: '' });
  const [showCustom, setShowCustom] = useState(false);
  const dropdownRef = useRef(null);

  const presets = [
    { key: 'hari_ini', label: 'Hari Ini', description: 'Data hari ini' },
    { key: 'kemarin', label: 'Kemarin', description: 'Data kemarin' },
    { key: 'minggu_ini', label: 'Minggu Ini', description: 'Data minggu ini' },
    { key: 'minggu_lalu', label: 'Minggu Lalu', description: 'Data minggu lalu' },
    { key: 'bulan_ini', label: 'Bulan Ini', description: 'Data bulan ini' },
    { key: 'bulan_lalu', label: 'Bulan Lalu', description: 'Data bulan lalu' },
    { key: '3_bulan', label: '3 Bulan Terakhir', description: 'Data 3 bulan terakhir' },
    { key: '6_bulan', label: '6 Bulan Terakhir', description: 'Data 6 bulan terakhir' },
    { key: 'tahun_ini', label: 'Tahun Ini', description: 'Data tahun ini' },
    { key: 'tahun_lalu', label: 'Tahun Lalu', description: 'Data tahun lalu' },
  ];

  const getCurrentPreset = () => {
    return presets.find(preset => preset.key === selectedFilter) || presets[0];
  };

  const handlePresetSelect = (preset) => {
    onFilterChange(preset.key);
    setIsOpen(false);
    setShowCustom(false);
  };

  const handleCustomRangeApply = () => {
    if (customRange.start && customRange.end) {
      onFilterChange('custom', { start: customRange.start, end: customRange.end });
      setIsOpen(false);
    }
  };

  const handleCustomRangeCancel = () => {
    setCustomRange({ start: '', end: '' });
    setShowCustom(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowCustom(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg border transition-all duration-200 hover:shadow-md"
        style={{
          backgroundColor: theme.secondary,
          borderColor: theme.special,
          color: theme.text
        }}
      >
        <Calendar size={18} />
        <span className="font-medium">{getCurrentPreset().label}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className="absolute top-full mt-2 w-80 rounded-lg shadow-xl z-50 border"
          style={{
            backgroundColor: theme.secondary,
            borderColor: theme.special
          }}
        >
          {!showCustom ? (
            <>
              <div className="p-3 border-b" style={{ borderColor: theme.special }}>
                <h3 className="font-semibold text-sm" style={{ color: theme.text }}>
                  Pilih Periode Waktu
                </h3>
              </div>

              <div className="max-h-64 overflow-y-auto">
                {presets.map((preset) => (
                  <button
                    key={preset.key}
                    onClick={() => handlePresetSelect(preset)}
                    className="w-full text-left px-4 py-3 hover:bg-opacity-20 transition-colors duration-150 border-b border-opacity-10"
                    style={{
                      borderColor: theme.special,
                      backgroundColor: selectedFilter === preset.key ? `${theme.accent}20` : 'transparent',
                      color: theme.text
                    }}
                  >
                    <div className="font-medium text-sm">{preset.label}</div>
                    <div className="text-xs opacity-70 mt-1">{preset.description}</div>
                  </button>
                ))}
              </div>

              <div className="p-3 border-t" style={{ borderColor: theme.special }}>
                <button
                  onClick={() => setShowCustom(true)}
                  className="w-full text-left px-3 py-2 rounded-md transition-colors duration-200 hover:bg-opacity-20 text-sm font-medium"
                  style={{
                    backgroundColor: theme.accent,
                    color: theme.background
                  }}
                >
                  Pilih Rentang Tanggal Kustom
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: theme.special }}>
                <h3 className="font-semibold text-sm" style={{ color: theme.text }}>
                  Rentang Tanggal Kustom
                </h3>
                <button
                  onClick={() => setShowCustom(false)}
                  className="p-1 rounded-md hover:bg-opacity-20 transition-colors duration-200"
                  style={{ color: theme.text }}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={customRange.start}
                    onChange={(e) => setCustomRange(prev => ({ ...prev, start: e.target.value }))}
                    className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 transition-colors duration-200"
                    style={{
                      backgroundColor: theme.background,
                      borderColor: theme.special,
                      color: theme.text
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: theme.text }}>
                    Tanggal Akhir
                  </label>
                  <input
                    type="date"
                    value={customRange.end}
                    onChange={(e) => setCustomRange(prev => ({ ...prev, end: e.target.value }))}
                    className="w-full px-3 py-2 rounded-md border focus:outline-none focus:ring-2 transition-colors duration-200"
                    style={{
                      backgroundColor: theme.background,
                      borderColor: theme.special,
                      color: theme.text
                    }}
                  />
                </div>

                <div className="flex space-x-2 pt-2">
                  <button
                    onClick={handleCustomRangeCancel}
                    className="flex-1 px-4 py-2 rounded-md border transition-colors duration-200 hover:bg-opacity-20"
                    style={{
                      borderColor: theme.special,
                      color: theme.text
                    }}
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleCustomRangeApply}
                    disabled={!customRange.start || !customRange.end}
                    className="flex-1 px-4 py-2 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      backgroundColor: theme.accent,
                      color: theme.background
                    }}
                  >
                    Terapkan
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default DateFilter;
