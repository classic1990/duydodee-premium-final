\# 🤖 AI CLI — Prompt Handbook

> คู่มือ Prompt สำหรับ Gemini CLI / Claude Code และ AI CLI ทุกตัว

> วางไว้ใน `D:\\DUYDODEE-HD\\AI\_CLI\_PROMPTS.md` หรือ reference ได้ตลอด



\---



\## 📌 สารบัญ

1\. \[System Identity — หัวใจที่ต้องใส่ทุกครั้ง](#1-system-identity)

2\. \[อ่านและ Audit โปรเจค](#2-audit--read-only)

3\. \[แก้ไขไฟล์อย่างปลอดภัย](#3-safe-file-edit)

4\. \[เพิ่ม Feature ใหม่](#4-add-feature)

5\. \[Debug และ Fix Error](#5-debug--fix)

6\. \[Refactor โดยไม่พัง Logic](#6-refactor-safely)

7\. \[Deploy และ Run Command](#7-deploy--run)

8\. \[ป้องกัน Loop / มั่ว](#8-anti-loop-guard)

9\. \[Review โค้ดก่อน Merge](#9-code-review)

10\. \[สร้างไฟล์ใหม่](#10-create-new-file)

11\. \[Prompt สำหรับโปรเจค DUYDODEE โดยเฉพาะ](#11-duydodee-specific)



\---



\## 1. System Identity

> วางตรงนี้ \*\*ก่อน\*\* ทุก prompt เพื่อตั้ง behavior ของ AI



```

You are a precise senior developer on the DUYDODEE project.



Core rules — non-negotiable:

\- Do EXACTLY what is asked, nothing more, nothing less

\- NEVER rewrite working code unprompted

\- NEVER add features that were not requested

\- NEVER delete files without explicit instruction

\- If a task is ambiguous, ASK one clarifying question before acting

\- Confirm each step with me before proceeding to the next

\- When editing: show a diff (before/after) before saving

```



\---



\## 2. Audit / Read-Only

> ใช้เมื่อต้องการให้ AI \*\*ตรวจสอบ แต่ยังไม่แก้ไข\*\*



```

READ ONLY MODE — do not edit anything.



Scan: \[ระบุ folder หรือ file]

Report every issue in this format:



| SEVERITY | FILE | LINE | ISSUE | SUGGESTED FIX |

|----------|------|------|-------|---------------|



Severity levels: CRITICAL / HIGH / MEDIUM / LOW / INFO



After the report, wait for my instruction before touching any file.

```



\### ตัวอย่างใช้งาน:

```

READ ONLY MODE — do not edit anything.

Scan: D:\\DUYDODEE-HD\\public\\js\\services\\

Report every issue in this format:

| SEVERITY | FILE | LINE | ISSUE | SUGGESTED FIX |

Wait for my instruction before touching any file.

```



\---



\## 3. Safe File Edit

> ใช้เมื่อต้องการแก้ไขไฟล์ใดไฟล์หนึ่ง \*\*อย่างแม่นยำ\*\*



```

SINGLE FILE EDIT:



File: \[path เต็ม]

Problem: \[อธิบาย 1 บรรทัด]

Change: replace \[X] with \[Y]

Constraint: do not modify anything outside of this change



Before saving, show me:

1\. The exact line(s) before

2\. The exact line(s) after

3\. Wait for me to type "OK" to confirm

```



\### ตัวอย่างใช้งาน:

```

SINGLE FILE EDIT:

File: D:\\DUYDODEE-HD\\cors.json

Problem: origin is wildcard which is a security risk

Change: replace \["\*"] with \["https://duydodeesport.web.app"]

Do not modify anything else.

Show me before/after diff, wait for "OK" to confirm.

```



\---



\## 4. Add Feature

> ใช้เมื่อต้องการ \*\*เพิ่มของใหม่\*\* โดยไม่กระทบของเดิม



```

ADD NEW FEATURE:



Feature name: \[ชื่อ]

Target file(s): \[ระบุไฟล์ที่จะแก้]

Existing behavior to preserve: \[อธิบายสิ่งที่ต้องคงไว้]

New behavior wanted: \[อธิบายสิ่งที่ต้องการเพิ่ม]



Rules:

\- Add code, do not rewrite existing functions

\- New code goes at the bottom unless structure requires otherwise

\- If you need to modify an existing function, show me why first

\- Test: describe how I can verify this works after you're done

```



\---



\## 5. Debug / Fix

> ใช้เมื่อมี error และต้องการให้ AI วินิจฉัยและแก้



```

DEBUG MODE:



Error message: \[วาง error ทั้งหมด]

File: \[ไฟล์ที่เกิด error]

Last change made: \[อธิบายสิ่งที่แก้ล่าสุด ถ้ามี]



Steps to reproduce: \[ทำอะไรแล้ว error ขึ้น]



Instructions:

1\. Identify root cause first — explain it in plain language

2\. Propose ONE fix only

3\. Show the exact code change (diff format)

4\. Wait for my approval before applying

```



\---



\## 6. Refactor Safely

> ใช้เมื่อต้องการทำโค้ดให้ดีขึ้น \*\*โดยไม่เปลี่ยน behavior\*\*



```

SAFE REFACTOR:



File: \[ระบุไฟล์]

Goal: \[เช่น reduce duplication / improve readability / split into functions]



Hard constraints:

\- Input/output of every function must remain identical

\- All existing variable names that are referenced in other files must stay the same

\- Do not change the public API or exported functions

\- Run lint check after refactor



Deliver: show full refactored file with changes highlighted.

Then I will compare and confirm.

```



\---



\## 7. Deploy / Run Command

> ใช้เมื่อต้องการให้ AI รัน command ที่มีผลกับระบบจริง



```

CONTROLLED EXECUTION:



Task: \[อธิบายงาน]



Before running ANY command that writes, deletes, or deploys:

1\. Show me the exact command

2\. Show what files/services will be affected

3\. Show expected output

4\. Wait for me to type "EXECUTE" to proceed



If a command fails:

\- Show the full error

\- Propose ONE retry approach

\- Wait for approval before retrying

\- Do NOT loop or try variations automatically

```



\---



\## 8. Anti-Loop Guard

> วางไว้ท้าย prompt เสมอ เพื่อป้องกัน AI วนซ้ำ



```

LOOP PREVENTION RULES:

\- Maximum 3 consecutive tool calls without checking with me

\- If the same error appears twice, STOP and explain the situation

\- Do not try different variations of the same approach without asking

\- If you are stuck, say "I am stuck at \[X]. Options are \[A] or \[B]. Which do you prefer?"

\- Never proceed past a failed step automatically

```



\---



\## 9. Code Review

> ใช้ก่อน commit หรือ deploy เพื่อให้ AI ตรวจสอบ



```

CODE REVIEW:



Files changed: \[list ไฟล์ที่แก้ไป]

Context: \[อธิบายว่าทำอะไรไป]



Review for:

1\. SECURITY — hardcoded secrets, open permissions, XSS risks

2\. LOGIC — edge cases, null checks, async errors not handled

3\. CONSISTENCY — does it follow the existing code style?

4\. SIDE EFFECTS — does this change break anything else?



Format output as:

✅ PASS / ⚠️ WARNING / ❌ FAIL



For each issue: FILE | LINE | DESCRIPTION | HOW TO FIX

```



\---



\## 10. Create New File

> ใช้เมื่อต้องการให้ AI สร้างไฟล์ใหม่จากศูนย์



```

CREATE NEW FILE:



File path: \[path เต็ม]

Purpose: \[ทำหน้าที่อะไร]

Must follow pattern from: \[ชี้ไฟล์เดิมที่ใช้เป็น template]

Must use: \[เช่น UI.showToast, UI.setLoading — ตาม standard โปรเจค]

Must NOT include: \[สิ่งที่ไม่ต้องการ เช่น console.log, inline styles]



After creating: show full file content for my review before saving.

```



\---



\## 11. DUYDODEE-Specific

> Prompt สำเร็จรูปสำหรับโปรเจคนี้โดยเฉพาะ



\### 🔍 ตรวจสอบ JS ทั้งโปรเจค

```

READ ONLY MODE.

Scan: D:\\DUYDODEE-HD\\public\\js\\

Check for:

\- console.log left in production code

\- functions that are defined but never called

\- missing null checks before .forEach or .querySelector

\- Firebase calls without .catch() error handling

Report as table. Wait for instruction.

```



\### 🛡️ ตรวจสอบ Security ทั้งโปรเจค

```

READ ONLY MODE — Security Audit.

Scan: D:\\DUYDODEE-HD\\public\\ and D:\\DUYDODEE-HD\\firestore.rules

Check for:

\- Any API key or secret hardcoded in JS files

\- Firestore rules that use "if true" for write operations

\- Admin pages accessible without auth check

\- User input rendered as innerHTML without sanitization

Report as: CRITICAL / HIGH / MEDIUM with file and line number.

Wait for instruction before fixing anything.

```



\### ➕ เพิ่มหน้า Admin ใหม่

```

ADD NEW FEATURE — New Admin Page.

Pattern to follow: D:\\DUYDODEE-HD\\public\\admin\\admin-manage-movies.html

and: D:\\DUYDODEE-HD\\public\\js\\admin\\admin-manage-movies.js



New page name: \[ชื่อหน้า]

Purpose: \[ทำหน้าที่อะไร]



Requirements:

\- Must include admin-overlay div

\- Must use viewport width 1024

\- Must call UI.initAdminSidebar() on DOMContentLoaded

\- Must use UI.showToast and UI.setLoading for all async operations

\- Must add entry to vite.config.js rollupOptions.input



Show me both HTML and JS files before creating. Wait for "OK".

```



\### 🐛 Fix Bug โดยไม่พัง Logic

```

DEBUG — Logic Preservation Mode.

File: \[ระบุไฟล์]

Bug: \[อธิบาย]

Error: \[วาง error message]



Rules:

\- The function signature must not change

\- Return value type must not change

\- Other functions that call this must still work

\- Show root cause analysis first

\- Show diff before applying fix

\- Wait for "APPLY" to confirm

```



\### 🚀 Deploy ปลอดภัย

```

DEPLOY — Controlled Mode.

Project: D:\\DUYDODEE-HD

Target: Firebase Hosting (duydodeesport)



Pre-deploy checklist — run in order and STOP if any fail:

1\. npm run lint → must pass with 0 errors

2\. npm test → must pass all tests

3\. npm run build:css → must succeed

4\. npm run build → must succeed

5\. Show me the list of files that will be deployed

6\. Wait for me to type "SHIP" before running firebase deploy

```



\---



\## 💡 เคล็ดลับการใช้งาน



| สถานการณ์ | Prompt ที่ใช้ |

|-----------|--------------|

| ไม่แน่ใจว่ามีปัญหาอะไร | #2 Audit ก่อน |

| รู้ว่าปัญหาอยู่ที่ไหน | #3 Safe Edit |

| AI วนซ้ำ / ทำมั่ว | หยุด แล้วเริ่มใหม่ด้วย #8 Anti-Loop |

| ก่อน deploy ทุกครั้ง | #9 Code Review แล้วค่อย #7 Deploy |

| เพิ่มหน้าหรือ feature ใหม่ | #4 Add Feature หรือ #10 Create New File |



> \*\*กฎทอง:\*\* scope แคบ = ผลดี / scope กว้าง = มั่ว

> ทุก prompt ที่ดีต้องมี: \*\*ไฟล์ที่จะแก้ + สิ่งที่ต้องเปลี่ยน + สิ่งที่ห้ามแตะ\*\*



\---



\*อัปเดตล่าสุด: 2026 | สำหรับโปรเจค DUYDODEE-HD\*

