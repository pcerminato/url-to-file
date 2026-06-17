import { IFileDB } from "../interfaces/db.js";
import { FileJob } from "../interfaces/index.js";

type CallbackType = Parameters<IFileDB["createFileJob"]>[1];

/* FileJobStatusChange() is a factory that receives the db and a getter
for the date as dependency injection.
It returns operations for each status change of the job. */
export function FileJobStatusChange(db: IFileDB, getDate: () => string) {
  async function setJobPending(job: Partial<FileJob>, callback?: CallbackType) {
    const { jobId, fileName, fileUrl, sourceUrl, storageDir } = job;

    if (
      !jobId || !fileName || !fileUrl || !sourceUrl ||
      !storageDir
    ) {
      throw Error("Job entity error. Missing mandatory properties.");
    }

    await db.createFileJob({
      jobId,
      fileName,
      fileUrl,
      sourceUrl,
      storageDir,
      status: "pending",
      createdAt: getDate(),
    }, callback);
  }
  async function setJobDone(job: FileJob) {
    await db.updateFileJob({
      ...job,
      doneBy: getDate(),
      status: "done",
    });
  }
  async function setJobProgress(job: FileJob) {
    await db.updateFileJob({
      ...job,
      startedAt: getDate(),
      status: "progress",
    });
  }
  async function setJobError(job: FileJob, error: unknown) {
    db.updateFileJob({
      ...job,
      doneBy: JSON.stringify(Date.now()),
      status: "error",
      error: (error instanceof Error)
        ? error.message
        : `Error while processing the job.`,
    });
  }

  return Object.freeze({
    setJobPending,
    setJobProgress,
    setJobDone,
    setJobError,
  });
}
