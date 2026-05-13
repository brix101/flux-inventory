import { useAtomRefresh, useAtomValue } from "@effect/atom-react";
import { createFileRoute } from "@tanstack/react-router";
import * as Cause from "effect/Cause";
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { AtomApiClient } from "~/lib/atom-client";

export const Route = createFileRoute("/_app/")({ component: Home });

const productAtom = AtomApiClient.query("products", "list", {
  query: { pageSize: 20 },
  reactivityKeys: ["products"],
});

function Home() {
  const products = useAtomValue(productAtom);
  const refreshProducts = useAtomRefresh(productAtom);

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Welcome to TanStack Start</h1>
      <p className="mt-4 text-lg">
        Edit <code>src/routes/index.tsx</code> to get started.
      </p>
      {AsyncResult.builder(products)
        // .onInitial(() => <p>Loading...</p>)
        .onWaiting(() => <p>Loading...</p>)
        .onFailure((error) => (
          <Card>
            <CardHeader>
              <CardTitle>Something went wrong loading products.</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{Cause.pretty(error)}</CardDescription>
            </CardContent>
            <CardFooter>
              <Button onClick={refreshProducts}>Retry</Button>
            </CardFooter>
          </Card>
        ))
        .onSuccess((data) => (
          <div className="mt-4">
            <h2 className="text-2xl font-bold">Products</h2>
            <ul className="mt-2">
              {data.items.map((product) => (
                <li key={product.id} className="border p-4 rounded mb-2">
                  <h3 className="text-xl font-semibold">{product.name}</h3>
                  <p>{product.sku}</p>
                </li>
              ))}
            </ul>
          </div>
        ))
        .render()}
    </div>
  );
}
