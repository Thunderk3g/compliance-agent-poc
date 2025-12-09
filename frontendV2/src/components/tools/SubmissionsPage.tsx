
import { RevealOnScroll } from '@/components/react-bits/RevealOnScroll';
import { ShinyButton } from '@/components/react-bits/ShinyButton';
import { useAnalyzeSubmission, useDeleteAllSubmissions, useDeleteSubmission, useSubmissions } from '@/hooks/useSubmissions';
import { type Submission } from '@/lib/api';
import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    type SortingState,
    useReactTable,
} from '@tanstack/react-table';
import { format } from 'date-fns';
import {
    LucideAlertCircle,
    LucideArrowUpDown,
    LucideFileCode,
    LucideFileText,
    LucideLoader2,
    LucidePlay,
    LucideTrash2
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const columnHelper = createColumnHelper<Submission>();

export default function SubmissionsPage() {
  const { data: submissions = [], isLoading, error } = useSubmissions();
  const deleteMutation = useDeleteSubmission();
  const deleteAllMutation = useDeleteAllSubmissions();
  const analyzeMutation = useAnalyzeSubmission();
  const [sorting, setSorting] = useState<SortingState>([]);
  const navigate = useNavigate();

  const handleAnalyze = (id: string) => {
    analyzeMutation.mutate(id);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure? This action cannot be undone.')) {
        deleteMutation.mutate(id);
    }
  };

  const handleDeleteAll = () => {
    if (confirm('Delete ALL submissions? This helps clean up but is irreversible.')) {
        deleteAllMutation.mutate();
    }
  };

  const columns = [
    columnHelper.accessor('title', {
      header: 'Title',
      cell: info => (
          <div className="font-semibold text-foreground">{info.getValue()}</div>
      ),
    }),
    columnHelper.accessor('content_type', {
      header: 'Type',
      cell: info => {
        const type = info.getValue();
        return (
            <div className="flex items-center gap-2">
                {type === 'html' || type === 'code' ? <LucideFileCode className="w-4 h-4 text-orange-500" /> : <LucideFileText className="w-4 h-4 text-blue-500" />}
                <span className="uppercase text-xs font-bold text-muted-foreground">{type}</span>
            </div>
        )
      },
    }),
    columnHelper.accessor('status', {
        header: 'Status',
        cell: info => {
            const status = info.getValue();
            const colors: any = {
                uploaded: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                analyzing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
                analyzed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            };
            return (
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
                    {status}
                </span>
            )
        }
    }),
    columnHelper.accessor('submitted_at', {
        header: 'Date',
        cell: info => <span className="text-muted-foreground text-sm">{format(new Date(info.getValue()), 'MMM d, yyyy')}</span>
    }),
    columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: info => {
            const submission = info.row.original;
            return (
                <div className="flex items-center gap-2">
                    {/* Analyze Button */}
                    {(submission.status === 'uploaded' || submission.status === 'pending') && (
                        <button 
                            onClick={() => handleAnalyze(submission.id)}
                            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-colors"
                            title="Run Analysis"
                            disabled={analyzeMutation.isPending}
                        >
                            {analyzeMutation.isPending ? <LucideLoader2 className="w-4 h-4 animate-spin" /> : <LucidePlay className="w-4 h-4" />}
                        </button>
                    )}
                    
                    {/* View Results */}
                    {(submission.status === 'analyzed' || submission.status === 'completed') && (
                         <button 
                            onClick={() => navigate(`/tools/results/${submission.id}`)}
                            className="text-xs font-bold text-primary hover:underline"
                        >
                            View Report
                        </button>
                    )}

                    {/* Delete */}
                    <button 
                        onClick={() => handleDelete(submission.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-lg transition-colors"
                    >
                        <LucideTrash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    })
  ];

  const table = useReactTable({
    data: submissions,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) return <div className="flex items-center justify-center h-64"><LucideLoader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  
  if (error) return (
    <div className="flex flex-col items-center justify-center p-12 bg-red-50 dark:bg-red-900/10 rounded-3xl border border-red-100 dark:border-red-900/30">
        <LucideAlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Failed to load submissions</h3>
        <p className="text-red-600 dark:text-red-300">Please try again later.</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-foreground tracking-tight">Submissions</h1>
           <p className="text-muted-foreground mt-1">Manage and track your compliance audits.</p>
        </div>
        <div className="flex items-center gap-3">
            {submissions.length > 0 && (
                <button 
                    onClick={handleDeleteAll}
                    disabled={deleteAllMutation.isPending}
                    className="text-red-500 hover:text-red-600 text-sm font-semibold px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                >
                    {deleteAllMutation.isPending ? 'Deleting...' : 'Delete All'}
                </button>
            )}
             <ShinyButton onClick={() => navigate('/tools/upload')} className="px-6 py-2">
                New Upload
            </ShinyButton>
        </div>
      </div>

      <RevealOnScroll>
      <div className="rounded-3xl border border-surface-200 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-sm overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
            <thead className="bg-surface-50/50 dark:bg-white/5 border-b border-surface-200 dark:border-white/5">
                {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                            <th key={header.id} className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                <div 
                                    className={`flex items-center gap-2 cursor-pointer select-none hover:text-foreground ${header.column.getCanSort() ? 'cursor-pointer' : ''}`}
                                    onClick={header.column.getToggleSortingHandler()}
                                >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {{
                                        asc: <LucideArrowUpDown className="w-3 h-3 rotate-180" />,
                                        desc: <LucideArrowUpDown className="w-3 h-3" />,
                                    }[header.column.getIsSorted() as string] ?? null}
                                </div>
                            </th>
                        ))}
                    </tr>
                ))}
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-white/5">
                {table.getRowModel().rows.length > 0 ? (
                    table.getRowModel().rows.map(row => (
                        <tr key={row.id} className="hover:bg-surface-50 dark:hover:bg-white/5 transition-colors group">
                            {row.getVisibleCells().map(cell => (
                                <td key={cell.id} className="p-4 text-sm">
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={columns.length} className="p-12 text-center text-muted-foreground">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-surface-100 dark:bg-white/5 flex items-center justify-center">
                                    <LucideFileText className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <p>No submissions found</p>
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
      </div>
      </RevealOnScroll>
    </div>
  );
}
