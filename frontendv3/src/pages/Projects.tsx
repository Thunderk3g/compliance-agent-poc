import { useProjects } from "@/services/projects";
import dayjs from "dayjs";
import { FolderPlus, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { StackedCard } from "../components/ui/stacked-card";

export default function Projects() {
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useProjects();

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your compliance projects and guidelines
          </p>
        </div>
        <Button onClick={() => navigate("/onboarding/flow")}>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border rounded">
          <FolderPlus className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-6">
            Create your first project to get started
          </p>
          <Button onClick={() => navigate("/onboarding/flow")}>
            <Plus className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: any) => (
            <StackedCard
              key={project.id}
              stackColor="bg-primary/10"
              interactive
              onClick={() => navigate(`/projects/${project.id}/dashboard`)}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                    <FolderPlus className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {dayjs(project.created_at).format("MMM D, YYYY")}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-semibold line-clamp-1">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span>Active</span>
                  </div>
                  {project.guidelines_count > 0 && (
                    <div>
                      {project.guidelines_count} guideline
                      {project.guidelines_count !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </div>
            </StackedCard>
          ))}
        </div>
      )}
    </div>
  );
}
