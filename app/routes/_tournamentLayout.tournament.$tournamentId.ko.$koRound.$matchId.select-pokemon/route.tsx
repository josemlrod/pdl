import { useState } from "react";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import {
  type ActionFunctionArgs,
  json,
  type LoaderFunctionArgs,
  redirect,
} from "@remix-run/node";
import { v4 as uuidv4 } from "uuid";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Toggle } from "@/components/ui/toggle";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AddKoMatch, ReadKoMatch, ReadPlayerByName } from "~/services/firebase";
import { getErrorMessage } from "~/services/utils";
import Data from "~/data.json";
import { type Pokemon } from "../_tournamentLayout.tournament.$tournamentId.dashboard/pokemon-list";
import { KoRoundsTitles } from "../_tournamentLayout.tournament.$tournamentId.ko/route";

export async function loader({ params }: LoaderFunctionArgs) {
  const { koRound, matchId, tournamentId } = params;
  const { data: pokemonData } = Data;

  try {
    const { data: match } =
      (await ReadKoMatch({
        koRound: String(koRound),
        matchId: String(matchId),
        tournamentId: String(tournamentId),
      })) || {};

    if (match.pokemonTeams) {
      return redirect(`../${koRound}/${matchId}/specify-results`);
    }

    const { data: playerOne } =
      (await ReadPlayerByName({
        name: match.playerNames[0],
        tournamentId: String(tournamentId),
      })) || {};
    const { data: playerTwo } =
      (await ReadPlayerByName({
        name: match.playerNames[1],
        tournamentId: String(tournamentId),
      })) || {};

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

    return json({
      playerOneName: playerOne.name,
      playerOnePokemon,
      playerTwoName: playerTwo.name,
      playerTwoPokemon,
      roundTitle: KoRoundsTitles[koRound],
    });
  } catch (e) {
    getErrorMessage(e);
    console.log(getErrorMessage(e));
    return redirect("/");
  }
}

export default function KoRoundDialog() {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const {
    playerOneName,
    playerOnePokemon,
    playerTwoName,
    playerTwoPokemon,
    roundTitle,
  } = useLoaderData<typeof loader>() || {};

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

  const disableNext =
    numPokemonPlayerOneTeam <= 0 || numPokemonPlayerTwoTeam <= 0;

  return (
    <Dialog open onOpenChange={() => navigate("..")}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{roundTitle}</DialogTitle>
          <DialogDescription>
            Select the Pokemon each player used
          </DialogDescription>
        </DialogHeader>
        <fetcher.Form method="post">
          <input
            hidden
            name="players"
            value={JSON.stringify([playerOneName, playerTwoName])}
          />
          <div className="flex">
            <div className="flex flex-col gap-2 items-center">
              <Label htmlFor="player_one" className="text-start">
                {playerOneName}
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
                        !playerOnePokemonMap[p?.github_name] &&
                        playerOneTeamFull
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
                {fetcher.data?.errors.playerOneTeam ? (
                  <em className="col-start-2 col-span-3 text-destructive text-sm">
                    {fetcher.data?.errors.playerOneTeam}
                  </em>
                ) : null}
              </div>
            </div>
            <div className="flex items-center font-black">vs</div>
            <div className="flex flex-col gap-2 items-center">
              <Label htmlFor="player_two" className="text-start">
                {playerTwoName}
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
                        !playerTwoPokemonMap[p?.github_name] &&
                        playerTwoTeamFull
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
                {fetcher.data?.errors.playerTwoTeam ? (
                  <em className="col-start-2 col-span-3 text-destructive text-sm">
                    {fetcher.data?.errors.playerTwoTeam}
                  </em>
                ) : null}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button disabled={disableNext} type="submit">
              Next
            </Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}

export async function action({ params, request }: ActionFunctionArgs) {
  const { koRound, matchId, tournamentId } = params;
  const body = await request.formData();
  const { players: stringifiedPlayers, ...rest } = Object.fromEntries(body);

  const [playerOneName, playerTwoName] = JSON.parse(String(stringifiedPlayers));
  const playerOneTeam = new Set<string>([]);
  const playerTwoTeam = new Set<string>([]);

  for (const [k, v] of Object.entries(rest)) {
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

  const id = matchId || uuidv4();

  await AddKoMatch({
    matchId: id,
    tournamentId: String(tournamentId),
    koRound: String(koRound),
    playedOn: new Date().toLocaleDateString(),
    playerNames: [playerOneName, playerTwoName],
    pokemonTeams: {
      [playerOneName]: [...playerOneTeam],
      [playerTwoName]: [...playerTwoTeam],
    },
  });

  return redirect(`../${koRound}/${matchId}/specify-results`);
}
