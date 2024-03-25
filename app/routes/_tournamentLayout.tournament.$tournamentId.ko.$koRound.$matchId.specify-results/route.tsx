import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import Data from "~/data.json";
import { AddKoMatch, ReadKoMatch, ReadPlayerByName } from "~/services/firebase";
import { type Pokemon } from "../_tournamentLayout.tournament.$tournamentId.dashboard/pokemon-list";
import { KoRoundsTitles } from "../_tournamentLayout.tournament.$tournamentId.ko/route";
import { getErrorMessage, hydratePokemon } from "~/services/utils";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FAINTS_REQUIRED_FOR_LOSS } from "../_tournamentLayout.tournament.$tournamentId._dashboard.new-match.$matchId.specify-results/route";
import { Button } from "@/components/ui/button";

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

    if (match.results && match.winner) {
      return redirect(`..`);
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
      playerOne,
      playerOneName: playerOne.name,
      playerOnePokemon,
      playerTwo,
      playerTwoName: playerTwo.name,
      playerTwoPokemon,
      roundTitle: KoRoundsTitles[koRound],
      match,
    });
  } catch (e) {
    getErrorMessage(e);
    console.log(getErrorMessage(e));
    return redirect("/");
  }
}

export default function SpecifyResults() {
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const {
    playerOne,
    playerOneName,
    // playerOnePokemon,
    playerTwo,
    playerTwoName,
    // playerTwoPokemon,
    roundTitle,
    match,
  } = useLoaderData<typeof loader>();

  const { data: pokemonData } = Data;

  const { pokemonTeams } = match;
  const playerOnePokemon = pokemonTeams[playerOneName].map((p: string) => {
    const pokemon = pokemonData.find((pFromDb) => pFromDb.github_name === p);
    return pokemon;
  });
  const playerTwoPokemon = pokemonTeams[playerTwoName].map((p: string) => {
    const pokemon = pokemonData.find((pFromDb) => pFromDb.github_name === p);
    return pokemon;
  });

  return (
    <Dialog open onOpenChange={() => navigate("..")}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{roundTitle}</DialogTitle>
          <DialogDescription>Specify the match's results</DialogDescription>
        </DialogHeader>
        <fetcher.Form method="post">
          <div className="flex overflow-y-scroll gap-2">
            <input
              className="hidden"
              name="match"
              readOnly
              type="text"
              value={JSON.stringify(match)}
            />
            <div className="flex flex-col gap-2 items-center">
              <Label htmlFor="player_one" className="text-start">
                {playerOneName}
              </Label>
              <div className="flex flex-wrap gap-x-1 gap-y-1 justify-center max-w-[178px] max-h-[456px] sm:max-h-none">
                <input
                  className="hidden"
                  name="player_one"
                  readOnly
                  type="text"
                  value={JSON.stringify(playerOne)}
                />
                {playerOnePokemon.map((p) => (
                  <Card className="border-none" key={p?.github_name}>
                    <CardContent className="p-2">
                      <div className="flex gap-1 items-center">
                        <img
                          className="w-8 h-8 sm:w-14 sm:h-14"
                          src={p?.spriteUrl}
                        />
                        <div className="flex flex-col gap-1">
                          <Input
                            name={`${p.github_name}_kills_${playerOneName}`}
                            type="number"
                            placeholder="KOs"
                          />
                          <Input
                            name={`${p.github_name}_faints_${playerOneName}`}
                            type="number"
                            placeholder="Faint"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="flex items-center font-black">vs</div>
            <div className="flex flex-col gap-2 items-center">
              <Label htmlFor="player_two" className="text-start">
                {playerTwoName}
              </Label>
              <div className="flex flex-wrap gap-x-1 gap-y-1 justify-center max-w-[178px] max-h-[456px] sm:max-h-none">
                <input
                  className="hidden"
                  name="player_two"
                  type="text"
                  readOnly
                  value={JSON.stringify(playerTwo)}
                />
                {playerTwoPokemon.map((p) => (
                  <Card className="border-none" key={p?.github_name}>
                    <CardContent className="p-2">
                      <div className="flex gap-1 items-center">
                        <img
                          className="w-8 h-8 sm:w-14 sm:h-14"
                          src={p?.spriteUrl}
                        />
                        <div className="flex flex-col gap-1">
                          <Input
                            name={`${p.github_name}_kills_${playerTwoName}`}
                            type="number"
                            placeholder="KOs"
                          />
                          <Input
                            name={`${p.github_name}_faints_${playerTwoName}`}
                            type="number"
                            placeholder="Faint"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button type="submit">Next</Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { koRound, matchId, tournamentId } = params;
  const body = await request.formData();
  const {
    player_one,
    player_two,
    match: m,
    ...rest
  } = Object.fromEntries(body);

  const playerOne = JSON.parse(String(player_one));
  const playerTwo = JSON.parse(String(player_two));
  const match = JSON.parse(String(m));

  let playerOneResults = playerOne.pokemon;
  let playerTwoResults = playerTwo.pokemon;

  let playerOneKos = 0;
  let playerOneFaints = 0;
  let playerTwoKos = 0;
  let playerTwoFaints = 0;

  for (const [key, value] of Object.entries(rest)) {
    const [githubName, statName, playerName] = key.split("_");

    if (value && value !== "") {
      if (playerName === playerOne.name) {
        playerOneResults = playerOneResults.map((p) => {
          if (p?.githubName === githubName) {
            p.record[statName] = Number(value);
          }
          return p;
        });

        if (statName === "kills") {
          playerOneKos += Number(value);
        } else if (statName === "faints") {
          playerOneFaints += Number(value);
        }
      }

      if (playerName === playerTwo.name) {
        playerTwoResults = playerTwoResults.map((p) => {
          if (p?.githubName === githubName) {
            p.record[statName] = Number(value);
          }
          return p;
        });

        if (statName === "kills") {
          playerTwoKos += Number(value);
        } else if (statName === "faints") {
          playerTwoFaints += Number(value);
        }
      }
    }
  }

  const winner =
    (playerOneFaints !== FAINTS_REQUIRED_FOR_LOSS && playerOne) || playerTwo;
  const playerOneTeam = hydratePokemon({
    pokemonTeam: match.pokemonTeams[playerOne.name],
    pokemon: playerOneResults,
  });
  const playerTwoTeam = hydratePokemon({
    pokemonTeam: match.pokemonTeams[playerTwo.name],
    pokemon: playerTwoResults,
  });

  // update current match
  await AddKoMatch({
    matchId: String(matchId),
    koRound: String(koRound),
    tournamentId: String(tournamentId),
    results: {
      [playerOne.name]: playerOneTeam,
      [playerTwo.name]: playerTwoTeam,
    },
    winner,
  });

  /**
   * TODO:
   * programatically push winner to following match. find match by next_match reference
   */

  return redirect(`/tournament/${tournamentId}/dashboard`);
}
