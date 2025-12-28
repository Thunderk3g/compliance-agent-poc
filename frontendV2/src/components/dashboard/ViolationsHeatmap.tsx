import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ViolationsHeatmapProps {
  series: { name: string; data: number[] }[];
  categories: string[];
}

const getHeatColor = (count: number): string => {
  if (count === 0) return 'bg-zinc-100 dark:bg-zinc-800';
  if (count <= 5) return 'bg-emerald-200 dark:bg-emerald-900/40';
  if (count <= 10) return 'bg-amber-200 dark:bg-amber-900/40';
  return 'bg-red-200 dark:bg-red-900/40';
};

const getTextColor = (count: number): string => {
  if (count === 0) return 'text-zinc-400 dark:text-zinc-600';
  if (count <= 5) return 'text-emerald-800 dark:text-emerald-200';
  if (count <= 10) return 'text-amber-800 dark:text-amber-200';
  return 'text-red-800 dark:text-red-200';
};

export function ViolationsHeatmap({ series, categories }: ViolationsHeatmapProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-3 text-left text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                Severity
              </th>
              {categories.map((category) => (
                <th
                  key={category}
                  className="p-3 text-center text-sm font-semibold text-zinc-700 dark:text-zinc-300"
                >
                  {category}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {series.map((row, rowIndex) => (
              <motion.tr
                key={row.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: rowIndex * 0.1 }}
              >
                <td className="p-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {row.name}
                </td>
                {row.data.map((count, colIndex) => (
                  <td key={colIndex} className="p-2">
                    <div
                      className={cn(
                        'rounded-lg p-4 text-center transition-all duration-300 hover:scale-105',
                        getHeatColor(count)
                      )}
                    >
                      <span className={cn('text-2xl font-bold', getTextColor(count))}>
                        {count}
                      </span>
                    </div>
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
