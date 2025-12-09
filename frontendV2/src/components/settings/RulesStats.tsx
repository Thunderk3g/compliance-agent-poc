
import { type RuleStats } from '@/lib/api';
import { LucideCheckCircle, LucideScale, LucideShieldAlert, LucideShieldBan } from 'lucide-react';

interface RuleStatsProps {
  stats: RuleStats | null;
  isLoading: boolean;
}

export function RulesStats({ stats, isLoading }: RuleStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/50 border border-surface-200 h-24 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards = [
    {
      label: 'Active Rules',
      value: stats.active_rules,
      color: 'text-green-600',
      icon: LucideCheckCircle,
    },
    {
      label: 'Inactive Rules',
      value: stats.inactive_rules,
      color: 'text-gray-500',
      icon: LucideShieldBan,
    },
    {
        label: 'IRDAI Rules',
        value: stats.by_category.irdai,
        color: 'text-purple-600',
        icon: LucideScale,
    },
    {
      label: 'Critical Rules',
      value: stats.by_severity.critical,
      color: 'text-red-600',
      icon: LucideShieldAlert,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <div key={index} className="bg-white dark:bg-card border border-surface-200 dark:border-white/5 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">{card.label}</span>
            <card.icon className={`w-5 h-5 opacity-80 ${card.color}`} />
          </div>
          <div className={`text-3xl font-bold ${card.color}`}>{card.value}</div>
        </div>
      ))}
    </div>
  );
}
