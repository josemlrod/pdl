import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Link, Outlet, useLoaderData } from "@remix-run/react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReadPlayers } from "~/services/firebase";
import {
  getGroupAPlayers,
  getGroupBPlayers,
  getGroupTopPlayers,
} from "../_tournamentLayout.tournament.$tournamentId.standings/utils";

export const KoRounds = Object.freeze({
  QF: "quarter_finals",
  SF: "semi_finals",
  F: "finals",
});

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

export default function Knockout() {
  const { players } = useLoaderData<typeof loader>();
  const groupAPlayers = getGroupAPlayers(players);
  const groupBPlayers = getGroupBPlayers(players);

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
        <div className="w-full grow flex gap-2 md:gap-4 flex-wrap">
          {/* Quarter finals column */}
          <div className="grow flex flex-col justify-center items-center min-w-[185px] gap-4">
            <div className="flex justify-center items-center bg-secondary py-4 w-full rounded-xl">
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                Quarter Finals
              </span>
            </div>

            <Match
              matchRound={KoRounds.QF}
              playerOneName={aFirstPl.name}
              playerTwoName={bFourthPl.name}
            />
            <Match
              matchRound={KoRounds.QF}
              playerOneName={aSecondPl.name}
              playerTwoName={bThirdPl.name}
            />
            <Match
              matchRound={KoRounds.QF}
              playerOneName={bFirstPl.name}
              playerTwoName={aFourthPl.name}
            />
            <Match
              matchRound={KoRounds.QF}
              playerOneName={bSecondPl.name}
              playerTwoName={aThirdPl.name}
            />
          </div>

          {/* Semi finals column */}
          <div className="grow flex flex-col justify-center items-center min-w-[185px] gap-4">
            <div className="flex justify-center items-center bg-secondary py-4 w-full rounded-xl">
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                Semi Finals
              </span>
            </div>

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
          </div>

          {/* finals column */}
          <div className="grow flex flex-col justify-center items-center min-w-[185px] gap-4">
            <div className="flex justify-center items-center bg-secondary py-4 w-full rounded-xl">
              <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                Final
              </span>
            </div>

            <Match
              matchRound={KoRounds.F}
              playerOneName="Semis 1 winner"
              playerTwoName="Semis 2 winner"
            />
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
  matchRound,
  playerOneName,
  playerTwoName,
}: {
  matchRound: string;
  playerOneName: string;
  playerTwoName: string;
}) {
  return (
    <div className="grow w-full flex items-center">
      <Link
        className={cn(
          buttonVariants({ variant: "secondary" }),
          "h-fit w-full flex justify-center items-center flex-col py-4 rounded-xl"
        )}
        to={`${matchRound}?p_one=${playerOneName}&p_two=${playerTwoName}`}
      >
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
