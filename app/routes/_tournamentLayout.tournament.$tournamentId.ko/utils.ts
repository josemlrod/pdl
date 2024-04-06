import { type Match } from "~/services/firebase";

export function getKoMatchLink({
  match,
  matchId,
  matchRound,
}: {
  match: Match;
  matchId: string;
  matchRound: string;
}) {
  if (match.winner) {
    return `${matchRound}/${matchId}/winner`;
  } else if (match.pokemonTeams) {
    return `${matchRound}/${matchId}/specify-results`;
  } else {
    return `${matchRound}/${matchId}/select-pokemon`;
  }
}
