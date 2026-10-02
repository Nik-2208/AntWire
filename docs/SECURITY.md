# AntWire Security Architecture & Hardening Guide

> **Created & Developed by [Nikhilesh H. Chavda](https://nik-portfolio-lime.vercel.app/)**  
> *AntWire Open Source Platform — Security, Integrity & Trust*

---

## 1. Security Philosophy & Principles

AntWire is engineered as a secure, local-first research platform. Because AntWire models biological neural architectures and allows developers to train and export computational models, the codebase adheres to strict defensive security standards:

1. **Local-First Isolation**: Core 55K-neuron inference, continuous sensory vectors, and multi-agent physics run 100% locally in the browser or offline Python runtime. No private runtime state is ever sent to external cloud services.
2. **Defensive Input Validation**: All user inputs (feedback, experiment titles, model filenames, task configurations) undergo strict boundary checks and type validation.
3. **No Client-Side Trust**: Aggregate counters (downloads, ratings, verified benchmarks) are validated server-side and rate-limited.
4. **Least-Privilege Database Access**: Firebase Realtime Database rules enforce strict schemas, non-tamperable timestamps, and role-based write limits.
5. **Zero Secret Leakage**: API credentials, service account keys, and internal filesystem paths are never embedded in client-side bundles or public logs.

---

## 2. Threat Mitigations

### A. Path Traversal Prevention
When importing or exporting `.antbrain` model archives:
* All filenames are sanitized using [`SecuritySanitizer.validateSafeFilename()`](file:///c:/Users/Nikhilesh/Desktop/Ant%20Brain/src/security/sanitizer.ts).
* Directory traversal sequences (`../`, `..\`, absolute Unix/Windows paths, and null bytes `\0`) are stripped.
* Only approved extensions (`.antbrain`, `.json`, `.zip`) are accepted.

### B. Cross-Site Scripting (XSS) Mitigation
* All dynamic community inputs (feedback descriptions, experiment notes) are sanitized with [`SecuritySanitizer.escapeHtml()`](file:///c:/Users/Nikhilesh/Desktop/Ant%20Brain/src/security/sanitizer.ts).
* Text rendering in React utilizes safe text nodes, preventing arbitrary HTML injection.

### C. Rate Limiting & Denial-of-Service Defense
* Client and backend endpoints are rate-limited via [`RateLimiter`](file:///c:/Users/Nikhilesh/Desktop/Ant%20Brain/src/security/rate_limiter.ts) using sliding-window token buckets:
  * **Feedback Submissions**: Max 5 requests/min with 3s minimum cooldown.
  * **Experiment Publishing**: Max 3 requests/5min with 10s cooldown.
  * **Download Telemetry**: Max 20 requests/min with 500ms cooldown.

### D. Model Archive Verification & Checksum Whitelisting
* Official model releases published to the **Model Hub** contain cryptographic SHA-256 checksums verified before execution.
* Model packages enforce a 50MB maximum archive size to prevent decompression bomb attacks.

---

## 3. Database Security Rules (`database.rules.json`)

The cloud database employs strict rule-based enforcement:
* `model_releases`: Publicly readable; writes restricted to verified admin tokens.
* `download_events`: Append-only (`!data.exists() && newData.exists()`) with timestamp validation (`newData.child('timestamp').val() <= now`).
* `feedback`: Schema-validated with min/max character constraints and enum validation (`type` $\in$ `{idea, bug, feature_request, general}`).
* `public_experiments`: Mandatory field validation and population caps ($1 \le \text{population} \le 500$).

---

## 4. Reporting Security Vulnerabilities

If you discover a potential security flaw in AntWire, please report it directly to:

* **Author**: Nikhilesh H. Chavda
* **GitHub**: [https://github.com/Nik-2208](https://github.com/Nik-2208)
* **LinkedIn**: [https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/](https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/)
* **Portfolio**: [https://nik-portfolio-lime.vercel.app/](https://nik-portfolio-lime.vercel.app/)

Please provide reproduction steps and proof-of-concept payloads. Vulnerabilities will be triaged and addressed promptly.
