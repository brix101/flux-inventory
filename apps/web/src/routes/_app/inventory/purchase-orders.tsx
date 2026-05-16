import { SearchParamsSchema } from "@flux/contracts";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import * as Schema from "effect/Schema";

import { PageHeader, PageHeaderDescription, PageHeaderHeading } from "~/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { purchaseOrderListQueryOptions } from "~/features/purchase-orders";

export const Route = createFileRoute("/_app/inventory/purchase-orders")({
  component: RouteComponent,
  validateSearch: Schema.toStandardSchemaV1(SearchParamsSchema),
});

function RouteComponent() {
  const searchParams = Route.useSearch();

  const { data, isLoading } = useQuery(purchaseOrderListQueryOptions(searchParams));

  return (
    <section className="space-y-6">
      <PageHeader>
        <PageHeaderHeading>Purchase Orders</PageHeaderHeading>
        <PageHeaderDescription>Manage your inventory purchase orders here.</PageHeaderDescription>
      </PageHeader>
      <div className="space-y-2">
        {isLoading && <p>Loading...</p>}
        {data?.items.map((item) => (
          <Card key={item.id}>
            <CardContent>
              <CardHeader>
                <CardTitle>{item.name}</CardTitle>
                <CardDescription>Order ID: {item.id}</CardDescription>
              </CardHeader>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
