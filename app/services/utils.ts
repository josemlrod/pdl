import type { Pokemon } from "~/routes/_tournamentLayout.tournament.$tournamentId.dashboard/pokemon-list";
import type { Player } from "./firebase";

type ErrorWithMessage = {
  message: string;
};

export type User = {
  displayName: string;
  email: string;
  id: string;
};

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  );
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError));
  }
}

export function getErrorMessage(error: unknown) {
  return toErrorWithMessage(error).message;
}

export const getAllPokemonKills = (pokemon: Pokemon[]) => {
  let total = 0;
  for (const p of pokemon) {
    total += p.record.kills;
  }

  return total;
};

export const getAllPokemonFaints = (pokemon: Pokemon[]) => {
  let total = 0;
  for (const p of pokemon) {
    total += p.record.faints;
  }

  return total;
};

export const sortPlayers = (players: Player[]) => {
  return players.sort((a: Player, b: Player) => {
    const aGamesPlayed = a.record.wins + a.record.loses;
    const bGamesPlayed = b.record.wins + b.record.loses;
    const aPokemonKills =
      getAllPokemonKills(a.pokemon) + getAllPokemonKills(a.previousPokemon);
    const aPokemonFaints =
      getAllPokemonFaints(a.pokemon) + getAllPokemonFaints(a.previousPokemon);
    const bPokemonKills =
      getAllPokemonKills(b.pokemon) + getAllPokemonKills(b.previousPokemon);
    const bPokemonFaints =
      getAllPokemonFaints(b.pokemon) + getAllPokemonFaints(b.previousPokemon);

    const aDifferential = aPokemonKills - aPokemonFaints;
    const bDifferential = bPokemonKills - bPokemonFaints;

    if (bGamesPlayed < aGamesPlayed && b.record.wins === a.record.wins) {
      return b;
    }

    if (b.record.wins === a.record.wins) {
      return bDifferential - aDifferential;
    }

    return b.record.wins - a.record.wins;
  });
};

export const getIsAdmin = (user: User) => {
  if (user) {
    if (user.id === "d93e4d2a-5830-442a-bcd3-58a1d2f819fc") {
      return true;
    }
  }

  return false;
};

export function hydratePlayers({
  playerNames,
  players,
}: {
  playerNames: [string, string];
  players: Array<Player>;
}) {
  return players.filter((p) => playerNames.includes(p.name));
}

export function hydratePokemon({ pokemonTeam, pokemon }) {
  return pokemon.filter((p) => pokemonTeam.includes(p.githubName));
}
