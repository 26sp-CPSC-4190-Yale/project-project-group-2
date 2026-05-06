import { NextRequest } from "next/server";

interface BuildNextRequestOptions {
  method?: string;
  url?: string;
  body?: unknown;
  searchParams?: Record<string, string | string[]>;
  headers?: Record<string, string>;
}

// builds a real NextRequest for route handler tets to use nextUrl and request.json()
export function buildNextRequest({
  method = "GET",
  url = "http://localhost:4000/api/test",
  body,
  searchParams,
  headers,
}: BuildNextRequestOptions = {}): NextRequest {
  const urlObj = new URL(url);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (Array.isArray(value)) {
        for (const v of value) urlObj.searchParams.append(key, v);
      } else {
        urlObj.searchParams.set(key, value);
      }
    }
  }

  type NextRequestInit = NonNullable<ConstructorParameters<typeof NextRequest>[1]> & {
    duplex?: "half";
  };
  
  const init: NextRequestInit = { method };

  if (body !== undefined) {
    if (body instanceof FormData) {
      init.body = body;
    } else {
      init.body = JSON.stringify(body);
      init.headers = { "Content-Type": "application/json", ...(headers ?? {}) };
    }
  } else if (headers) {
    init.headers = headers;
  }

  return new NextRequest(urlObj.toString(), init);
}

export function buildIdContext(id: string) {
  return { params: Promise.resolve({ id }) };
}
