import {
  CACHE_PICTURES_DIR,
  PLAYLIST_DEFAULT_DIR,
  BIN_DIR,
} from "@ongaku/constants";
import fs from "node:fs";

export function checkFolders(): void {
  const folders = [PLAYLIST_DEFAULT_DIR, BIN_DIR, CACHE_PICTURES_DIR];

  for (const folder of folders) {
    ensureDir(folder);
  }
}

function ensureDir(path: string): void {
  try {
    const stat = fs.statSync(path, { throwIfNoEntry: false });

    if (stat) {
      if (!stat.isDirectory()) {
        throw new Error(
          `The  "${path}" exists but is not a directory (it's a file).`,
        );
      }
      return;
    }

    fs.mkdirSync(path, { recursive: true });
  } catch (err) {
    if (err instanceof Error && "code" in err && err.code === "EEXIST") {
      return;
    }
    throw new Error(
      `Could not create/verify the folder "${path}": ${
        err instanceof Error ? err.message : String(err)
      }`,
    );
  }
}
