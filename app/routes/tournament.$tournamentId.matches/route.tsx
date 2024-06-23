import React from "react";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import {
  Link,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { Dialog, Transition } from "@headlessui/react";
import {
  ArrowLeftIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { Button, buttonVariants } from "@/components/ui/button";

import { Match, ReadMatches } from "~/services/firebase";
import { getErrorMessage } from "~/services/utils";
import { ModeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import MatchCard from "./MatchCard";
import { sortDates } from "./utils";

export async function loader({ params }: LoaderFunctionArgs) {
  const { tournamentId } = params;

  try {
    const { data: matches } =
      (await ReadMatches({
        tournamentId: String(tournamentId),
      })) || {};
    return json({
      matches: Object.groupBy(matches, ({ playedOn }: Match) => playedOn),
    });
  } catch (e) {
    console.log(getErrorMessage(e));
    return {
      matches: [],
      e: getErrorMessage(e),
    };
  }
}

export default function Matches() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { matches } = useLoaderData<typeof loader>();
  const matchDates = Object.keys(matches);
  const sortedDates = sortDates(matchDates);

  const selectedMatchDate = searchParams.get("d");
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const selectedMatches = selectedMatchDate ? matches[selectedMatchDate] : null;

  return (
    <div className="h-full">
      <Transition.Root show={sidebarOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setSidebarOpen}>
          <Transition.Child
            as={React.Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={React.Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={React.Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon
                        className="h-6 w-6 text-primary"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>
                {/* Sidebar component, swap this element with another sidebar if you like */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4 bg-primary-foreground">
                  <div className="flex h-16 shrink-0 items-center">
                    <Button
                      className="w-fit flex justify-center items-center flex-col rounded-lg"
                      variant="secondary"
                      onClick={() => navigate(-1)}
                    >
                      <ArrowLeftIcon className="w-6" />
                    </Button>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul
                          role="list"
                          className="-mx-2 space-y-1 flex flex-col"
                        >
                          {sortedDates.map((d, i) => {
                            const active = d === selectedMatchDate;
                            return (
                              <Button
                                key={`${d}-${i}`}
                                className={cn(
                                  "gap-2",
                                  "justify-start",
                                  active
                                    ? "bg-accent text-accent-foreground"
                                    : ""
                                )}
                                variant="ghost"
                                onClick={() => {
                                  searchParams.set("d", d);
                                  setSearchParams(searchParams);
                                }}
                              >
                                {d}
                              </Button>
                            );
                          })}
                        </ul>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-72 xl:flex-col">
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <Button
              className="w-fit flex justify-center items-center flex-col rounded-lg"
              variant="secondary"
              onClick={() => navigate(-1)}
            >
              <ArrowLeftIcon className="w-6" />
            </Button>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1 flex flex-col">
                  {sortedDates.map((d, i) => {
                    const active = d === selectedMatchDate;
                    return (
                      <Button
                        key={`${d}-${i}`}
                        className={cn(
                          "gap-2",
                          "justify-start",
                          active ? "bg-accent text-accent-foreground" : ""
                        )}
                        variant="ghost"
                        onClick={() => {
                          searchParams.set("d", d);
                          setSearchParams(searchParams);
                        }}
                      >
                        {d}
                      </Button>
                    );
                  })}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="xl:pl-72 h-full">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 xl:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex w-full justify-center">
            <ModeToggle />
          </div>
        </div>

        <main
          className="overflow-y-scroll flex px-4 sm:px-6 lg:px-8"
          style={{ height: `calc(100dvh - 64px)` }}
        >
          <div className="grow">
            {!selectedMatchDate ? (
              <div className="w-full h-full flex justify-center items-center">
                <h3 className="text-4xl font-semibold text-muted-foreground">
                  Select a date
                </h3>
              </div>
            ) : (
              <div className="grid min-[900px]:grid-cols-2 min-[1600px]:grid-cols-3 justify-items-center gap-4 py-8">
                {selectedMatches.map((m: Match, i: number) => (
                  <MatchCard key={`${i}-${m.winner.name}`} match={m} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
