import { Link, Outlet, useLoaderData } from "@remix-run/react";
import { json, type MetaFunction } from "@remix-run/node";

import { buttonVariants } from "@/components/ui/button";
import { getErrorMessage } from "~/services/utils";
import { ReadTournaments } from "~/services/firebase";
import { cn } from "@/lib/utils";

export const meta: MetaFunction = () => {
  return [
    { title: "PokemonDL" },
    {
      name: "description",
      content: "Where your Pokemon tournament data lives!",
    },
  ];
};

export async function loader() {
  try {
    const tournaments = await ReadTournaments();

    return json({ data: tournaments?.data ?? null });
  } catch (error) {
    getErrorMessage(error);
  }
}

export default function Home() {
  const { data: tournaments } = useLoaderData<typeof loader>();
  const hasTournaments =
    tournaments && Array.isArray(tournaments) && tournaments.length;

  return (
    <div
      className="container px-2 sm:px-8"
      style={{ height: `calc(100dvh - 72px)` }}
    >
      <section className="py-6 sm:10 md:py-14">
        <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 gap-y-4 flex flex-col">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-4xl font-bold tracking-tight text-primary sm:text-6xl">
              👋
            </h2>
            <p className="mt-6 text-lg leading-8 text-secondary-foreground">
              Start by creating a tournament. This will allow you to add
              players, their teams, matches, follow the standings, and the
              players' transactions!
            </p>
          </div>
          <Link
            className={cn(buttonVariants({ variant: "default" }), "w-fit")}
            to="../new-tournament"
          >
            New
          </Link>
        </div>
      </section>

      <section className="px-2 sm:px-6 lg:px-8">
        {hasTournaments ? (
          <>
            <div className="border-b border-primary pb-5 mb-5 sm:flex sm:items-center sm:justify-between">
              <h3 className="text-base font-semibold leading-6 text-primary">
                Tournaments
              </h3>
            </div>
            <div className="flex flex-col gap-4">
              {tournaments.map((t, index) => (
                <div className="flex gap-6" key={index}>
                  <Link
                    className={cn(
                      buttonVariants({ variant: "secondary" }),
                      "py-8 justify-between flex grow"
                    )}
                    to={`../tournament/${t.id}`}
                  >
                    {t.name}
                  </Link>
                  <Link
                    className={cn(
                      buttonVariants({ variant: "secondary" }),
                      "py-8"
                    )}
                    to={`../edit/${t.id}`}
                  >
                    Edit
                  </Link>
                </div>
              ))}
            </div>
          </>
        ) : (
          <TournamentsEmptyState />
        )}
      </section>
      <Outlet />
    </div>
  );
}

function TournamentsEmptyState() {
  return (
    <button
      type="button"
      className="relative block w-full rounded-lg border-2 border-dashed border-primary p-12 text-center hover:border-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
    >
      <svg
        className="mx-auto h-12 w-12 text-primary"
        stroke="currentColor"
        fill="none"
        viewBox="0 0 48 48"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 14v20c0 4.418 7.163 8 16 8 1.381 0 2.721-.087 4-.252M8 14c0 4.418 7.163 8 16 8s16-3.582 16-8M8 14c0-4.418 7.163-8 16-8s16 3.582 16 8m0 0v14m0-4c0 4.418-7.163 8-16 8S8 28.418 8 24m32 10v6m0 0v6m0-6h6m-6 0h-6"
        />
      </svg>
      <span className="mt-2 block text-sm font-semibold text-primary">
        Create a new tournament
      </span>
    </button>
  );
}
