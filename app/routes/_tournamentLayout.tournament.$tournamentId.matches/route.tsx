import React from "react";
import { type LoaderFunctionArgs, json } from "@remix-run/node";
import {
  useLoaderData,
  useNavigate,
  useParams,
  useSearchParams,
} from "@remix-run/react";
import { Dialog, Transition } from "@headlessui/react";
import {
  ArrowLeftIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { Button } from "@/components/ui/button";

import { Match, ReadMatches, ReadPlayers } from "~/services/firebase";
import { getErrorMessage } from "~/services/utils";
import { ModeToggle } from "@/components/ThemeToggle";
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
      matches: groupMatchesByDate(matches as Array<Match>),
      playerNames: getPlayerNames(players),
    });
  } catch (e) {
    getErrorMessage(e);
  }
}

export default function Matches() {
  const navigate = useNavigate();
  const { tournamentId } = useParams();
  const { matches, playerNames } = useLoaderData<typeof loader>();
  const matchDates = Object.keys(matches);
  const sortedDates = sortDates(matchDates);

  const [searchParams, setSearchParams] = useSearchParams();
  const selectedMatchDate = searchParams.get("d");
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [activeFilter, setActiveFilter] = React.useState("date");

  const selectedMatches = selectedMatchDate ? matches[selectedMatchDate] : null;

  // return (
  //   <div className="h-full">
  //     <Transition.Root show={sidebarOpen} as={React.Fragment}>
  //       <Dialog as="div" className="relative z-50" onClose={setSidebarOpen}>
  //         <Transition.Child
  //           as={React.Fragment}
  //           enter="transition-opacity ease-linear duration-300"
  //           enterFrom="opacity-0"
  //           enterTo="opacity-100"
  //           leave="transition-opacity ease-linear duration-300"
  //           leaveFrom="opacity-100"
  //           leaveTo="opacity-0"
  //         >
  //           <div className="fixed inset-0" />
  //         </Transition.Child>

  //         <div className="fixed inset-0 flex">
  //           <Transition.Child
  //             as={React.Fragment}
  //             enter="transition ease-in-out duration-300 transform"
  //             enterFrom="-translate-x-full"
  //             enterTo="translate-x-0"
  //             leave="transition ease-in-out duration-300 transform"
  //             leaveFrom="translate-x-0"
  //             leaveTo="-translate-x-full"
  //           >
  //             <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
  //               <Transition.Child
  //                 as={React.Fragment}
  //                 enter="ease-in-out duration-300"
  //                 enterFrom="opacity-0"
  //                 enterTo="opacity-100"
  //                 leave="ease-in-out duration-300"
  //                 leaveFrom="opacity-100"
  //                 leaveTo="opacity-0"
  //               >
  //                 <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
  //                   <button
  //                     type="button"
  //                     className="-m-2.5 p-2.5"
  //                     onClick={() => setSidebarOpen(false)}
  //                   >
  //                     <span className="sr-only">Close sidebar</span>
  //                     <XMarkIcon
  //                       className="h-6 w-6 text-primary"
  //                       aria-hidden="true"
  //                     />
  //                   </button>
  //                 </div>
  //               </Transition.Child>
  //               {/* Sidebar component, swap this element with another sidebar if you like */}
  //               <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-4 bg-primary-foreground">
  //                 <div className="flex h-16 shrink-0 items-center">
  //                   <Button
  //                     className="w-fit flex justify-center items-center flex-col rounded-lg"
  //                     variant="secondary"
  //                     onClick={() =>
  //                       navigate(`/tournament/${tournamentId}/dashboard`)
  //                     }
  //                   >
  //                     <ArrowLeftIcon className="w-6" />
  //                   </Button>
  //                 </div>
  //                 <nav className="flex flex-1 flex-col">
  //                   <ul role="list" className="flex flex-1 flex-col gap-y-7">
  //                     <li>
  //                       <ul
  //                         role="list"
  //                         className="-mx-2 space-y-1 flex flex-col"
  //                       >
  // {sortedDates.map((d, i) => {
  //   const active = d === selectedMatchDate;
  //   return (
  //     <Button
  //       key={`${d}-${i}`}
  //       className={cn(
  //         "gap-2",
  //         "justify-start",
  //         active
  //           ? "bg-accent text-accent-foreground"
  //           : ""
  //       )}
  //       variant="ghost"
  //       onClick={() => {
  //         searchParams.set("d", d);
  //         setSearchParams(searchParams);
  //       }}
  //     >
  //       {d}
  //     </Button>
  //   );
  // })}
  //                       </ul>
  //                     </li>
  //                   </ul>
  //                 </nav>
  //               </div>
  //             </Dialog.Panel>
  //           </Transition.Child>
  //         </div>
  //       </Dialog>
  //     </Transition.Root>

  //     {/* Static sidebar for desktop */}
  //     <div className="hidden xl:fixed xl:inset-y-0 xl:z-50 xl:flex xl:w-72 xl:flex-col">
  //       {/* Sidebar component, swap this element with another sidebar if you like */}
  //       <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r px-6 pb-4">
  //         <div className="flex h-16 shrink-0 items-center">
  //           <Button
  //             className="w-fit flex justify-center items-center flex-col rounded-lg"
  //             variant="secondary"
  //             onClick={() => navigate(`/tournament/${tournamentId}/dashboard`)}
  //           >
  //             <ArrowLeftIcon className="w-6" />
  //           </Button>
  //         </div>
  //         <nav className="flex flex-1 flex-col">
  //           <ul role="list" className="flex flex-1 flex-col gap-y-7">
  //             <li>
  //               <ul role="list" className="-mx-2 space-y-1 flex flex-col">
  //                 {sortedDates.map((d, i) => {
  //                   const active = d === selectedMatchDate;
  //                   return (
  //                     <Button
  //                       key={`${d}-${i}`}
  //                       className={cn(
  //                         "gap-2",
  //                         "justify-start",
  //                         active ? "bg-accent text-accent-foreground" : ""
  //                       )}
  //                       variant="ghost"
  //                       onClick={() => {
  //                         searchParams.set("d", d);
  //                         setSearchParams(searchParams);
  //                       }}
  //                     >
  //                       {d}
  //                     </Button>
  //                   );
  //                 })}
  //               </ul>
  //             </li>
  //           </ul>
  //         </nav>
  //       </div>
  //     </div>

  //     <div className="xl:pl-72 h-full">
  //       <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
  //         <button
  //           type="button"
  //           className="-m-2.5 p-2.5 xl:hidden"
  //           onClick={() => setSidebarOpen(true)}
  //         >
  //           <span className="sr-only">Open sidebar</span>
  //           <Bars3Icon className="h-6 w-6" aria-hidden="true" />
  //         </button>
  //         <div className="flex w-full justify-center">
  //           <ModeToggle />
  //         </div>
  //       </div>

  //       <main
  //         className="overflow-y-scroll flex px-4 sm:px-6 lg:px-8"
  //         style={{ height: `calc(100dvh - 64px)` }}
  //       >
  //         <div className="grow">
  //           {!selectedMatchDate ? (
  //             <div className="w-full h-full flex justify-center items-center">
  //               <h3 className="text-4xl font-semibold text-muted-foreground">
  //                 Select a date
  //               </h3>
  //             </div>
  //           ) : (
  //             <div className="grid min-[900px]:grid-cols-2 min-[1600px]:grid-cols-3 justify-items-center gap-4 py-8">
  //               {selectedMatches
  //                 ? selectedMatches.map((m: Match, i: number) => (
  //                     <MatchCard key={`${i}-${m.winner.name}`} match={m} />
  //                   ))
  //                 : null}
  //             </div>
  //           )}
  //         </div>
  //       </main>
  //     </div>
  //   </div>
  // );
  const isDateFilterActive = activeFilter === "date";
  const isPlayerNameFilterActive = activeFilter === "player_name";

  return (
    <div className="w-full h-full py-4">
      {/* filter buttons container */}
      <div className="flex justify-end gap-2">
        <Toggle
          className={`w-fit h-fit py-2 bg-primary-background rounded p-4 ${
            isDateFilterActive ? "bg-accent" : "hover:bg-primary-foreground/80"
          }`}
          onPressedChange={(e) => {
            setActiveFilter("date");
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
            setActiveFilter("player_name");
          }}
        >
          By Player Name
        </Toggle>
      </div>

      {/* filter buttons container */}
      <div className="mt-4">
        {isPlayerNameFilterActive ? (
          <dl className="grid grid-cols-2 gap-2 overflow-hidden text-center sm:grid-cols-5 lg:grid-cols-10 pb-2">
            {playerNames.map((name, idx) => (
              <Button
                key={`${name}-${idx}`}
                className={cn(
                  "gap-2"
                  // active ? "bg-accent text-accent-foreground" : ""
                )}
                variant="outline"
                // onClick={() => {
                //   searchParams.set("d", d);
                //   setSearchParams(searchParams);
                // }}
              >
                {name}
              </Button>
            ))}
          </dl>
        ) : (
          <div className="flex gap-2 flex-wrap">
            {sortedDates.map((d, i) => {
              const active = d === selectedMatchDate;
              return (
                <Button
                  key={`${d}-${i}`}
                  className={cn(
                    active ? "bg-accent text-accent-foreground" : ""
                  )}
                  variant="outline"
                  onClick={() => {
                    searchParams.set("d", d);
                    setSearchParams(searchParams);
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
  );
}
