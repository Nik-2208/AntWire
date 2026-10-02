# AntWire Community Data Storage & Backend Walkthrough

> **Created & Developed by [Nikhilesh H. Chavda](https://nik-portfolio-lime.vercel.app/)**  
> *AntWire Open Source Platform — Community Architecture, Data Schema & Telemetry Integrity*

---

## 1. System Architecture

AntWire implements a strict **local-first + decoupled community backend** model. The computational ant brain, 55K-neuron spiking dynamics, and colony physics execute **100% locally** on the client. Only public community metadata (verified model releases, community feedback, public experiment benchmarks, and real download events) interacts with the backend.

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           ANTWIRE CLIENT PLATFORM                               │
│                                                                                 │
│  ┌────────────────────────────────────────┐  ┌───────────────────────────────┐  │
│  │     LOCAL RUNTIME & BRAIN KERNEL       │  │     COMMUNITY PLATFORM        │  │
│  │  • 55K-Neuron LIF Neural Engine        │  │  • Model Hub & Downloads      │  │
│  │  • Stigmergic Chemical Fields (6-Ch)   │  │  • Public Experiments         │  │
│  │  • 14-D Sensory Perception & Drives    │  │  • Feedback & Issue Tracker   │  │
│  │  • Multi-Agent Colony Superorganism    │  │  • Developer Comments         │  │
│  └────────────────────────────────────────┘  └───────────────┬───────────────┘  │
└──────────────────────────────────────────────────────────────┼──────────────────┘
                                                               ▼ (HTTPS / WSS)
                                               ┌──────────────────────────────────┐
                                               │      API & AUTHENTICATION        │
                                               │  • Anonymous Session Tokens      │
                                               │  • Rate Limiting & Bounds Checks │
                                               │  • Input Sanitizer (XSS / Paths) │
                                               └───────────────┬──────────────────┘
                                                               ▼
                                               ┌──────────────────────────────────┐
                                               │   FIREBASE REALTIME DATABASE     │
                                               │  • model_releases (Read-Only)    │
                                               │  • download_events (Append-Only) │
                                               │  • feedback (Public Submit)      │
                                               │  • public_experiments           │
                                               │  • comments (Target-Bound)       │
                                               └──────────────────────────────────┘
```

---

## 2. No-Fake-Data Rule

> **MANDATORY SCIENTIFIC & PLATFORM INVARIANT**:  
> **AntWire must never manufacture community users, comments, download counts, experiment results, or telemetry values.**

* If zero download events have occurred for a model release, the platform displays `0 downloads` or `No download events recorded`.
* If zero comments exist on an experiment or model, the platform displays `No comments yet`.
* If an experiment metric was not recorded or measured, it is labeled `NOT MEASURED`.
* All public aggregate statistics are derived strictly by querying actual stored records.

---

## 3. Data Entities & Schema Specification

### A. Users (`/users/{userId}`)
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `userId` | `string` (UUID) | Yes | Anonymous session token or authenticated user ID |
| `displayName` | `string` (max 50) | Yes | User handle or `'Developer'` / `'Anonymous Researcher'` |
| `createdAt` | `number` (timestamp) | Yes | Account / session initialization timestamp (ms) |
| `authProvider` | `string` | Yes | `'anonymous'` or `'github'` |

### B. Model Releases (`/model_releases/{modelId}`)
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` (slug) | Yes | Canonical model identifier (e.g. `antbrain-v2-production`) |
| `name` | `string` | Yes | Human-readable model title |
| `version` | `string` | Yes | Semantic release version (e.g. `v2.5.0-prod`) |
| `architecture` | `string` | Yes | Neuropil circuit description |
| `neuronCount` | `number` | Yes | Exact neuron count in model topology (e.g. `55420`) |
| `synapseCount` | `number` | Yes | Synaptic connection count (e.g. `184500`) |
| `checksum` | `string` (SHA-256) | Yes | Verified cryptographic checksum (`sha256-...`) |
| `license` | `string` | Yes | Software/model license (e.g. `MIT License`) |
| `provenance` | `string` | Yes | Model authorship and training lineage |
| `biologicalDistinction` | `string` | Yes | Biological evidence tier classification |

### C. Download Events (`/download_events/{downloadEventId}`)
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `downloadEventId` | `string` (UUID) | Yes | Idempotent download transaction identifier |
| `modelId` | `string` | Yes | Target model ID reference |
| `modelVersion` | `string` | Yes | Target model version |
| `userId` | `string` | Yes | Anonymous session ID or authenticated user ID |
| `timestamp` | `number` | Yes | Event timestamp ($\le \text{now}$) |
| `source` | `string` | Yes | Origin: `'web_ui'`, `'python_cli'`, or `'api'` |

### D. Public Experiments (`/public_experiments/{experimentId}`)
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `experimentId` | `string` | Yes | Unique experiment identifier (e.g. `EXP-XXXX`) |
| `authorId` | `string` | Yes | Session ID of publishing developer |
| `title` | `string` (5–150) | Yes | Experiment benchmark title |
| `description` | `string` (max 2000) | Yes | Methodology and qualitative observations |
| `modelVersion` | `string` | Yes | Brain model version evaluated |
| `environment` | `string` | Yes | Arena or simulation environment name |
| `task` | `string` | Yes | Target task classification |
| `population` | `number` (1–500) | Yes | Number of simulated ant agents |
| `configuration` | `object` | Yes | World parameters (food, diffusion, hazards) |
| `metrics` | `object` | Yes | Quantitative benchmark results (foraging, survival) |
| `createdAt` | `number` | Yes | Timestamp of publication |
| `visibility` | `string` | Yes | `'PUBLIC'` or `'UNLISTED'` |

### E. Community Feedback (`/feedback/{feedbackId}`)
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Internal database record ID |
| `trackingId` | `string` | Yes | Public reference ticket (e.g. `ANT-FB-XXXX`) |
| `userId` | `string` | Yes | Session token |
| `type` | `enum` | Yes | `'idea'`, `'bug'`, `'feature_request'`, `'general'` |
| `title` | `string` (3–150) | Yes | Feedback summary |
| `description` | `string` (10–2000)| Yes | Detailed reproduction or feature request |
| `category` | `string` | Yes | Subsystem tag (e.g. `TASK_ENVIRONMENT`, `BRAIN`) |
| `createdAt` | `number` | Yes | Submission timestamp |
| `status` | `enum` | Yes | `'OPEN'`, `'TRIAGED'`, `'IN_PROGRESS'`, `'RESOLVED'`, `'CLOSED'` |

### F. Developer Comments (`/comments/{commentId}`)
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `commentId` | `string` | Yes | Unique comment identifier (`CM-XXXX`) |
| `userId` | `string` | Yes | Comment author session ID |
| `authorName` | `string` (max 50) | Yes | Display name |
| `targetId` | `string` | Yes | Target model ID, experiment ID, or feedback ID |
| `targetType` | `enum` | Yes | `'MODEL'`, `'EXPERIMENT'`, or `'FEEDBACK'` |
| `body` | `string` (3–1000) | Yes | Sanitized text content |
| `createdAt` | `number` | Yes | Creation timestamp |
| `status` | `enum` | Yes | `'ACTIVE'`, `'FLAGGED'`, `'RESOLVED'`, `'DELETED'` |

---

## 4. Operational Flows

### A. Download Tracking Flow
```text
User clicks "Download Model Package"
  │
  ├── 1. RateLimiter checks client cooldown (<20 req/min)
  ├── 2. SecuritySanitizer validates modelId & version
  ├── 3. Create unique event: { downloadEventId, modelId, version, userId, timestamp: now }
  ├── 4. Persist to /download_events/{downloadEventId}
  ├── 5. Query actual events matching modelId: total = count(events)
  └── 6. Trigger client browser package download
```

### B. Comment Submission Flow
```text
User submits comment on Model / Experiment / Issue
  │
  ├── 1. RateLimiter checks client submission cooldown
  ├── 2. SecuritySanitizer escapes HTML & validates bounds (3–1000 chars)
  ├── 3. Target verification (modelId or experimentId must exist)
  ├── 4. Generate comment record with status: 'ACTIVE'
  ├── 5. Persist to /comments/{commentId}
  └── 6. React view updates instantaneously
```

---

## 5. Security & Threat Controls

* **Path Traversal Defense**: All filenames and model identifiers are validated using `SecuritySanitizer.validateSafeFilename()`. Any inputs containing `..`, `/`, `\`, or null bytes are rejected.
* **XSS Mitigation**: All string inputs are HTML-entity-encoded prior to storage and rendered as safe React text elements.
* **Token-Bucket Rate Limiting**: Max 5 feedback posts/min, 3 public experiments/5min, and 20 download events/min.
* **Payload Bounds**: JSON payloads capped at 2MB; string fields strictly bounded.

---

## 6. Realtime vs. Local-First Boundary

```text
┌────────────────────────────────────────┬────────────────────────────────────────┐
│ REALTIME VIA COMMUNITY BACKEND         │ 100% LOCAL (NEVER TRANSMITTED)        │
├────────────────────────────────────────┼────────────────────────────────────────┤
│ • Model release manifests & checksums  │ • 55,000 LIF neuron membrane voltages  │
│ • Verified download event increments   │ • Real-time synaptic spiking rasters   │
│ • Community feedback & bug tracking    │ • Stigmergic pheromone diffusion grids │
│ • Public experiment benchmark records  │ • Local ant motor decisions & steering │
│ • Developer discussions & comments     │ • Reinforcement learning weight updates│
└────────────────────────────────────────┴────────────────────────────────────────┘
```

---

## 7. Failure Handling & Offline Resilience

If the Firebase backend is offline, unreachable, or unconfigured:
1. The application displays: `Community services offline (Local mode active)`.
2. All local simulations, 3D neuropil atlas rendering, offline training, and causal tracing continue running with **zero performance impact**.
3. Feedback submissions and download events are saved to local browser storage (`localStorage`) and will sync once connectivity is restored.

---

## 8. Local Development Configuration (`.env.example`)

To connect a custom development Firebase backend, create a `.env` file in the project root:

```bash
# Firebase Client Configuration (Optional for cloud sync; local mode active by default)
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

> **Security Note**: Never commit actual `.env` credentials to source control.

---

## 9. Production Deployment (Vercel)

1. Connect the GitHub repository to [Vercel](https://vercel.com/).
2. In the Vercel Project Settings $\to$ **Environment Variables**, add the `VITE_FIREBASE_*` keys.
3. Deploy. The production bundle compiles with static asset hashing and automated TypeScript validation.

---

## 10. Data Lifecycle & Retention

* **Creation**: All user submissions are timestamped and assigned immutable IDs.
* **Moderation**: Admin tokens can update feedback status (`TRIAGED`, `RESOLVED`, `CLOSED`) or flag comments.
* **Deletion**: Users can delete their own comments during their active session.
* **Export**: All public data can be exported in standardized JSON format via the **Data Hub**.

---

## 11. Authorship & Citation

```text
ANTWIRE
Created & Developed by Nikhilesh H. Chavda

Portfolio: https://nik-portfolio-lime.vercel.app/
GitHub:    https://github.com/Nik-2208
LinkedIn:  https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/

Copyright © 2026 Nikhilesh H. Chavda. All Rights Reserved.
```
