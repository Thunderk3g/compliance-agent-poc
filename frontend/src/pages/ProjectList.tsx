import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Calendar, Folder, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreateProjectDialog } from '../components/projects/CreateProjectDialog';
import { useQuery, useMutation } from '@apollo/client';
import { GET_PROJECTS, DELETE_PROJECT } from '../lib/queries';
import { useAuth } from '../contexts/AuthContext';

export default function ProjectList() {
    const { loading, error, data, refetch } = useQuery(GET_PROJECTS);
    const [deleteProject] = useMutation(DELETE_PROJECT, {
        onCompleted: () => refetch()
    });
    const { logout, currentUser } = useAuth();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const handleDeleteProject = async (e: React.MouseEvent, projectId: string) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
            return;
        }

        try {
            await deleteProject({ variables: { id: projectId } });
        } catch (err) {
            console.error("Failed to delete project:", err);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
                    <p className="text-gray-600 mt-2">Manage your compliance workspaces</p>
                    {currentUser && <p className="text-sm text-blue-600 mt-1">Logged in as: {currentUser.email}</p>}
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={logout}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Logout
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                    >
                        <Plus className="w-5 h-5" />
                        New Project
                    </button>
                </div>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-100">
                    {error.message}
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
                    {data?.projects?.map((project: any) => (
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
                                        <button
                                            onClick={(e) => handleDeleteProject(e, project.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-10"
                                            title="Delete Project"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
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

            {!loading && (!data?.projects || data.projects.length === 0) && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No projects found. Create one to get started!</p>
                </div>
            )}

            <CreateProjectDialog
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onProjectCreated={refetch}
            />
        </div>
    );
}
