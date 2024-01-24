import { useFetcher, useNavigate } from "@remix-run/react";
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
import { AddTournament, ReadUser } from "~/services/firebase";
import { authCookie } from "~/sessions.server";
import { getIsAdmin } from "~/services/utils";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await authCookie.getSession(request.headers.get("Cookie"));
  const userId = (session.has("userId") && session.get("userId")) || null;
  let user = null;

  const readUserResponse = userId ? await ReadUser({ userId }) : null;
  user =
    readUserResponse && typeof readUserResponse !== "string"
      ? readUserResponse.data
      : null;
  const isAdmin = getIsAdmin(user);

  if (isAdmin) {
    return json({});
  }

  return redirect("/home");
}

export default function NewTournament() {
  const navigate = useNavigate();
  const fetcher = useFetcher();

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
                defaultValue=""
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
                defaultValue=""
                className="col-span-3"
                type="number"
              />
              <Label htmlFor="format" className="text-right">
                Select a format
              </Label>
              <Select defaultValue="knockout" name="format" required>
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

export async function action({ request }: ActionFunctionArgs) {
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
    id: crypto.randomUUID(),
    name,
    player_num: playerNum,
    format,
  });

  return redirect("/home");
}
