import Link from "next/link";
import { Activity, FileText, Sparkles, Workflow } from "lucide-react";
import { Card } from "@/components/ui/card";
import { OptionBadge } from "@/components/shared/option-badge";
import { projectStatusMap, projectTypeMap } from "@/lib/constants";
import type { ProjectListItem } from "@/db/queries/projects";

export function ProjectCard({ project }: { project: ProjectListItem }) {
  return (
    <Link href={`/projects/${project.slug}`}>
      <Card className="group gap-0 overflow-hidden p-0 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
        <div className="h-1.5" style={{ backgroundColor: project.color }} />
        <div className="p-4">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full" style={{ backgroundColor: project.color }} />
            <h3 className="truncate font-medium transition-colors group-hover:text-primary">{project.name}</h3>
          </div>
          {project.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <OptionBadge option={projectTypeMap[project.type]} withIcon={false} />
            <OptionBadge option={projectStatusMap[project.status]} withIcon={false} />
          </div>
          <div className="mt-3 flex items-center gap-4 border-t pt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Sparkles className="size-3.5" /> {project.promptCount}</span>
            <span className="flex items-center gap-1"><Workflow className="size-3.5" /> {project.workflowCount}</span>
            <span className="flex items-center gap-1"><FileText className="size-3.5" /> {project.noteCount}</span>
            <span className="flex items-center gap-1"><Activity className="size-3.5" /> {project.runCount}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
