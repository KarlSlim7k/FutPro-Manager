import { TrendingUp, DollarSign, Users, AlertTriangle, ArrowUpRight } from "lucide-react";
import type { SaaSBusinessMetrics } from "@/lib/billing/mrr-metrics";

interface SaasMetricsCardProps {
  metrics: SaaSBusinessMetrics;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function SaasMetricsCard({ metrics }: SaasMetricsCardProps) {
  return (
    <div className="space-y-4">
      {/* Tarjetas KPI Super Admin */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* MRR */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              MRR Mensual
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              <TrendingUp className="h-3 w-3" /> Activo
            </span>
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-gray-900">
            {formatCurrency(metrics.mrr)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            ARR estimado: <span className="font-semibold text-gray-700">{formatCurrency(metrics.arr)}</span>
          </p>
        </div>

        {/* Ligas Activas de Pago */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Ligas de Pago
            </span>
            <Users className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-gray-900">
            {metrics.activePaidLeagues}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {metrics.trialingLeagues} en periodo de prueba
          </p>
        </div>

        {/* ARPU */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              ARPU Promedio
            </span>
            <DollarSign className="h-4 w-4 text-teal-600" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-gray-900">
            {formatCurrency(metrics.arpu)}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Ingreso promedio por liga activa
          </p>
        </div>

        {/* Churn Rate */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Tasa de Churn
            </span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl sm:text-3xl font-black text-gray-900">
            {metrics.churnRate}%
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {metrics.cancelledLeagues} suscripciones canceladas
          </p>
        </div>
      </div>

      {/* Desglose por Planes */}
      {metrics.planDistribution.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
            Distribución de Ingresos por Nivel de Plan
          </h3>
          <div className="space-y-3">
            {metrics.planDistribution.map((plan) => {
              const pct =
                metrics.mrr > 0
                  ? Math.round((plan.revenue / metrics.mrr) * 100)
                  : 0;
              return (
                <div key={plan.slug} className="space-y-1">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-semibold text-gray-800">
                      {plan.name}{" "}
                      <span className="text-gray-400 font-normal">
                        ({plan.count} ligas)
                      </span>
                    </span>
                    <span className="font-bold text-gray-900">
                      {formatCurrency(plan.revenue)} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
