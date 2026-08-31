"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { GoalRow, ClientRow } from "@/lib/types";

export default function MetasPage() {
  const supabase = createClient();
  const [goals, setGoals] = useState<GoalRow[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [metricName, setMetricName] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");
  const [clientId, setClientId] = useState("");
  const [deadline, setDeadline] = useState("");

  const load = useCallback(async () => {
    const { data: g } = await supabase
      .from("goals")
      .select("*, clients(name)")
      .neq("status", "cancelada")
      .order("deadline", { ascending: true, nullsFirst: false });
    const { data: c } = await supabase.from("clients").select("*").order("name");
    setGoals((g as GoalRow[]) ?? []);
    setClients((c as ClientRow[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function addGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !metricName.trim()) return;
    setSaving(true);
    await supabase.from("goals").insert({
      title: title.trim(),
      metric_name: metricName.trim(),
      target_value: targetValue ? Number(targetValue) : null,
      unit: unit.trim() || null,
      client_id: clientId || null,
      deadline: deadline || null,
    });
    setTitle("");
    setMetricName("");
    setTargetValue("");
    setUnit("");
    setClientId("");
    setDeadline("");
    setShowForm(false);
    setSaving(false);
    load();
  }

  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Metas</h1>
          <p className="text-sm text-muted mt-1">{goals.length} em acompanhamento</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 rounded bg-ink text-paper text-sm font-medium"
        >
          {showForm ? "Cancelar" : "Nova meta"}
        </button>
      </header>

      {showForm && (
        <form
          onSubmit={addGoal}
          className="mb-8 p-5 rounded border border-border bg-surface grid grid-cols-2 gap-3"
        >
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título (ex: Reduzir CAC do cliente X)"
            required
            className="col-span-2 px-3 py-2 rounded border border-border bg-white text-sm"
          />
          <input
            value={metricName}
            onChange={(e) => setMetricName(e.target.value)}
            placeholder="Métrica (ex: CAC, ROAS)"
            required
            className="px-3 py-2 rounded border border-border bg-white text-sm"
          />
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="Unidade (ex: R$, %)"
            className="px-3 py-2 rounded border border-border bg-white text-sm"
          />
          <input
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder="Valor alvo"
            type="number"
            className="px-3 py-2 rounded border border-border bg-white text-sm"
          />
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="px-3 py-2 rounded border border-border bg-white text-sm"
          >
            <option value="">Meta interna (agência)</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            type="date"
            className="col-span-2 px-3 py-2 rounded border border-border bg-white text-sm"
          />
          <button
            type="submit"
            disabled={saving}
            className="col-span-2 py-2 rounded bg-ink text-paper text-sm font-medium disabled:opacity-50"
          >
            Salvar meta
          </button>
        </form>
      )}

      {loading && <p className="text-sm text-muted">Carregando...</p>}

      <div className="space-y-5">
        {goals.map((g) => {
          const pct =
            g.target_value && g.target_value > 0
              ? Math.min(100, Math.round(((g.current_value ?? 0) / g.target_value) * 100))
              : null;
          return (
            <div key={g.id} className="pb-4 border-b border-border">
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-sm font-medium">{g.title}</span>
                {g.clients?.name && (
                  <span className="text-xs text-muted">{g.clients.name}</span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                  {pct !== null && (
                    <div
                      className="h-full bg-gold"
                      style={{ width: `${pct}%` }}
                    />
                  )}
                </div>
                <span className="text-xs font-mono text-muted whitespace-nowrap">
                  {g.current_value ?? 0}
                  {g.target_value ? ` / ${g.target_value}` : ""} {g.unit ?? ""}
                </span>
              </div>
              {g.deadline && (
                <span className="text-xs font-mono text-muted mt-1 inline-block">
                  até {g.deadline.slice(8, 10)}/{g.deadline.slice(5, 7)}/{g.deadline.slice(0, 4)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
