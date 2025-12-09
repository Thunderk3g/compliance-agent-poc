import { type Rule } from '@/lib/api';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { LucidePencil, LucideRotateCcw, LucideTrash2 } from 'lucide-react';

interface RulesTableProps {
  rules: Rule[];
  isLoading: boolean;
  onEdit: (rule: Rule) => void;
  onDelete: (id: string) => void;
  onRestore?: (id: string) => void;
  showRestore: boolean;
}

const columnHelper = createColumnHelper<Rule>();

export function RulesTable({ rules, isLoading, onEdit, onDelete, onRestore, showRestore }: RulesTableProps) {
  
  const columns = [
    columnHelper.accessor('category', {
      header: 'Category',
      cell: info => {
        const cat = info.getValue() as string;
        const colors: any = {
          irdai: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
          brand: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
          seo: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
        };
        return (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${colors[cat] || 'bg-gray-100 text-gray-800'}`}>
            {cat}
          </span>
        );
      },
    }),
    columnHelper.accessor('severity', {
      header: 'Severity',
      cell: info => {
        const sev = info.getValue() as string;
        const colors: any = {
            critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
            medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${colors[sev]}`}>
                {sev}
            </span>
        );
      }
    }),
    columnHelper.accessor('rule_text', {
        header: 'Rule Text',
         cell: info => <div className="max-w-md line-clamp-2 text-sm text-foreground/80" title={info.getValue()}>{info.getValue()}</div>
    }),
    columnHelper.accessor('points_deduction', {
        header: 'Points',
        cell: info => {
            const points = info.getValue(); 
             return (
                 <span className={`text-sm font-bold ${points <= -10 ? 'text-red-500' : 'text-orange-500'}`}>
                     {points}
                 </span>
             )
        }
    }),
    columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: info => (
            <div className="flex items-center gap-2">
                <button 
                    onClick={() => onEdit(info.row.original)}
                    className="p-1.5 hover:bg-surface-100 dark:hover:bg-white/10 text-primary rounded-lg transition-colors"
                >
                    <LucidePencil className="w-4 h-4" />
                </button>
                {showRestore ? (
                     <button 
                        onClick={() => onRestore?.(info.row.original.id)}
                        className="p-1.5 hover:bg-green-50 dark:hover:bg-green-900/20 text-green-600 rounded-lg transition-colors"
                    >
                        <LucideRotateCcw className="w-4 h-4" />
                    </button>
                ) : (
                    <button 
                        onClick={() => onDelete(info.row.original.id)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"
                    >
                        <LucideTrash2 className="w-4 h-4" />
                    </button>
                )}
            </div>
        )
    })
  ];

  const table = useReactTable({
    data: rules,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading rules...</div>;
  if (rules.length === 0) return <div className="p-8 text-center text-muted-foreground">No rules found.</div>;

  return (
    <div className="rounded-xl border border-surface-200 dark:border-white/5 bg-white dark:bg-card overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-surface-50 dark:bg-white/5 border-b border-surface-200 dark:border-white/5">
           {table.getHeaderGroups().map(headerGroup => (
             <tr key={headerGroup.id}>
               {headerGroup.headers.map(header => (
                 <th key={header.id} className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                   {flexRender(header.column.columnDef.header, header.getContext())}
                 </th>
               ))}
             </tr>
           ))}
        </thead>
        <tbody className="divide-y divide-surface-200 dark:divide-white/5">
          {table.getRowModel().rows.map(row => (
             <tr key={row.id} className="hover:bg-surface-50 dark:hover:bg-white/5">
               {row.getVisibleCells().map(cell => (
                 <td key={cell.id} className="p-4">
                   {flexRender(cell.column.columnDef.cell, cell.getContext())}
                 </td>
               ))}
             </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
