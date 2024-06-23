import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  DocumentDuplicateIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
  FireIcon,
  TableCellsIcon,
} from "@heroicons/react/24/outline";

import {
  NavLink,
  Outlet,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { ModeToggle } from "@/components/ThemeToggle";
import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { getErrorMessage, getIsAdmin } from "~/services/utils";
import { ReadTournament, ReadUser } from "~/services/firebase";
import { authCookie } from "~/sessions.server";

const navigationSteps = [
  { name: "Dashboard", href: "dashboard", icon: HomeIcon, current: true },
  { name: "Standings", href: "standings", icon: UsersIcon, current: false },
  {
    name: "Transactions",
    href: "transactions",
    icon: DocumentDuplicateIcon,
    current: false,
  },
  {
    name: "Matches",
    href: "matches",
    icon: TableCellsIcon,
    current: false,
  },
  {
    name: "Knockout",
    href: "ko",
    icon: FireIcon,
    current: false,
  },
];

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { tournamentId } = params;
  const session = await authCookie.getSession(request.headers.get("Cookie"));
  const userId = (session.has("userId") && session.get("userId")) || null;
  let user = null;

  const readUserResponse = await ReadUser({ userId });
  user =
    readUserResponse && typeof readUserResponse !== "string"
      ? readUserResponse.data
      : null;

  if (tournamentId) {
    try {
      const readTournamentResponse = await ReadTournament({ id: tournamentId });
      const tournament =
        typeof readTournamentResponse !== "string" &&
        Object.entries(readTournamentResponse).length &&
        readTournamentResponse.data;

      if (!tournament) {
        return redirect("/home");
      }

      const noPlayers =
        !tournament ||
        !Array.isArray(tournament.players) ||
        !tournament.players.length;

      return json({
        data: {
          tournament,
          noPlayers,
          isAdmin: getIsAdmin(user),
        },
      });
    } catch (e) {
      getErrorMessage(e);
    }
  }

  return redirect("/home");
}

export default function TournamentLayout() {
  const {
    data: { tournament, noPlayers, isAdmin },
  } = useLoaderData<typeof loader>();

  const navigation = useNavigation();
  const navigating = navigation.state !== "idle";

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-full">
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
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
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
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
                    <NavLink to="/">
                      <img
                        className="h-10 w-auto"
                        src="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg"
                        alt="app logo"
                      />
                    </NavLink>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigationSteps.map((item) => (
                            <li key={item.name}>
                              <NavLink
                                to={`../${item.href}`}
                                relative="path"
                                className={({ isActive }) =>
                                  cn(
                                    isActive
                                      ? cn(
                                          buttonVariants({ variant: "link" }),
                                          "underline gap-2"
                                        )
                                      : cn(
                                          buttonVariants({ variant: "link" }),
                                          "gap-2"
                                        )
                                  )
                                }
                                preventScrollReset
                              >
                                <item.icon
                                  className="h-6 w-6 shrink-0"
                                  aria-hidden="true"
                                />
                                {item.name}
                              </NavLink>
                            </li>
                          ))}
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
            <NavLink to="/">
              <img
                className="h-10 w-auto text-primary"
                src="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg"
                alt="app logo"
              />
            </NavLink>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigationSteps.map((item) => (
                    <li key={item.name}>
                      <NavLink
                        to={`../${item.href}`}
                        relative="path"
                        className={({ isActive }) =>
                          cn(
                            isActive
                              ? cn(
                                  buttonVariants({ variant: "link" }),
                                  "underline gap-2"
                                )
                              : cn(buttonVariants({ variant: "link" }), "gap-2")
                          )
                        }
                      >
                        <item.icon
                          className="h-6 w-6 shrink-0"
                          aria-hidden="true"
                        />
                        {item.name}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
              <li>
                <div className="text-xs font-semibold leading-6 text-primary">
                  Actions
                </div>
                <ul role="list" className="-mx-2 mt-2 space-y-1">
                  <li key="new-match">
                    {noPlayers || !isAdmin ? (
                      <Button className="gap-2" disabled variant="link">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium">
                          N
                        </span>
                        <span className="truncate">New match</span>
                      </Button>
                    ) : (
                      <NavLink
                        to={`../new-match/select-players`}
                        aria-disabled={noPlayers}
                        relative="path"
                        preventScrollReset
                        className={({ isActive }) =>
                          cn(
                            isActive
                              ? cn(
                                  buttonVariants({ variant: "link" }),
                                  "underline gap-2"
                                )
                              : cn(buttonVariants({ variant: "link" }), "gap-2")
                          )
                        }
                      >
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border text-[0.625rem] font-medium">
                          N
                        </span>
                        <span className="truncate">New match</span>
                      </NavLink>
                    )}
                  </li>
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
            {navigating ? (
              <div
                role="status"
                className="flex items-center justify-center h-screen"
              >
                <svg
                  aria-hidden="true"
                  className="w-8 h-8 text-primary-foreground animate-spin fill-primary"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
            ) : (
              <Outlet
                context={{
                  tournament,
                  noPlayers,
                }}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
