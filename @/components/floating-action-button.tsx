import { PlusIcon } from "@heroicons/react/24/outline";
import { NavLink } from "@remix-run/react";
import { buttonVariants } from "./ui/button";
import { cn } from "@/lib/utils";

export default function FloatingActionButton({
  pathname,
}: {
  pathname: string;
}) {
  return (
    <NavLink
      className={cn(
        buttonVariants({ variant: "outline" }),
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
