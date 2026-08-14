export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function computeElectionStatus(startDate: string, endDate: string): "upcoming" | "open" | "closed" {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "open";
  return "closed";
}

export function getStatusLabel(status: "upcoming" | "open" | "closed") {
  if (status === "upcoming") return "À venir";
  if (status === "open") return "En cours";
  return "Terminée";
}

export function getResultsForElection(election: { lists: { id: string; name: string; votes?: number }[] }, totalVotes: number) {
  return election.lists.map((list) => {
    const votes = list.votes ?? 0;
    return {
      ...list,
      votes,
      percentage: totalVotes > 0 ? (votes / totalVotes) * 100 : 0,
    };
  });
}
