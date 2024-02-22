import {
  useFetcher,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
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
import { useEffect, useState } from "react";

export const TransactionTypes = Object.freeze({
  TERA_CAPTAIN: "tera captain",
  TRANSFER: "transfer",
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
      console.log(readPlayersResponse.data);
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
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedPlayer = searchParams.get("selected_player");

  const [incomingPokemonQuery, setIncomingPokemonQuery] = useState("");

  const { data } = Data;
  const filteredItems =
    incomingPokemonQuery === ""
      ? []
      : data.filter((item) => {
          return item.name
            .toLowerCase()
            .includes(incomingPokemonQuery.toLowerCase());
        });

  const selectedPlayerPokemon = selectedPlayer
    ? players.find((p: Player) => p.name === selectedPlayer).pokemon
    : [];

  return (
    <Dialog open onOpenChange={() => navigate("..")}>
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
              <Select
                defaultValue={String(selectedPlayer)}
                name="player_name"
                required
                onValueChange={(value) => {
                  const params = new URLSearchParams();
                  params.set("selected_player", value);
                  setSearchParams(params, { preventScrollReset: true });
                }}
              >
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
              <Select
                defaultValue={selectedPlayerPokemon[0].githubName}
                name="outgoing_pokemon"
                required
              >
                <SelectTrigger className="w-[180px] col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {selectedPlayerPokemon.map((p: Pokemon, idx: number) => (
                      <SelectItem key={idx} value={p.githubName}>
                        {p.githubName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Label htmlFor="incoming_pokemon" className="text-right">
                Incoming pokemon
              </Label>
              <Input
                id="incoming_pokemon"
                name="incoming_pokemon"
                placeholder="Rayquaza"
                defaultValue={incomingPokemonQuery}
                value={incomingPokemonQuery}
                onChange={(e) => {
                  const q = e.target.value;
                  setIncomingPokemonQuery(q);
                }}
                className="col-span-2"
                type="text"
              />
              {filteredItems.length ? (
                <span className="text-xs text-green-300">
                  {filteredItems[0].github_name}
                </span>
              ) : incomingPokemonQuery ? (
                <span>🚫</span>
              ) : (
                <span />
              )}
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
              id: uuidv4(),
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
  }

  return redirect(`/tournament/${tournamentId}/transactions`);
}
