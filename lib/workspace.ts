import { join } from "@std/path";

export function filePathRelativeToCacheDir(filePath: string) {
  const cacheDir = join(import.meta.dirname!, "../", ".cache");
  return join(cacheDir, filePath);
}
