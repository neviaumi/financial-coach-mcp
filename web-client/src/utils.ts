import { TemplateResult } from "lit";

export function isError(e: unknown): e is Error {
  if (!Error.isError(e)) {
    if (e instanceof DOMException) {
      return true; // As 2026, it partially supports Error.isError
    }
    return false;
  }
  return true;
}

export function handletaskError(handle: (e: Error) => TemplateResult) {
  return (e: unknown) => {
    if (isError(e)) {
      return handle(e);
    }
    throw e;
  };
}
