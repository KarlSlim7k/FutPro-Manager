export default function PublicLeagueLoading() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-gray-100">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-28 rounded bg-gray-200" />
            <div className="h-8 w-24 rounded bg-gray-200" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-lg bg-gray-200" />
            <div className="space-y-2">
              <div className="h-7 w-48 rounded bg-gray-200 sm:w-64" />
              <div className="h-4 w-32 rounded bg-gray-200" />
            </div>
          </div>
        </div>

        {/* Nav Skeleton */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200 pb-1">
          <div className="h-8 w-20 rounded bg-gray-200" />
          <div className="h-8 w-36 rounded bg-gray-200" />
          <div className="h-8 w-20 rounded bg-gray-200" />
          <div className="h-8 w-20 rounded bg-gray-200" />
        </div>

        {/* Content Skeleton Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-xl border border-gray-200 bg-white p-4 space-y-2">
              <div className="h-3 w-16 rounded bg-gray-200" />
              <div className="h-5 w-24 rounded bg-gray-200" />
            </div>
          ))}
        </div>

        {/* Main Section Skeleton */}
        <div className="space-y-4">
          <div className="h-48 rounded-xl border border-gray-200 bg-white p-6 space-y-4">
            <div className="h-5 w-40 rounded bg-gray-200" />
            <div className="space-y-2">
              <div className="h-4 w-full rounded bg-gray-100" />
              <div className="h-4 w-5/6 rounded bg-gray-100" />
              <div className="h-4 w-4/6 rounded bg-gray-100" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
