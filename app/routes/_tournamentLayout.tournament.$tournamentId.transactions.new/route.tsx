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
import {
  type Player,
  ReadPlayers,
  ReadUser,
  ReadPlayerByName,
  AddPlayer,
} from "~/services/firebase";
import { getErrorMessage, getIsAdmin } from "~/services/utils";
import { authCookie } from "~/sessions.server";
import Data from "../../data.json";
import type { Pokemon } from "../_tournamentLayout.tournament.$tournamentId.dashboard/pokemon-list";

export const TransactionTypes = Object.freeze({
  TERA_CAPTAIN: "Tera captain",
  TRANSFER: "Transfer",
});

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { tournamentId } = params;
  const session = await authCookie.getSession(request.headers.get("Cookie"));
  const userId = (session.has("userId") && session.get("userId")) || null;
  let user = null;

  const readUserResponse = userId ? await ReadUser({ userId }) : null;
  user =
    readUserResponse && typeof readUserResponse !== "string"
      ? readUserResponse.data
      : null;
  const isAdmin = getIsAdmin(user);

  if (tournamentId && isAdmin) {
    try {
      const readPlayersResponse = await ReadPlayers({ tournamentId });
      const players =
        readPlayersResponse &&
        readPlayersResponse.data &&
        Object.entries(readPlayersResponse.data).length &&
        readPlayersResponse.data;

      return json({
        data: players,
      });
    } catch (e) {
      getErrorMessage(e);
    }
  }

  return redirect("/home");
}

export default function NewTransaction() {
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const { data: players } = useLoaderData<typeof loader>();
  const playerNames = players.map((p: Player) => p.name);

  return (
    <Dialog open onOpenChange={() => navigate("/home")}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add new transaction</DialogTitle>
          <DialogDescription>
            Reinforce your team by transferring existing Pokemon in your roster
            for new Pokemon or change your Tera Captain
          </DialogDescription>
        </DialogHeader>
        <fetcher.Form method="post">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="player_name" className="text-right">
                Player name
              </Label>
              <Select defaultValue={playerNames[0]} name="player_name" required>
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="outgoing_pokemon" className="text-right">
                Outgoing pokemon
              </Label>
              <Input
                id="outgoing_pokemon"
                name="outgoing_pokemon"
                placeholder="Muk"
                defaultValue={""}
                className="col-span-3"
                type="text"
              />
              <Label htmlFor="incoming_pokemon" className="text-right">
                Incoming pokemon
              </Label>
              <Input
                id="incoming_pokemon"
                name="incoming_pokemon"
                placeholder="Rayquaza"
                defaultValue={""}
                className="col-span-3"
                type="text"
              />
              <Label htmlFor="transaction_type" className="text-right">
                Transaction type
              </Label>
              <Select defaultValue="transfer" name="transaction_type" required>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="tera_captain">Tera Captain</SelectItem>
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
     */
    const {
      player_name: playerName,
      outgoing_pokemon: outgoing,
      incoming_pokemon: incoming,
      transaction_type: type,
    } = bodyData;

    if (type === TransactionTypes.TERA_CAPTAIN) {
      const {
        data: { id: player_id, pokemon, transactions },
      } =
        (await ReadPlayerByName({ name: String(playerName), tournamentId })) ||
        {};

      for (const p of pokemon) {
        if (p.githubName === outgoing) {
          p.isTeraCaptain = false;
        } else if (p.githubName === incoming) {
          p.isTeraCaptain = true;
        }
      }

      const newTransactionsData = [
        ...transactions,
        {
          player_name: playerName,
          in: incoming,
          out: outgoing,
          type,
        },
      ];

      await AddPlayer({
        id: player_id,
        pokemon,
        transactions: newTransactionsData,
        tournamentId,
      });
    } else if (type === TransactionTypes.TRANSFER) {
      const { data: pkmnData } = Data;
      const incomingPokemon = pkmnData.find((p) => p.github_name === incoming);
      const {
        data: { id: player_id, pokemon, previousPokemon, transactions },
      } =
        (await ReadPlayerByName({ name: String(playerName), tournamentId })) ||
        {};
      const [outgoingPokemon] = pokemon.filter((p: Pokemon) => {
        return p.githubName === outgoing;
      });
      const filteredPokemon = pokemon.filter((p: Pokemon) => {
        return p.githubName !== outgoing;
      });
      const newPkmnData = [
        ...filteredPokemon,
        incomingPokemon
          ? {
              githubName: incomingPokemon.github_name,
              name: incomingPokemon.name,
              id: crypto.randomUUID(),
              pts: incomingPokemon.pts,
              record: {
                faints: 0,
                kills: 0,
              },
            }
          : undefined,
      ].filter(Boolean);
      const newTransactionsData = [
        ...transactions,
        {
          player_name: playerName,
          in: incoming,
          out: outgoing,
          type,
        },
      ];
      const newPreviousPokemon = [...previousPokemon, outgoingPokemon];

      await AddPlayer({
        id: player_id,
        pokemon: newPkmnData,
        transactions: newTransactionsData,
        previousPokemon: newPreviousPokemon,
        tournamentId,
      });
    }

    return redirect(`/tournament/${tournamentId}/transactions`);
  }

  return redirect("/home");
}
