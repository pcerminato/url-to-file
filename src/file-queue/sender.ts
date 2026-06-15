import amqp from "amqplib";
import { QUEUE_NAME, RMQ_URL } from "./constants.js";
import { FileJob } from "../interfaces/index.js";

export async function sendToQueue(job: FileJob) {
  const connection = await amqp.connect(RMQ_URL);
  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE_NAME, {
    durable: true,
    arguments: {
      "x-queue-type": "quorum",
    },
  });

  channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(job)), {
    persistent: true,
  });
}
