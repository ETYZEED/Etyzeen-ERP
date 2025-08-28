import React, { useState } from 'react';
import { themes } from '../utils/helpers';

const SettingsContent = ({ theme, setTheme, setStoreLogo }) => {
  const [tempLogo, setTempLogo] = useState('');

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempLogo(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (tempLogo) {
      setStoreLogo(tempLogo);
    }
  };

  return (
    <div className={`p-6 rounded-xl shadow-lg`} style={{ backgroundColor: theme.secondary }}>
      <h2 className={`text-xl font-semibold mb-6`} style={{ color: theme.text }}>Pengaturan & Kustomisasi</h2>
      <p className={`mb-4 font-medium`} style={{ color: theme.accent }}>Kelola pengaturan aplikasi, termasuk logo dan tema warna.</p>
      
      {/* Kustomisasi Logo Toko */}
      <div className="mb-6">
        <label className={`block text-sm font-bold mb-2`} style={{ color: theme.accent }} htmlFor="store-logo">
          Logo Toko
        </label>
        <div className="flex items-center space-x-4">
          <input
            id="store-logo"
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className={`block w-full text-sm
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
            `}
            style={{ color: theme.text, file: { backgroundColor: theme.special, color: theme.text } }}
          />
          {tempLogo && <img src={tempLogo} alt="Logo Preview" className="w-12 h-12 rounded-full object-cover" />}
        </div>
      </div>
      
      <button 
        onClick={handleSave}
        className={`font-bold py-2 px-4 rounded-lg transition-colors duration-200`}
        style={{ backgroundColor: theme.accent, color: theme.background }}
      >
        Simpan Perubahan
      </button>

      {/* Pemilihan Tema */}
      <div className={`mt-10 pt-6 border-t`} style={{ borderColor: theme.special }}>
        <h3 className={`text-lg font-semibold mb-4`} style={{ color: theme.text }}>Pilih Tema Warna</h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
          {themes.map((t, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg cursor-pointer flex flex-col items-center justify-center transition-transform hover:scale-105 ${theme.name === t.name ? `ring-2` : ''}`}
              style={{ ringColor: t.accent }}
              onClick={() => setTheme(t)}
            >
              <div
                className="w-full h-8 rounded-md"
                style={{
                  background: `linear-gradient(to right, ${t.background}, ${t.secondary}, ${t.accent})`,
                }}
              ></div>
              <p className={`mt-2 text-xs font-medium text-center`} style={{ color: t.accent }}>{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsContent;