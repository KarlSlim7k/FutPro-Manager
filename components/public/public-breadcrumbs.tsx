import Link from "next/link";
import { cn } from "@/lib/utils";

type BreadcrumbItem = { label: string; href?: string };

export function PublicBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden="true" className="text-gray-300">/</span>}
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  "transition hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-1",
                  i === items.length - 1 ? "font-medium text-gray-900" : "hover:underline"
                )}
              >
                {item.label}
              </Link>
            ) : (
              <span className={cn(i === items.length - 1 && "font-medium text-gray-900")}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
