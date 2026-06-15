export type JobId = string;
export type TimeStamp = string;

export interface FileJob {
  jobId: JobId;
  fileName: string; // the bare file name, without the path
  fileUrl: string; // the export http path of the resulting file
  sourceUrl: string; // the url to use as the source of the file
  status: "pending" | "progress" | "done" | "error";
  startedAt: TimeStamp;
  updatedAt?: TimeStamp;
  doneBy?: TimeStamp;
  storageDir: string; // the physical path to store the resulting file
  error?: string;
}
