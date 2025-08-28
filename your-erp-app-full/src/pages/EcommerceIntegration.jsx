import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Globe, 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Link, 
  Unlink,
  Info,
  ExternalLink
} from 'lucide-react';
import { ecommerceApiService, platformConfigs, formatPlatformName, getPlatformLogo } from '../utils/ecommerceApi';

const EcommerceIntegration = ({ theme }) => {
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState({});
  const [configs, setConfigs] = useState({
    shopee: { apiKey: '', apiSecret: '', partnerId: '', shopId: '' },
    tokopedia: { clientId: '', clientSecret: '', fsId: '' },
    tiktokshop: { appKey: '', appSecret: '', shopId: '', authCode: '' }
  });
  const [showConfig, setShowConfig] = useState({});

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await ecommerceApiService.getStatus();
      setStatus(response.data.status || {});
    } catch (error) {
      console.error('Failed to fetch status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform) => {
    try {
      setConnecting(prev => ({ ...prev, [platform]: true }));
      
      let response;
      switch (platform) {
        case 'shopee':
          response = await ecommerceApiService.connectShopee(configs.shopee);
          break;
        case 'tokopedia':
          response = await ecommerceApiService.connectTokopedia(configs.tokopedia);
          break;
        case 'tiktokshop':
          response = await ecommerceApiService.connectTikTokShop(configs.tiktokshop);
          break;
        default:
          return;
      }

      if (response.data.success) {
        await fetchStatus();
        setShowConfig(prev => ({ ...prev, [platform]: false }));
      }
    } catch (error) {
      console.error(`Failed to connect ${platform}:`, error);
    } finally {
      setConnecting(prev => ({ ...prev, [platform]: false }));
    }
  };

  const handleDisconnect = async (platform) => {
    try {
      await ecommerceApiService.disconnect(platform);
      await fetchStatus();
    } catch (error) {
      console.error(`Failed to disconnect ${platform}:`, error);
    }
  };

  const handleSync = async (platform = null) => {
    try {
      setLoading(true);
      await ecommerceApiService.sync(platform);
      await fetchStatus();
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (platform, field, value) => {
    setConfigs(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }));
  };

  const PlatformCard = ({ platform }) => {
    const platformStatus = status[platform];
    const isConnected = platformStatus?.connected;
    const config = platformConfigs[platform];
    const isConnecting = connecting[platform];
    const showConfigForm = showConfig[platform];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`p-6 rounded-xl mb-6 shadow-lg border`}
        style={{ 
          backgroundColor: theme.secondary,
          borderColor: theme.special,
          color: theme.text
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{config.logo}</span>
            <h3 className="text-lg font-semibold">{config.name}</h3>
          </div>
          
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <div className="flex items-center text-green-400">
                <CheckCircle size={16} className="mr-1" />
                <span className="text-sm">Terhubung</span>
              </div>
            ) : (
              <div className="flex items-center text-red-400">
                <XCircle size={16} className="mr-1" />
                <span className="text-sm">Terputus</span>
              </div>
            )}
          </div>
        </div>

        {!showConfigForm ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowConfig(prev => ({ ...prev, [platform]: true }))}
                className={`px-4 py-2 rounded-lg font-medium flex items-center`}
                style={{ 
                  backgroundColor: theme.primary,
                  color: theme.background
                }}
              >
                <Settings size={16} className="mr-2" />
                Konfigurasi
              </button>
              
              {isConnected ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSync(platform)}
                    disabled={loading}
                    className={`px-3 py-2 rounded-lg font-medium flex items-center disabled:opacity-50`}
                    style={{ 
                      backgroundColor: theme.highlight,
                      color: theme.background
                    }}
                  >
                    <RefreshCw size={16} className="mr-2" />
                    Sync
                  </button>
                  <button
                    onClick={() => handleDisconnect(platform)}
                    className={`px-3 py-2 rounded-lg font-medium flex items-center`}
                    style={{ 
                      backgroundColor: theme.accent,
                      color: theme.background
                    }}
                  >
                    <Unlink size={16} className="mr-2" />
                    Putus
                  </button>
                </div>
              ) : null}
            </div>

            {isConnected && platformStatus.lastSync && (
              <p className="text-sm opacity-75">
                Terakhir sync: {new Date(platformStatus.lastSync).toLocaleString('id-ID')}
              </p>
            )}

            <a
              href={config.documentation}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm flex items-center opacity-75 hover:opacity-100 transition-opacity"
              style={{ color: theme.accent }}
            >
              <Info size={14} className="mr-1" />
              Dokumentasi API
              <ExternalLink size={12} className="ml-1" />
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3">
              {config.fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium mb-1" style={{ color: theme.text }}>
                    {field.label}
                    {field.required && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  <input
                    type={field.type}
                    value={configs[platform][field.name]}
                    onChange={(e) => handleConfigChange(platform, field.name, e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg border`}
                    style={{ 
                      backgroundColor: theme.background,
                      borderColor: theme.special,
                      color: theme.text
                    }}
                    placeholder={`Masukkan ${field.label}`}
                    required={field.required}
                  />
                  {field.help && (
                    <p className="text-xs opacity-75 mt-1" style={{ color: theme.accent }}>
                      {field.help}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => handleConnect(platform)}
                disabled={isConnecting}
                className={`px-4 py-2 rounded-lg font-medium flex items-center disabled:opacity-50`}
                style={{ 
                  backgroundColor: theme.primary,
                  color: theme.background
                }}
              >
                {isConnecting ? (
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                ) : (
                  <Link size={16} className="mr-2" />
                )}
                {isConnecting ? 'Menghubungkan...' : 'Hubungkan'}
              </button>

              <button
                onClick={() => setShowConfig(prev => ({ ...prev, [platform]: false }))}
                className={`px-4 py-2 rounded-lg font-medium`}
                style={{ 
                  backgroundColor: theme.accent,
                  color: theme.background
                }}
              >
                Batal
              </button>
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className={`p-6 rounded-xl shadow-lg`} style={{ backgroundColor: theme.secondary }}>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className={`text-2xl font-bold mb-2`} style={{ color: theme.text }}>
            Integrasi E-commerce
          </h2>
          <p className={`opacity-75`} style={{ color: theme.accent }}>
            Kelola koneksi dengan platform e-commerce untuk sinkronisasi otomatis
          </p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => handleSync()}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium flex items-center disabled:opacity-50`}
            style={{ 
              backgroundColor: theme.highlight,
              color: theme.background
            }}
          >
            <RefreshCw size={16} className="mr-2" />
            Sync Semua
          </button>

          <button
            onClick={fetchStatus}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium flex items-center disabled:opacity-50`}
            style={{ 
              backgroundColor: theme.primary,
              color: theme.background
            }}
          >
            <Globe size={16} className="mr-2" />
            Refresh Status
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <PlatformCard platform="shopee" />
        <PlatformCard platform="tokopedia" />
        <PlatformCard platform="tiktokshop" />
      </div>

      {Object.keys(status).length > 0 && (
        <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: theme.background }}>
          <h3 className="font-semibold mb-3" style={{ color: theme.text }}>Status Koneksi</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(status).map(([platform, platformStatus]) => (
              <div key={platform} className="text-center p-3 rounded-lg" style={{ backgroundColor: theme.secondary }}>
                <div className="text-2xl mb-2">{getPlatformLogo(platform)}</div>
                <div className="font-medium" style={{ color: theme.text }}>
                  {formatPlatformName(platform)}
                </div>
                <div className={`text-sm ${platformStatus.connected ? 'text-green-400' : 'text-red-400'}`}>
                  {platformStatus.connected ? 'Terhubung' : 'Terputus'}
                </div>
                {platformStatus.lastSync && (
                  <div className="text-xs opacity-75 mt-1">
                    Sync: {new Date(platformStatus.lastSync).toLocaleTimeString('id-ID')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EcommerceIntegration;
