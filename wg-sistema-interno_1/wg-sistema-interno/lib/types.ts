export type ClientStatus = "prospect" | "ativo" | "pausado" | "encerrado";
export type ActivityType =
  | "campanha"
  | "prospeccao"
  | "atendimento"
  | "financeiro"
  | "desenvolvimento"
  | "outro";
export type ActivityPriority = "baixa" | "media" | "alta" | "urgente";
export type ActivityStatus = "pendente" | "em_andamento" | "concluida" | "cancelada";
export type GoalStatus = "em_andamento" | "atingida" | "atrasada" | "cancelada";

export interface ClientRow {
  id: string;
  name: string;
  segment: string | null;
  status: ClientStatus;
  services: string[];
  recurring_value: number | null;
  acquisition_channel: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  country: string | null;
  start_date: string | null;
  notes: string | null;
}

export interface ActivityRow {
  id: string;
  title: string;
  description: string | null;
  type: ActivityType;
  priority: ActivityPriority;
  status: ActivityStatus;
  client_id: string | null;
  goal_id: string | null;
  due_date: string | null;
  is_recurring: boolean;
  clients?: { name: string } | null;
}

export interface GoalRow {
  id: string;
  title: string;
  metric_name: string;
  target_value: number | null;
  current_value: number | null;
  unit: string | null;
  client_id: string | null;
  deadline: string | null;
  status: GoalStatus;
  clients?: { name: string } | null;
}
