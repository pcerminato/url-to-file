import path from "node:path";
import { Worker } from "node:worker_threads";
import { WorkerDataProps, WorkerReturn } from "./types.js";

import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createFileWorker(
  { sourceUrl, storageDir, fileName, fileUrl }: WorkerDataProps,
) {
  return new Promise<WorkerReturn>((resolve, reject) => {
    // init file creation
    const worker = new Worker(path.resolve(__dirname, "worker.js"), {
      workerData: { sourceUrl, storageDir, fileName, fileUrl },
    });
    worker.on("message", (m: WorkerReturn) => {
      resolve(m);
    });
    worker.on("error", (e: unknown) => {
      reject({
        status: "error",
        result: null,
        error: (e instanceof Error) ? e?.message : "Error processing the file",
      });
    });
  });
}
