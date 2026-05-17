import { SearchParamsSchema } from "@flux/contracts";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import * as Schema from "effect/Schema";

import NewProductForm from "~/components/new-product-form";
import { PageHeader, PageHeaderHeading, PageHeaderDescription } from "~/components/page-header";
import { Card, CardContent } from "~/components/ui/card";
import { productListQueryOptions } from "~/features/products";

export const Route = createFileRoute("/_app/inventory/products/")({
  component: RouteComponent,
  validateSearch: Schema.toStandardSchemaV1(SearchParamsSchema),
});

function RouteComponent() {
  const searchParams = Route.useSearch();

  const { data, isLoading } = useQuery(productListQueryOptions(searchParams));

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardContent>
          <NewProductForm />
        </CardContent>
      </Card>
      <section className="space-y-6">
        <PageHeader>
          <PageHeaderHeading>Products</PageHeaderHeading>
          <PageHeaderDescription>Manage your inventory products here.</PageHeaderDescription>
        </PageHeader>
        <div className="space-y-2">
          {isLoading && <p>Loading...</p>}
          {data?.items.map((product) => {
            const isLoading = "isLoading" in product && product.isLoading;

            if (!product.name || !product.product) {
              return null;
            }

            return (
              <Card key={product.id} className={isLoading ? "bg-muted animate-pulse" : ""}>
                <CardContent>
                  <h3 className="text-xl font-semibold capitalize">{`${product.product.name} ${product.name}`}</h3>
                  <p>{product.sku}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
