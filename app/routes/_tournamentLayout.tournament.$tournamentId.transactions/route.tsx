import { Fragment } from "react";
import { Outlet, useLoaderData, useSearchParams } from "@remix-run/react";
import { type LoaderFunctionArgs, json, redirect } from "@remix-run/node";

import { ReadPlayers, ReadTransactions, ReadUser } from "~/services/firebase";
import FloatingActionButton from "@/components/floating-action-button";
import { authCookie } from "~/sessions.server";
import { type User, getIsAdmin } from "~/services/utils";

const stats = [
  { id: 1, name: "Creators on the platform", value: "8,000+" },
  { id: 2, name: "Flat platform fee", value: "3%" },
  { id: 3, name: "Uptime guarantee", value: "99.9%" },
  { id: 4, name: "Paid out to creators", value: "$70M" },
  { id: 1, name: "Creators on the platform", value: "8,000+" },
  { id: 2, name: "Flat platform fee", value: "3%" },
  { id: 3, name: "Uptime guarantee", value: "99.9%" },
  { id: 4, name: "Paid out to creators", value: "$70M" },
  { id: 1, name: "Creators on the platform", value: "8,000+" },
  { id: 2, name: "Flat platform fee", value: "3%" },
];

export async function loader({ params, request }: LoaderFunctionArgs) {
  const { tournamentId } = params;
  const session = await authCookie.getSession(request.headers.get("Cookie"));
  const userId = (session.has("userId") && session.get("userId")) || null;
  let user = null;

  const readUserResponse = await ReadUser({ userId });
  const readPlayersResponse = await ReadPlayers({
    tournamentId: String(tournamentId),
  });
  const players =
    readPlayersResponse &&
    readPlayersResponse.data &&
    Object.entries(readPlayersResponse.data).length &&
    readPlayersResponse.data;
  user =
    readUserResponse && typeof readUserResponse !== "string"
      ? readUserResponse.data
      : null;
  const isAdmin = user ? getIsAdmin(user as User) : false;

  if (tournamentId) {
    const transactions = await ReadTransactions({ tournamentId });

    return json({ transactions: transactions?.data, isAdmin, players });
  }

  return redirect("/home");
}

export default function Transactions() {
  const { isAdmin, transactions, players } = useLoaderData<typeof loader>();
  const [{ name: playerName }] = players;

  const transactionsPerPlayer = transactions?.reduce((acc, cur) => {
    if (acc[cur.player_name]) {
      acc[cur.player_name] += 1;
      return acc;
    }

    acc[cur.player_name] = 1;

    return acc;
  }, {});

  return (
    <div className="py-4">
      <h3 className="text-2xl font-semibold pb-2">Transactions left</h3>
      <dl className="grid grid-cols-3 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-6 lg:grid-cols-9 pb-2">
        {transactionsPerPlayer
          ? Object.entries(transactionsPerPlayer).map(
              ([name, transactions], idx) => (
                <div
                  key={`${idx}-name`}
                  className="flex flex-col bg-primary-foreground p-8"
                >
                  <dt className="text-sm font-semibold leading-6 text-primary">
                    {name}
                  </dt>
                  <dd className="order-first text-3xl font-semibold tracking-tight text-muted-foreground">
                    {6 - Number(transactions)}
                  </dd>
                </div>
              )
            )
          : null}
      </dl>
      <h3 className="text-2xl font-semibold pb-2">Transaction list</h3>
      <div className="px-4 sm:px-6 lg:px-8 rounded-md border drop-shadow-lg">
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

      <FloatingActionButton
        isAdmin={isAdmin}
        pathname={`new?selected_player=${playerName}`}
      />
      <Outlet context={{ transactionsPerPlayer }} />
    </div>
  );
}
