import { FileJob } from "../interfaces/index.js";

export type WorkerDataProps = Pick<
  FileJob,
  "sourceUrl" | "storageDir" | "fileName" | "fileUrl"
>;

export type WorkerReturn = {
  status: "pending" | "error" | "done";
  result: Pick<FileJob, "fileName" | "fileUrl">;
  error?: string;
};
