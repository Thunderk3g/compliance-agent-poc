import React, { useEffect, useState } from 'react';
import { Plus, Folder, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Project } from '../lib/types';
import { CreateProjectDialog } from '../components/projects/CreateProjectDialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ProjectList() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const response = await api.getProjects();
            setProjects(response.data);
            setError(null);
        } catch (err) {
            console.error("Failed to load projects:", err);
            setError("Failed to load projects.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
                    <p className="text-gray-600 mt-2">Manage your compliance workspaces</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                    <Plus className="w-5 h-5" />
                    New Project
                </button>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Create New Card */}
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="group flex flex-col items-center justify-center p-8 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 h-[200px]"
                    >
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-full group-hover:scale-110 transition-transform mb-4">
                            <Plus className="w-6 h-6" />
                        </div>
                        <span className="font-semibold text-gray-900">Create New Project</span>
                        <span className="text-sm text-gray-500 mt-1">Start a new compliance workspace</span>
                    </button>

                    {/* Project Cards */}
                    {projects.map((project) => (
                        <Link
                            key={project.id}
                            to={`/projects/${project.id}`}
                            className="block group"
                        >
                            <Card className="h-[200px] hover:shadow-lg transition-all duration-300 border-gray-200 group-hover:border-blue-200 relative overflow-hidden">
                                <div className="absolute top-0 right-[-10px] w-24 h-24 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500" />

                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg mb-2">
                                            <Folder className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                                        {project.name}
                                    </CardTitle>
                                    <CardDescription className="line-clamp-2">
                                        {project.description || "No description provided"}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent>
                                    <div className="flex items-center text-sm text-gray-500 mt-auto pt-4">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'Unknown date'}

                                        <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                                            <ArrowRight className="w-5 h-5 text-blue-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}

            {!loading && projects.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No projects found. Create one to get started!</p>
                </div>
            )}

            <CreateProjectDialog
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onProjectCreated={fetchProjects}
            />
        </div>
    );
}
