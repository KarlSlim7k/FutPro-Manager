import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { createClient } from "@/lib/supabase/server";
import { CreatePlanForm } from "@/components/subscriptions/create-plan-form";
import { PlanToggleButton } from "@/components/subscriptions/plan-toggle-button";
import { AssignSubscriptionForm } from "@/components/subscriptions/assign-subscription-form";

export default async function SubscriptionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("profiles").select("global_role").eq("id", user.id).maybeSingle();

  if (profile?.global_role !== "super_admin") {
    return (
      <section className="space-y-6">
        <PageHeader backHref="/dashboard" backLabel="Volver al panel" title="Suscripciones" description="Planes y suscripciones de ligas" />
        <Card>
          <CardHeader>
            <CardTitle>Acceso restringido</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">Solo super_admin puede gestionar suscripciones.</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  const [{ data: plans }, { data: leagues }, { data: subscriptions }] = await Promise.all([
    supabase.from("subscription_plans").select("id, name, slug, price_monthly, currency, is_active").order("price_monthly", { ascending: true }),
    supabase.from("leagues").select("id, name, slug").order("name", { ascending: true }),
    supabase
      .from("league_subscriptions")
      .select("id, league_id, plan_id, status, created_at")
      .in("status", ["trialing", "active", "past_due"])
      .order("created_at", { ascending: false }),
  ]);

  const planList = plans ?? [];
  const leagueList = leagues ?? [];
  const activeSubs = subscriptions ?? [];
  const subByLeague = new Map(activeSubs.map((s) => [s.league_id as string, s]));
  const planById = new Map(planList.map((p) => [p.id as string, p]));

  return (
    <section className="space-y-6">
      <PageHeader
        backHref="/dashboard"
        backLabel="Volver al panel"
        title="Suscripciones"
        description="Planes comerciales y asignación por liga (solo super_admin)."
      />

      <Card>
        <CardHeader>
          <CardTitle>Planes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {planList.length === 0 ? (
            <EmptyState title="Sin planes" description="Crea el primer plan comercial." />
          ) : (
            <ul className="space-y-2">
              {planList.map((plan) => (
                <li key={plan.id as string} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm">
                  <span className="font-medium text-gray-900">{plan.name as string}</span>
                  <span className="text-gray-500">
                    {Number(plan.price_monthly).toFixed(2)} {plan.currency as string}
                  </span>
                  <StatusBadge variant={plan.is_active ? "success" : "neutral"}>
                    {(plan.is_active as boolean) ? "Activo" : "Inactivo"}
                  </StatusBadge>
                  <PlanToggleButton planId={plan.id as string} isActive={plan.is_active as boolean} />
                </li>
              ))}
            </ul>
          )}
          <CreatePlanForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Suscripciones por liga</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {leagueList.length === 0 ? (
            <EmptyState title="Sin ligas" description="Aún no hay ligas registradas." />
          ) : (
            <ul className="space-y-2">
              {leagueList.map((league) => {
                const sub = subByLeague.get(league.id as string);
                const plan = sub ? planById.get(sub.plan_id as string) : undefined;
                return (
                  <li key={league.id as string} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 text-sm">
                    <span className="font-medium text-gray-900">{league.name as string}</span>
                    <span className="text-gray-500">
                      {plan ? `${plan.name as string} · ${sub?.status as string}` : "Sin suscripción vigente"}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
          {planList.length > 0 && leagueList.length > 0 ? (
            <AssignSubscriptionForm
              leagues={leagueList.map((l) => ({ id: l.id as string, name: l.name as string }))}
              plans={planList
                .filter((p) => p.is_active as boolean)
                .map((p) => ({ id: p.id as string, name: p.name as string }))}
            />
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
