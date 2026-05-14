import { useAtomRefresh, useAtomValue } from "@effect/atom-react";
import { SearchParamsSchema } from "@flux/contracts";
import { createFileRoute } from "@tanstack/react-router";
import * as Cause from "effect/Cause";
import * as Schema from "effect/Schema";
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult";

import { PageHeader, PageHeaderHeading, PageHeaderDescription } from "~/components/page-header";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ApiClient } from "~/lib/api-client";

export const Route = createFileRoute("/_app/inventory/products/")({
  component: RouteComponent,
  validateSearch: Schema.toStandardSchemaV1(SearchParamsSchema),
});

function RouteComponent() {
  const query = Route.useSearch();

  const productAtom = ApiClient.query("products", "list", {
    query,
    reactivityKeys: ["products"],
  });

  const products = useAtomValue(productAtom);
  const refreshProducts = useAtomRefresh(productAtom);

  return (
    <section className="space-y-6">
      <PageHeader>
        <PageHeaderHeading>Products</PageHeaderHeading>
        <PageHeaderDescription>Manage your inventory products here.</PageHeaderDescription>
      </PageHeader>
      {AsyncResult.builder(products)
        .onInitial(() => <p>Loading...</p>)
        // .onWaiting(() => <p>Loading...</p>)
        .onFailure((cause) => (
          <Card>
            <CardHeader>
              <CardTitle>Something went wrong loading products.</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{Cause.pretty(cause)}</CardDescription>
            </CardContent>
            <CardFooter>
              <Button onClick={refreshProducts}>Retry</Button>
            </CardFooter>
          </Card>
        ))
        .onSuccess((data) => 
          <div className="space-y-2">
{
            data.items.map((product) => (
              <Card key={product.id}>
                <CardContent>
                <h3 className="text-xl font-semibold capitalize">{`${product.product.name} ${product.name}`}</h3>
                <p>{product.sku}</p>
                </CardContent>
              </Card>
            ))
          }
          </div>
        )
        .render()}
    </section>
  );
}
