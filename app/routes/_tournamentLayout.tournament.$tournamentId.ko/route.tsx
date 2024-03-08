import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";

import {
  getGroupAPlayers,
  getGroupTopPlayers,
} from "../_tournamentLayout.tournament.$tournamentId.standings/utils";
import { ReadPlayers } from "~/services/firebase";
import { useLoaderData } from "@remix-run/react";

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

          <div className="grow w-full flex justify-center items-center flex-col">
            <PlayerBracket name={aFirstPl.name} />
            <Divider
              childrenStyles={{ padding: "0 10px" }}
              containerStyles={{ width: "50%" }}
            >
              vs
            </Divider>
            <PlayerBracket name="B's 4th place" />
          </div>
          <div className="grow w-full flex justify-center items-center flex-col">
            <PlayerBracket name={aSecondPl.name} />
            <Divider
              childrenStyles={{ padding: "0 10px" }}
              containerStyles={{ width: "50%" }}
            >
              vs
            </Divider>
            <PlayerBracket name="B's 3rd place" />
          </div>
          <div className="grow w-full flex justify-center items-center flex-col">
            <PlayerBracket name="B's 1st place" />
            <Divider
              childrenStyles={{ padding: "0 10px" }}
              containerStyles={{ width: "50%" }}
            >
              vs
            </Divider>
            <PlayerBracket name={aFourthPl.name} />
          </div>
          <div className="grow w-full flex justify-center items-center flex-col">
            <PlayerBracket name="B's 2nd place" />
            <Divider
              childrenStyles={{ padding: "0 10px" }}
              containerStyles={{ width: "50%" }}
            >
              vs
            </Divider>
            <PlayerBracket name={aThirdPl.name} />
          </div>
        </div>

        {/* Semi finals column */}
        <div className="grow flex flex-col justify-center items-center min-w-[185px] gap-4">
          <div className="flex justify-center items-center bg-primary-foreground py-4 w-full rounded-xl">
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
              Semi Finals
            </span>
          </div>

          <div className="grow w-full flex justify-center items-center flex-col">
            <PlayerBracket name="Quarters 1 winner" />
            <Divider
              childrenStyles={{ padding: "0 10px" }}
              containerStyles={{ width: "50%" }}
            >
              vs
            </Divider>
            <PlayerBracket name="Quarters 2 winner" />
          </div>
          <div className="grow w-full flex justify-center items-center flex-col">
            <PlayerBracket name="Quarters 3 winner" />
            <Divider
              childrenStyles={{ padding: "0 10px" }}
              containerStyles={{ width: "50%" }}
            >
              vs
            </Divider>
            <PlayerBracket name="Quarters 4 winner" />
          </div>
        </div>

        {/* finals column */}
        <div className="grow flex flex-col justify-center items-center min-w-[185px] gap-4">
          <div className="flex justify-center items-center bg-primary-foreground py-4 w-full rounded-xl">
            <span className="whitespace-nowrap overflow-hidden text-ellipsis">
              Final
            </span>
          </div>

          <div className="grow w-full flex justify-center items-center flex-col">
            <PlayerBracket name="Semis 1 winner" />
            <Divider
              childrenStyles={{ padding: "0 10px" }}
              containerStyles={{ width: "50%" }}
            >
              vs
            </Divider>
            <PlayerBracket name="Semis 2 winner" />
          </div>
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
        <span className="bg-background" style={childrenStyles}>
          {children}
        </span>
      </div>
    </div>
  );
}

function PlayerBracket({ name }: { name: string }) {
  return (
    <div className="w-[75%] rounded-xl h-16 bg-primary-foreground flex justify-center items-center">
      <span className="whitespace-nowrap overflow-hidden text-ellipsis">
        {name}
      </span>
    </div>
  );
}
