# AntWire — Cloud Firestore Community Setup & Operational Walkthrough

> **AntWire**: An extensible, biology-grounded computational ant brain (~55,000 synthetic neurons), individual-ant runtime, multi-agent colony superorganism, and community platform.  
> **Created & Developed by Nikhilesh H. Chavda**  
> GitHub: [Nik-2208](https://github.com/Nik-2208) | LinkedIn: [Nikhilesh Chavda](https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/) | Portfolio: [nik-portfolio-lime.vercel.app](https://nik-portfolio-lime.vercel.app/)

---

## 1. Firebase Project Overview

AntWire connects directly to **Cloud Firestore** in the official Firebase project:
- **Project ID**: `ant-wire`
- **Auth Domain**: `ant-wire.firebaseapp.com`
- **Storage Bucket**: `ant-wire.firebasestorage.app`
- **Application ID**: `1:236018130196:web:ef292439ca61832784b601`
- **Measurement ID**: `G-QSG9FHZRTY`

---

## 2. Terminal-Only Setup & Deployment

You do not need to manually create collections in the Firebase Console. Everything is managed via the **Firebase CLI** and automated scripts.

### Terminal Commands:

```bash
# 1. Log in to Firebase CLI (if not already authenticated)
npx firebase-tools login

# 2. Select the ant-wire project
npx firebase-tools use ant-wire

# 3. Deploy Cloud Firestore security rules and compound indexes
npx firebase-tools deploy --only firestore

# 4. Run the idempotent database initialization script (registers schemas and official models)
npm run init:firestore
```

---

## 3. Authentication Configuration

AntWire uses Firebase Authentication for secure identity and ownership:
- **Anonymous Browsing**: Allows researchers to browse models, inspect experiments, and run simulations without login friction.
- **Google Developer Sign-In**: Enables verified identity for editing/deleting own comments, upvoting feature requests, and tracking feedback tickets.

### CLI / Admin Configuration:
Ensure the following providers are enabled for `ant-wire`:
- `Anonymous`
- `Google` (Authorized domains: `localhost`, `127.0.0.1`, `ant-brain-keyboard.vercel.app`, and custom production domains)

---

## 4. Cloud Firestore Collections & Document Schemas

```text
Firestore Root
├── users (Collection)
│   ├── _schema (Schema Metadata Document)
│   └── {uid} (Document)
│       ├── uid: string
│       ├── displayName: string
│       ├── isAnonymous: boolean
│       └── lastActive: number (timestamp)
│
├── modelReleases (Collection)
│   ├── _schema (Schema Metadata Document)
│   ├── antwire-v1-foundation (Official Base Connectome Document)
│   ├── antwire-v1-keyboard-rl (Trained Keyboard RL Brain Document)
│   └── {modelId} (Document)
│       ├── id: string
│       ├── name: string
│       ├── version: string
│       ├── description: string
│       ├── architecture: string
│       ├── neuronCount: number
│       ├── synapseCount: number
│       ├── capabilities: string[]
│       ├── limitations: string[]
│       ├── trainingInfo: string
│       ├── checksum: string (SHA-256)
│       └── license: string
│
├── downloadEvents (Collection)
│   ├── _schema (Schema Metadata Document)
│   └── {eventId} (Document)
│       ├── downloadEventId: string
│       ├── modelId: string
│       ├── modelVersion: string
│       ├── uid: string (session ID or authenticated user ID)
│       ├── timestamp: number (checked against server time)
│       └── source: "web_ui" | "python_cli" | "api"
│
├── feedback (Collection)
│   ├── _schema (Schema Metadata Document)
│   └── {feedbackId} (Document)
│       ├── id: string (ANT-FB-XXXX)
│       ├── feedbackId: string
│       ├── uid: string
│       ├── type: "FEATURE_REQUEST" | "BUG" | "IDEA" | "PERFORMANCE" | "GENERAL"
│       ├── title: string
│       ├── body: string
│       ├── category: string
│       ├── modelVersion: string (optional)
│       ├── appVersion: string
│       ├── createdAt: number
│       └── status: "OPEN" | "TRIAGED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
│
├── comments (Collection)
│   ├── _schema (Schema Metadata Document)
│   └── {commentId} (Document)
│       ├── commentId: string
│       ├── uid: string
│       ├── authorName: string
│       ├── targetId: string (modelId, experimentId, or "general-discussion")
│       ├── targetType: "MODEL" | "EXPERIMENT" | "FEEDBACK" | "FEATURE" | "BUG" | "GENERAL"
│       ├── body: string
│       ├── createdAt: number
│       ├── updatedAt: number (optional)
│       └── status: "ACTIVE" | "FLAGGED" | "RESOLVED" | "DELETED"
│
├── featureRequests (Collection)
│   ├── _schema (Schema Metadata Document)
│   └── {requestId} (Document)
│       ├── requestId: string
│       ├── uid: string
│       ├── authorName: string
│       ├── title: string
│       ├── description: string
│       ├── category: string
│       ├── createdAt: number
│       ├── status: "OPEN" | "TRIAGED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
│       ├── votes: number
│       └── voters: map<string, boolean>
│
├── bugReports (Collection)
│   ├── _schema (Schema Metadata Document)
│   └── {reportId} (Document)
│       ├── reportId: string
│       ├── uid: string
│       ├── authorName: string
│       ├── title: string
│       ├── description: string
│       ├── severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
│       ├── environment: string
│       ├── appVersion: string
│       ├── createdAt: number
│       └── status: "OPEN" | "TRIAGED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED"
│
└── publicExperiments (Collection)
    ├── _schema (Schema Metadata Document)
    └── {experimentId} (Document)
        ├── experimentId: string
        ├── authorId: string
        ├── author: string
        ├── title: string
        ├── description: string
        ├── modelVersion: string
        ├── environment: string
        ├── task: string
        ├── population: number
        ├── configuration: map
        ├── metrics: map
        ├── createdAt: number
        ├── isoDate: string
        └── visibility: "PUBLIC" | "UNLISTED"
```

---

## 5. Cloud Firestore Security Rules (`firestore.rules`)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(uid) {
      return isAuthenticated() && request.auth.uid == uid;
    }
    
    function isAdmin() {
      return isAuthenticated() && request.auth.token.admin == true;
    }

    match /users/{uid} {
      allow read: if isAuthenticated();
      allow write: if isOwner(uid);
    }

    match /modelReleases/{modelId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /downloadEvents/{eventId} {
      allow read: if true;
      allow create: if request.resource.data.downloadEventId == eventId
                    && request.resource.data.timestamp <= request.time.toMillis()
                    && request.resource.data.uid.size() <= 128;
      allow update, delete: if false;
    }

    match /feedback/{feedbackId} {
      allow read: if true;
      allow create: if request.resource.data.title.size() >= 3
                    && request.resource.data.title.size() <= 150
                    && request.resource.data.body.size() >= 10
                    && request.resource.data.body.size() <= 2000;
      allow update: if isOwner(resource.data.uid) || isAdmin();
      allow delete: if isAdmin();
    }

    match /comments/{commentId} {
      allow read: if true;
      allow create: if request.resource.data.body.size() >= 3
                    && request.resource.data.body.size() <= 1500;
      allow update: if isOwner(resource.data.uid) || isAdmin();
      allow delete: if isOwner(resource.data.uid) || isAdmin();
    }

    match /featureRequests/{requestId} {
      allow read: if true;
      allow create: if request.resource.data.title.size() >= 3
                    && request.resource.data.title.size() <= 150
                    && request.resource.data.description.size() >= 10
                    && request.resource.data.description.size() <= 2000;
      allow update: if isAuthenticated() || isOwner(resource.data.uid) || isAdmin();
      allow delete: if isOwner(resource.data.uid) || isAdmin();
    }

    match /bugReports/{reportId} {
      allow read: if true;
      allow create: if request.resource.data.title.size() >= 3
                    && request.resource.data.title.size() <= 150
                    && request.resource.data.description.size() >= 10
                    && request.resource.data.description.size() <= 2000;
      allow update: if isOwner(resource.data.uid) || isAdmin();
      allow delete: if isAdmin();
    }

    match /publicExperiments/{experimentId} {
      allow read: if true;
      allow create: if request.resource.data.title.size() >= 5
                    && request.resource.data.title.size() <= 150
                    && request.resource.data.description.size() <= 2000;
      allow update: if isOwner(resource.data.authorId) || isAdmin();
      allow delete: if isOwner(resource.data.authorId) || isAdmin();
    }
  }
}
```

---

## 6. Operational Data Flows

### A. Feedback Submission Flow
$$\text{Researcher} \longrightarrow \text{Sanitize \& Rate-Limit} \longrightarrow \text{Create Document in /feedback} \longrightarrow \text{Realtime Snapshot Updates UI}$$

### B. Verified Model Download Flow
$$\text{Click Download} \longrightarrow \text{10s Debounce Guard} \longrightarrow \text{setDoc in /downloadEvents} \longrightarrow \text{Derived Aggregate Total} \longrightarrow \text{Deliver .antbrain}$$

### C. Offline / Resilience Guarantee
If Cloud Firestore is unreachable:
1. `FirebaseBackendConfig` handles the failure without throwing unhandled exceptions.
2. The UI switches status to `OFFLINE` (`Community temporarily unavailable`).
3. **The core AntWire 55k biological simulation, neural connectome, training arena, and keyboard RL operate 100% locally with zero disruption.**

---

## 7. Deployment Instructions (Vercel)

1. Connect your repository `https://github.com/Nik-2208/AntWire`.
2. Configure environment variables in Vercel Project Settings:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
3. Deploy.

---

## 8. Authorship & Project Links

- **Creator & Developer**: **Nikhilesh H. Chavda**
- **GitHub**: [https://github.com/Nik-2208](https://github.com/Nik-2208)
- **LinkedIn**: [https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/](https://www.linkedin.com/in/nikhilesh-chavda-2b779533a/)
- **Portfolio**: [https://nik-portfolio-lime.vercel.app/](https://nik-portfolio-lime.vercel.app/)
- **Live Keyboard RL Showcase**: [https://ant-brain-keyboard.vercel.app/](https://ant-brain-keyboard.vercel.app/)
