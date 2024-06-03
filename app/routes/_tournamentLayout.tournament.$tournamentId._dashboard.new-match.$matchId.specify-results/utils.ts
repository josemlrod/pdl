import type { Player } from "~/services/firebase";

export function getPlayerNewPokemon({
  player,
  pokemonStats,
}: {
  player: Player;
  pokemonStats: Array<any>;
}) {
  const pokemonMap = player.pokemon.reduce((acc, curr) => {
    return { ...acc, [curr.githubName]: curr };
  }, {});

  for (const [key, value] of pokemonStats) {
    const [githubName, statName] = key.split("_");
    pokemonMap[githubName].record[statName] += Number(value);
  }

  return Object.values(pokemonMap);
}

export function getPlayerMatchPokemon({
  player,
  pokemonStats,
}: {
  player: Player;
  pokemonStats: Array<any>;
}) {
  const pokemonMap = player.pokemon.reduce((acc, curr) => {
    return { ...acc, [curr.githubName]: curr };
  }, {});

  for (const [key, value] of pokemonStats) {
    const [githubName, statName] = key.split("_");
    pokemonMap[githubName].record[statName] = Number(value);
  }

  return Object.values(pokemonMap);
}
