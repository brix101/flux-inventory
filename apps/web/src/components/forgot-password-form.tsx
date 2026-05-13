import { useForm } from "@tanstack/react-form"
import { Link } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import z from "zod"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"

export const onChangeSchema = z.object({
  email: z.email({ error: "Email is required" }),
})

export function ForgotPasswordForm() {
  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onChange: onChangeSchema,
    },
    onSubmit: async ({ value }) => {
      return await authClient.requestPasswordReset(value, {
        onError: ({ error }) => {
          toast.error("Unable to process request", {
            description: error.message,
          })
        },
        onSuccess: ({ data }) => {
          toast.success("Check your email", {
            description: data.message,
          })
          form.reset()
        },
      })
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your email address and we’ll send you a link to reset your
            password.
          </p>
        </div>
        <form.Field
          name="email"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  id={field.name}
                  placeholder="m@example.com"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            )
          }}
        />
        <Field>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit}>
                {isSubmitting ? <Spinner /> : "Submit"}
              </Button>
            )}
          </form.Subscribe>
        </Field>

        <FieldSeparator />
        <Link to="/login" className={cn(buttonVariants({ variant: "link" }))}>
          <ArrowLeft className="me-2" />
          Back to login
        </Link>
      </FieldGroup>
    </form>
  )
}
