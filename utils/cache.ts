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

const cache = await Deno.open(filePathRelativeToCacheDir("cache.json"), {
  read: true,
})
  .then((file) => {
    return readAll(file).finally(() => {
      file.close();
    });
  })
  .then((resp) => JSON.parse(new TextDecoder().decode(resp)))
  .catch(() => ({}));

function isCacheExist(cacheKey: string) {
  return (cache: Cache) => {
    return cache[cacheKey];
  };
}

function isCacheExpired(cacheKey: string) {
  return (cache: Cache) => {
    if (!isCacheExist(cacheKey)(cache)) return false;
    const now = Temporal.Now.plainDateTimeISO();
    const expireTime = Temporal.Instant.fromEpochMilliseconds(
      cache[cacheKey].expireAt,
    ).toZonedDateTimeISO("UTC").toPlainDateTime();
    return now.until(expireTime).total("second") < 0;
  };
}

function updateCache(cacheKey: string, value: any, expireAt: number) {
  cache[cacheKey] = {
    value,
    expireAt,
  };

  Deno.open(filePathRelativeToCacheDir("cache.json"), {
    write: true,
    create: true,
  }).then((file) => {
    const encoder = new TextEncoder();
    file.write(encoder.encode(JSON.stringify(cache, null, 4))).finally(() => {
      file.close();
    });
  });
  return cache;
}

export function withCache(
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
        !isCacheExist(key)(cache) || isCacheExpired(key)(cache)
      ) {
        const result = func(...args);
        if (isPromise(result)) {
          return result.then((resolved) => {
            const _options = typeof options === "function"
              ? options(resolved)
              : options;
            updateCache(
              key,
              resolved,
              _options.expireAt.toZonedDateTime("UTC").toInstant()
                .epochMilliseconds,
            );
            return resolved;
          });
        }
        const _options = typeof options === "function"
          ? options(result)
          : options;
        updateCache(
          key,
          result,
          _options.expireAt.toZonedDateTime("UTC").toInstant()
            .epochMilliseconds,
        );
        return result;
      }
      return cache[key].value;
    };
  };
}
