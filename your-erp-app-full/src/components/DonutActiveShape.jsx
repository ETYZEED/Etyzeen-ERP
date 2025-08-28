import React from 'react';
import { Sector } from 'recharts';

const DonutActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value, name, theme } = props;
  const outerRadiusExpanded = outerRadius * 1.08; // Lebih pop-out
  const innerRadiusExpanded = innerRadius * 0.98; // Sedikit lebih kecil di dalam untuk efek depth
  const offsetDistance = 10; // Jarak perpindahan untuk efek 'terpisah'

  // Calculate new cx, cy for exploded slice
  const midAngleRad = (startAngle + endAngle) / 2 * Math.PI / 180;
  const offsetCx = cx + offsetDistance * Math.cos(midAngleRad);
  const offsetCy = cy + offsetDistance * Math.sin(midAngleRad);

  // Calculate text position in the middle of the active slice
  const textRadius = (innerRadiusExpanded + outerRadiusExpanded) / 2;
  const textX = offsetCx + textRadius * Math.cos(midAngleRad);
  const textY = offsetCy + textRadius * Math.sin(midAngleRad);

  return (
    <g transform={`translate(${offsetCx - cx}, ${offsetCy - cy})`}>
      {/* Sector untuk memberikan ilusi kedalaman (shadow/bottom part) */}
      <Sector
        cx={cx}
        cy={cy + 5} // Sedikit ke bawah untuk ilusi kedalaman
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={theme.dark} // Warna lebih gelap untuk efek bayangan
        className="transition-all duration-300 ease-in-out"
      />
      {/* Sector utama yang 'terangkat' */}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadiusExpanded}
        outerRadius={outerRadiusExpanded}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        className="drop-shadow-lg transition-all duration-300 ease-in-out"
      />

      {/* Teks di tengah potongan yang aktif */}
      <text x={textX} y={textY} textAnchor="middle" fill={theme.text} className="text-sm font-bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
      <text x={textX} y={textY} dy={18} textAnchor="middle" fill={theme.accent} className="text-xs">
        {name}
      </text>
    </g>
  );
};

export default DonutActiveShape;
