# SRS file upload flow

## Async workflow (Worker + database queue)

1. **User** uploads SRS doc (PDF, DOC, DOCX, or TXT) in the Create Project request.
2. **API** validates the file, uploads it to **Supabase Storage** (bucket `srs_pdf`), creates a **project** (with `SrsPath` set), and inserts a row into **`srs_jobs`** with `status = 'queued'`.
3. **API** returns **202 Accepted** with body `{ projectId, name, message, jobId }` and `Location` pointing to `GET /api/projects/{projectId}/srs-job`.
4. **Background worker** (`SrsJobProcessingWorker`) runs in the same process, polling `srs_jobs` every few seconds for `status = 'queued'`.
5. For each job: worker sets `status = 'processing'`, downloads the file from Supabase, calls **Gemini**, applies the hierarchy to the project, deletes the file from Supabase, clears `Project.SrsPath`, and sets job `status = 'completed'` (or `'failed'` and `error` on exception).
6. **Client** can poll `GET /api/projects/{projectId}/srs-job` until `status` is `completed` or `failed`.

## Summary

| Step | Where | Action |
|------|--------|--------|
| 1 | API | Upload SRS to Supabase; create project + `srs_jobs` row (queued) |
| 2 | API | Return 202 with `projectId` and `jobId` |
| 3 | Worker | Poll `srs_jobs`, pick one `queued` → download → Gemini → apply hierarchy → delete file → mark completed/failed |

**No SRS file:** `POST /api/projects` with no file creates the project synchronously and returns **201 Created** (no job).

**Database:** The worker uses `srs_jobs.status` values: `queued`, `processing`, `completed`, `failed`. If your `status` column uses a Postgres enum (e.g. `llm_prompt_status`), ensure that enum includes these values (or alter the enum / use a text column).

See **SUPABASE_STORAGE.md** for bucket setup, **ProjectsController.CreateProject** and **SrsJobProcessingWorker** for the implementation.
