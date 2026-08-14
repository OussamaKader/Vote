export type Role = "user" | "admin";
export type ElectionStatus = "upcoming" | "open" | "closed";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
};

export type Candidate = {
  id: string;
  list_id: string;
  name: string;
  photo_url: string;
  position: string;
  description: string;
  created_at: string;
};

export type ElectionList = {
  id: string;
  election_id: string;
  name: string;
  description: string;
  logo_url: string;
  created_at: string;
  candidates: Candidate[];
};

export type Vote = {
  id: string;
  election_id: string;
  list_id: string;
  user_id: string;
  created_at: string;
};

export type Election = {
  id: string;
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
