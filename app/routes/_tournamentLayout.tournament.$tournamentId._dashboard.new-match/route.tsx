import { Outlet, useLoaderData, useNavigate } from "@remix-run/react";
import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ReadPlayers } from "~/services/firebase";

export async function loader({ params }: LoaderFunctionArgs) {
  const { tournamentId } = params;

  if (tournamentId) {
    const { data: players } = (await ReadPlayers({ tournamentId })) || {};
    return json({ players });
  }

  return redirect("/");
}

export default function NewMatch() {
  const navigate = useNavigate();
  const { players } = useLoaderData<typeof loader>();

  return (
    <Dialog open onOpenChange={() => navigate(-1)}>
      <DialogContent className="sm:max-w-[425px]">
        <Outlet context={{ players }} />
      </DialogContent>
    </Dialog>
  );
}
