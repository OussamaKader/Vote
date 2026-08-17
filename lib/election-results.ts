export type ElectionVoteRecord = {
  id?: string | number;
  list_id: string | number;
  user_id: string | number;
  election_id?: string | number;
};

export type ElectionResultRow = {
  list_id: string | number;
  list_name: string;
  vote_count: number;
  percentage: number;
  rank: number;
  is_winner: boolean;
  is_tied: boolean;
};

export type ElectionResultSummary = {
  id: string | number;
  title: string;
  total_voters: number;
  total_votes: number;
  winner: string;
  winningCandidates: string[];
  isTie: boolean;
  rows: ElectionResultRow[];
};

function formatTieLabel(names: string[]) {
  if (names.length === 0) {
    return "Égalité";
  }

  if (names.length === 1) {
    return names[0];
  }

  if (names.length === 2) {
    return `Égalité entre ${names[0]} et ${names[1]}`;
  }

  return `Égalité entre ${names.slice(0, -1).join(", ")} et ${names[names.length - 1]}`;
}

export function calculateElectionResults({
  id,
  title,
  votes = [],
  listNameById = new Map<string, string>(),
}: {
  id: string | number;
  title: string;
  votes?: ElectionVoteRecord[];
  listNameById?: Map<string, string>;
}): ElectionResultSummary {
  const rowsMap = new Map<string, { list_id: string | number; list_name: string; vote_count: number }>();
  const uniqueVoters = new Set<string>();

  for (const vote of votes) {
    uniqueVoters.add(String(vote.user_id));

    const key = String(vote.list_id);
    const currentRow = rowsMap.get(key) ?? {
      list_id: vote.list_id,
      list_name: listNameById.get(key) ?? "-",
      vote_count: 0,
    };

    currentRow.vote_count += 1;
    rowsMap.set(key, currentRow);
  }

  const totalVotes = Array.from(rowsMap.values()).reduce((sum, row) => sum + row.vote_count, 0);

  const rows = Array.from(rowsMap.values())
    .map((row) => ({
      list_id: row.list_id,
      list_name: row.list_name,
      vote_count: row.vote_count,
      percentage: totalVotes > 0 ? (row.vote_count / totalVotes) * 100 : 0,
      rank: 0,
      is_winner: false,
      is_tied: false,
    }))
    .sort((a, b) => b.vote_count - a.vote_count || a.list_name.localeCompare(b.list_name));

  const maxVotes = rows.reduce((max, row) => Math.max(max, row.vote_count), 0);
  const winningRows = rows.filter((row) => row.vote_count === maxVotes);
  const isTie = winningRows.length > 1;

  let previousVoteCount: number | null = null;
  let previousRank = 0;

  const rankedRows = rows.map((row, index) => {
    let rank = index + 1;

    if (previousVoteCount !== null && row.vote_count === previousVoteCount) {
      rank = previousRank;
    } else {
      previousRank = index + 1;
      previousVoteCount = row.vote_count;
      rank = previousRank;
    }

    return {
      ...row,
      rank,
      is_winner: row.vote_count === maxVotes,
      is_tied: winningRows.length > 1 && row.vote_count === maxVotes,
    };
  });

  const winnerNames = winningRows.map((row) => row.list_name);
  const winnerText = isTie ? formatTieLabel(winnerNames) : winnerNames[0] ?? "-";

  return {
    id,
    title,
    total_voters: uniqueVoters.size,
    total_votes: totalVotes,
    winner: winnerText,
    winningCandidates: winnerNames,
    isTie,
    rows: rankedRows,
  };
}
