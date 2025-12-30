import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface KPICardProps {
  title: string;
  value: number;
  trend?: number;
  icon: LucideIcon;
  color: 'indigo' | 'emerald' | 'amber' | 'red';
  format?: 'number' | 'percentage';
}

const colorClasses = {
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/20',
    icon: 'text-indigo-600 dark:text-indigo-400',
    trend: 'text-indigo-700 dark:text-indigo-300',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    icon: 'text-emerald-600 dark:text-emerald-400',
    trend: 'text-emerald-700 dark:text-emerald-300',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    icon: 'text-amber-600 dark:text-amber-400',
    trend: 'text-amber-700 dark:text-amber-300',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/20',
    icon: 'text-red-600 dark:text-red-400',
    trend: 'text-red-700 dark:text-red-300',
  },
};

export function KPICard({ title, value, trend, icon: Icon, color, format = 'number' }: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  // Animated counter
  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const formattedValue = format === 'percentage' ? `${displayValue}%` : displayValue.toLocaleString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-6',
        colorClasses[color].bg,
        'shadow-[8px_8px_16px_rgba(163,177,198,0.3),-8px_-8px_16px_rgba(255,255,255,0.5)]',
        'dark:shadow-[8px_8px_16px_rgba(0,0,0,0.3),-8px_-8px_16px_rgba(255,255,255,0.03)]',
        'hover:shadow-[12px_12px_24px_rgba(163,177,198,0.4),-12px_-12px_24px_rgba(255,255,255,0.6)]',
        'dark:hover:shadow-[12px_12px_24px_rgba(0,0,0,0.4),-12px_-12px_24px_rgba(255,255,255,0.05)]',
        'transition-all duration-300 hover:-translate-y-1'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 mb-2">{title}</p>
          <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">{formattedValue}</p>
          {trend !== undefined && (
            <div className={cn('flex items-center gap-1 mt-2 text-sm font-medium', colorClasses[color].trend)}>
              <span>{trend > 0 ? '↑' : trend < 0 ? '↓' : '→'}</span>
              <span>{Math.abs(trend)}%</span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">vs last period</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl bg-white/50 dark:bg-black/20', colorClasses[color].icon)}>
          <Icon className="w-8 h-8" />
        </div>
      </div>
    </motion.div>
  );
}
