import express from "express";
import path from "node:path";
import { v4 as uuidv4 } from "uuid";

import { sendToQueue } from "./file-queue/sender.js";
import { FileJob } from "./interfaces/index.js";
import { DB } from "./services/db.js";
import { dateNowIso } from "./services/index.js";

export function createApp(APP_URI: string) {
  const app = express();
  const db = new DB();

  app.use("/static", express.static(path.join(import.meta.dirname, "static")));

  app.get("/", (req, res) => {
    res.sendFile(path.join("static", "index.html"), {
      root: import.meta.dirname,
    });
  });

  app.get("/download-file", async (req, res) => {
    try {
      const qFileName = req.query["file-name"] as string || "file-example.png";
      const sourceUrl = req.query["source-url"] as string;
      const jobId = uuidv4();
      const fileName = `${jobId}_${qFileName}`;

      const job: FileJob = {
        fileName,
        jobId,
        status: "pending",
        storageDir: `static/files`,
        fileUrl: `${APP_URI}/static/files/${fileName}`,
        sourceUrl: global.decodeURI(sourceUrl),
        createdAt: dateNowIso(),
      };

      await db.createFileJob(job, sendToQueue);

      return res.json({
        jobId: job.jobId,
        fileName,
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: error.message,
        });
      }
    }
  });

  app.get("/download-file/status/:jobId", async (req, res) => {
    try {
      const { jobId } = req.params;
      const fileJob = await db.getFileJobById(jobId);

      return res.json({
        ...fileJob,
      });
    } catch (error: any) {
      if (error instanceof Error) {
        return res.status(500).json({
          error: error.message,
        });
      }
    }
  });

  return app;
}
