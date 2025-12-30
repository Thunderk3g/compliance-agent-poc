import { motion } from 'framer-motion';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface StatusDonutProps {
  passed: number;
  flagged: number;
  failed: number;
}

const COLORS = {
  passed: '#34d399',
  flagged: '#fbbf24',
  failed: '#f87171',
};

export function StatusDonut({ passed, flagged, failed }: StatusDonutProps) {
  const total = passed + flagged + failed;
  const data = [
    { name: 'Passed', value: passed, color: COLORS.passed },
    { name: 'Flagged', value: flagged, color: COLORS.flagged },
    { name: 'Failed', value: failed, color: COLORS.failed },
  ];

  const renderLabel = (entry: any) => {
    const percent = ((entry.value / total) * 100).toFixed(0);
    return `${percent}%`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full flex flex-col items-center"
    >
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="80%"
            paddingAngle={2}
            dataKey="value"
            label={renderLabel}
            labelLine={false}
            animationDuration={1500}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e4e4e7',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex gap-6 mt-4">
        {data.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              {entry.name}: <span className="font-semibold text-zinc-900 dark:text-zinc-50">{entry.value}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{total}</p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Total</p>
      </div>
    </motion.div>
  );
}
