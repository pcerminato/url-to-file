/*
This file is in this repo for the sake of the excercise,
but in a prod app it would be on its own repo
for a standalone deployment.
*/

import amqp from "amqplib";
import { QUEUE_NAME, RMQ_URL } from "./constants.js";
import { createFileWorker } from "../file-worker/index.js";
import { IFileDB } from "../interfaces/db.js";
import { dateNowIso, DB } from "../services/index.js";
import { FileJob } from "../interfaces/index.js";
import { FileJobStatusChange } from "../use-cases/set-file-status.js";

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
    const { setJobProgress, setJobDone, setJobError } = FileJobStatusChange(
      db,
      dateNowIso,
    );

    try {
      await setJobProgress(parsedJob);

      const workerRespData = await createFileWorker({
        fileName: parsedJob.fileName,
        fileUrl: parsedJob.fileUrl,
        sourceUrl: parsedJob.sourceUrl,
        storageDir: parsedJob.storageDir,
      });
      const { result, status } = workerRespData;

      if (status === "done") {
        await setJobDone(parsedJob);

        if (job) {
          channel.ack(job);
        }
      }
    } catch (error) {
      await setJobError(parsedJob, error);
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
