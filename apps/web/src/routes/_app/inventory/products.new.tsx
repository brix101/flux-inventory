import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, XIcon } from "lucide-react";

import NewProductForm from "~/components/new-product-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { buttonVariants } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";

export const Route = createFileRoute("/_app/inventory/products/new")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col gap-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              render={
                <Link to="/inventory/products" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Products</span>
                </Link>
              }
            />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>New</BreadcrumbPage>
            <div className="ml-2 flex gap-2">
              {/* <form.Subscribe */}
              {/*   selector={(state) => [state.canSubmit, state.isDirty, state.isSubmitting]} */}
              {/* > */}
              {/*   {([canSubmit, isDirty, isSubmitting]) => ( */}
              {/*     <Button */}
              {/*       type="submit" */}
              {/*       form="product-form" */}
              {/*       disabled={!canSubmit && !isDirty} */}
              {/*       size="icon" */}
              {/*       variant="link" */}
              {/*     > */}
              {/*       {isSubmitting ? <Spinner /> : <CloudUploadIcon />} */}
              {/*     </Button> */}
              {/*   )} */}
              {/* </form.Subscribe> */}
              <Link
                to="/inventory/products"
                className={buttonVariants({
                  variant: "outline",
                  size: "icon",
                })}
              >
                <XIcon />
              </Link>
            </div>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="grid w-full flex-1 grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="col-span-1 md:col-span-2">
          <CardContent>
            <NewProductForm />
          </CardContent>
        </Card>

        <Card className="col-span-1 border-0">
          <CardContent>
            <h3 className="mb-3 font-medium">Audit Log</h3>
            <p className="text-muted-foreground text-sm">No activity yet</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
