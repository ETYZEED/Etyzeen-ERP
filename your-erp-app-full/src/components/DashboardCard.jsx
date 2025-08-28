import React from 'react';

const DashboardCard = ({ title, value, icon: Icon, theme, onClick, valueColor }) => (
  <div
    className={`relative p-6 rounded-xl shadow-lg flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer`}
    style={{ backgroundColor: theme.secondary, color: theme.text, boxShadow: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 8px 15px -3px ${theme.primary}` }}
    onClick={onClick}
  >
    <div className="flex items-start justify-between mb-4">
      <h3 className={`text-sm font-bold`} style={{ color: theme.accent }}>{title}</h3>
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center`} style={{ backgroundColor: theme.special }}>
        <Icon style={{ color: theme.text }} size={24} />
      </div>
    </div>
    <div>
      <p className={`text-2xl font-bold whitespace-nowrap overflow-hidden text-ellipsis`} style={{ color: valueColor }}>{value}</p>
      <p className={`text-sm font-medium`} style={{ color: theme.accent }}>+12% dari bulan lalu</p>
    </div>
  </div>
);

export default DashboardCard;