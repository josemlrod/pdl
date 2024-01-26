import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { UpdatePlayerPokemon } from "~/services/firebase";

export const action = async ({ request }: ActionFunctionArgs) => {
  const body = await request.formData();
  const bodyData = Object.fromEntries(body);

  const {
    player_id: playerId,
    pokemon_name: name,
    github_name: githubName,
    pokemon_pts: pts,
    tournament_id: tournamentId,
  } = bodyData;
  await UpdatePlayerPokemon({
    tournamentId: String(tournamentId),
    playerId: String(playerId),
    pokemon: {
      githubName: String(githubName),
      name: String(name),
      pts: String(pts),
    },
  });

  return redirect(`/tournament/${tournamentId}/dashboard`);
};
