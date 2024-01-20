import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { authCookie } from "~/sessions.server";

export async function action({ request }: ActionFunctionArgs) {
  const session = await authCookie.getSession(request.headers.get("Cookie"));
  session.unset("userId");
  return redirect("/home", {
    headers: { "Set-Cookie": await authCookie.commitSession(session) },
  });
}
