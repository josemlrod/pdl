import { Fragment, useState } from "react";
import { Dialog, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  DocumentDuplicateIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

import { NavLink, Outlet, useMatches } from "@remix-run/react";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { ModeToggle } from "@/components/ThemeToggle";

const navigation = [
  { name: "Dashboard", href: "dashboard", icon: HomeIcon, current: true },
  { name: "Standings", href: "standings", icon: UsersIcon, current: false },
  {
    name: "Transactions",
    href: "transactions",
    icon: DocumentDuplicateIcon,
    current: false,
  },
];

export default function TournamentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const matches = useMatches();

  //   const {
  //     data: { players },
  //   } =
  //     Array.isArray(matches) &&
  //     matches.length &&
  //     matches.find((m) => m.id === "routes/tournament.$tournamentId");
  //   const noPlayers = !players || (Array.isArray(players) && !players.length);
  const noPlayers = true;

  return (
    <div className="h-full">
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 lg:hidden"
          onClose={setSidebarOpen}
        >
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
                          {navigation.map((item) => (
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
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
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
                  {navigation.map((item) => (
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
                    {noPlayers ? (
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

      <div className="lg:pl-72 h-full">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-primary lg:hidden" aria-hidden="true" />

          <div className="flex w-full justify-end">
            <ModeToggle />
          </div>
        </div>

        <main
          className="py-4 sm:py-10 overflow-scroll flex"
          style={{ height: `calc(100dvh - 64px)` }}
        >
          <div className="px-4 sm:px-6 lg:px-8 grow">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
