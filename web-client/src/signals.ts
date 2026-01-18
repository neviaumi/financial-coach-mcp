import { signal } from "@lit-labs/signals";
import type { Statement } from "@app/open-banking/types";
export const statement = signal<Statement | null>(null);
