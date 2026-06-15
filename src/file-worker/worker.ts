import { parentPort, workerData } from "node:worker_threads";
import path from "node:path";
import { fileURLToPath } from "node:url";

import puppeteer from "puppeteer";
import { FileJob } from "../interfaces/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async function name() {
  console.log("Worker start");

  const { sourceUrl, storageDir, fileName, fileUrl } = workerData as FileJob;

  /* >>> */
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(sourceUrl, { waitUntil: "networkidle2" });
  await page.setViewport({ width: 1080, height: 1024 });
  await page.screenshot({
    path: path.resolve(__dirname, "../", storageDir, fileName),
  });
  await browser.close();
  /* <<< */

  parentPort?.postMessage({
    status: "done",
    result: fileUrl,
  });
})();
