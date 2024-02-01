import { useState } from "react";
import { useFetcher, useLocation, useOutletContext } from "@remix-run/react";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Button } from "@/components/ui/button";
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { AddMatch, type Player } from "~/services/firebase";
import Data from "~/data.json";
import type { Pokemon } from "../_tournamentLayout.tournament.$tournamentId.dashboard/pokemon-list";

export default function SelectPokemon() {
  const fetcher = useFetcher();
  const location = useLocation();
  const { players } = useOutletContext<{ players: Player[] }>();

  const queryParams = new URLSearchParams(location.search);
  const playerOneName = queryParams.get("playerOne");
  const playerTwoName = queryParams.get("playerTwo");

  const [playerOne] = players.filter((p: Player) => p.name === playerOneName);
  const [playerTwo] = players.filter((p: Player) => p.name === playerTwoName);

  const { data: pokemonData } = Data;
  const playerOnePokemon = playerOne.pokemon.map((p: Pokemon) => {
    const pokemon = pokemonData.find(
      (pFromDb) => pFromDb.github_name === p.githubName
    );
    return pokemon;
  });
  const playerTwoPokemon = playerTwo.pokemon.map((p: Pokemon) => {
    const pokemon = pokemonData.find(
      (pFromDb) => pFromDb.github_name === p.githubName
    );
    return pokemon;
  });

  const [playerOnePokemonMap, setPlayerOnePokemonMap] = useState(
    playerOnePokemon.reduce((acc, curr) => {
      return {
        ...acc,
        [curr?.github_name]: false,
      };
    }, {})
  );
  const [playerTwoPokemonMap, setPlayerTwoPokemonMap] = useState(
    playerTwoPokemon.reduce((acc, curr) => {
      return {
        ...acc,
        [curr?.github_name]: false,
      };
    }, {})
  );

  const numPokemonPlayerOneTeam = Object.entries(playerOnePokemonMap).reduce(
    (acc, [k, v]) => {
      if (v) {
        acc += 1;
      }

      return acc;
    },
    0
  );
  const numPokemonPlayerTwoTeam = Object.entries(playerTwoPokemonMap).reduce(
    (acc, [k, v]) => {
      if (v) {
        acc += 1;
      }

      return acc;
    },
    0
  );
  const playerOneTeamFull = numPokemonPlayerOneTeam >= 6;
  const playerTwoTeamFull = numPokemonPlayerTwoTeam >= 6;

  return (
    <>
      <DialogHeader>
        <DialogTitle>New match</DialogTitle>
        <DialogDescription>
          Select the Pokemon each player used
        </DialogDescription>
      </DialogHeader>
      <fetcher.Form method="post">
        <div className="flex">
          <div className="flex flex-col gap-2 items-center">
            <Label htmlFor="player_one" className="text-start">
              {playerOne.name}
            </Label>
            <div className="flex flex-wrap gap-x-1 gap-y-1 justify-center max-w-[178px]">
              {playerOnePokemon.map((p) => (
                <div key={p?.github_name}>
                  <input
                    hidden
                    type="text"
                    name={`player_one,${p?.github_name}`}
                    value={`${playerOnePokemonMap[p?.github_name]}`}
                    readOnly
                  />
                  <Toggle
                    className="w-fit h-fit py-2"
                    disabled={
                      !playerOnePokemonMap[p?.github_name] && playerOneTeamFull
                    }
                    value={playerOnePokemonMap[p?.github_name]}
                    onPressedChange={(e) => {
                      setPlayerOnePokemonMap({
                        ...playerOnePokemonMap,
                        [p?.github_name]: e,
                      });
                    }}
                  >
                    <img className="w-8 sm:w-14" src={p?.spriteUrl} />
                  </Toggle>
                </div>
              ))}
              {fetcher.data?.playerOneTeam ? (
                <em className="col-start-2 col-span-3 text-destructive text-sm">
                  {fetcher.data?.playerOneTeam}
                </em>
              ) : null}
            </div>
          </div>

          <div className="flex items-center font-black">vs</div>

          <div className="flex flex-col gap-2 items-center">
            <Label htmlFor="player_two" className="text-start">
              {playerTwo.name}
            </Label>
            <div className="flex flex-wrap gap-x-1 gap-y-1 justify-center max-w-[178px]">
              {playerTwoPokemon.map((p) => (
                <div key={p?.github_name}>
                  <input
                    hidden
                    type="text"
                    name={`player_two,${p?.github_name}`}
                    value={`${playerTwoPokemonMap[p?.github_name]}`}
                    readOnly
                  />
                  <Toggle
                    className="w-fit h-fit py-2"
                    disabled={
                      !playerTwoPokemonMap[p?.github_name] && playerTwoTeamFull
                    }
                    value={playerTwoPokemonMap[p?.github_name]}
                    onPressedChange={(e) => {
                      setPlayerTwoPokemonMap({
                        ...playerTwoPokemonMap,
                        [p?.github_name]: e,
                      });
                    }}
                  >
                    <img className="w-8 sm:w-14" src={p?.spriteUrl} />
                  </Toggle>
                </div>
              ))}
              {fetcher.data?.playerTwoTeam ? (
                <em className="col-start-2 col-span-3 text-destructive text-sm">
                  {fetcher.data?.playerTwoTeam}
                </em>
              ) : null}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Next</Button>
        </DialogFooter>
      </fetcher.Form>
    </>
  );
}

export async function action({ params, request }: ActionFunctionArgs) {
  const { tournamentId } = params;
  const body = await request.formData();
  const bodyData = Object.fromEntries(body);

  const url = new URL(request.url);
  const playerOneName = String(url.searchParams.get("playerOne"));
  const playerTwoName = String(url.searchParams.get("playerTwo"));

  const playerOneTeam = new Set<string>([]);
  const playerTwoTeam = new Set<string>([]);

  for (const [k, v] of Object.entries(bodyData)) {
    const [player, pokemon] = k.split(",");
    if (player === "player_one" && v === "true") {
      playerOneTeam.add(pokemon);
    }

    if (player === "player_two" && v === "true") {
      playerTwoTeam.add(pokemon);
    }
  }

  let errors: { playerOneTeam?: string; playerTwoTeam?: string } = {};
  if (playerOneTeam.size <= 0) {
    errors.playerOneTeam = "Please choose at least one Pokemon";
  }

  if (playerTwoTeam.size <= 0) {
    errors.playerTwoTeam = "Please choose at least one Pokemon";
  }

  if (Object.keys(errors).length > 0) {
    return errors;
  }

  const matchId = crypto.randomUUID();
  await AddMatch({
    matchId,
    tournamentId: tournamentId ?? "",
    playerNames: [playerOneName, playerTwoName],
    pokemonTeams: {
      [playerOneName]: [...playerOneTeam],
      [playerTwoName]: [...playerTwoTeam],
    },
  });

  return redirect(`../${matchId}/specify-results`);
}
