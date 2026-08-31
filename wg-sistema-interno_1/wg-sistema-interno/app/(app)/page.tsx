"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ActivityRow, ActivityPriority, ClientRow } from "@/lib/types";

const PRIORITY_ORDER: ActivityPriority[] = ["urgente", "alta", "media", "baixa"];
const PRIORITY_LABEL: Record<ActivityPriority, string> = {
  urgente: "Urgente",
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};
const PRIORITY_DOT: Record<ActivityPriority, string> = {
  urgente: "bg-danger",
  alta: "bg-gold",
  media: "bg-teal",
  baixa: "bg-muted",
};

export default function DashboardPage() {
  const supabase = createClient();
  const [activities, setActivities] = useState<ActivityRow[]>([]);
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [newClientId, setNewClientId] = useState<string>("");
  const [newPriority, setNewPriority] = useState<ActivityPriority>("media");
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().slice(0, 10);

  const load = useCallback(async () => {
    const { data: acts } = await supabase
      .from("activities")
      .select("*, clients(name)")
      .in("status", ["pendente", "em_andamento"])
      .or(`due_date.lte.${today},due_date.is.null`)
      .order("due_date", { ascending: true, nullsFirst: false });

    const { data: cli } = await supabase
      .from("clients")
      .select("*")
      .neq("status", "encerrado")
      .order("name");

    setActivities((acts as ActivityRow[]) ?? []);
    setClients((cli as ClientRow[]) ?? []);
    setLoading(false);
  }, [supabase, today]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleDone(activity: ActivityRow) {
    const nextStatus = activity.status === "concluida" ? "pendente" : "concluida";
    await supabase
      .from("activities")
      .update({
        status: nextStatus,
        completed_at: nextStatus === "concluida" ? new Date().toISOString() : null,
      })
      .eq("id", activity.id);
    load();
  }

  async function addActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSaving(true);
    await supabase.from("activities").insert({
      title: newTitle.trim(),
      priority: newPriority,
      client_id: newClientId || null,
      due_date: today,
      status: "pendente",
    });
    setNewTitle("");
    setNewClientId("");
    setNewPriority("media");
    setSaving(false);
    load();
  }

  const grouped = PRIORITY_ORDER.map((p) => ({
    priority: p,
    items: activities.filter((a) => a.priority === p),
  })).filter((g) => g.items.length > 0);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl font-semibold">Hoje</h1>
        <p className="text-sm text-muted mt-1">
          {new Date().toLocaleDateString("pt-BR", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </header>

      <form onSubmit={addActivity} className="flex gap-2 mb-8">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Nova atividade..."
          className="flex-1 px-3 py-2 rounded border border-border bg-surface text-sm focus:outline-none focus:ring-1 focus:ring-teal"
        />
        <select
          value={newClientId}
          onChange={(e) => setNewClientId(e.target.value)}
          className="px-2 py-2 rounded border border-border bg-surface text-sm"
        >
          <option value="">Interna</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value as ActivityPriority)}
          className="px-2 py-2 rounded border border-border bg-surface text-sm"
        >
          {PRIORITY_ORDER.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABEL[p]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded bg-ink text-paper text-sm font-medium disabled:opacity-50"
        >
          Adicionar
        </button>
      </form>

      {loading && <p className="text-sm text-muted">Carregando...</p>}

      {!loading && grouped.length === 0 && (
        <p className="text-sm text-muted">
          Nada pendente pra hoje. Bom momento pra olhar as metas.
        </p>
      )}

      <div className="space-y-6">
        {grouped.map((group) => (
          <div key={group.priority}>
            <div className="flex items-center gap-2 mb-2">
              <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOT[group.priority]}`} />
              <span className="text-xs text-muted">{PRIORITY_LABEL[group.priority]}</span>
            </div>
            <ul className="border-t border-border">
              {group.items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 py-2.5 border-b border-border"
                >
                  <input
                    type="checkbox"
                    checked={item.status === "concluida"}
                    onChange={() => toggleDone(item)}
                    className="w-4 h-4 accent-teal"
                  />
                  <span
                    className={`flex-1 text-sm ${
                      item.status === "concluida" ? "line-through text-muted" : "text-ink"
                    }`}
                  >
                    {item.title}
                  </span>
                  {item.clients?.name && (
                    <span className="text-xs text-muted border border-border rounded px-1.5 py-0.5">
                      {item.clients.name}
                    </span>
                  )}
                  {item.due_date && (
                    <span className="text-xs font-mono text-muted">
                      {item.due_date.slice(8, 10)}/{item.due_date.slice(5, 7)}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
