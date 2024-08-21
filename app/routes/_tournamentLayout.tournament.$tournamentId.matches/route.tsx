import React from "react";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";

import { Button } from "@/components/ui/button";

import { Match, ReadMatches, ReadPlayers } from "~/services/firebase";
import { getErrorMessage } from "~/services/utils";
import { cn } from "@/lib/utils";
import MatchCard from "./MatchCard";
import { getPlayerNames, groupMatchesByDate, sortDates } from "./utils";
import { Toggle } from "@radix-ui/react-toggle";

export async function loader({ params }: LoaderFunctionArgs) {
  const { tournamentId } = params;

  try {
    const { data: matches } =
      (await ReadMatches({
        tournamentId: String(tournamentId),
      })) || {};

    const { data: players } =
      (await ReadPlayers({
        tournamentId: String(tournamentId),
      })) || {};

    return json({
      matches,
      matchDates: Object.keys(groupMatchesByDate(matches as Array<Match>)),
      playerNames: getPlayerNames(players),
    });
  } catch (e) {
    getErrorMessage(e);
  }
}

export default function Matches() {
  const navigate = useNavigate();
  const { tournamentId } = useParams();
  const { matches, playerNames, matchDates } = useLoaderData<typeof loader>();
  const sortedDates = sortDates(matchDates);

  const [activeFilterType, setActiveFilterType] = React.useState("date");
  const [activeFilter, setActiveFilter] = React.useState(sortedDates[0]);

  const isDateFilterActive = activeFilterType === "date";
  const isPlayerNameFilterActive = activeFilterType === "player_name";

  const filteredMatches = matches?.filter((m) => {
    if (activeFilterType === "player_name") {
      return m.playerNames.includes(activeFilter);
    }

    return m.playedOn === activeFilter;
  });

  return (
    <>
      <div className="sticky top-0 z-10 px-4 sm:px-6 lg:px-8 py-4 bg-gray-400 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10">
        {/* filter type buttons container */}
        <div className="flex justify-end gap-2">
          <Toggle
            className={`w-fit h-fit py-2 bg-primary-background rounded p-4 ${
              isDateFilterActive
                ? "bg-accent"
                : "hover:bg-primary-foreground/80"
            }`}
            onPressedChange={(e) => {
              setActiveFilterType("date");
              setActiveFilter(matchDates[0]);
            }}
          >
            By Date
          </Toggle>
          <Toggle
            className={`w-fit h-fit py-2 bg-primary-background rounded p-4 ${
              isPlayerNameFilterActive
                ? "bg-accent"
                : "hover:bg-primary-foreground/80"
            }`}
            onPressedChange={(e) => {
              setActiveFilterType("player_name");
              setActiveFilter(playerNames[0]);
            }}
          >
            By Player Name
          </Toggle>
        </div>

        {/* filter buttons container */}
        <div className="mt-4">
          {isPlayerNameFilterActive ? (
            <dl className="grid grid-cols-2 gap-2 overflow-hidden text-center sm:grid-cols-5 lg:grid-cols-10 pb-2">
              {playerNames.map((name, idx) => {
                const active = activeFilter === name;
                return (
                  <Button
                    key={`${name}-${idx}`}
                    className={cn(
                      "gap-2",
                      active ? "bg-accent text-accent-foreground" : ""
                    )}
                    variant="outline"
                    onClick={() => {
                      setActiveFilter(name);
                    }}
                  >
                    {name}
                  </Button>
                );
              })}
            </dl>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {sortedDates.map((d, i) => {
                const active = d === activeFilter;
                return (
                  <Button
                    key={`${d}-${i}`}
                    className={cn(
                      active ? "bg-accent text-accent-foreground" : ""
                    )}
                    variant="outline"
                    onClick={() => {
                      setActiveFilter(d);
                    }}
                  >
                    {d}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div className="w-full h-full py-4">
        {/* filter results container */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4 place-items-center overflow-hidden">
          {filteredMatches
            ? filteredMatches.map((m: Match, i: number) => (
                <MatchCard key={`${i}-${m.winner.name}`} match={m} />
              ))
            : null}
        </div>
      </div>
    </>
  );
}
