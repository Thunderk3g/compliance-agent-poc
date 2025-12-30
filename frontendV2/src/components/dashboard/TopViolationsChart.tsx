import type { TopViolation } from '@/types/dashboard';
import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

interface TopViolationsChartProps {
  violations: TopViolation[];
}

const severityConfig = {
  critical: { color: '#f87171', icon: XCircle },
  high: { color: '#fbbf24', icon: AlertTriangle },
  medium: { color: '#60a5fa', icon: Info },
  low: { color: '#34d399', icon: AlertCircle },
};

export function TopViolationsChart({ violations }: TopViolationsChartProps) {
  const data = violations.map((v) => ({
    ...v,
    shortDesc: v.description.length > 35 ? v.description.substring(0, 32) + '...' : v.description,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" opacity={0.3} />
          <XAxis type="number" stroke="#71717a" fontSize={12} />
          <YAxis
            type="category"
            dataKey="shortDesc"
            stroke="#71717a"
            fontSize={12}
            width={110}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e4e4e7',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            formatter={(value: any, _name: any, props: any) => [
              value,
              props.payload.description,
            ]}
          />
          <Bar dataKey="count" radius={[0, 8, 8, 0]} animationDuration={1500}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={severityConfig[entry.severity].color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
