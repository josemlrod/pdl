import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useFetcher } from "@remix-run/react";
import { VariantProps } from "class-variance-authority";
import type { Player } from "~/services/firebase";

export default function SheetButton({
  buttonProps,
  buttonLabel,
  player,
}: {
  buttonProps: VariantProps<typeof buttonVariants>;
  buttonLabel: string;
  player: Player;
}) {
  const fetcher = useFetcher();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button {...buttonProps}>{buttonLabel}</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit player</SheetTitle>
          <SheetDescription>
            Make changes to your player information. Click save when you're
            done.
          </SheetDescription>
        </SheetHeader>
        <fetcher.Form method="post">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <input hidden name="id" value={player.id} readOnly />
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={player.name}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="team_name" className="text-right">
                Team name
              </Label>
              <Input
                id="team_name"
                name="team_name"
                defaultValue={player.team_name}
                className="col-span-3"
              />
            </div>
          </div>
          <SheetFooter>
            <SheetClose asChild>
              <Button type="submit">Save changes</Button>
            </SheetClose>
          </SheetFooter>
        </fetcher.Form>
      </SheetContent>
    </Sheet>
  );
}
