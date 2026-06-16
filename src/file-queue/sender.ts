import amqp from "amqplib";
import { QUEUE_NAME, RMQ_URL } from "./constants.js";
import { FileJob } from "../interfaces/index.js";

/* Sends the message to the queue and waits for receipt confirmation */
export async function sendToQueue(job: FileJob) {
  try {
    const connection = await amqp.connect(RMQ_URL);
    const channel = await connection.createConfirmChannel();

    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
      arguments: {
        "x-queue-type": "quorum",
      },
    });

    channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(job)), {
      persistent: true,
    });

    // It'll throw an error if the message was not delivered to the queue
    await channel.waitForConfirms();
  } catch (error) {
    /* Formats the error message as the error object comming from RabbitMQ is not the standard Error */
    let errMsg = "Queue sender error.";
    if (error instanceof Error) {
      if (error.message) {
        errMsg += ` ${errMsg}. ${error.message}`;
      } else {
        errMsg += ` ${error.name}`;
        if (error.hasOwnProperty("code")) {
          // @ts-ignore
          errMsg += ` [${error.code}]`;
        }
      }
      throw Error(errMsg);
    }
  }
}
