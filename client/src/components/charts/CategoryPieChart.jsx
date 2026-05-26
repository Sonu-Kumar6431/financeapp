import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Sector } from 'recharts';
import { CATEGORY_COLORS, formatCurrency } from '../../utils/formatters';

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value } = props;
  return (
    <g>
      <text x={cx} y={cy - 12} textAnchor="middle" fill="#111827" fontSize={13} fontWeight={600}>
        {payload.category}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#6b7280" fontSize={12}>
        ₹{value?.toLocaleString('en-IN')}
      </text>
      <text x={cx} y={cy + 28} textAnchor="middle" fill="#9ca3af" fontSize={11}>
        {payload.percentage}%
      </text>
      <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 8}
        startAngle={startAngle} endAngle={endAngle} fill={fill} />
    </g>
  );
};

export default function CategoryPieChart({ data }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!data?.length) return (
    <div className="card flex items-center justify-center h-64 text-gray-400 text-sm">
      No expense data for this month
    </div>
  );

  const chartData = data.map((d) => ({
    ...d,
    name: d.category,
    value: d.amount,
  }));

  return (
    <div className="card">
      <h3 className="text-base font-semibold text-gray-800 mb-4">Expense Breakdown</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={chartData}
            cx="50%" cy="50%"
            innerRadius={65} outerRadius={90}
            dataKey="value"
            onMouseEnter={(_, index) => setActiveIndex(index)}
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={CATEGORY_COLORS[entry.category] || '#9ca3af'} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-1 mt-2">
        {data.slice(0, 6).map((d) => (
          <div key={d.category} className="flex items-center gap-2 text-xs text-gray-600">
            <span className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: CATEGORY_COLORS[d.category] || '#9ca3af' }} />
            <span className="truncate">{d.category}</span>
            <span className="ml-auto text-gray-400">{d.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
