
import { RevealOnScroll } from '@/components/react-bits/RevealOnScroll';
import { ShinyButton } from '@/components/react-bits/ShinyButton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from '@/lib/utils';
import {
    AlertCircle,
    CheckCircle2,
    File,
    FileCode,
    FileText,
    FileType,
    Loader2,
    Sparkles,
    Upload as UploadIcon,
    X
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UploadPage() {
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'html': return <FileCode className="w-8 h-8 text-orange-500" />;
      case 'markdown': return <FileText className="w-8 h-8 text-blue-500" />;
      case 'pdf': return <FileText className="w-8 h-8 text-red-500" />;
      case 'docx': return <File className="w-8 h-8 text-blue-600" />;
      default: return <FileType className="w-8 h-8 text-muted-foreground" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      const fileExt = droppedFile.name.split('.').pop()?.toLowerCase();
      if (['html', 'md', 'pdf', 'docx'].includes(fileExt || '')) {
        setFile(droppedFile);
        if (!contentType) {
          setContentType(fileExt === 'md' ? 'markdown' : fileExt || '');
        }
        setError(null);
      } else {
        setError('Please upload HTML, Markdown, PDF, or DOCX files only');
      }
    }
  }, [contentType]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!file || !title || !contentType) {
      setError('Please fill all fields');
      return;
    }

    setUploading(true);

    // Simulator API Call
    setTimeout(() => {
      setUploading(false);
      setSuccess(true);
      setTimeout(() => {
          // Navigate to Tools overview
          navigate('/tools');
      }, 1500);
    }, 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-foreground tracking-tight">New Submission</h1>
           <p className="text-muted-foreground mt-1">Upload content for AI-powered compliance analysis.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
            <RevealOnScroll>
            <div className="p-8 rounded-3xl bg-white dark:bg-card border border-surface-200 dark:border-white/5 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-semibold text-foreground ml-1">Title</label>
                            <input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Summer Campaign v1"
                                className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/20 border border-surface-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50 text-foreground shadow-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="type" className="text-sm font-semibold text-foreground ml-1">Content Type</label>
                             <Select value={contentType} onValueChange={setContentType}>
                                <SelectTrigger className="w-full h-[50px] rounded-xl bg-white dark:bg-black/20 border-surface-200 dark:border-white/10 shadow-sm">
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-slate-900 border-surface-200 dark:border-white/10">
                                    <SelectItem value="html">HTML</SelectItem>
                                    <SelectItem value="markdown">Markdown</SelectItem>
                                    <SelectItem value="pdf">PDF</SelectItem>
                                    <SelectItem value="docx">DOCX</SelectItem>
                                </SelectContent>
                             </Select>
                        </div>
                    </div>

                    {/* Drag Drop Zone */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground ml-1">File Upload</label>
                        <div
                            onDragEnter={handleDragEnter}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={cn(
                                "relative group border-2 border-dashed rounded-2xl p-10 transition-all duration-300 text-center cursor-pointer bg-surface-50/50 dark:bg-white/5",
                                isDragging 
                                    ? "border-primary bg-primary/5 scale-[1.01]" 
                                    : file 
                                        ? "border-green-500/50 bg-green-500/5" 
                                        : "border-surface-200 dark:border-white/10 bg-surface-50/50 dark:bg-white/5 hover:border-primary/50 hover:bg-surface-50 dark:hover:bg-white/5"
                            )}
                            onClick={() => !file && fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                accept=".html,.md,.pdf,.docx"
                                onChange={handleFileSelect}
                            />
                            
                            {!file ? (
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-white/5 text-primary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <UploadIcon className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-lg font-semibold text-foreground">Click to upload or drag and drop</p>
                                        <p className="text-sm text-muted-foreground">HTML, Markdown, PDF, DOCX (Max 10MB)</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between pointer-events-none">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-surface-100 dark:border-white/5">
                                            {getFileIcon(contentType)}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-foreground text-lg">{file.name}</p>
                                            <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                                        </div>
                                    </div>
                                    <div className="pointer-events-auto" onClick={(e) => { e.stopPropagation(); removeFile(); }}>
                                        <button type="button" className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 rounded-full transition-colors">
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Messages */}
                    {error && (
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    {success && (
                         <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30 flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                            <p className="text-sm font-medium">Upload successful! Analysis started.</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="pt-4">
                         <ShinyButton 
                            className="w-full py-4 text-lg font-bold shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-shadow active:scale-[0.98]" 
                            disabled={uploading || !file || !title || !contentType}
                            type="submit"
                        >
                            {uploading ? (
                                <div className="flex items-center  gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" /> Uploading...
                                </div>
                            ) : (
                                "Start Compliance Analysis"
                            )}
                        </ShinyButton>
                    </div>
                </form>
            </div>
            </RevealOnScroll>
        </div>

            {/* Sidebar Help */}
        <div className="space-y-6">
            <RevealOnScroll delay={0.1}>
            <div className="p-6 rounded-3xl bg-primary text-white shadow-xl shadow-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-6 border border-white/10">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                     <h3 className="text-xl font-bold mb-2">Automated Analysis</h3>
                     <p className="opacity-90 leading-relaxed text-sm text-white/90">
                        Our AI engine scans your content against IRDAI regulations, brand guidelines, and SEO best practices instantly.
                     </p>
                </div>
            </div>
            </RevealOnScroll>

            <RevealOnScroll delay={0.2}>
            <div className="p-6 rounded-3xl bg-white dark:bg-card border border-surface-200 dark:border-white/5 shadow-sm">
                <h3 className="font-bold text-foreground mb-4">What we check</h3>
                <div className="space-y-4">
                     <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0 text-xs font-bold">1</div>
                        <div>
                             <p className="font-semibold text-sm text-foreground">IRDAI Guidelines</p>
                             <p className="text-xs text-muted-foreground">Compliance with localized regulations</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 flex-shrink-0 text-xs font-bold">2</div>
                        <div>
                             <p className="font-semibold text-sm text-foreground">Brand Voice</p>
                             <p className="text-xs text-muted-foreground">Tone, terminology and style checks</p>
                        </div>
                     </div>
                     <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 flex-shrink-0 text-xs font-bold">3</div>
                        <div>
                             <p className="font-semibold text-sm text-foreground">Disclaimers</p>
                             <p className="text-xs text-muted-foreground">Required legal text presence</p>
                        </div>
                     </div>
                </div>
            </div>
            </RevealOnScroll>
        </div>
      </div>
    </div>
  );
}
