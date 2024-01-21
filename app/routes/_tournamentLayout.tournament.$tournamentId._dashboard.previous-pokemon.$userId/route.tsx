import { useNavigate, useOutletContext, useParams } from "@remix-run/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NoSymbolIcon } from "@heroicons/react/24/outline";

import { Player } from "~/services/firebase";
import PokemonList from "../_tournamentLayout.tournament.$tournamentId.dashboard/pokemon-list";

type ContextType = {
  players: Player[];
};

export default function PreviousPokemon() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { players } = useOutletContext<ContextType>();

  const [{ previousPokemon }] = players.filter((p) => p.id === userId);
  const hasPreviousPokemon =
    previousPokemon && Array.isArray(previousPokemon) && previousPokemon.length;

  return (
    <Dialog open onOpenChange={() => navigate(-1)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Previous Pokemon</DialogTitle>
          <DialogDescription>
            Here you can see your transfers.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 flex justify-center">
          {hasPreviousPokemon ? (
            <PokemonList pokemon={previousPokemon} />
          ) : (
            <p>No transfers found❌</p>
          )}
        </div>
        <DialogFooter>
          <Button onClick={() => navigate(-1)} type="submit">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
