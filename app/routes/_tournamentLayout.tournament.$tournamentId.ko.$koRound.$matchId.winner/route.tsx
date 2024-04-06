import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import Confetti from "@/components/ui/confetti";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";

import { getErrorMessage } from "~/services/utils";
import { ReadKoMatch } from "~/services/firebase";
import { KoRoundsTitles } from "../_tournamentLayout.tournament.$tournamentId.ko/route";
import Data from "../../data.json";
import { Button } from "@/components/ui/button";

export async function loader({ params }: LoaderFunctionArgs) {
  const { tournamentId, koRound, matchId } = params;

  try {
    const { data: koMatch } =
      (await ReadKoMatch({
        koRound: String(koRound),
        matchId: String(matchId),
        tournamentId: String(tournamentId),
      })) || {};

    return json({ koMatch });
  } catch (e) {
    getErrorMessage(e);
    console.log(getErrorMessage(e));
    return redirect("/");
  }
}

export default function KoMatchWinner() {
  const { koMatch } = useLoaderData<typeof loader>();
  const { koRound } = useParams();
  const navigate = useNavigate();

  if (!koMatch) return null;

  const { playerNames, results, winner, playedOn } = koMatch;
  const [playerOneName, playerTwoName] = playerNames;
  const { data: pokemonData } = Data;
  const winningTeam = results[winner.name];

  const koRoundTitle = KoRoundsTitles[koRound];
  const winnerTeam = winningTeam.map((p) => {
    const pokemon = pokemonData.find(
      (pFromDb) => pFromDb.github_name === p.githubName
    );
    return { ...p, spriteUrl: pokemon.spriteUrl };
  });
  const winnerTeamKos = winningTeam.reduce((acc, curr) => {
    return (acc += curr.record.kills);
  }, 0);
  const winnerTeamFaints = winningTeam.reduce((acc, curr) => {
    return (acc += curr.record.faints);
  }, 0);

  return (
    <Dialog open onOpenChange={() => navigate("..")}>
      {typeof document !== undefined ? <Confetti recycle /> : null}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {koRoundTitle}: {playerOneName} vs {playerTwoName}
          </DialogTitle>
          <DialogDescription>
            Take a look at some of the match's facts
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-lg">Match stats</p>
            <ul className="">
              <li className="text-sm text-muted-foreground">
                <span className="">Winner:</span>{" "}
                <span className="">{winner.name}</span>
              </li>
              <li className="text-sm text-muted-foreground">
                <span className="">Score:</span>{" "}
                <span className="">
                  {winnerTeamKos} - {winnerTeamFaints}
                </span>
              </li>
              <li className="text-sm text-muted-foreground">
                <span className="">Played on:</span>{" "}
                <span className="">{playedOn}</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-lg">Winning team</p>
            <div className="grid grid-cols-2 gap-1">
              {winnerTeam.map((p) => (
                <Card className="border-none bg-muted" key={p?.github_name}>
                  <CardContent className="p-2">
                    <div className="flex gap-1 items-center">
                      <img
                        className="w-8 h-8 sm:w-14 sm:h-14"
                        src={p?.spriteUrl}
                      />
                      <div className="flex flex-col gap-1">
                        <p>KOs: {p.record.kills}</p>
                        <p>Faints: {p.record.faints}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => navigate("..")}>Done</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
