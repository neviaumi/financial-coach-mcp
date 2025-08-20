type Cache = {
  [key: string]: {
    value: unknown;
    expireAt: number;
  };
};
import { readAll } from "@std/io/read-all";
import { isPromise } from "node:util/types";

import { join } from "@std/path";

export function filePathRelativeToCacheDir(filePath: string) {
  const cacheDir = join(import.meta.dirname!, "../", ".cache");
  return join(cacheDir, filePath);
}

function removeExpiredCache(cache: Cache) {
  const result = Object.fromEntries(
    Object.entries(cache).filter(([key]) => !isCacheExpired(cache)(key)),
  );
  return result;
}

function isCacheExist(cache: Cache) {
  return (cacheKey: string) => cache[cacheKey];
}

function isCacheExpired(cache: Cache) {
  return (cacheKey: string) => {
    if (!isCacheExist(cache)(cacheKey)) return false;
    const now = Temporal.Now.plainDateTimeISO();
    const expireTime = Temporal.Instant.fromEpochMilliseconds(
      cache[cacheKey].expireAt,
    ).toZonedDateTimeISO("UTC").toPlainDateTime();
    return now.until(expireTime).total("second") < 0;
  };
}

export async function initializeCache(options?: {
  filePath?: string;
}) {
  const filePath = options?.filePath ??
    filePathRelativeToCacheDir("cache.json");
  const cache: Cache = await Deno.open(
    filePath,
    {
      read: true,
    },
  )
    .then((file) =>
      readAll(file).finally(() => {
        file.close();
      })
    )
    .then((resp) =>
      removeExpiredCache(JSON.parse(new TextDecoder().decode(resp)))
    )
    .catch(() => {
      return ({});
    });
  return {
    withCache(
      key: string,
      options:
        | {
          expireAt: Temporal.PlainDateTime;
        }
        // deno-lint-ignore no-explicit-any
        | ((...args: any[]) => {
          expireAt: Temporal.PlainDateTime;
        }),
    ) {
      // deno-lint-ignore no-explicit-any
      return function wrapper<T extends (...args: any[]) => any>(func: T) {
        return (...args: Parameters<T>) => {
          if (
            !isCacheExist(cache)(key) || isCacheExpired(cache)(key)
          ) {
            const result = func(...args);
            if (isPromise(result)) {
              return result.then((resolved) => {
                const _options = typeof options === "function"
                  ? options(resolved)
                  : options;
                cache[key] = {
                  value: result,
                  expireAt: _options.expireAt.toZonedDateTime("UTC").toInstant()
                    .epochMilliseconds,
                };
                return resolved;
              });
            }
            const _options = typeof options === "function"
              ? options(result)
              : options;
            cache[key] = {
              value: result,
              expireAt: _options.expireAt.toZonedDateTime("UTC").toInstant()
                .epochMilliseconds,
            };
            return result;
          }
          return cache[key].value;
        };
      };
    },
    [Symbol.asyncDispose]() {
      return this.close();
    },
    close() {
      return Deno.open(filePath, {
        write: true,
        create: true,
      }).then((file) => {
        const encoder = new TextEncoder();
        file.write(
          encoder.encode(JSON.stringify(removeExpiredCache(cache), null, 4)),
        ).finally(() => {
          file.close();
        });
      });
    },
  };
}
