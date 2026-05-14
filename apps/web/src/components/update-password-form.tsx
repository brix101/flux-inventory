import { PasswordSchema } from "@flux/contracts";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import * as Schema from "effect/Schema";
import { toast } from "sonner";

import { PasswordInput } from "~/components/password-input";
import { Button } from "~/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "~/components/ui/field";
import { Spinner } from "~/components/ui/spinner";
import { authClient } from "~/lib/auth-client";

const inputSchema = Schema.Struct({
  password: PasswordSchema,
  confirmPassword: Schema.String,
}).pipe(
  Schema.check(
    Schema.makeFilter((data) =>
      data.password === data.confirmPassword
        ? undefined
        : { path: ["confirmPassword"], issue: "Passwords do not match" },
    ),
  ),
);

export function ResetPasswordForm({ token }: { token: string }) {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onChange: Schema.toStandardSchemaV1(inputSchema),
    },
    onSubmit: async ({ value }) => {
      return await authClient.resetPassword(
        {
          newPassword: value.password,
          token,
        },
        {
          onError: ({ error }) => {
            toast.error("Unable to reset password", {
              description: error.message,
            });
          },
          onSuccess: () => {
            toast.success("Password updated", {
              description: "Password reset successfully. Please sign in with your new password.",
            });
            navigate({ to: "/login" });
          },
        },
      );
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Reset Password</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Enter your new password below to reset your account.
          </p>
        </div>
        <form.Field
          name="password"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <PasswordInput
                  id={field.name}
                  placeholder="**********"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
        <form.Field
          name="confirmPassword"
          children={(field) => {
            const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
                <PasswordInput
                  id={field.name}
                  placeholder="**********"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
        <Field>
          <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit}>
                {isSubmitting ? <Spinner /> : "Submit"}
              </Button>
            )}
          </form.Subscribe>
        </Field>
      </FieldGroup>
    </form>
  );
}
