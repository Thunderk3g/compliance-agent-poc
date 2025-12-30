import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { useProjects } from '@/services/projects';
import { motion } from 'framer-motion';
import { Calendar, Folder, Plus, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Project {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export default function ProjectsPage() {
  const { data: projects = [], isLoading, error } = useProjects();


  return (
    <div className="flex min-h-[calc(100vh-108px)]">
      {/* Left Sidebar - Analytics */}
      <div className="w-80 border-r border-zinc-800 p-6 space-y-6">
        {/* Usage Section */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Usage</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Last 30 days</span>
              <button className="px-2 py-1 bg-zinc-900 text-white rounded text-xs hover:bg-zinc-800 transition-colors">
                Upgrade
              </button>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-zinc-700" />
                <span className="text-xs text-zinc-400 flex-1">Fast Data Transfer</span>
                <span className="text-xs text-zinc-500">0 / 100 GB</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-zinc-700" />
                <span className="text-xs text-zinc-400 flex-1">Fast Origin Transfer</span>
                <span className="text-xs text-zinc-500">0 / 10 GB</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-zinc-700" />
                <span className="text-xs text-zinc-400 flex-1">Edge Requests</span>
                <span className="text-xs text-zinc-500">0 / 1M</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-zinc-700" />
                <span className="text-xs text-zinc-400 flex-1">Edge Request CPU Duration</span>
                <span className="text-xs text-zinc-500">0 / 1M</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Section */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Alerts</h3>
          <Card className="bg-zinc-900 border-zinc-800 p-4">
            <h4 className="text-sm font-medium text-white mb-2">Get started for anomalies</h4>
            <p className="text-xs text-zinc-400 mb-3">
              Automatically monitor your projects for anomalies and get notified.
            </p>
            <Button variant="outline" size="sm" className="w-full">
              Upgrade to Observability Plus
            </Button>
          </Card>
        </div>

        {/* Recent Previews */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-3">Recent Previews</h3>
          <div className="flex items-center justify-center h-32 border border-dashed border-zinc-800 rounded-lg">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-zinc-900 flex items-center justify-center">
                <Folder className="w-5 h-5 text-zinc-600" />
              </div>
              <p className="text-xs text-zinc-500">
                Preview deployments that you have
                <br />
                recently visited or created will appear here.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Main Area - Projects */}
      <div className="flex-1 p-6">
        <div className="max-w-5xl mx-auto">
          {/* Search and Controls */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search Projects..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Link to="/onboarding">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Create New Project
              </Button>
            </Link>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-900/20 border border-red-800 text-red-400 rounded-lg">
              Failed to load projects. Please try again.
            </div>
          )}

          {/* Projects Grid */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Create New Project Card */}
              <Link to="/onboarding">
                <Card className="h-[200px] bg-zinc-900 border-zinc-800 border-2 border-dashed hover:border-blue-500 hover:bg-zinc-800 transition-all cursor-pointer flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Plus className="w-6 h-6 text-blue-500" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">Create New Project</h3>
                    <p className="text-xs text-zinc-400">Start a new compliance workspace</p>
                  </div>
                </Card>
              </Link>

              {/* Project Cards */}
              {projects.map((project) => (
                <Link key={project.id} to={`/projects/${project.id}/dashboard`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="h-[200px] bg-zinc-900 border-zinc-800 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Folder className="w-5 h-5 text-blue-500" />
                          </div>
                        </div>
                        <CardTitle className="text-lg group-hover:text-blue-500 transition-colors">
                          {project.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-2">
                          {project.description || 'No description provided'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center text-xs text-zinc-500">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(project.created_at).toLocaleDateString()}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && projects.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-900 flex items-center justify-center">
                <Folder className="w-8 h-8 text-zinc-600" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">No projects yet</h2>
              <p className="text-zinc-400 mb-6">
                Create your first compliance project to get started.
              </p>
              <Link to="/onboarding">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Project
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
