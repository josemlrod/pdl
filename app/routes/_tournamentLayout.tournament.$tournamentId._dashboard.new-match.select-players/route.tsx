import { useFetcher, useOutletContext } from "@remix-run/react";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { Button } from "@/components/ui/button";
import {
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Player } from "~/services/firebase";

export default function SelectPlayers() {
  const fetcher = useFetcher();
  const { players } = useOutletContext<{ players: Player[] }>();
  const playerNames = players.map((p: Player) => p.name);

  return (
    <>
      <DialogHeader>
        <DialogTitle>New match</DialogTitle>
        <DialogDescription>
          Choose the players who participated in this match
        </DialogDescription>
      </DialogHeader>
      <fetcher.Form method="post">
        <div className="grid gap-4 py-4">
          <div className="gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="player_one" className="text-right">
                Player one
              </Label>
              <Select defaultValue={playerNames[0]} name="player_one" required>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {playerNames
                      ? playerNames.map((p: string, idx: number) => (
                          <SelectItem key={idx} value={p}>
                            {p}
                          </SelectItem>
                        ))
                      : null}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4">
              {fetcher.data?.playerOne ? (
                <em className="col-start-2 col-span-3 text-destructive text-sm">
                  {fetcher.data.playerOne}
                </em>
              ) : null}
            </div>
          </div>
          <div className="gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="player_two" className="text-right">
                Player two
              </Label>
              <Select defaultValue={playerNames[1]} name="player_two" required>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {playerNames
                      ? playerNames.map((p: string, idx: number) => (
                          <SelectItem key={idx} value={p}>
                            {p}
                          </SelectItem>
                        ))
                      : null}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4">
              {fetcher.data?.playerTwo ? (
                <em className="col-start-2 col-span-3 text-destructive text-sm">
                  {fetcher.data.playerTwo}
                </em>
              ) : null}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Next</Button>
        </DialogFooter>
      </fetcher.Form>
    </>
  );
}

export async function action({ params, request }: ActionFunctionArgs) {
  const { tournamentId } = params;
  const body = await request.formData();
  const bodyData = Object.fromEntries(body);
  const { player_one, player_two } = bodyData;

  let errors: { playerOne?: string; playerTwo?: string } = {};

  if (typeof player_one !== "string" || !player_one) {
    errors.playerOne = "Please provide player one";
  }

  if (typeof player_two !== "string" || !player_two) {
    errors.playerTwo = "Please provide player two";
  }

  if (player_one === player_two) {
    errors.playerOne = "Player one, and player two can't be the same.";
    errors.playerTwo = "Player one, and player two can't be the same.";
  }

  if (Object.keys(errors).length) {
    return errors;
  } else {
    return redirect(
      `/tournament/${tournamentId}/new-match/select-pokemon?playerOne=${player_one}&playerTwo=${player_two}`
    );
  }
}
