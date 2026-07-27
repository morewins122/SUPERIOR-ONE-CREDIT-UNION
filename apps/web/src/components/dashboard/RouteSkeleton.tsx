type RouteSkeletonProps = {
  variant: "dashboard" | "checking" | "transactions" | "statements" | "pay-transfer" | "generic";
};

function Shimmer({ className }: { className: string }) {
  return <div className={`skeleton-shimmer ${className}`} />;
}

export function RouteSkeleton({ variant }: RouteSkeletonProps) {
  if (variant === "transactions") {
    return (
      <section className="space-y-4">
        <Shimmer className="h-10 w-64 rounded-xl" />
        <Shimmer className="h-24 w-full rounded-2xl" />
        <Shimmer className="h-24 w-full rounded-2xl" />
        <Shimmer className="h-80 w-full rounded-2xl" />
      </section>
    );
  }

  if (variant === "statements") {
    return (
      <section className="space-y-4">
        <Shimmer className="h-10 w-64 rounded-xl" />
        <div className="panel rounded-2xl p-5 text-sm font-semibold text-slate-500">Loading Statements...</div>
        <Shimmer className="h-72 w-full rounded-2xl" />
      </section>
    );
  }

  if (variant === "pay-transfer") {
    return (
      <section className="space-y-4">
        <Shimmer className="h-10 w-56 rounded-xl" />
        <Shimmer className="h-36 w-full rounded-2xl" />
        <Shimmer className="h-56 w-full rounded-2xl" />
      </section>
    );
  }

  if (variant === "checking") {
    return (
      <section className="space-y-4">
        <Shimmer className="h-10 w-48 rounded-xl" />
        <div className="grid gap-4 md:grid-cols-4">
          <Shimmer className="h-28 w-full rounded-2xl" />
          <Shimmer className="h-28 w-full rounded-2xl" />
          <Shimmer className="h-28 w-full rounded-2xl" />
          <Shimmer className="h-28 w-full rounded-2xl" />
        </div>
        <Shimmer className="h-80 w-full rounded-2xl" />
      </section>
    );
  }

  if (variant === "dashboard") {
    return (
      <section className="space-y-4">
        <Shimmer className="h-48 w-full rounded-3xl" />
        <Shimmer className="h-44 w-full rounded-2xl" />
        <Shimmer className="h-80 w-full rounded-2xl" />
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <Shimmer className="h-10 w-52 rounded-xl" />
      <Shimmer className="h-40 w-full rounded-2xl" />
      <Shimmer className="h-72 w-full rounded-2xl" />
    </section>
  );
}
