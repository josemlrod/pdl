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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { logInNewUser } from "~/services/supabase";
import { authCookie } from "~/sessions.server";

export default function Login() {
  const navigate = useNavigate();
  const fetcher = useFetcher();

  return (
    <Dialog open onOpenChange={() => navigate("/home")}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log in</DialogTitle>
          <DialogDescription>
            Log in to be able to create/edit/delete tournaments, and their
            details
          </DialogDescription>
        </DialogHeader>
        <fetcher.Form method="post">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                placeholder="example@gmail.com"
                defaultValue=""
                className="col-span-3"
                minLength={12}
                maxLength={64}
                required
                type="email"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                placeholder="Type your password"
                defaultValue=""
                className="col-span-3"
                type="password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => navigate("../signup")}
              variant="outline"
              type="button"
            >
              Create account
            </Button>
            <Button type="submit">Log in</Button>
          </DialogFooter>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData();
  const bodyData = Object.fromEntries(body);

  const email = String(bodyData.email) || "";
  const password = String(bodyData.password) || "";

  const userId = await logInNewUser({
    email,
    password,
  });

  const session = await authCookie.getSession(request.headers.get("Cookie"));
  session.set("userId", userId);

  return redirect("/home", {
    headers: {
      "Set-Cookie": await authCookie.commitSession(session),
    },
  });
}
