import * as Effect from "effect/Effect"
import * as Exit from "effect/Exit"
import * as Layer from "effect/Layer"
import * as Option from "effect/Option"
import { describe, expect, it, vi } from "vitest"

import { AppRequest } from "@/server/lib/AppRequest"
import { Auth } from "@/server/lib/Auth"
import { Database } from "@/server/lib/Database"
// Replace these imports with your actual file paths
import { createProduct } from "./product.server"

// 1. Mock external standard functions if needed (like SKU generation)
vi.mock("./your-sku-utils", () => ({
  generateSKU: vi.fn().mockReturnValue("TEST-STAND-000"),
}))

describe("createProduct", () => {
  // Common test data
  const testInput = {
    name: "Test Product",
    description: "A great product",
    categoryId: "cat-123",
    unit: "pcs",
  }

  const mockRequest = new Request("http://localhost", {
    headers: { Authorization: "Bearer valid-token" },
  })

  it("should create a product and its default variant successfully", async () => {
    // --- MOCKS ---

    // 1. Mock Drizzle Transaction Chain (insert -> values -> returning)
    const mockTx = {
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      returning: vi
        .fn()
        // First time it's called (products table)
        .mockResolvedValueOnce([{ id: "prod-1", name: testInput.name }])
        // Second time it's called (variants table)
        .mockResolvedValueOnce([
          { id: "var-1", sku: "TEST-STAND-000", name: "Standard" },
        ]),
    }

    // 2. Build the Layers
    const AppRequestLayer = Layer.succeed(AppRequest, mockRequest)

    const AuthLayer = Layer.succeed(Auth, {
      getSession: vi.fn(() =>
        Effect.succeed(
          Option.some({
            user: { id: "user-123" } as any,
            session: {
              id: "session-123",
              expiresAt: new Date(),
              token: "token-123",
              createdAt: new Date(),
              updatedAt: new Date(),
              userId: "user-123",
            } as any,
          })
        )
      ),
    } as any)

    const DatabaseLayer = Layer.succeed(Database, {
      withAudit: vi.fn((_userId, fn) =>
        Effect.tryPromise(() => fn(mockTx as any))
      ),
    } as any)

    // Combine all mock layers
    const TestLayer = Layer.mergeAll(AppRequestLayer, AuthLayer, DatabaseLayer)

    // --- ACT ---

    // Provide the mocks and run the effect
    const runnable = Effect.provide(createProduct(testInput), TestLayer)
    const result = await Effect.runPromise(runnable)

    // --- ASSERT ---

    expect(result).toEqual({
      id: "prod-1",
      name: "Test Product",
      variants: [{ id: "var-1", sku: "TEST-STAND-000", name: "Standard" }],
    })
  })

  it("should fail with Unauthorized if no session exists", async () => {
    // --- MOCKS ---

    const AppRequestLayer = Layer.succeed(AppRequest, mockRequest)

    const AuthLayer = Layer.succeed(Auth, {
      getSession: vi.fn(() => Effect.succeed(Option.none())),
    } as any)

    // Database shouldn't even be called, but we provide a dummy mock to satisfy TypeScript
    const DatabaseLayer = Layer.succeed(Database, { withAudit: vi.fn() } as any)

    const TestLayer = Layer.mergeAll(AppRequestLayer, AuthLayer, DatabaseLayer)

    // --- ACT ---

    const runnable = Effect.provide(createProduct(testInput), TestLayer)
    const exit = await Effect.runPromiseExit(runnable)

    // --- ASSERT ---

    // Verify that the effect failed correctly
    expect(Exit.isFailure(exit)).toBe(true)
    if (Exit.isFailure(exit)) {
      expect(exit.cause.toString()).toContain("Unauthorized")
    }
  })
})
