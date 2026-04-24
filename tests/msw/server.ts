import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/** Node-side MSW server used by Vitest. */
export const server = setupServer(...handlers);
