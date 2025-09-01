import React from 'react';
import {
  Tooltip,
  Sector,
} from 'recharts';
import { formatRupiah } from '../utils/helpers';

export const CustomTooltip = ({ active, payload, label, theme }) => {
  if (active && payload && payload.length) {
    const revenue = payload.find(p => p.dataKey === 'Pendapatan');
    const expenses = payload.find(p => p.dataKey === 'Pengeluaran');
    const profit = revenue && expenses ? revenue.value - expenses.value : 0;

    return (
      <div className="p-4 rounded-lg shadow-lg min-w-[200px]" style={{ backgroundColor: theme.background, border: `1px solid ${theme.special}` }}>
        <p className="font-bold mb-2" style={{ color: theme.text }}>{label}</p>
        <div className="space-y-1">
          {revenue && (
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: revenue.color }}>Pendapatan:</span>
              <span className="font-semibold" style={{ color: revenue.color }}>{formatRupiah(revenue.value)}</span>
            </div>
          )}
          {expenses && (
            <div className="flex justify-between items-center">
              <span className="text-sm" style={{ color: expenses.color }}>Pengeluaran:</span>
              <span className="font-semibold" style={{ color: expenses.color }}>{formatRupiah(expenses.value)}</span>
            </div>
          )}
          {revenue && expenses && (
            <div className="border-t pt-1 mt-2" style={{ borderColor: theme.special }}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium" style={{ color: theme.text }}>Laba Bersih:</span>
                <span className={`font-bold ${profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatRupiah(profit)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const CustomTooltipPie = ({ active, payload, label, theme }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    const percentage = ((data.value / data.payload.total) * 100).toFixed(1);

    return (
      <div className="p-4 rounded-lg shadow-lg min-w-[180px]" style={{ backgroundColor: theme.background, border: `1px solid ${theme.special}` }}>
        <p className="font-bold mb-2" style={{ color: theme.text }}>{data.name}</p>
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: theme.text }}>Nilai:</span>
            <span className="font-semibold" style={{ color: data.color }}>{formatRupiah(data.value)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: theme.text }}>Persentase:</span>
            <span className="font-semibold" style={{ color: data.color }}>{percentage}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const ActivePieShape = (props) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, name, value, theme } = props;
    const outerRadiusExpanded = outerRadius * 1.05;
    const midAngle = (startAngle + endAngle) / 2;
    const radian = midAngle * (Math.PI / 180);
    const sin = Math.sin(radian);
    const cos = Math.cos(radian);
    const ex = cx + outerRadiusExpanded * cos;
    const ey = cy + outerRadiusExpanded * sin;
    const strokeColor = "#fff";
    // Garis tepi putih
    const strokeWidth = 2;
    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadiusExpanded}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                style={{ filter: `drop-shadow(0px 0px 8px ${fill})` }}
            />
        </g>
    );
};