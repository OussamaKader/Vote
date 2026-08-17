export type Role = "user" | "admin";
export type ElectionStatus = "upcoming" | "active" | "finished";

export type Profile = {
  id: string | number;
  full_name: string;
  whatsapp_number: string;
  password_hash?: string;
  role: Role;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
};

export type Candidate = {
  id: string | number;
  list_id: string | number;
  name: string;
  photo_url: string;
  position: string;
  description: string;
  created_at: string;
};

export type ElectionList = {
  id: string | number;
  election_id: string | number;
  name: string;
  description: string;
  logo_url: string;
  created_at: string;
  candidates: Candidate[];
};

export type Vote = {
  id: string | number;
  election_id: string | number;
  list_id: string | number;
  user_id: string;
  created_at: string;
};

export type Election = {
  id: string | number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: ElectionStatus;
  results_visible: boolean;
  created_at: string;
  updated_at: string;
  lists: ElectionList[];
};

export type DashboardStats = {
  users: number;
  elections: number;
  activeElections: number;
  finishedElections: number;
  votes: number;
  participation: number;
};
