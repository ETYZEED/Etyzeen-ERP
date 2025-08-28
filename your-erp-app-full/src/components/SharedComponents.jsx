import React from 'react';
import {
  Tooltip,
  Sector,
} from 'recharts';
import { formatRupiah } from '../utils/helpers';

export const CustomTooltip = ({ active, payload, label, theme }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 rounded-lg shadow-lg" style={{ backgroundColor: theme.background, border: `1px solid ${theme.special}` }}>
        <p className="font-bold" style={{ color: theme.text }}>{label}</p>
        <p className="font-medium" style={{ color: payload[0].color }}>{`Pendapatan : ${formatRupiah(payload[0].value)}`}</p>
        <p className="font-medium" style={{ color: payload[1].color }}>{`Pengeluaran : ${formatRupiah(payload[1].value)}`}</p>
      </div>
    );
  }
  return null;
};

export const CustomTooltipPie = ({ active, payload, label, theme }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-4 rounded-lg shadow-lg" style={{ backgroundColor: theme.background, border: `1px solid ${theme.special}` }}>
        <p className="font-bold" style={{ color: theme.text }}>{`${payload[0].name}`}</p>
        <p className="font-medium" style={{ color: payload[0].color }}>{`${formatRupiah(payload[0].value)}`}</p>
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