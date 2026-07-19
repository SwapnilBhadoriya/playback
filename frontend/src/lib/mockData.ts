import type { VideoMetadata } from "@/types/videoMeta";
import type { TimelineChapter } from "@/types/timeline";
import type { NoteSection } from "@/types/notes";
import type { PracticeQuestionRich } from "@/types/questions";
import type { ProcessingStepState } from "@/types/processing";

export const mockVideoMetadata: VideoMetadata = {
  id: "demo-jwt-auth",
  title: "JSON Web Tokens (JWT) Authentication — Full Course",
  youtubeId: "7Q17ubqLfaM",
  thumbnailUrl: "https://i.ytimg.com/vi/7Q17ubqLfaM/maxresdefault.jpg",
  durationSeconds: 1938,
  channelName: "Web Dev Simplified",
};

export const mockTimeline: TimelineChapter[] = [
  { id: "t1", title: "Introduction", startSeconds: 0, endSeconds: 151, summary: "Why authentication matters, session vs token-based approaches" },
  { id: "t2", title: "What is Authentication?", startSeconds: 151, endSeconds: 380, summary: "Identifying users, credentials, and trust boundaries" },
  { id: "t3", title: "What is JWT?", startSeconds: 380, endSeconds: 620, summary: "Structure: header, payload, signature" },
  { id: "t4", title: "JWT Structure", startSeconds: 620, endSeconds: 890, summary: "Encoding, claims, the three dot-separated parts" },
  { id: "t5", title: "Token Signing", startSeconds: 890, endSeconds: 1200, summary: "HMAC vs RSA, secret keys, signature verification" },
  { id: "t6", title: "Refresh Tokens", startSeconds: 1200, endSeconds: 1725, summary: "Token expiry, refresh flow, secure storage" },
  { id: "t7", title: "Best Practices", startSeconds: 1450, endSeconds: 1810, summary: "Common pitfalls and production recommendations" },
  { id: "t8", title: "Demo & Implementation", startSeconds: 1710, endSeconds: 1938, summary: "Building an Express middleware end to end" },
];

export const mockNoteSections: NoteSection[] = [
  {
    id: "n1",
    title: "What is JWT?",
    startTimestamp: 380,
    blocks: [
      {
        type: "paragraph",
        text: "JWT (JSON Web Token) is a compact, URL-safe means of representing claims to be transferred between two parties. It is commonly used for authentication and information exchange in web applications.",
      },
      {
        type: "keypoints",
        points: [
          { id: "kp1", label: "Stateless", value: "No need to store session on the server" },
          { id: "kp2", label: "Secure", value: "Digitally signed and cannot be tampered" },
          { id: "kp3", label: "Compact", value: "Small in size, ideal for transmission" },
          { id: "kp4", label: "Self-contained", value: "Contains all necessary information" },
          { id: "kp5", label: "Scalable", value: "Perfect for distributed systems" },
          { id: "kp6", label: "Standard", value: "Based on open standards (RFC 7519)" },
        ],
      },
    ],
  },
  {
    id: "n2",
    title: "JWT Structure",
    startTimestamp: 620,
    blocks: [
      {
        type: "paragraph",
        text: "A JWT consists of three parts separated by dots (`.`): **Header**, **Payload**, and **Signature**.",
      },
      { type: "code", language: "text", code: "xxxxx.yyyyy.zzzzz" },
      {
        type: "paragraph",
        text: "1. **Header** – Contains token type and signing algorithm\n2. **Payload** – Contains claims (user information)\n3. **Signature** – Verifies that the token hasn't been altered",
      },
      { type: "code", language: "json", code: '{\n  "alg": "HS256",\n  "typ": "JWT"\n}' },
    ],
  },
  {
    id: "n3",
    title: "Signing and Verification",
    startTimestamp: 890,
    blocks: [
      {
        type: "paragraph",
        text: "Tokens are signed using either a shared secret (HMAC) or a public/private key pair (RSA/ECDSA), which allows the receiving party to verify the token hasn't been tampered with.",
      },
      {
        type: "keypoints",
        points: [
          { id: "kp7", label: "HMAC (HS256)", value: "Single shared secret, symmetric signing" },
          { id: "kp8", label: "RSA (RS256)", value: "Private key signs, public key verifies" },
        ],
      },
      {
        type: "code",
        language: "text",
        code: "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInRIcCI6IkpXVCJ9...\\n",
      },
    ],
  },
  {
    id: "n4",
    title: "Implementing Auth Middleware",
    startTimestamp: 1200,
    blocks: [
      {
        type: "paragraph",
        text: "Extract the token from the `Authorization` header, verify it, and attach the decoded payload to the request before calling `next()`.",
      },
      {
        type: "code",
        language: "javascript",
        code: "function authMiddleware(req, res, next) {\n  const token = req.headers.authorization?.split(' ')[1];\n  if (!token) return res.status(401).json({ error: 'No token' });\n  try {\n    req.user = jwt.verify(token, SECRET);\n    next();\n  } catch {\n    res.status(403).json({ error: 'Invalid token' });\n  }\n}",
      },
    ],
  },
  {
    id: "n5",
    title: "Refresh Tokens & Best Practices",
    startTimestamp: 1450,
    blocks: [
      {
        type: "paragraph",
        text: "Access tokens should be short-lived (e.g. 15 minutes); refresh tokens are longer-lived and should be stored securely, such as in httpOnly cookies.",
      },
      {
        type: "keypoints",
        points: [
          { id: "kp9", label: "Access token TTL", value: "~15 minutes" },
          { id: "kp10", label: "Refresh token TTL", value: "~7-30 days" },
          { id: "kp11", label: "Storage", value: "httpOnly, Secure cookies preferred" },
        ],
      },
    ],
  },
];

export const mockQuestions: PracticeQuestionRich[] = [
  {
    id: "q1",
    questionType: "multiple_choice",
    questionText: "What is JWT and why is it used?",
    options: [
      "A compact, signed token format for transmitting claims between parties",
      "A database engine for storing sessions",
      "An encryption algorithm for passwords",
      "A protocol for transferring files",
    ],
    answer: "A compact, signed token format for transmitting claims between parties",
    explanation: "JWT (JSON Web Token) is a compact, URL-safe means of representing claims to be transferred between two parties, commonly used for stateless authentication.",
    marks: 5,
    difficulty: "easy",
    confidenceScore: 92,
    topicTags: ["JWT", "Authentication", "Basics"],
    timestampSeconds: 465,
  },
  {
    id: "q2",
    questionType: "short_answer",
    questionText: "Explain the structure of JWT with an example.",
    options: null,
    answer: "A JWT consists of three Base64Url-encoded parts separated by dots: header.payload.signature. The header declares the token type and algorithm, the payload carries claims, and the signature verifies integrity.",
    explanation: "Example: xxxxx.yyyyy.zzzzz, where each segment is Base64Url-encoded JSON.",
    marks: 10,
    difficulty: "medium",
    confidenceScore: 89,
    topicTags: ["JWT", "Token Structure", "Security"],
    timestampSeconds: 690,
  },
  {
    id: "q3",
    questionType: "long_answer",
    questionText: "How does JWT authentication work in a real-world application?",
    options: null,
    answer: "On login, the server issues a signed JWT to the client. The client stores it and sends it in the Authorization header on subsequent requests. The server verifies the signature and claims on each request without needing server-side session state, enabling stateless, scalable authentication.",
    explanation: "Covers the full request/response lifecycle: issuance, storage, transmission, verification, and expiry/refresh handling.",
    marks: 15,
    difficulty: "hard",
    confidenceScore: 76,
    topicTags: ["JWT", "Authentication", "Flow"],
    timestampSeconds: 1125,
  },
  {
    id: "q4",
    questionType: "true_false",
    questionText: "HMAC-based JWT signing (HS256) uses a public/private key pair.",
    options: ["True", "False"],
    answer: "False",
    explanation: "HS256 uses a single shared secret (symmetric). RS256 uses a public/private key pair (asymmetric).",
    marks: 3,
    difficulty: "medium",
    confidenceScore: 81,
    topicTags: ["Signing", "Security"],
    timestampSeconds: 950,
  },
  {
    id: "q5",
    questionType: "multiple_choice",
    questionText: "Where should a JWT typically be sent in an HTTP request?",
    options: ["Authorization header", "URL query string", "Cookie only", "Request body"],
    answer: "Authorization header",
    explanation: "Convention is `Authorization: Bearer <token>`, though httpOnly cookies are also commonly used for refresh tokens.",
    marks: 2,
    difficulty: "easy",
    confidenceScore: 88,
    topicTags: ["Implementation"],
    timestampSeconds: 1210,
  },
];

export const mockProcessingSteps: ProcessingStepState[] = [
  { id: "extracting_audio", label: "Extracting audio", status: "pending" },
  { id: "transcribing", label: "Transcribing", status: "pending" },
  { id: "generating_notes", label: "Generating notes", status: "pending" },
  { id: "generating_questions", label: "Generating questions", status: "pending" },
];
