import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

interface ComplianceTrendChartProps {
  dates: string[];
  scores: number[];
  counts: number[];
}

export function ComplianceTrendChart({ dates, scores, counts }: ComplianceTrendChartProps) {
  const data = dates.map((date, index) => ({
    date,
    score: scores[index],
    count: counts[index],
    formattedDate: format(new Date(date), 'MMM dd'),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" opacity={0.3} />
          <XAxis
            dataKey="formattedDate"
            stroke="#71717a"
            fontSize={12}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            stroke="#71717a"
            fontSize={12}
            tickLine={false}
            domain={[0, 100]}
            label={{ value: 'Score', angle: -90, position: 'insideLeft', style: { fill: '#71717a' } }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#71717a"
            fontSize={12}
            tickLine={false}
            label={{ value: 'Count', angle: 90, position: 'insideRight', style: { fill: '#71717a' } }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e4e4e7',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
            labelStyle={{ color: '#18181b', fontWeight: 600 }}
          />
          <ReferenceLine yAxisId="left" y={80} stroke="#34d399" strokeDasharray="3 3" label="Target" />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="score"
            stroke="#6366f1"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorScore)"
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
