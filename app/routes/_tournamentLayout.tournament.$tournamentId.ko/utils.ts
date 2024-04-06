import { type Match } from "~/services/firebase";

export function getKoMatchLink({
  isAdmin,
  match,
  matchId,
  matchRound,
}: {
  isAdmin: boolean;
  match: Match;
  matchId: string;
  matchRound: string;
}) {
  if (match.winner) {
    return `${matchRound}/${matchId}/winner`;
  } else if (match.pokemonTeams && isAdmin) {
    return `${matchRound}/${matchId}/specify-results`;
  } else if (isAdmin) {
    return `${matchRound}/${matchId}/select-pokemon`;
  } else {
    return ".";
  }
}
