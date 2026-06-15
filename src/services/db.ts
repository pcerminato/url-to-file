import { IFileDB } from "../interfaces/db.js";
import { FileJob, JobId } from "../interfaces/index.js";

export class DB implements IFileDB {
  connect(): Promise<void> {
    console.log("Connect to DB");
    return Promise.resolve();
  }
  disconnect(): Promise<void> {
    console.log("Diconnected from DB");
    return Promise.resolve();
  }
  createFileJob(data: FileJob): Promise<JobId> {
    console.log(
      `JobId ${data.jobId} logged to the db with status ${data.status}.`,
    );
    return Promise.resolve(data.jobId);
  }
  updateFileJob(data: FileJob): Promise<FileJob> {
    console.log(
      `JobId ${data.jobId} updated in the db with status ${data.status}.`,
    );
    return Promise.resolve(data);
  }
  getFileJobById(id: JobId): Promise<FileJob> {
    return Promise.resolve({
      jobId: id,
      fileName: "Mock-file-name-data.img",
      fileUrl: "http://localhost:8081/static/example.png",
      createdAt: JSON.stringify(Date.now()),
      startedAt: JSON.stringify(Date.now()),
      status: "progress",
      sourceUrl: "https://www.tycsports.com/",
      storageDir: "static",
    });
  }
}
