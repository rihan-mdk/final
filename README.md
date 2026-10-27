# THE HUNT EXPEDITION
## Fully Offline Local Treasure Hunt Web Application

Designed and engineered for a collegiate treasure hunt event held on **28 October 2026, 1:00 PM – 4:00 PM IST**.

---

### Key System Specifications

- **Event Schedule:** 28 October 2026, 1:00 PM – 4:00 PM IST
- **Registered Teams:** Exactly **9 teams** (`TEAM-01` through `TEAM-09`), with one dedicated device per team.
- **Structure:** Exactly 4 Levels, 10 Questions per Level (**40 Authoritative Questions**)
- **Data Source:** `The_Hunt_Expedition_Google_Form_Backup_Questions.docx` (Questions 1–40 verbatim)
- **Levels Included:** Level 1 (Q1–Q10), Level 2 (Q11–Q20), Level 3 (Q21–Q30), Level 4 (Q31–Q40). Level 5 (Q41–Q45) is excluded.
- **Physical Checkpoints:** Q31 (*Checkpoint Cipher*) and Q38 (*Observation Card*) with physical inspection workflows and organizer PIN verification.
- **Answer Attempts Rule:** **UNLIMITED ATTEMPTS**. No penalties, lockouts, or waiting periods. Immediate retries allowed.
- **Authentication & Access Control:**
  - Compact team login screen (Team Name + Password). Participant team-selection screen is removed.
  - Dedicated hardware binding: devices can be locked by organizers to specific teams.
  - Trial Mode and QA tools are strictly restricted to authenticated administrators.
- **Offline Architecture:** 100% offline. Zero runtime internet dependencies, zero remote CDNs/fonts, zero external databases. Service Worker & PWA enabled.

---

### Configured Team Accounts & Passwords

The application is pre-configured with the 9 exact authoritative team accounts:

| Team ID | Team Name | Initial Password | Callsign |
|---|---|---|---|
| `TEAM-01` | **Code3SD** | `Code3SD@yit` | `CODE3SD` |
| `TEAM-02` | **IMPACTX** | `IMPACTX@yit` | `IMPACTX` |
| `TEAM-03` | **THE COGNIVEX** | `THE COGNIVEX@yit` | `COGNIVEX` |
| `TEAM-04` | **Ctrl Alt Elit** | `Ctrl Alt Elit@yit` | `CTRL_ALT` |
| `TEAM-05` | **Non-syntax Error** | `Non-syntax Error@yit` | `NON_SYNTAX` |
| `TEAM-06` | **The Lost Five** | `The Lost Five@yit` | `LOST_FIVE` |
| `TEAM-07` | **Team executives** | `Team executives@yit` | `EXECUTIVES` |
| `TEAM-08` | **Zedox** | `Zedox@yit` | `ZEDOX` |
| `TEAM-09` | **MindX** | `MindX@yit` | `MINDX` |

*Password Convention:* `<Team Name>@yit` (case-sensitive, internal spaces preserved).

---

### Nine-Device Provisioning Workflow

To prepare the 9 devices before the event:

1. **Host Setup:** Start the local application:
   ```powershell
   npm run build && npm run preview
   ```
2. **Open Device Browser:** On each team device, open the browser and navigate to `http://<HOST_IP>:3000`.
3. **Verify Offline Caching:** Allow the initial splash screen to complete and confirm Service Worker cache registration. Disconnect WiFi to verify offline durability.
4. **Hardware Device Binding (Organizer Setup):**
   - Click the **Shield** icon in the top right.
   - Enter/establish the master Organizer PIN (e.g. `1234` or custom PIN).
   - In the Organizer Console, tap the **Device** tab.
   - Select the team designated for that device:
     - Device 1 $\rightarrow$ Assign to **Code3SD** (`TEAM-01`)
     - Device 2 $\rightarrow$ Assign to **IMPACTX** (`TEAM-02`)
     - Device 3 $\rightarrow$ Assign to **THE COGNIVEX** (`TEAM-03`)
     - Device 4 $\rightarrow$ Assign to **Ctrl Alt Elit** (`TEAM-04`)
     - Device 5 $\rightarrow$ Assign to **Non-syntax Error** (`TEAM-05`)
     - Device 6 $\rightarrow$ Assign to **The Lost Five** (`TEAM-06`)
     - Device 7 $\rightarrow$ Assign to **Team executives** (`TEAM-07`)
     - Device 8 $\rightarrow$ Assign to **Zedox** (`TEAM-08`)
     - Device 9 $\rightarrow$ Assign to **MindX** (`TEAM-09`)
5. **Participant Login:**
   - Once bound, participants on Device 1 can ONLY log in as `Code3SD` with password `Code3SD@yit`. Attempts to log in with other teams' credentials are automatically blocked.
   - Logging in immediately launches the game for that team.
   - Logging out returns to the login screen and **preserves all saved progress**.

---

### How to Change Team Credentials

1. Open the **Organizer Console** (Shield icon $\rightarrow$ enter PIN).
2. Go to the **Teams** tab.
3. Click the pencil/edit icon next to any team's password.
4. Enter the updated password and click **Save**. The updated credential is immediately saved locally.

---

### Administrator-Only Trial Mode

- Trial Mode is **completely hidden** from participants. Participants only see the Login screen and their live Event Game screen.
- Only authenticated administrators who enter the Organizer PIN can access the **Controls** tab $\rightarrow$ click **LAUNCH TRIAL MODE QA**.
- The Trial Dashboard allows testing all 40 questions, revealing answer keys, and checking validation rules in a sandboxed namespace that never alters official event records.

---

### Automated Test Suite

Run the full automated test suite:
```powershell
npm test
```
All **36 tests** pass across 4 suites:
- `questions.test.ts` (5 tests): 40 authoritative questions, 10 per level, zero Level 5 questions.
- `validation.test.ts` (13 tests): Numeric, coordinate `(6,1)`, sequence `3,5,1,8`, probability `1/4`, binary, two-word/three-word.
- `storage.test.ts` (5 tests): 9 default teams, isolated namespaces, team progress reset, CSV export with 9 records.
- `auth.test.ts` (13 tests): Participant team-selection removed, exact 9 team names, passwords, device binding, role-based access checks, logout persistence, unlimited retries.

---

### Security Limitations of Local-Only Authentication

- **Client-Side Storage:** In a fully local, database-less web application, credentials and session progress are stored in browser `localStorage`.
- **Direct Inspection:** A participant with physical access to browser Developer Tools (`F12` / Inspect Element) can view local storage. The team passwords and Organizer PIN provide operational safeguards against unauthorized access through the application UI during the event.
