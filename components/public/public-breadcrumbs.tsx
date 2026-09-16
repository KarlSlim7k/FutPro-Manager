import Link from "next/link";
import { cn } from "@/lib/utils";

type BreadcrumbItem = { label: string; href?: string };

export function PublicBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-gray-400">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden="true" className="text-gray-600">/</span>}
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  "transition hover:text-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded",
                  i === items.length - 1 ? "font-semibold text-white" : "hover:underline"
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span className={cn(i === items.length - 1 ? "font-semibold text-white" : "text-gray-400")}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
