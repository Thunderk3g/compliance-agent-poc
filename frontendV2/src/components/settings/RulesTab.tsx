
import { useDeleteRule, useRules, useRuleStats, useUpdateRule } from '@/hooks/useRules';
import { LucideSearch } from 'lucide-react';
import { useState } from 'react';
import { RulesStats } from './RulesStats';
import { RulesTable } from './RulesTable';
import { RuleUpload } from './RuleUpload';

export default function RulesTab() {
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  // Queries
  const { data: rulesData, isLoading: rulesLoading } = useRules({
    page,
    page_size: 20,
    is_active: activeTab === 'active',
    search: search || undefined
  });

  const { data: statsData, isLoading: statsLoading } = useRuleStats();

  // Mutations
  const updateMutation = useUpdateRule();
  const deleteMutation = useDeleteRule();

  const handleEdit = (rule: any) => {
    // TODO: Implement Edit Modal
    console.log('Edit rule', rule);
    alert('Edit functionality coming soon');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to deactivate this rule?')) {
        deleteMutation.mutate(id);
    }
  };

  const handleRestore = (id: string) => {
      updateMutation.mutate({ id, updates: { is_active: true } });
  };

  return (
    <div className="space-y-8 animate-fade-in">
        {/* Stats */}
        <RulesStats stats={statsData || null} isLoading={statsLoading} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Controls */}
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white dark:bg-card p-4 rounded-xl border border-surface-200 dark:border-white/5 shadow-sm">
                    <div className="flex bg-surface-100 dark:bg-white/5 p-1 rounded-lg">
                        <button 
                            onClick={() => { setActiveTab('active'); setPage(1); }}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'active' ? 'bg-white dark:bg-white/10 text-primary dark:text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Active Rules
                        </button>
                        <button 
                            onClick={() => { setActiveTab('inactive'); setPage(1); }}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${activeTab === 'inactive' ? 'bg-white dark:bg-white/10 text-primary dark:text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Inactive Rules
                        </button>
                    </div>

                    <div className="relative w-full md:w-64">
                        <LucideSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input 
                            type="text" 
                            placeholder="Search rules..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-surface-50 dark:bg-white/5 border border-surface-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground"
                        />
                    </div>
                </div>

                {/* Table */}
                <RulesTable 
                    rules={rulesData?.rules || []} 
                    isLoading={rulesLoading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onRestore={handleRestore}
                    showRestore={activeTab === 'inactive'}
                />

                {/* Pagination Controls */}
                 <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <div>
                       Showing {(rulesData?.rules?.length || 0)} of {rulesData?.total || 0} rules
                    </div>
                    <div className="flex gap-2">
                        <button 
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="px-3 py-1 bg-white dark:bg-white/5 border border-surface-200 dark:border-white/10 rounded-lg disabled:opacity-50 hover:bg-surface-50 dark:hover:bg-white/10 transition-colors"
                        >
                            Previous
                        </button>
                        <button 
                            disabled={page >= (rulesData?.total_pages || 1)}
                            onClick={() => setPage(p => p + 1)}
                            className="px-3 py-1 bg-white dark:bg-white/5 border border-surface-200 dark:border-white/10 rounded-lg disabled:opacity-50 hover:bg-surface-50 dark:hover:bg-white/10 transition-colors"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Sidebar / Upload */}
            <div className="space-y-6">
                 {activeTab === 'active' && <RuleUpload onSuccess={() => { /* maybe refresh queries */ }} />}
                 
                 <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Help & Tips</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-400 leading-relaxed">
                        Upload compliance documents (PDF/DOCX) to automatically generate new rules. You can review and edit them before they go live.
                    </p>
                 </div>
            </div>
        </div>
    </div>
  );
}

