import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { PageHeader, PageHeaderHeading, PageHeaderDescription } from "~/components/page-header";
import { productListOptions } from "~/features/products/options";

export const Route = createFileRoute("/_app/inventory/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data } = useQuery(productListOptions({ page: 1, size: 10 }));

  console.log(data);
  return (
    <div>
      <PageHeader>
        <PageHeaderHeading>Inventory</PageHeaderHeading>
        <PageHeaderDescription>Manage your inventory here.</PageHeaderDescription>
      </PageHeader>
    </div>
  );
}
