import { Pool, PoolClient } from "pg";
import { IFileDB } from "../interfaces/db.js";
import { FileJob, JobId } from "../interfaces/index.js";

const { DB_USER, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT } = process.env;

export class DB implements IFileDB {
  private readonly pool: Pool;
  private client: PoolClient | null;
  constructor() {
    this.pool = new Pool({
      connectionString:
        `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
    });
    this.client = null;
  }
  async connect() {
    console.log("Connect to DB");
    this.client = await this.pool.connect();
  }
  disconnect() {
    console.log("Diconnected from DB");
    if (this.client) {
      this.client.release();
      this.client = null;
    }
  }
  async createFileJob(
    data: FileJob,
    callback?: (data: FileJob) => Promise<void>,
  ): Promise<JobId> {
    await this.connect();

    try {
      const {
        fileName,
        fileUrl,
        sourceUrl,
        storageDir,
      } = data;

      await this.client?.query("BEGIN");

      if (callback) {
        /*
        Approach to the callback:
         - no refs to the queue (to avoid coupling the DB to the queue).
         - to ensure consistency:
            - if the addition to the queue fails, keep from adding the record to the DB.
            - in case the DB is down but the queue is up, consistency is reached anyways,
            because the db connection will fail before getting to the callback, so the job
            won't be added to the queue.
        */
        await callback(data);
      }

      await this.client?.query(
        `INSERT INTO jobs (
          job_id, 
          status,
          data,
          created_at
        ) VALUES (
          $1, $2, $3, $4
        )`,
        [
          data.jobId,
          data.status,
          JSON.stringify({
            fileName,
            fileUrl,
            sourceUrl,
            storageDir,
          }),
          data.createdAt,
        ],
      );
      await this.client?.query("COMMIT");

      return Promise.resolve(data.jobId);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log("ROLLBACK");
        await this.client?.query("ROLLBACK");
      }
      throw error;
    } finally {
      this.disconnect();
    }
  }
  updateFileJob(data: FileJob): Promise<FileJob> {
    console.log(
      `JobId ${data.jobId} updated in the db with status ${data.status}.`,
    );
    return Promise.resolve(data);
  }
  async getFileJobById(id: JobId): Promise<FileJob | null> {
    await this.connect();

    try {
      const result = await this.client?.query(
        "SELECT data, status, created_at FROM jobs WHERE job_id = $1",
        [id],
      );

      if (result && result.rows?.length === -1) {
        return null;
      }

      const {
        data: { fileUrl, fileName, sourceUrl, storageDir },
        status,
        created_at: createdAt,
      } = result?.rows[0];

      return Promise.resolve({
        jobId: id,
        fileUrl,
        fileName,
        sourceUrl,
        storageDir,
        status,
        createdAt,
      });
    } catch (error) {
      throw error;
    } finally {
      this.disconnect();
    }
  }
}
