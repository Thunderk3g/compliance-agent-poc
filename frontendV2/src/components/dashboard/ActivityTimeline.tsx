import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Clock, FileText, XCircle } from 'lucide-react';

interface RecentSubmission {
  id: string;
  title: string;
  status: string;
  submitted_at: string;
}

interface ActivityTimelineProps {
  submissions: RecentSubmission[];
}

const statusConfig = {
  analyzed: {
    icon: CheckCircle,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    dot: 'bg-emerald-500',
  },
  analyzing: {
    icon: Clock,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    dot: 'bg-blue-500',
  },
  flagged: {
    icon: AlertCircle,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    dot: 'bg-amber-500',
  },
  failed: {
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-100 dark:bg-red-900/30',
    dot: 'bg-red-500',
  },
};

export function ActivityTimeline({ submissions }: ActivityTimelineProps) {
  if (!submissions || submissions.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        <p className="text-sm">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
      {submissions.map((submission, index) => {
        // Safely get config with fallback
        const config = statusConfig[submission.status as keyof typeof statusConfig] || {
          icon: FileText,
          color: 'text-zinc-500 dark:text-zinc-400',
          bg: 'bg-zinc-100 dark:bg-zinc-800',
          dot: 'bg-zinc-500',
        };
        const Icon = config.icon;

        return (
          <motion.div
            key={submission.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-4 group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 p-3 rounded-lg transition-colors"
          >
            {/* Timeline dot */}
            <div className="flex flex-col items-center">
              <div className={cn('w-3 h-3 rounded-full', config.dot)} />
              {index < submissions.length - 1 && (
                <div className="w-0.5 h-full bg-zinc-200 dark:bg-zinc-700 mt-2" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={cn('p-1.5 rounded-lg', config.bg)}>
                    <Icon className={cn('w-4 h-4', config.color)} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm truncate">
                      {submission.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(submission.submitted_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    'px-2 py-1 text-xs font-medium rounded-md capitalize',
                    config.bg,
                    config.color
                  )}
                >
                  {submission.status}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
