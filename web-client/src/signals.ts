import { signal } from "@lit-labs/signals";
import type { Statement } from "@app/bank-statement/types";
export const statement = signal<Statement | null>(null);
