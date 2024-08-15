import React from "react";
import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline";

import { type Match } from "~/services/firebase";
import Data from "~/data.json";
import TrainerSVG from "../../../public/assets/trainer.png";

export default function MatchCard({ match }: { match: Match }) {
  const { data: pokemonData } = Data;

  const [showWinner, setShowWinner] = React.useState(false);

  const [playerOne, playerTwo] = match.playerNames;
  const playerOneTeam = match.pokemonTeams[playerOne].map((pName) => {
    let pkmn;
    for (const result of Object.values(match.results[playerOne])) {
      if (result.githubName.includes(pName)) {
        pkmn = result;
        break;
      }
    }

    return pkmn
      ? {
          ...pkmn,
          spriteUrl: pokemonData.find(
            (pFromDb) => pFromDb.github_name === pkmn.githubName
          )?.spriteUrl,
        }
      : null;
  });

  const playerTwoTeam = match.pokemonTeams[playerTwo].map((pName) => {
    let pkmn;
    for (const result of Object.values(match.results[playerTwo])) {
      if (result.githubName.includes(pName)) {
        pkmn = result;
        break;
      }
    }

    return pkmn
      ? {
          ...pkmn,
          spriteUrl: pokemonData.find(
            (pFromDb) => pFromDb.github_name === pkmn.githubName
          )?.spriteUrl,
        }
      : null;
  });

  const winningTeam =
    match.winner.name === playerOne ? playerOneTeam : playerTwoTeam;

  return (
    <div className="relative w-[343px] sm:w-[420px] h-[420px] transform transition duration-500 hover:scale-105 group">
      <button
        className="h-full w-full absolute inset-0 flex text-start gap-4 bg-muted rounded-lg px-2.5 py-6 items-center"
        onClick={() => setShowWinner(!showWinner)}
      >
        <div className="flex gap-2 flex-col w-52 items-center">
          <h3 className="text-xl font-semibold gap-2">{playerOne}</h3>
          <div className="flex flex-col gap-1">
            {playerOneTeam.map((pkmn, i) => {
              const fainted = !!pkmn?.record.faints;
              return (
                <div className="flex gap-1" key={`${i}-${pkmn?.githubName}`}>
                  <img
                    className={`w-14 ${fainted ? "opacity-25" : "opacity-100"}`}
                    src={pkmn?.spriteUrl}
                  />
                  <div className="flex items-center">
                    <p className="text-muted-foreground">
                      {pkmn?.record.kills} KOs
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <ArrowsRightLeftIcon className="w-8 h-8 text-muted-foreground" />

        <div className="flex gap-2 flex-col w-52 items-center">
          <h3 className="text-xl font-semibold">{playerTwo}</h3>
          <div className="flex flex-col gap-1">
            {playerTwoTeam.map((pkmn, i) => {
              const fainted = !!pkmn?.record.faints;
              return (
                <div className="flex gap-1" key={`${i}-${pkmn?.githubName}`}>
                  <img
                    className={`w-14 ${fainted ? "opacity-25" : "opacity-100"}`}
                    src={pkmn?.spriteUrl}
                  />
                  <div className="flex items-center">
                    <p className="text-muted-foreground">
                      {pkmn?.record.kills} KOs
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </button>
      <div className="flex flex-col items-center justify-center opacity-0 hover:opacity-100 absolute rotate-y-180 w-full h-full bg-[#d2d2d2] dark:bg-[#0F1823] bg-opacity-95 backdrop-visibility rounded-lg overflow-hidden px-4 text-neutral-300 space-y-5 backface-hidden">
        <h3 className="text-xl font-semibold text-primary">Winner</h3>
        <div className="flex gap-2">
          <div className="flex flex-col items-center justify-center gap-2">
            <img className="w-44" src={TrainerSVG} alt="trainer" />
            <p>{match.winner.name}</p>
          </div>
          <div className="flex gap-1 flex-wrap justify-center">
            {winningTeam.map((pkmn, i) => {
              return (
                <div className="flex gap-1" key={`${i}-${pkmn?.githubName}`}>
                  <img className="w-20" src={pkmn?.spriteUrl} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
