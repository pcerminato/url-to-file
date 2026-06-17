/* This file covers the need for an ORM by now */
import { FileJob } from "../interfaces/index.js";

type FileJobDbSchema = {
  id: number;
  job_id: FileJob["jobId"];
  data: Pick<FileJob, "fileName" | "fileUrl" | "sourceUrl" | "storageDir">;
  status: FileJob["status"];
  error: string;
  created_at: FileJob["createdAt"];
  started_at: FileJob["startedAt"];
  done_by: FileJob["doneBy"];
  attempts: number;
  max_attempts: number;
};

export function parseDbResult(schema: FileJobDbSchema): FileJob | null {
  if (!schema) return null;
  try {
    const {
      data: { fileUrl, fileName, sourceUrl, storageDir },
      status,
      created_at: createdAt,
      started_at: startedAt,
      job_id: jobId,
    } = schema;

    return {
      jobId,
      fileUrl,
      fileName,
      sourceUrl,
      storageDir,
      status,
      createdAt,
      startedAt,
    };
  } catch {
    return null;
  }
}
