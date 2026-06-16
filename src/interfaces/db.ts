import { FileJob, JobId } from "./index.js";

export interface IFileDB {
  connect(): void;
  disconnect(): void;
  createFileJob(data: FileJob): Promise<JobId>;
  updateFileJob(data: Partial<FileJob>): Promise<FileJob>;
  getFileJobById(id: JobId): Promise<FileJob>;
}
