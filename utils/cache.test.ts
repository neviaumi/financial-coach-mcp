import { initializeCache } from "@/utils/cache.ts";
import { assertEquals, assertThrows } from "@std/assert";

function createMockFunction() {
  let callCount = 0;
  return (x: number) => {
    if (callCount !== 0) {
      throw new Error("Function should only be called once");
    }
    callCount += 1;
    return x * 2;
  };
}

Deno.test("Mock function will throw will call more than once", () => {
  const fn = createMockFunction();
  assertEquals(fn(2), 4);
  assertThrows(() => fn(3), Error, "Function should only be called once");
});

Deno.test("Caching", async (t) => {
  const cacheFilePath = await Deno.makeTempFile({ suffix: ".json" });
  await t.step("Initialize and use cache", async () => {
    const cache = await initializeCache({
      filePath: cacheFilePath,
    });
    const fn = createMockFunction();
    const cachedFn = cache.withCache("testKey", {
      expireAt: Temporal.Now.plainDateTimeISO().add({ hours: 1 }),
    })(fn);
    Array.from({ length: 4 }).forEach(() => {
      assertEquals(cachedFn(2), 4);
    });
    await cache.close();
  });
  await t.step("Recover cache from previous use", async () => {
    const cache = await initializeCache({
      filePath: cacheFilePath,
    });
    const fn = createMockFunction();
    const cachedFn = cache.withCache("testKey", {
      expireAt: Temporal.Now.plainDateTimeISO().add({ hours: 1 }),
    })(fn);
    for (let i = 0; i < 4; i++) {
      assertEquals(cachedFn(i), 4);
    }
  });
});

Deno.test("Using cache", async (t) => {
  const cacheFilePath = await Deno.makeTempFile({ suffix: ".json" });
  await t.step("Initialize and use cache", async () => {
    await using cache = await initializeCache({
      filePath: cacheFilePath,
    });
    const fn = createMockFunction();
    const cachedFn = cache.withCache("testKey", {
      expireAt: Temporal.Now.plainDateTimeISO().add({ hours: 1 }),
    })(fn);
    Array.from({ length: 4 }).forEach(() => {
      assertEquals(cachedFn(2), 4);
    });
  });
  await t.step("Recover cache from previous use", async () => {
    await using cache = await initializeCache({
      filePath: cacheFilePath,
    });
    const fn = createMockFunction();
    const cachedFn = cache.withCache("testKey", {
      expireAt: Temporal.Now.plainDateTimeISO().add({ hours: 1 }),
    })(fn);
    for (let i = 0; i < 4; i++) {
      assertEquals(cachedFn(i), 4);
    }
  });
});
