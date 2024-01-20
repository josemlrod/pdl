import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import { AddTournament, ReadTournament } from "~/services/firebase";
import { getErrorMessage } from "~/services/utils";

export async function loader({ params }: LoaderFunctionArgs) {
  const { tournamentId } = params;
  if (tournamentId) {
    try {
      const readTournamentResponse = await ReadTournament({ id: tournamentId });
      const tournament =
        typeof readTournamentResponse !== "string" &&
        readTournamentResponse.data &&
        Object.entries(readTournamentResponse.data).length &&
        readTournamentResponse.data;

      if (tournament) {
        return json({
          data: tournament,
        });
      }
    } catch (e) {
      getErrorMessage(e);
    }
  }

  return redirect("/home");
}

export default function EditTournament() {
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const {
    data: { name, player_num: playerNum, format },
  } = useLoaderData<typeof loader>();

  return (
    <Dialog open onOpenChange={() => navigate("/home")}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create new tournament</DialogTitle>
          <DialogDescription>
            Add a new tournament to start tracking players and their teams!
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
                defaultValue={name}
                className="col-span-3"
                required
                type="text"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="player_num" className="text-right">
                Player number
              </Label>
              <Input
                id="player_num"
                name="player_num"
                placeholder="12"
                defaultValue={playerNum}
                className="col-span-3"
                type="number"
              />
              <Label htmlFor="format" className="text-right">
                Select a format
              </Label>
              <Select defaultValue={format} name="format" required>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Formats</SelectLabel>
                    <SelectItem value="knockout">Knockout</SelectItem>
                    <SelectItem value="league">League</SelectItem>
                    <SelectItem value="knockout_league">
                      League + Knockout
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { tournamentId } = params;
  if (tournamentId) {
    const body = await request.formData();
    const bodyData = Object.fromEntries(body);

    /**
     * TODO:
     * add data validation here
     * name - required, 3 letter min length
     * player_number - required, 2 min players
     */

    const name = String(bodyData.name);
    const playerNum = String(bodyData.player_num);
    const format = String(bodyData.format);

    await AddTournament({
      id: tournamentId,
      name,
      player_num: playerNum,
      format,
    });
  }

  return redirect("/home");
}
