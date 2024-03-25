import { useFetcher, useLoaderData, useOutletContext } from "@remix-run/react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { Button } from "@/components/ui/button";
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  AddMatch,
  AddPlayer,
  type Player,
  ReadMatch,
} from "~/services/firebase";
import {
  getErrorMessage,
  hydratePlayers,
  hydratePokemon,
} from "~/services/utils";
import Data from "~/data.json";

export const FAINTS_REQUIRED_FOR_LOSS = 6;

export async function loader({ params }: LoaderFunctionArgs) {
  const { matchId, tournamentId } = params;

  try {
    if (matchId && tournamentId) {
      const { data } = (await ReadMatch({ matchId, tournamentId })) || {};
      return json({ match: data });
    }
  } catch (e) {
    getErrorMessage(e);
  }
}

export default function SpecifyResults() {
  const fetcher = useFetcher();
  const { match } = useLoaderData<typeof loader>();
  const { players } = useOutletContext<{ players: Player[] }>();
  const { playerNames, pokemonTeams } = match;
  const [playerOneName, playerTwoName] = playerNames;

  const { data: pokemonData } = Data;

  const [playerOne, playerTwo] = hydratePlayers({
    playerNames: match.playerNames,
    players,
  });
  const playerOnePokemon = pokemonTeams[playerOneName].map((p: string) => {
    const pokemon = pokemonData.find((pFromDb) => pFromDb.github_name === p);
    return pokemon;
  });
  const playerTwoPokemon = pokemonTeams[playerTwoName].map((p: string) => {
    const pokemon = pokemonData.find((pFromDb) => pFromDb.github_name === p);
    return pokemon;
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>New match</DialogTitle>
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
        <DialogFooter>
          <Button type="submit">Next</Button>
        </DialogFooter>
      </fetcher.Form>
    </>
  );
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { matchId, tournamentId } = params;
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

  let playerOneNewPokemon = playerOne.pokemon;
  let playerTwoNewPokemon = playerTwo.pokemon;

  let playerOneKos = 0;
  let playerOneFaints = 0;
  let playerTwoKos = 0;
  let playerTwoFaints = 0;

  for (const [key, value] of Object.entries(rest)) {
    const [githubName, statName, playerName] = key.split("_");

    if (value && value !== "") {
      if (playerName === playerOne.name) {
        playerOneNewPokemon = playerOneNewPokemon.map((p) => {
          if (p?.githubName === githubName) {
            p.record[statName] += Number(value);
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
        playerTwoNewPokemon = playerTwoNewPokemon.map((p) => {
          if (p?.githubName === githubName) {
            p.record[statName] += Number(value);
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
    pokemon: playerOneNewPokemon,
  });
  const playerTwoTeam = hydratePokemon({
    pokemonTeam: match.pokemonTeams[playerTwo.name],
    pokemon: playerTwoNewPokemon,
  });

  const playerOneRecord = {
    loses:
      winner.name === playerOne.name
        ? playerOne.record.loses
        : Number(playerOne.record.loses) + 1,
    wins:
      winner.name === playerOne.name
        ? Number(playerOne.record.wins) + 1
        : playerOne.record.wins,
  };
  const playerTwoRecord = {
    loses:
      winner.name === playerTwo.name
        ? playerTwo.record.loses
        : Number(playerTwo.record.loses) + 1,
    wins:
      winner.name === playerTwo.name
        ? Number(playerTwo.record.wins) + 1
        : playerTwo.record.wins,
  };

  await AddPlayer({
    id: playerOne.id,
    tournamentId: String(tournamentId),
    pokemon: playerOneNewPokemon,
    record: {
      loses:
        winner.name === playerOne.name
          ? playerOne.record.loses
          : Number(playerOne.record.loses) + 1,
      wins:
        winner.name === playerOne.name
          ? Number(playerOne.record.wins) + 1
          : playerOne.record.wins,
    },
  });

  await AddPlayer({
    id: playerTwo.id,
    tournamentId: String(tournamentId),
    pokemon: playerTwoNewPokemon,
    record: {
      loses:
        winner.name === playerTwo.name
          ? playerTwo.record.loses
          : Number(playerTwo.record.loses) + 1,
      wins:
        winner.name === playerTwo.name
          ? Number(playerTwo.record.wins) + 1
          : playerTwo.record.wins,
    },
  });

  await AddMatch({
    matchId: match.id,
    tournamentId,
    ...match,
    results: {
      [playerOne.name]: {
        ...playerOneTeam,
        kos: playerOneKos,
        faints: playerOneFaints,
      },
      [playerTwo.name]: {
        ...playerTwoTeam,
        kos: playerTwoKos,
        faints: playerTwoFaints,
      },
    },
    userRecords: {
      [playerOne.name]: playerOneRecord,
      [playerTwo.name]: playerTwoRecord,
    },
    winner,
  });

  return redirect(`/tournament/${tournamentId}/dashboard`);
}
