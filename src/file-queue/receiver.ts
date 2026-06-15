/*
This file is in this repo for the sake of the excercise,
but in a prod app it would be on its own repo
for a standalone deployment.
*/

import amqp from "amqplib";
import { QUEUE_NAME, RMQ_URL } from "./constants.js";
import { createFileWorker } from "../file-worker/index.js";
import { IFileDB } from "../interfaces/db.js";
import { DB } from "../services/db.js";
import { FileJob } from "../interfaces/index.js";

(async function receiveFromQueue(db: IFileDB) {
  const connection = await amqp.connect(RMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE_NAME, {
    durable: true,
    arguments: {
      "x-queue-type": "quorum",
    },
  });

  channel.consume(QUEUE_NAME, async (job) => {
    const parsedJob: FileJob = JSON.parse(
      job?.content?.toString() || "{}",
    );
    try {
      const workerRespData = await createFileWorker({
        fileName: parsedJob.fileName,
        fileUrl: parsedJob.fileUrl,
        sourceUrl: parsedJob.sourceUrl,
        storageDir: parsedJob.storageDir,
      });
      const { result, status } = workerRespData;

      if (status === "done") {
        db.updateFileJob({
          jobId: parsedJob.jobId,
          fileUrl: result.fileUrl,
          fileName: result.fileName,
          updatedAt: JSON.stringify(Date.now()),
          status: "done",
        });
        if (job) {
          channel.ack(job);
        }
      }
    } catch (error: unknown) {
      db.updateFileJob({
        jobId: parsedJob.jobId,
        updatedAt: JSON.stringify(Date.now()),
        status: "error",
        error: (error instanceof Error)
          ? error.message
          : `Error while processing the job.`,
      });
      console.error("Queue:error: ", error);
      /*
        TODO: manage dead letter or retry logic
        if (job) {
          channel.nack(job);
        } */
    }
  }, {
    noAck: false,
  });
})(new DB());
