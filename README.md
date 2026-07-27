# url-print-worker

This repo holds an experimental app that prints a file (output) from a public url (input).

## Architecture

The app is set as a distributed system (\*):

- Client UI (src/ui/): html, css and js.
- Rest API (src/app.ts): express.js.
- Queue (src/file-queue/): rabbitMQ.
- Worker (src/file-worker): node:worker_threads and pupeteer.

The architectural approach is based on _clean architecture_ (entities, use cases, adapters and implementation), directly relying on dependency and inversion of control.

> (\*) For sake of the app being experimental, all the components of the system live in the same repo (api, queue, worker, ui).

### Interfaces & entities

`IFileDB`: defines the template for database interactions.
`FileJob`: the main entity in the domain.

### Services

`DB` implements `IFileDB` over Posgres.

### Use cases

`FileJobStatusChange` is a factory that provides the operations for the lifecycle of the Job:

- `setJobPending()`,
- `setJobProgress()`,
- `setJobDone()`,
- `setJobError()`,

## Flow

```text
┌────────────────────────────────────────────────────────────────────────┐
│ CLIENT                                                                 │
│ GET /download-file                                                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ ENDPOINT                                                               │
│ • setJobPending()  :: stores status in DB as pending                   │
│ • sendToQueue()    :: adds the Job to the queue as pending             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ QUEUE                                                                  │
│ • /file-queue/sender.ts   :: logs each job into the queue              │
│ • /file-queue/receiver.ts :: consumes jobs from the queue             │
│   ├─ creates a worker to process each pending job                      │
│   ├─ listens to worker events                                          │
│   └─ uses FileJobStatusChange to log job status in the DB              │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ WORKER                                                                 │
│ /file-worker/worker.ts                                                 │
│ • runs a process to create the file with Puppeteer                     │
│ • stores the file on disk                                              │
│ • returns a fileUrl to access the file through HTTP                    │
└────────────────────────────────────────────────────────────────────────┘
```

## How to run 🚀

### Docker build

- Fill up `.env` (check out `.env.example`)
- Start Postgres and RabbitMQ (use compose.yml)

### Locally

- (Install dependencies: `npm i`)
- Rest API: `npm run build && npm start`
- Queue: `npm run dev:queue`

Open [text](http://localhost:8081/) (use the port at `.env`) in the web browser.
