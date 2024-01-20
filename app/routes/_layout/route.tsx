import { ModeToggle } from "@/components/ThemeToggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { Form, Link, Outlet, useLoaderData } from "@remix-run/react";
import { ReadUser } from "~/services/firebase";
import { authCookie } from "~/sessions.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await authCookie.getSession(request.headers.get("Cookie"));
  const userId = (session.has("userId") && session.get("userId")) || null;
  let user = null;

  if (userId) {
    const readUserResponse = await ReadUser({ userId });
    user =
      readUserResponse && typeof readUserResponse !== "string"
        ? readUserResponse.data
        : null;
  }

  return json(
    { data: user },
    {
      headers: { "Set-Cookie": await authCookie.commitSession(session) },
    }
  );
}

export default function HomeLayout() {
  const { data: user } = useLoaderData<typeof loader>();
  const isLoggedIn = user && Object.entries(user).length;

  return (
    <main style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <header className="container py-4 px-2 sm:px-8">
        <nav className="flex justify-between">
          <img
            className="h-10 w-auto text-primary"
            src="https://upload.wikimedia.org/wikipedia/commons/5/53/Pok%C3%A9_Ball_icon.svg"
            alt="app logo"
          />
          <ModeToggle />
          {isLoggedIn ? (
            <Form method="POST" action="/logout">
              <Button variant="ghost" type="submit">
                Log out
              </Button>
            </Form>
          ) : (
            <Link
              className={cn(buttonVariants({ variant: "ghost" }))}
              to="login"
            >
              Log in
            </Link>
          )}
        </nav>
      </header>
      <Outlet />
    </main>
  );
}
