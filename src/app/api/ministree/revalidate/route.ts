import { createRevalidateRoute } from "@ministree/template-sdk/next";

/** Ministree pings this on Publish so changes go live in seconds, not an ISR window. */
export const { POST } = createRevalidateRoute();
