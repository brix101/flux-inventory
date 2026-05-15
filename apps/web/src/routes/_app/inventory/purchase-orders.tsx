import { useAtomValue, useAtomRefresh } from "@effect/atom-react";
import { SearchParamsSchema } from "@flux/contracts";
import { createFileRoute } from "@tanstack/react-router";
import * as Cause from "effect/Cause";
import * as Schema from "effect/Schema";
import * as AsyncResult from "effect/unstable/reactivity/AsyncResult";

import { PageHeader, PageHeaderDescription, PageHeaderHeading } from "~/components/page-header";
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

export const Route = createFileRoute("/_app/inventory/purchase-orders")({
  component: RouteComponent,
  validateSearch: Schema.toStandardSchemaV1(SearchParamsSchema),
});

function RouteComponent() {
  const query = Route.useSearch();

  const purchaseOrderAtom = ApiClient.query("purchaseOrders", "list", {
    query,
    reactivityKeys: ["purchaseOrders"],
  });

  const purchaseOrders = useAtomValue(purchaseOrderAtom);
  const refreshPurchaseOrders = useAtomRefresh(purchaseOrderAtom);

  return (
    <section className="space-y-6">
      <PageHeader>
        <PageHeaderHeading>Purchase Orders</PageHeaderHeading>
        <PageHeaderDescription>Manage your inventory purchase orders here.</PageHeaderDescription>
      </PageHeader>
      {AsyncResult.builder(purchaseOrders)
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
              <Button onClick={refreshPurchaseOrders}>Retry</Button>
            </CardFooter>
          </Card>
        ))
        .onSuccess((data) => (
          <div className="space-y-2">
            {data.items.map((item) => (
              <Card key={item.id}>
                <CardContent>
                  <CardHeader>
                    <CardTitle>{item.orderNumber}</CardTitle>
                    <CardDescription>Order ID: {item.id}</CardDescription>
                  </CardHeader>
                </CardContent>
              </Card>
            ))}
          </div>
        ))
        .render()}
    </section>
  );
}
