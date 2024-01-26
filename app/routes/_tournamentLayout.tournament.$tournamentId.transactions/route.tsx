import { Fragment } from "react";
import { Outlet, useLoaderData, useSearchParams } from "@remix-run/react";
import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";

import { ReadTransactions, ReadUser } from "~/services/firebase";
import FloatingActionButton from "@/components/floating-action-button";
import { authCookie } from "~/sessions.server";
import { getIsAdmin } from "~/services/utils";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { tournamentId } = params;
  const session = await authCookie.getSession(request.headers.get("Cookie"));
  const userId = (session.has("userId") && session.get("userId")) || null;
  let user = null;

  const readUserResponse = await ReadUser({ userId });
  user =
    readUserResponse && typeof readUserResponse !== "string"
      ? readUserResponse.data
      : null;
  const isAdmin = user ? getIsAdmin(user) : false;

  if (tournamentId) {
    const transactions = await ReadTransactions({ tournamentId });

    return json({ transactions: transactions?.data, isAdmin });
  }

  return redirect("/home");
}

export default function Transactions() {
  const { isAdmin, transactions } = useLoaderData<typeof loader>();

  const [searchParams] = useSearchParams();

  return (
    <Fragment>
      <div
        className="px-4 sm:px-6 lg:px-8 my-4 rounded-md border drop-shadow-lg"
        style={{ maxHeight: 900 }}
      >
        <div className="flow-root" style={{ maxHeight: "inherit" }}>
          <div
            className="-mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8"
            style={{ maxHeight: "inherit" }}
          >
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y text-center overflow-y-scroll">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-sm font-semibold sm:pl-0 text-center"
                    >
                      Player name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-sm font-semibold text-center"
                    >
                      Out
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-sm font-semibold text-center"
                    >
                      In
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-sm font-semibold text-center"
                    >
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {transactions && transactions.length
                    ? transactions.map((t, idx) => (
                        <tr key={idx}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0">
                            {t.player_name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary-foreground">
                            {t.out}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary-foreground">
                            {t.in}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary-foreground">
                            {t.type}
                          </td>
                        </tr>
                      ))
                    : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <FloatingActionButton isAdmin={isAdmin} pathname="new" />
      <Outlet />
    </Fragment>
  );
}
