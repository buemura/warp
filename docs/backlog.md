# Warp Backlog

## Analysis Summary
- Stack: FastAPI + SQLModel backend, React + TanStack Router frontend.
- Core flow works conceptually (upload -> short link -> gated access), but there are high-impact correctness, security, and consistency gaps.
- Biggest risks today: case-sensitive code breakage in UI, misleading “encrypted” claim, unsafe filename handling, race conditions on one-time links, and stale tests/docs.

## Priority Legend
- P0: critical bug/security/trust issue
- P1: important reliability/product issue
- P2: quality and optimization

## Fixes

### P0-1: Preserve case in warp code input
- Area: `apps/web/src/routes/index.tsx`
- Problem: input forces `toUpperCase()`, but backend IDs are mixed-case.
- Impact: many valid codes fail to resolve.
- Proposed fix: remove forced uppercasing, validate allowed characters without changing case, and set max length to 8.
- Acceptance criteria: entering or pasting a mixed-case code navigates successfully.

### P0-2: Remove or implement encryption claim
- Area: UI copy in home hero (`apps/web/src/routes/index.tsx`)
- Problem: app claims “Encrypted” but files are stored plaintext on disk.
- Impact: user trust/legal risk.
- Proposed fix: either remove “Encrypted” copy immediately or implement at-rest encryption with managed keys.
- Acceptance criteria: product copy matches actual security guarantees.

### P0-3: Sanitize uploaded filenames
- Area: `apps/api/app/services/storage.py`, bundle logic in `apps/api/app/services/file_service.py`
- Problem: raw user filename is used in stored filename and ZIP entry names.
- Impact: path traversal/unsafe path semantics and potentially dangerous ZIP extraction paths.
- Proposed fix: normalize with `Path(name).name`, strip separators/control chars, cap length, and generate safe ZIP entry names.
- Acceptance criteria: malicious filenames cannot escape upload root or create unsafe ZIP entries.

### P0-4: Make one-time access atomic
- Area: `apps/api/app/services/file_service.py`, `apps/api/app/routers/files.py`
- Problem: validate then increment is non-atomic; concurrent requests can both pass.
- Impact: one-time links can be downloaded more than once.
- Proposed fix: transaction with row-level lock (`SELECT ... FOR UPDATE`) or single conditional update (`access_count < max_access_count`).
- Acceptance criteria: concurrent access tests show exactly one successful download for one-time links.

### P0-5: Prevent unbounded memory usage on multi-file upload
- Area: `apps/api/app/services/file_service.py`
- Problem: bundle ZIP is built fully in memory.
- Impact: memory spikes/OOM on large or many files.
- Proposed fix: stream ZIP to temp file on disk and enforce limits on file count and aggregate size independent of `UploadFile.size`.
- Acceptance criteria: large uploads stay within memory budget and fail gracefully when over limit.

### P1-1: Align API contract, docs, and tests (`file` vs `files`)
- Area: backend tests/docs and API endpoint signature
- Problem: endpoint expects `files`, while tests and README still send/document `file`.
- Impact: CI failures and confusing API usage.
- Proposed fix: either support both aliases short-term or standardize on `files` and update tests/docs.
- Acceptance criteria: all backend tests pass and README examples match implementation.

### P1-2: Fix frontend tests for collapsed advanced options
- Area: `apps/web/tests/components/UploadForm.test.tsx`
- Problem: tests expect always-visible options and old copy.
- Impact: failing CI and low confidence in UI refactors.
- Proposed fix: update tests to click “Advanced options” before asserting fields; assert current copy.
- Acceptance criteria: frontend test suite passes consistently.

### P1-3: Don’t force TTL by default when user didn’t opt in
- Area: `apps/web/src/components/UploadForm.tsx`
- Problem: `ttl` defaults to `5` and is always submitted.
- Impact: links expire unexpectedly after 5 minutes.
- Proposed fix: default to “no expiration” (`undefined`) unless user explicitly sets TTL.
- Acceptance criteria: upload without enabling TTL returns `expires_at: null`.

### P1-4: Harden short ID generation against collisions
- Area: `apps/api/app/services/file_service.py`
- Problem: collision on unique `short_id` yields server error.
- Impact: rare but user-visible 500s.
- Proposed fix: retry generation on integrity error with bounded attempts.
- Acceptance criteria: forced collision test retries and succeeds/fails with controlled 503/500 message.

### P1-5: Improve missing-file behavior on access
- Area: `apps/api/app/routers/files.py`
- Problem: if metadata exists but file missing, response can become 500 and access count can be consumed.
- Impact: broken downloads and inconsistent counters.
- Proposed fix: verify physical file presence before counting access and return `410 Gone`/`404` with clear message.
- Acceptance criteria: missing blob test returns controlled error without incrementing access count.

### P1-6: Cleanup policy for one-time consumed files
- Area: cleanup service and data lifecycle
- Problem: one-time files remain on disk forever unless TTL exists.
- Impact: storage growth and privacy retention risk.
- Proposed fix: mark consumed one-time files for deletion immediately after successful download (or scheduled short delay).
- Acceptance criteria: consumed one-time files are removed from storage and marked in DB.

### P2-1: Replace string-matching error logic with typed access status
- Area: `validate_access` and `get_file_info`
- Problem: state inference depends on substring checks like “expired”.
- Impact: brittle logic and localization hazards.
- Proposed fix: return enum/status code (`ok`, `expired`, `exhausted`, `password_required`, `incorrect_password`).
- Acceptance criteria: file info flags and HTTP mapping use status enum only.

### P2-2: Make cleanup task shutdown robust
- Area: `apps/api/app/main.py`
- Problem: background cleanup task is canceled but not awaited.
- Impact: noisy shutdown logs / potential dangling task warnings.
- Proposed fix: await cancellation and swallow `CancelledError` explicitly.
- Acceptance criteria: clean shutdown without task warnings.

### P2-3: Expand security test coverage
- Area: `apps/api/tests`
- Problem: current security tests only cover bcrypt helpers.
- Impact: regressions can slip in unnoticed.
- Proposed fix: add tests for rate limiting behavior, filename sanitization, collision retries, and concurrent one-time access.
- Acceptance criteria: security/regression suite covers all critical invariants.

## Improvements

### P1: UX clarity and resilience
- Show explicit “No expiration” option in TTL selector.
- Allow pasting full URL and auto-extract short ID.
- Add client-side pre-check for total size and file count before upload.
- Show upload progress and estimated time for large files.

### P1: Operational visibility
- Add structured logs with `short_id`, request id, and outcome.
- Add `/health` and `/ready` endpoints.
- Add basic metrics (uploads, downloads, failures, cleanup deletions).

### P2: Data and privacy hygiene
- Add retention settings for metadata (`removed_at` lifecycle + purge window).
- Consider storing truncated/anonymized IP address by default.
- Add admin tooling for cleanup verification and orphan file detection.

### P2: Developer experience
- Add pre-commit/lint pipeline (ruff + mypy + eslint + typecheck).
- Add CI matrix with backend + frontend test jobs.
- Replace monkey-patching in tests with injectable storage dependency/factory.

## New Features

### F1: Share options and controls (P1)
- Add “max downloads” >1 option (not only one-time).
- Add optional “burn after first view/download attempt” mode.
- Add ability to revoke a link manually.

### F2: Better transfer experience (P1)
- Drag-select multiple files with per-file progress.
- Optional compression toggle before upload.
- Add checksum display (SHA-256) for integrity verification.

### F3: Enterprise-ready storage (P2)
- Pluggable storage backends (S3/R2/GCS) with presigned URLs.
- Background job queue for cleanup and large ZIP processing.
- Signed temporary download URLs to offload file serving.

### F4: Security hardening package (P2)
- Optional malware scanning hook before link activation.
- Optional per-link passphrase strength policy.
- Audit trail events for creation/access/deletion.

### F5: Product polish (P2)
- QR code share for mobile transfer.
- One-click “copy markdown link” and “copy curl download command”.
- Localized expiry formatting and relative countdown timer.

## Suggested Execution Order
1. Ship P0 fixes (case sensitivity, encryption claim, filename sanitization, atomic one-time access, memory-safe bundling).
2. Repair contract drift (tests/docs/API naming, TTL default semantics).
3. Add reliability hardening (collision retry, missing-file handling, cleanup policy).
4. Expand coverage + CI.
5. Build feature roadmap incrementally from F1/F2.
