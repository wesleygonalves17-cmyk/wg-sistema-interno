"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ClientRow, ClientStatus } from "@/lib/types";

const STATUS_LABEL: Record<ClientStatus, string> = {
  prospect: "Prospect",
  ativo: "Ativo",
  pausado: "Pausado",
  encerrado: "Encerrado",
};
const STATUS_COLOR: Record<ClientStatus, string> = {
  prospect: "text-muted",
  ativo: "text-teal",
  pausado: "text-gold",
  encerrado: "text-danger",
};

export default function ClientesPage() {
  const supabase = createClient();
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [segment, setSegment] = useState("");
  const [status, setStatus] = useState<ClientStatus>("prospect");
  const [recurringValue, setRecurringValue] = useState("");
  const [channel, setChannel] = useState("");

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("clients")
      .select("*")
      .order("status")
      .order("name");
    setClients((data as ClientRow[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    load();
  }, [load]);

  async function addClient(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await supabase.from("clients").insert({
      name: name.trim(),
      segment: segment.trim() || null,
      status,
      recurring_value: recurringValue ? Number(recurringValue) : null,
      acquisition_channel: channel.trim() || null,
    });
    setName("");
    setSegment("");
    setStatus("prospect");
    setRecurringValue("");
    setChannel("");
    setShowForm(false);
    setSaving(false);
    load();
  }

  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Clientes</h1>
          <p className="text-sm text-muted mt-1">{clients.length} cadastrados</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 rounded bg-ink text-paper text-sm font-medium"
        >
          {showForm ? "Cancelar" : "Novo cliente"}
        </button>
      </header>

      {showForm && (
        <form
          onSubmit={addClient}
          className="mb-8 p-5 rounded border border-border bg-surface grid grid-cols-2 gap-3"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do cliente"
            required
            className="col-span-2 px-3 py-2 rounded border border-border bg-white text-sm"
          />
          <input
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
            placeholder="Segmento (ex: estética, e-commerce)"
            className="px-3 py-2 rounded border border-border bg-white text-sm"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ClientStatus)}
            className="px-3 py-2 rounded border border-border bg-white text-sm"
          >
            {Object.entries(STATUS_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <input
            value={recurringValue}
            onChange={(e) => setRecurringValue(e.target.value)}
            placeholder="Valor recorrente (R$)"
            type="number"
            className="px-3 py-2 rounded border border-border bg-white text-sm"
          />
          <input
            value={channel}
            onChange={(e) => setChannel(e.target.value)}
            placeholder="Canal de aquisição"
            className="px-3 py-2 rounded border border-border bg-white text-sm"
          />
          <button
            type="submit"
            disabled={saving}
            className="col-span-2 py-2 rounded bg-ink text-paper text-sm font-medium disabled:opacity-50"
          >
            Salvar cliente
          </button>
        </form>
      )}

      {loading && <p className="text-sm text-muted">Carregando...</p>}

      {!loading && (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="font-normal py-2">Nome</th>
              <th className="font-normal py-2">Segmento</th>
              <th className="font-normal py-2">Status</th>
              <th className="font-normal py-2 text-right">Recorrente</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-b border-border">
                <td className="py-2.5">{c.name}</td>
                <td className="py-2.5 text-muted">{c.segment ?? "—"}</td>
                <td className={`py-2.5 ${STATUS_COLOR[c.status]}`}>
                  {STATUS_LABEL[c.status]}
                </td>
                <td className="py-2.5 text-right font-mono">
                  {c.recurring_value
                    ? `R$ ${c.recurring_value.toLocaleString("pt-BR")}`
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
