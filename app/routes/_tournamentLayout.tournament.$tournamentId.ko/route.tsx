import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";

import {
  getGroupAPlayers,
  getGroupTopPlayers,
} from "../_tournamentLayout.tournament.$tournamentId.standings/utils";
import { ReadPlayers } from "~/services/firebase";
import { useLoaderData } from "@remix-run/react";
import { Button } from "@/components/ui/button";

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
  const {
    firstPl: aFirstPl,
    secondPl: aSecondPl,
    thirdPl: aThirdPl,
    fourthPl: aFourthPl,
  } = getGroupTopPlayers(groupAPlayers);

  return (
    <section className="h-full w-full flex flex-col py-4">
      <div className="w-full grow flex gap-2 md:gap-4 flex-wrap">
        {/* Quarter finals column */}
        <div className="grow flex flex-col justify-center items-center min-w-[185px] gap-4">
          <div className="flex justify-center items-center bg-primary-foreground py-4 w-full rounded-xl">
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
              Quarter Finals
            </span>
          </div>

          <Match playerOneName={aFirstPl.name} playerTwoName="B's 4th place" />
          <Match playerOneName={aSecondPl.name} playerTwoName="B's 3rd place" />
          <Match playerOneName="B's 1st place" playerTwoName={aFourthPl.name} />
          <Match playerOneName="B's 2nd place" playerTwoName={aThirdPl.name} />
        </div>

        {/* Semi finals column */}
        <div className="grow flex flex-col justify-center items-center min-w-[185px] gap-4">
          <div className="flex justify-center items-center bg-primary-foreground py-4 w-full rounded-xl">
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
              Semi Finals
            </span>
          </div>

          <Match
            playerOneName="Quarters 1 winner"
            playerTwoName="Quarters 2 winner"
          />
          <Match
            playerOneName="Quarters 3 winner"
            playerTwoName="Quarters 4 winner"
          />
        </div>

        {/* finals column */}
        <div className="grow flex flex-col justify-center items-center min-w-[185px] gap-4">
          <div className="flex justify-center items-center bg-primary-foreground py-4 w-full rounded-xl">
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
              Final
            </span>
          </div>

          <Match
            playerOneName="Semis 1 winner"
            playerTwoName="Semis 2 winner"
          />
        </div>
      </div>
    </section>
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
  playerOneName,
  playerTwoName,
}: {
  playerOneName: string;
  playerTwoName: string;
}) {
  return (
    <div className="grow w-full flex items-center">
      <Button
        className="h-fit w-full flex justify-center items-center flex-col py-4 rounded-xl"
        variant="secondary"
      >
        <PlayerBracket name={playerOneName} />
        <Divider
          childrenStyles={{ padding: "0 10px" }}
          containerStyles={{ width: "50%" }}
        >
          vs
        </Divider>
        <PlayerBracket name={playerTwoName} />
      </Button>
    </div>
  );
}
