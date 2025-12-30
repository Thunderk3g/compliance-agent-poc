import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Sparkles,
  Upload as UploadIcon,
  X,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function SubmissionPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectId = searchParams.get('projectId');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // UI state
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // File type helpers
  const getFileIcon = (type: string) => {
    const iconClass = 'w-12 h-12';
    switch (type) {
      case 'html':
        return <FileText className={`${iconClass} text-blue-500`} />;
      case 'markdown':
        return <FileText className={`${iconClass} text-indigo-500`} />;
      case 'pdf':
        return <FileText className={`${iconClass} text-red-500`} />;
      case 'docx':
        return <FileText className={`${iconClass} text-blue-600`} />;
      default:
        return <FileText className={`${iconClass} text-muted-foreground`} />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Drag and drop handlers
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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
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
    },
    [contentType]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!contentType && fileExt) {
        setContentType(fileExt === 'md' ? 'markdown' : fileExt);
      }
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
      setError('Please fill all required fields');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content_type', contentType);
      formData.append('file', file);
      if (projectId) {
        formData.append('project_id', projectId);
      }

      await api.uploadSubmission(formData);
      setSuccess(true);

      // Navigate after brief delay
      setTimeout(() => {
        if (projectId) {
          navigate(`/projects/${projectId}/dashboard`);
        } else {
          navigate('/dashboard');
        }
      }, 1500);
    } catch (error: any) {
      console.error('Upload failed:', error);
      setError(error.response?.data?.detail || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const canSubmit = title.trim() !== '' && contentType !== '' && file !== null;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <Sparkles className="w-6 h-6 text-indigo-500" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Upload Content</h1>
          </div>
          <p className="text-muted-foreground">
            Upload your marketing content for AI-powered compliance analysis
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Upload Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Content Details</CardTitle>
                <CardDescription>Provide information about your content</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title Input */}
                  <Input
                    label="Content Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Q4 Life Insurance Campaign"
                    required
                  />

                  {/* Content Type Select */}
                  <div>
                    <label
                      htmlFor="content-type"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Content Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="content-type"
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value)}
                      required
                      className="w-full px-4 py-3 border-2 border-input rounded-lg bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 outline-none transition-all"
                    >
                      <option value="">Select content type</option>
                      <option value="html">HTML</option>
                      <option value="markdown">Markdown</option>
                      <option value="pdf">PDF</option>
                      <option value="docx">DOCX</option>
                    </select>
                  </div>

                  {/* File Upload Area */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Upload File <span className="text-red-500">*</span>
                    </label>
                    <div
                      onDragEnter={handleDragEnter}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`relative border-2 border-dashed rounded-xl p-8 transition-all ${
                        isDragging
                          ? 'border-indigo-500 bg-indigo-500/5 scale-[1.02]'
                          : file
                          ? 'border-emerald-500 bg-emerald-500/5'
                          : 'border-border hover:border-foreground/50'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        id="file"
                        type="file"
                        onChange={handleFileSelect}
                        accept=".html,.md,.pdf,.docx"
                        required
                        className="hidden"
                      />

                      {!file ? (
                        <div className="text-center">
                          <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                              <UploadIcon className="w-8 h-8 text-muted-foreground" />
                            </div>
                          </div>
                          <p className="text-lg font-semibold text-foreground mb-2">
                            Drag & drop your file here
                          </p>
                          <p className="text-sm text-muted-foreground mb-4">or</p>
                          <Button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                          >
                            Browse Files
                          </Button>
                          <p className="text-xs text-muted-foreground mt-4">
                            Supported: HTML, Markdown, PDF, DOCX (Max 50MB)
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {getFileIcon(contentType)}
                            <div>
                              <p className="font-semibold text-foreground">{file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeFile}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5 text-red-500" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <p className="text-sm text-red-500">{error}</p>
                    </motion.div>
                  )}

                  {/* Success Message */}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 bg-emerald-500/10 border border-emerald-500/50 rounded-lg flex items-center gap-3"
                    >
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <p className="text-sm text-emerald-500">
                        Upload successful! Redirecting...
                      </p>
                    </motion.div>
                  )}

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={!canSubmit || uploading}
                    isLoading={uploading}
                    className="w-full"
                  >
                    {uploading ? (
                      'Uploading...'
                    ) : (
                      <>
                        <UploadIcon className="w-5 h-5" />
                        Upload Content
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Info Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            {/* What We Check Card */}
            <Card className="bg-indigo-500/5 border-indigo-500/20">
              <CardHeader>
                <CardTitle className="text-lg">What We Check</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">IRDAI Regulations</p>
                    <p className="text-sm text-muted-foreground">50% weight</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">Brand Guidelines</p>
                    <p className="text-sm text-muted-foreground">30% weight</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-foreground">SEO Best Practices</p>
                    <p className="text-sm text-muted-foreground">20% weight</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tips Card */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    Ensure your content is complete before uploading
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    Analysis typically takes 10-30 seconds
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    You'll receive detailed violation reports
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <p className="text-muted-foreground">
                    AI-powered suggestions for fixes included
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* AI-Powered Card */}
            <Card className="bg-card border-border">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-indigo-500" />
                </div>
                <p className="font-semibold text-foreground mb-1">AI-Powered Analysis</p>
                <p className="text-xs text-muted-foreground">
                  Intelligent compliance checking with advanced AI models
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
