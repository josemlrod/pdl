import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReadKoMatches, ReadPlayers, ReadUser } from "~/services/firebase";
import {
  getGroupAPlayers,
  getGroupBPlayers,
  getGroupTopPlayers,
} from "../_tournamentLayout.tournament.$tournamentId.standings/utils";
import { authCookie } from "~/sessions.server";
import { getIsAdmin } from "~/services/utils";
import { getKoMatchLink } from "./utils";
import { Badge } from "@/components/ui/badge";

export const KoRounds = Object.freeze({
  QF: "quarter_finals",
  SF: "semi_finals",
  F: "finals",
});

export const KoRoundsTitles = Object.freeze({
  [KoRounds.QF]: "Quarter Finals",
  [KoRounds.SF]: "Semi Finals",
  [KoRounds.F]: "Finals",
});

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { tournamentId } = params;
  const session = await authCookie.getSession(request.headers.get("Cookie"));
  const userId = (session.has("userId") && session.get("userId")) || null;
  let user = null;

  const readUserResponse = await ReadUser({ userId });
  user =
    readUserResponse && typeof readUserResponse !== "string"
      ? readUserResponse.data
      : null;
  const isAdmin = user ? getIsAdmin(user) : false;

  if (tournamentId) {
    const { data: players } = (await ReadPlayers({ tournamentId })) || {};
    const { data: koMatches } = (await ReadKoMatches({ tournamentId })) || {};

    return json({
      koMatches,
      players,
      isAdmin,
    });
  }

  return redirect("/home");
}

export default function Knockout() {
  const { isAdmin, koMatches, players } = useLoaderData<typeof loader>();
  const groupAPlayers = getGroupAPlayers(players);
  const groupBPlayers = getGroupBPlayers(players);

  const qfMatches = koMatches[KoRounds.QF];
  const sfMatches = koMatches[KoRounds.SF];
  const fMatch = koMatches[KoRounds.F];

  const {
    firstPl: aFirstPl,
    secondPl: aSecondPl,
    thirdPl: aThirdPl,
    fourthPl: aFourthPl,
  } = getGroupTopPlayers(groupAPlayers);
  const {
    firstPl: bFirstPl,
    secondPl: bSecondPl,
    thirdPl: bThirdPl,
    fourthPl: bFourthPl,
  } = getGroupTopPlayers(groupBPlayers);

  return (
    <>
      <section className="h-full w-full flex flex-col py-4">
        <div className="container flex gap-2 md:gap-4 flex-wrap max-w-[1200px]">
          {/* Quarter finals column */}
          <div className="grow flex flex-col justify-center items-center min-w-[185px] gap-4">
            <div className="flex justify-center items-center bg-secondary py-4 w-full rounded-xl">
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                Quarter Finals
              </span>
            </div>
            {qfMatches && qfMatches.length ? (
              <>
                {qfMatches.map((m) => {
                  const [playerOneName, playerTwoName] = m.playerNames;
                  const link = getKoMatchLink({
                    isAdmin,
                    match: m,
                    matchId: m.id,
                    matchRound: KoRounds.QF,
                  });
                  return (
                    <Match
                      key={m.id}
                      isComplete={!!m.winner}
                      link={link}
                      playerOneName={playerOneName}
                      playerTwoName={playerTwoName}
                    />
                  );
                })}
              </>
            ) : (
              <>
                <Match
                  matchId={`${KoRounds.QF}-${aFirstPl.name}-${bFourthPl.name}`}
                  matchRound={KoRounds.QF}
                  playerOneName={aFirstPl.name}
                  playerTwoName={bFourthPl.name}
                />
                <Match
                  matchId={`${KoRounds.QF}-${aSecondPl.name}-${bThirdPl.name}`}
                  matchRound={KoRounds.QF}
                  playerOneName={aSecondPl.name}
                  playerTwoName={bThirdPl.name}
                />
                <Match
                  matchId={`${KoRounds.QF}-${bFirstPl.name}-${aFourthPl.name}`}
                  matchRound={KoRounds.QF}
                  playerOneName={bFirstPl.name}
                  playerTwoName={aFourthPl.name}
                />
                <Match
                  matchId={`${KoRounds.QF}-${bSecondPl.name}-${aThirdPl.name}`}
                  matchRound={KoRounds.QF}
                  playerOneName={bSecondPl.name}
                  playerTwoName={aThirdPl.name}
                />
              </>
            )}
          </div>

          {/* Semi finals column */}
          <div className="grow flex flex-col justify-center items-center min-w-[185px] gap-4">
            <div className="flex justify-center items-center bg-secondary py-4 w-full rounded-xl">
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                Semi Finals
              </span>
            </div>
            {/**
             * TODO:
             * finish updating the other two ko rounds
             * go back to /:koRound/:matchId and update accordingly
             */}

            {/* <Match
              matchRound={KoRounds.SF}
              playerOneName="Quarters 1 winner"
              playerTwoName="Quarters 2 winner"
            />
            <Match
              matchRound={KoRounds.SF}
              playerOneName="Quarters 3 winner"
              playerTwoName="Quarters 4 winner"
            /> */}
            {sfMatches && sfMatches.length ? (
              <>
                {sfMatches.map((m) => {
                  const [playerOneName, playerTwoName] = m.playerNames;
                  const link = getKoMatchLink({
                    isAdmin,
                    match: m,
                    matchId: m.id,
                    matchRound: KoRounds.SF,
                  });
                  return (
                    <Match
                      key={m.id}
                      isComplete={!!m.winner}
                      link={link}
                      playerOneName={playerOneName}
                      playerTwoName={playerTwoName}
                    />
                  );
                })}
              </>
            ) : (
              <>
                <Match
                  matchRound={KoRounds.SF}
                  playerOneName="Quarters 1 winner"
                  playerTwoName="Quarters 2 winner"
                />
                <Match
                  matchRound={KoRounds.SF}
                  playerOneName="Quarters 3 winner"
                  playerTwoName="Quarters 4 winner"
                />
              </>
            )}
          </div>

          {/* finals column */}
          <div className="grow flex flex-col justify-center items-center min-w-[185px] gap-4">
            <div className="flex justify-center items-center bg-secondary py-4 w-full rounded-xl">
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                Final
              </span>
            </div>

            {fMatch && fMatch.length ? (
              <>
                {fMatch.map((m) => {
                  const [playerOneName, playerTwoName] = m.playerNames;
                  const link = getKoMatchLink({
                    isAdmin,
                    match: m,
                    matchId: m.id,
                    matchRound: KoRounds.F,
                  });
                  return (
                    <Match
                      key={m.id}
                      isComplete={!!m.winner}
                      link={link}
                      playerOneName={playerOneName}
                      playerTwoName={playerTwoName}
                    />
                  );
                })}
              </>
            ) : (
              <Match
                matchRound={KoRounds.F}
                playerOneName="Semis 1 winner"
                playerTwoName="Semis 2 winner"
              />
            )}
          </div>
        </div>
      </section>
      <Outlet />
    </>
  );
}

function Divider({
  children,
  childrenStyles,
  containerStyles,
}: {
  children?: React.ReactNode;
  childrenStyles?: React.CSSProperties;
  containerStyles?: React.CSSProperties;
}) {
  return (
    <div className="relative" style={containerStyles}>
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-300" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-secondary" style={childrenStyles}>
          {children}
        </span>
      </div>
    </div>
  );
}

function PlayerBracket({ name }: { name: string }) {
  return (
    <div className="w-[75%] rounded-xl h-16 flex justify-center items-center">
      <span className="whitespace-nowrap overflow-hidden text-ellipsis">
        {name}
      </span>
    </div>
  );
}

function Match({
  isComplete,
  link,
  playerOneName,
  playerTwoName,
}: {
  isComplete: boolean;
  link: string;
  playerOneName: string;
  playerTwoName: string;
}) {
  return (
    <div className="grow w-full flex items-center">
      <Link
        className={cn(
          buttonVariants({ variant: "secondary" }),
          "h-fit w-full flex justify-center items-center flex-col py-4 rounded-xl relative"
        )}
        to={link}
      >
        <Badge
          className={`hover:unset absolute top-1.5 right-2.5 ${
            isComplete
              ? "bg-green-500 text-primary-foreground"
              : "bg-primary text-primary-foreground"
          }`}
          variant="outline"
        >
          {isComplete ? "Completed" : "Not started"}
        </Badge>
        <PlayerBracket name={playerOneName} />
        <Divider
          childrenStyles={{ padding: "0 10px" }}
          containerStyles={{ width: "50%" }}
        >
          vs
        </Divider>
        <PlayerBracket name={playerTwoName} />
      </Link>
    </div>
  );
}
