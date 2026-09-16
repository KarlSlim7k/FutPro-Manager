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
            <>
              {/* Mobile Cards (< md) */}
              <div className="space-y-3 md:hidden">
                {planList.map((plan) => (
                  <div key={plan.id as string} className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-xs">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-gray-900 text-base">{plan.name as string}</span>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">{plan.slug as string}</p>
                      </div>
                      <StatusBadge variant={plan.is_active ? "success" : "neutral"}>
                        {(plan.is_active as boolean) ? "Activo" : "Inactivo"}
                      </StatusBadge>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                      <span className="text-lg font-black text-gray-900">
                        ${Number(plan.price_monthly).toFixed(2)} <span className="text-xs font-normal text-gray-500">{plan.currency as string}/mes</span>
                      </span>
                      <PlanToggleButton planId={plan.id as string} isActive={plan.is_active as boolean} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table (md+) */}
              <div className="hidden overflow-x-auto rounded-lg border border-gray-200 md:block">
                <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-3">Nombre</th>
                      <th className="px-4 py-3">Precio Mensual</th>
                      <th className="px-4 py-3">Estado</th>
                      <th className="px-4 py-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {planList.map((plan) => (
                      <tr key={plan.id as string}>
                        <td className="px-4 py-3 font-medium text-gray-900">{plan.name as string}</td>
                        <td className="px-4 py-3">${Number(plan.price_monthly).toFixed(2)} {plan.currency as string}</td>
                        <td className="px-4 py-3">
                          <StatusBadge variant={plan.is_active ? "success" : "neutral"}>
                            {(plan.is_active as boolean) ? "Activo" : "Inactivo"}
                          </StatusBadge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <PlanToggleButton planId={plan.id as string} isActive={plan.is_active as boolean} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
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
            <>
              {/* Mobile Cards (< md) */}
              <div className="space-y-2.5 md:hidden">
                {leagueList.map((league) => {
                  const sub = subByLeague.get(league.id as string);
                  const plan = sub ? planById.get(sub.plan_id as string) : undefined;
                  return (
                    <div key={league.id as string} className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs">
                      <div className="min-w-0">
                        <span className="font-semibold text-gray-900 text-sm block truncate">{league.name as string}</span>
                        <span className="text-xs text-gray-500">
                          {plan ? plan.name as string : "Sin suscripción vigente"}
                        </span>
                      </div>
                      {sub ? (
                        <StatusBadge variant={sub.status === "active" ? "success" : sub.status === "trialing" ? "info" : "warning"}>
                          {sub.status as string}
                        </StatusBadge>
                      ) : (
                        <StatusBadge variant="neutral">Sin plan</StatusBadge>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table (md+) */}
              <div className="hidden overflow-x-auto rounded-lg border border-gray-200 md:block">
                <table className="min-w-full divide-y divide-gray-200 bg-white text-sm">
                  <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-3">Liga</th>
                      <th className="px-4 py-3">Plan asignado</th>
                      <th className="px-4 py-3">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {leagueList.map((league) => {
                      const sub = subByLeague.get(league.id as string);
                      const plan = sub ? planById.get(sub.plan_id as string) : undefined;
                      return (
                        <tr key={league.id as string}>
                          <td className="px-4 py-3 font-medium text-gray-900">{league.name as string}</td>
                          <td className="px-4 py-3">{plan ? (plan.name as string) : "Sin suscripción vigente"}</td>
                          <td className="px-4 py-3">
                            {sub ? (
                              <StatusBadge variant={sub.status === "active" ? "success" : sub.status === "trialing" ? "info" : "warning"}>
                                {sub.status as string}
                              </StatusBadge>
                            ) : (
                              <StatusBadge variant="neutral">Sin plan</StatusBadge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
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
