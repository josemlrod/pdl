import { useState } from "react";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { NavLink, useLoaderData, useMatches } from "@remix-run/react";
import { cn } from "@/lib/utils";
import { AddPlayer, ReadUser, type Player } from "~/services/firebase";
import { buttonVariants } from "@/components/ui/button";

import EmptyState from "./empty-state";
import PokemonList, { type Pokemon } from "./pokemon-list";
import CardLayout from "./card";
import SheetButton from "./sheet";
import Search from "./search";
import { authCookie } from "~/sessions.server";
import { getIsAdmin } from "~/services/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await authCookie.getSession(request.headers.get("Cookie"));
  const userId = (session.has("userId") && session.get("userId")) || null;
  let user = null;

  const readUserResponse = await ReadUser({ userId });
  user =
    readUserResponse && typeof readUserResponse !== "string"
      ? readUserResponse.data
      : null;

  return json({ user: user ?? null });
}

export default function TournamentDashboard() {
  const { user } = useLoaderData<typeof loader>();
  const matches = useMatches();
  const tournamentLayoutMatch = matches.find(
    (m) => m.id === "routes/_tournamentLayout"
  );
  const tournamentLayoutData =
    tournamentLayoutMatch &&
    tournamentLayoutMatch.data &&
    tournamentLayoutMatch.data.data;
  const { tournament, noPlayers } = tournamentLayoutData;
  const isAdmin = getIsAdmin(user);

  const [openSearch, setOpenSearch] = useState(false);

  const usersIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="mx-auto h-12 w-12"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  );
  const plusIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="mx-auto h-12 w-12 text-gray-400"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  );

  return noPlayers ? (
    <EmptyState
      icon={usersIcon}
      subtitle="Get started by adding a player"
      title="No players added"
    />
  ) : (
    <div className="py-4 grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-2">
      {tournament.players.map((p: Player, i: number) => {
        const hasAddedPokemon =
          p.pokemon && Array.isArray(p.pokemon) && p.pokemon.length;
        const costAddedPokemon =
          (hasAddedPokemon &&
            p.pokemon.reduce(
              (acc: number, cur: Pokemon) => Number(acc) + Number(cur.pts),
              0
            )) ||
          0;
        const canAddMorePokemon = costAddedPokemon < 120;
        const isHidden = p.isHidden;

        const header = (
          <div className="grid grid-cols-2 gap-y-1">
            <div className="font-bold text-center truncate">{p.name}</div>
            <div className="text-center truncate">
              {p.initialDraftPoints - costAddedPokemon} pts remaining
            </div>
            <div className="text-center truncate col-span-2 italic">
              {p.team_name}
            </div>
          </div>
        );

        const body = (
          <div className="w-full flex flex-col h-auto">
            {(hasAddedPokemon && <PokemonList pokemon={p.pokemon} />) || (
              <div className="text-center flex flex-col items-center grow">
                {plusIcon}
                <h3 className="mt-2 text-sm font-semibold">Add pokemon</h3>
                <p className="mt-1 text-sm">
                  Select the pokemon that will conform your roster!
                </p>
              </div>
            )}
            <div className="mt-2 flex w-full justify-between">
              <div>
                <NavLink
                  className={cn(buttonVariants({ variant: "ghost" }))}
                  preventScrollReset
                  relative="path"
                  to={`../previous-pokemon/${p.id}`}
                >
                  See previous Pokemon
                </NavLink>
              </div>
              <div className="flex gap-x-1">
                <SheetButton
                  buttonProps={{
                    variant: "ghost",
                  }}
                  buttonLabel="Edit"
                  player={p}
                />
                <button
                  className={cn(buttonVariants({ variant: "default" }))}
                  disabled={!canAddMorePokemon || !isAdmin}
                  onClick={() => {
                    setOpenSearch(true);
                  }}
                  type="button"
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        );

        return isHidden ? null : (
          <CardLayout
            body={body}
            header={header}
            key={i}
            styles={{ minWidth: 300, minHeight: 500 }}
          />
        );
      })}
      <Search open={openSearch} setOpen={setOpenSearch} />
    </div>
  );
}

export async function action({ params, request }: ActionFunctionArgs) {
  const { tournamentId } = params;
  const body = await request.formData();
  const data = Object.fromEntries(body);

  const id = String(data.id) || "";
  const name = String(data.name) || "";
  const teamName = String(data.team_name) || "";

  if (tournamentId) {
    await AddPlayer({
      id,
      tournamentId,
      name,
      team_name: teamName,
    });
  }

  return json({});
}
