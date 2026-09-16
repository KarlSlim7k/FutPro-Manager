export default function PublicLeagueLoading() {
  return (
    <main className="w-full">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 rounded bg-white/10" />
            <div className="h-8 w-24 rounded bg-white/10" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-xl bg-white/10" />
            <div className="space-y-2">
              <div className="h-7 w-48 rounded bg-white/10 sm:w-64" />
              <div className="h-4 w-32 rounded bg-white/10" />
            </div>
          </div>
        </div>

        {/* Nav Skeleton */}
        <div className="flex flex-wrap gap-2 border-b border-white/10 pb-1">
          <div className="h-8 w-20 rounded-t-lg bg-white/10" />
          <div className="h-8 w-36 rounded-t-lg bg-white/10" />
          <div className="h-8 w-20 rounded-t-lg bg-white/10" />
          <div className="h-8 w-20 rounded-t-lg bg-white/10" />
        </div>

        {/* Content Skeleton Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-2xl border border-white/10 bg-slate-900/60 p-4 space-y-2">
              <div className="h-3 w-16 rounded bg-white/10" />
              <div className="h-5 w-24 rounded bg-white/10" />
            </div>
          ))}
        </div>

        {/* Main Section Skeleton */}
        <div className="space-y-4">
          <div className="h-48 rounded-2xl border border-white/10 bg-slate-900/60 p-6 space-y-4">
            <div className="h-5 w-40 rounded bg-white/10" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-white/5" />
              <div className="h-4 w-5/6 rounded bg-white/5" />
              <div className="h-4 w-4/6 rounded bg-white/5" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
