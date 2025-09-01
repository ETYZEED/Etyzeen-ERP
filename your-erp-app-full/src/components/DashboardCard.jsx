import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const DashboardCard = ({ title, value, icon: Icon, theme, onClick, valueColor, trend = 0 }) => {
  const getTrendIcon = (trendValue) => {
    if (trendValue > 0) return <TrendingUp size={16} style={{ color: '#10b981' }} />;
    if (trendValue < 0) return <TrendingDown size={16} style={{ color: '#ef4444' }} />;
    return <Minus size={16} style={{ color: theme.light }} />;
  };

  const getTrendColor = (trendValue) => {
    if (trendValue > 0) return '#10b981'; // green
    if (trendValue < 0) return '#ef4444'; // red
    return theme.light; // theme-aware gray
  };

  const formatTrend = (trendValue) => {
    const sign = trendValue > 0 ? '+' : '';
    return `${sign}${trendValue.toFixed(1)}%`;
  };

  // Theme-aware gradient based on the theme's color palette
  const getGradientBackground = () => {
    return `linear-gradient(135deg, ${theme.secondary} 0%, ${theme.subtle || theme.primary} 100%)`;
  };

  // Enhanced shadow with theme colors
  const getEnhancedShadow = () => {
    return `0 8px 32px -4px ${theme.primary}20, 0 4px 16px -2px ${theme.primary}10, 0 2px 8px -1px ${theme.primary}05`;
  };

  return (
    <div
      className={`relative p-8 rounded-2xl flex flex-col justify-between transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl cursor-pointer group overflow-hidden`}
      style={{
        background: getGradientBackground(),
        color: theme.text,
        boxShadow: getEnhancedShadow(),
        border: `1px solid ${theme.primary}15`
      }}
      onClick={onClick}
    >
      {/* Enhanced animated background with multiple layers */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-all duration-500"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${valueColor}30 0%, transparent 50%), radial-gradient(circle at 70% 80%, ${theme.accent}20 0%, transparent 50%)`
        }}
      />

      {/* Subtle border glow on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          boxShadow: `inset 0 0 0 1px ${theme.highlight}40, 0 0 20px ${valueColor}20`
        }}
      />

      <div className="flex items-start justify-between mb-6 relative z-10">
        <h3 className={`text-sm font-semibold tracking-wide uppercase`} style={{ color: theme.accent }}>
          {title}
        </h3>
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}
          style={{
            background: `linear-gradient(135deg, ${theme.special} 0%, ${theme.highlight} 100%)`,
            boxShadow: `0 4px 12px ${theme.primary}30`
          }}
        >
          <Icon style={{ color: theme.text }} size={24} />
        </div>
      </div>

      <div className="relative z-10">
        <p
          className={`text-3xl font-bold whitespace-nowrap overflow-hidden text-ellipsis mb-3 transition-colors duration-300`}
          style={{ color: valueColor }}
        >
          {value}
        </p>
        <div className="flex items-center space-x-2">
          <div className="transition-transform duration-300 group-hover:scale-110">
            {getTrendIcon(trend)}
          </div>
          <span
            className={`text-sm font-medium transition-colors duration-300`}
            style={{ color: getTrendColor(trend) }}
          >
            {formatTrend(trend)} dari periode lalu
          </span>
        </div>
      </div>

      {/* Enhanced pulse animation for positive trends */}
      {trend > 0 && (
        <div
          className="absolute inset-0 rounded-2xl animate-pulse opacity-10"
          style={{
            background: `linear-gradient(45deg, ${valueColor}20, transparent)`,
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        />
      )}

      {/* Floating particles effect for premium themes */}
      {theme.name && ['Midnight Gold', 'Imperial Purple', 'Cosmic Fusion'].includes(theme.name) && (
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-ping"
              style={{
                top: `${20 + i * 30}%`,
                left: `${10 + i * 30}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: '3s'
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
