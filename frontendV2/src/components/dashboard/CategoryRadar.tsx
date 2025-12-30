import { motion } from 'framer-motion';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';

interface CategoryRadarProps {
  irdaiScore: number;
  brandScore: number;
  seoScore: number;
}

export function CategoryRadar({ irdaiScore, brandScore, seoScore }: CategoryRadarProps) {
  const data = [
    { category: 'IRDAI', score: irdaiScore, fullMark: 100 },
    { category: 'Brand', score: brandScore, fullMark: 100 },
    { category: 'SEO', score: seoScore, fullMark: 100 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full h-full"
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="#e4e4e7" />
          <PolarAngleAxis dataKey="category" tick={{ fill: '#71717a', fontSize: 14 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#71717a', fontSize: 12 }} />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.4}
            strokeWidth={2}
            dot={{ fill: '#6366f1', r: 4 }}
            animationDuration={1500}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e4e4e7',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
