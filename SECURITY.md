# Security Policy

ClashJudge treats security, user data protection, and sandboxed code execution integrity as critical priorities.

---

## 🛡 Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| < 2.0   | :x:                |

---

## 🔒 Security Architecture Highlights

1. **Sandboxed Code Execution**:
   - User-submitted code is evaluated through isolated runtime workers with bounded execution timeouts (35s maximum per submission batch) and strict payload size limits (64KB).
   - Code execution happens completely isolated from the main platform server.

2. **NoSQL / Query Injection Defense**:
   - All dynamic parameters across API routes (`email`, `roomCode`, `userId`, `problemId`) are strictly sanitized to string primitives before executing Mongoose/MongoDB queries, preventing operator injection attacks (`$gt`, `$ne`, etc.).

3. **Anti-Cheat & Duel Privacy**:
   - In 1v1 Competitive Duels, opponent code is strictly hidden on the server until the match transitions to `FINISHED`.
   - Hidden test cases are never transmitted to client browsers; only public example test cases are visible in problem workspaces.

4. **Rate Limiting & Authentication**:
   - Passwordless OTP codes are cryptographically hashed (SHA-256) with single-use expiration and 60-second rate-limiting cooldowns to prevent brute-force abuse.

---

## 🚨 Reporting a Vulnerability

If you discover a security vulnerability in ClashJudge, please **do NOT report it in public GitHub issues**.

Instead, please send a responsible disclosure email to:
**security@clashjudge.dev** (or contact the maintainers directly).

Please include:
- A detailed description of the vulnerability
- Step-by-step reproduction steps or proof of concept
- Potential impact and severity assessment

We commit to acknowledging your report within 48 hours and providing regular updates through resolution.
