import { PlusIcon } from "@heroicons/react/24/outline";
import { NavLink } from "@remix-run/react";
import { Button, buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

export default function FloatingActionButton({
  isAdmin,
  pathname,
}: {
  isAdmin: boolean;
  pathname: string;
}) {
  return !isAdmin ? (
    <Button
      className="fixed bottom-9 right-14 rounded-full px-1 opacity-50 cursor-not-allowed"
      disabled={!isAdmin}
      variant="default"
    >
      <PlusIcon className="h-7 w-7" aria-hidden="true" />
    </Button>
  ) : (
    <NavLink
      className={cn(
        buttonVariants({ variant: "default" }),
        "fixed bottom-9 right-14 rounded-full px-1"
      )}
      relative="path"
      end
      key="new-player-action-button"
      preventScrollReset
      to={pathname}
    >
      <PlusIcon className="h-7 w-7" aria-hidden="true" />
    </NavLink>
  );
}
