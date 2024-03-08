import { Fragment } from "react";
import { useLoaderData } from "@remix-run/react";
import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";

import { type Player, ReadPlayers } from "~/services/firebase";
import {
  getAllPokemonFaints,
  getAllPokemonKills,
  sortPlayers,
} from "~/services/utils";
import Data from "~/data.json";
import { type Pokemon } from "~/routes/_tournamentLayout.tournament.$tournamentId.dashboard/pokemon-list";
import { getGroupAPlayers, getGroupBPlayers } from "./utils";

/**
 * TODO:
 * fix hydration issue (see browser console)
 */

export async function loader({ params }: LoaderFunctionArgs) {
  const { tournamentId } = params;

  if (tournamentId) {
    const { data } = (await ReadPlayers({ tournamentId })) || {};

    return json({
      players: data,
    });
  }

  return redirect("/home");
}

export default function Standings() {
  const { players } = useLoaderData<typeof loader>();

  const playersGroupA = getGroupAPlayers(players);
  const playersGroupB = getGroupBPlayers(players);

  const sortedPlayersGroupA = sortPlayers(playersGroupA);
  const sortedPlayersGroupB = sortPlayers(playersGroupB);

  const playersPokemon = players.reduce(
    (acc: Player[], p: Player) => [...acc, ...p.pokemon],
    []
  );

  return (
    <Fragment>
      <div className="px-4 sm:px-6 lg:px-8 my-4 rounded-md border drop-shadow-lg">
        <div className="flow-root">
          <div className="-mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y text-center">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-sm font-semibold sm:pl-0 text-center"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-sm font-semibold text-center"
                    >
                      Games played
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-sm font-semibold text-center"
                    >
                      Wins
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-sm font-semibold text-center"
                    >
                      Loses
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-sm font-semibold text-center"
                    >
                      Differential
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sortedPlayersGroupA.map((p) => {
                    const allPokemonKills =
                      getAllPokemonKills(p.pokemon) +
                      getAllPokemonKills(p.previousPokemon);
                    const allPokemonFaints =
                      getAllPokemonFaints(p.pokemon) +
                      getAllPokemonFaints(p.previousPokemon);
                    const totalDifferential =
                      allPokemonKills - allPokemonFaints;
                    return p.isHidden ? null : (
                      <tr key={p.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0">
                          {p.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary-foreground">
                          {Number(p.record.wins) + Number(p.record.loses)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary-foreground">
                          {p.record.wins}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary-foreground">
                          {p.record.loses}
                        </td>
                        <td
                          className={`whitespace-nowrap px-3 py-4 text-sm ${
                            totalDifferential >= 0
                              ? "text-lime-600"
                              : "text-red-600"
                          }`}
                        >
                          {totalDifferential}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 sm:px-6 lg:px-8 my-4 rounded-md border drop-shadow-lg">
        <div className="flow-root">
          <div className="-mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y text-center">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-sm font-semibold sm:pl-0 text-center"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-sm font-semibold text-center"
                    >
                      Games played
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-sm font-semibold text-center"
                    >
                      Wins
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-sm font-semibold text-center"
                    >
                      Loses
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-sm font-semibold text-center"
                    >
                      Differential
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sortedPlayersGroupB.map((p) => {
                    const allPokemonKills =
                      getAllPokemonKills(p.pokemon) +
                      getAllPokemonKills(p.previousPokemon);
                    const allPokemonFaints =
                      getAllPokemonFaints(p.pokemon) +
                      getAllPokemonFaints(p.previousPokemon);
                    const totalDifferential =
                      allPokemonKills - allPokemonFaints;
                    return p.isHidden ? null : (
                      <tr key={p.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0">
                          {p.name}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-secondary-foreground text-sm">
                          {Number(p.record.wins) + Number(p.record.loses)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-secondary-foreground text-sm">
                          {p.record.wins}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-secondary-foreground text-sm">
                          {p.record.loses}
                        </td>
                        <td
                          className={`whitespace-nowrap px-3 py-4 text-sm ${
                            totalDifferential >= 0
                              ? "text-lime-600"
                              : "text-red-600"
                          }`}
                        >
                          {totalDifferential}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Leaderboard pokemon={playersPokemon} />
    </Fragment>
  );
}

function Leaderboard({ pokemon }: { pokemon: Pokemon[] }) {
  const { data } = Data;
  const havePlayedAnyGames = pokemon.some(
    (p) => !!p.record.kills || !!p.record.faints
  );

  const [killLeader, ...remainingKillLeaders] = pokemon
    .sort((a, b) => b.record.kills - a.record.kills)
    .slice(0, 5);
  const [faintsLeader, ...remainingFaintsLeaders] = pokemon
    .sort((a, b) => b.record.faints - a.record.faints)
    .slice(0, 5);

  const killLeaderSpriteUrl = data.find(
    (p) => killLeader.githubName === p.github_name
  )?.spriteUrl;
  const faintsLeaderSpriteUrl = data.find(
    (p) => faintsLeader.githubName === p.github_name
  )?.spriteUrl;

  return (
    (havePlayedAnyGames && (
      <ul className="grid grid-cols-2 gap-6 border-primary">
        <li
          key={killLeader.id}
          className="col-span-1 rounded-lg text-center shadow grid grid-cols-1 sm:grid-cols-2"
        >
          <div className="flex flex-1 flex-col p-8">
            <img
              className="mx-auto h-32 w-32 flex-shrink-0 rounded-full"
              src={killLeaderSpriteUrl}
              alt=""
            />
            <h3 className="mt-6 text-sm font-medium">{killLeader.name}</h3>
            <dl className="mt-1 flex flex-grow flex-col justify-between">
              <dt className="sr-only">Title</dt>
              <dd className="text-sm text-secondary-foreground">Kill leader</dd>
              <dt className="sr-only">Role</dt>
              <dd className="mt-3">
                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  {killLeader.record.kills}
                </span>
              </dd>
            </dl>
          </div>

          <div className="flex flex-1 flex-col p-8">
            <ul role="list" className="space-y-3">
              {remainingKillLeaders.map((p) => (
                <li
                  key={p.id}
                  className="overflow-hidden rounded-md bg-primary-foreground px-6 py-4 shadow flex justify-between"
                >
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs font-medium text-green-700">
                    {p.record.kills}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </li>
        <li
          key={faintsLeader.id}
          className="col-span-1 rounded-lg text-center shadow grid grid-cols-1 sm:grid-cols-2"
        >
          <div className="flex flex-1 flex-col p-8">
            <img
              className="mx-auto h-32 w-32 flex-shrink-0 rounded-full"
              src={faintsLeaderSpriteUrl}
              alt=""
            />
            <h3 className="mt-6 text-sm font-medium">{faintsLeader.name}</h3>
            <dl className="mt-1 flex flex-grow flex-col justify-between">
              <dt className="sr-only">Title</dt>
              <dd className="text-sm text-gray-500">Faints leader</dd>
              <dt className="sr-only">Role</dt>
              <dd className="mt-3">
                <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                  {faintsLeader.record.faints}
                </span>
              </dd>
            </dl>
          </div>
          <div className="flex flex-1 flex-col p-8">
            <ul role="list" className="space-y-3">
              {remainingFaintsLeaders.map((p) => (
                <li
                  key={p.id}
                  className="overflow-hidden rounded-md bg-primary-foreground px-6 py-4 shadow flex justify-between"
                >
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs font-medium text-green-700">
                    {p.record.faints}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </li>
      </ul>
    )) ||
    null
  );
}
