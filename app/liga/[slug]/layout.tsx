import { PublicFooter } from "@/components/public/public-footer";

export default function LeaguePublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col justify-between">
      <div className="flex-1">{children}</div>
      <PublicFooter />
    </div>
  );
}
