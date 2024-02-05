import { useFetcher, useNavigate } from "@remix-run/react";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { v4 as uuidv4 } from "uuid";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useIsSubmitting } from "../../hooks/useIsSubmitting";
import { AddPlayer } from "~/services/firebase";

export async function loader() {
  return {};
}

export default function NewPlayer() {
  const navigate = useNavigate();
  const isSubmitting = useIsSubmitting();
  const fetcher = useFetcher();

  return (
    <Dialog open onOpenChange={() => navigate(-1)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create new player</DialogTitle>
          <DialogDescription>
            Add a player with its roster to participate on the League!
          </DialogDescription>
        </DialogHeader>
        <fetcher.Form method="post">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="Last Hope"
                defaultValue=""
                className="col-span-3"
                required
                type="text"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="team_name" className="text-right">
                Team name
              </Label>
              <Input
                id="team_name"
                name="team_name"
                placeholder="Real Madrid FC"
                defaultValue=""
                className="col-span-3"
                type="text"
              />
            </div>
          </div>
          <DialogFooter>
            <Button disabled={isSubmitting} type="submit">
              Save
            </Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}

export async function action({ params, request }: ActionFunctionArgs) {
  const { tournamentId } = params;
  const body = await request.formData();
  const bodyData = Object.fromEntries(body);

  const { name, team_name } = bodyData;

  if (tournamentId) {
    const playerId = uuidv4();
    await AddPlayer({
      tournamentId,
      id: playerId,
      name: String(name),
      team_name: String(team_name),
    });
  }

  return redirect(`/tournament/${tournamentId}/dashboard`);
}
