import fs from "fs-extra";
import path from "path";
import { api } from "./api.js";
import { DOWNLOAD_FROM_STORAGE_SLEEP_DELAY } from "./constants.js";
import { sleep } from "./sleep.js";

export async function downloadFile(url, dir) {
  await fs.ensureDir(dir);

  const filename = path.basename(url.split("?")[0]);
  const filepath = path.join(dir, filename);

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await api.get(url, { responseType: "arraybuffer" });
      await fs.writeFile(filepath, res.data);
      return;
    } catch (err) {
      console.log(`⏳ retry ${attempt}/3 → ${url}`);
      await sleep(DOWNLOAD_FROM_STORAGE_SLEEP_DELAY * attempt);
    }
  }

  throw new Error(`failed to download after retries: ${url}`);
}
