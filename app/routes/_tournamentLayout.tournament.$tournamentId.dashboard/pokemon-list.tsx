import { cn } from "@/lib/utils";
import Data from "../../data.json";

export type Pokemon = {
  githubName: string;
  name: string;
  pts: string;
  id: string;
  record: {
    kills: number;
    faints: number;
  };
  isTeraCaptain?: boolean;
};

type Props = {
  pokemon: Pokemon[];
};

export default function PokemonList({ pokemon }: Props) {
  return (
    <ul className="space-y-1 w-full grow">
      {pokemon.map((p) => {
        const { isTeraCaptain } = p;
        const { data: pokemonData } = Data;
        const spriteUrlFromJson = pokemonData.find(
          (pFromDb) => pFromDb.github_name === p.githubName
        )?.spriteUrl;
        return (
          <li
            className={`overflow-hidden rounded-md ${
              (isTeraCaptain && "bg-warning text-warning-foreground") ||
              "bg-accent"
            } px-6 py-1 shadow flex flex-row justify-between items-center`}
            key={p.id}
          >
            <div
              className={cn(
                "flex h-10 w-10 flex-none items-center justify-center rounded-lg"
              )}
            >
              <img
                alt={`${p.githubName} sprite`}
                className="h-10 w-10"
                src={spriteUrlFromJson}
              />
            </div>
            <div>
              <b className="text-nowrap">{p.name}</b>
              <p className="text-center">{p.pts}</p>
            </div>

            <div>
              <p className="text-lime-600 text-nowrap">
                {p.record.kills} kills
              </p>
              <p className="text-red-600 text-nowrap">
                {p.record.faints} faints
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
