import Link from "next/link";
import { Clock, BookOpen, ArrowRight } from "lucide-react";
import type { Tutorial } from "@/types/database";
import { APP_ROLE_LABELS } from "@/lib/tutorials/roles";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";

export interface TutorialCardProps {
  tutorial: Tutorial;
}

export function TutorialCard({ tutorial }: TutorialCardProps) {
  return (
    <Card className="flex flex-col justify-between transition-shadow hover:shadow-md">
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          {tutorial.target_roles.map((role) => (
            <StatusBadge
              key={role}
              variant={role === "viewer" ? "neutral" : "info"}
              className="text-[11px] py-0.5 px-2"
            >
              {APP_ROLE_LABELS[role] ?? role}
            </StatusBadge>
          ))}
          {tutorial.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-flex rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600"
            >
              #{tag}
            </span>
          ))}
        </div>

        <CardHeader className="p-0">
          <CardTitle className="text-lg">
            <Link
              href={`/dashboard/ayuda/${tutorial.slug}`}
              className="rounded outline-none focus-visible:ring-2 focus-visible:ring-blue-500 hover:text-blue-600 transition-colors"
            >
              {tutorial.title}
            </Link>
          </CardTitle>
          <CardDescription className="mt-1.5 line-clamp-2">
            {tutorial.summary}
          </CardDescription>
        </CardHeader>
      </div>

      <CardContent className="mt-4 flex items-center justify-between border-t border-gray-100 p-0 pt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
          <span>{tutorial.estimated_minutes} min lectura</span>
        </div>

        <Link
          href={`/dashboard/ayuda/${tutorial.slug}`}
          className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800 rounded outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Ver guía</span>
          <ArrowRight className="h-3 w-3 ml-0.5" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  );
}
