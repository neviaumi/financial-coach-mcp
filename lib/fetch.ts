class FetchResponseError extends Error {
  accessor response: Response;
  accessor body: string | undefined;
  constructor(
    message: string,
    resp: Response,
    body: typeof FetchResponseError.prototype.body,
  ) {
    super(message);
    this.name = "FetchResponseError";
    this.response = resp;
    this.body = body;
  }
}

export async function verifyResponse(resp: Response): Promise<Response> {
  if (!resp.ok) {
    const body = await resp.text().catch(() => undefined);
    throw new FetchResponseError(
      `${resp.status} ${resp.statusText}`,
      resp,
      body,
    );
  }
  return resp;
}

export async function toJson<T>(resp: Response): Promise<T> {
  const verified = await verifyResponse(resp);
  return verified.json() as Promise<T>;
}

export async function toText(resp: Response): Promise<string> {
  const verified = await verifyResponse(resp);
  return verified.text();
}
