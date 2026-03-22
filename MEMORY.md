# MEMORY.md — Mission Control Shared Memory

Purpose: Central memory file for Mission Control so all important context is stored in one place.

## How to use
- Put long-term decisions here.
- Keep daily/raw notes in separate dated files if needed.
- Keep entries concise and actionable.

## Sections

### 1) Project Context
- Product goals
- Current priorities
- Active environments (local/staging/prod)

### 2) Architecture Decisions
- Key technical decisions
- Tradeoffs and rationale
- Links to related PRs/issues

### 3) Operations & Deployments
- Deployment URLs
- Release notes highlights
- Known infra constraints

### 4) Integrations
- Supabase schema notes
- Discord/Telegram routing notes
- External automation/webhook mapping

### 5) Playbooks
- Incident response steps
- Rollback checklist
- Backup/restore notes

### 6) Known Issues & Follow-ups
- Open bugs
- Workarounds
- Next actions

---

## Initial Entries

- Mission dashboard URL: https://agent-dashboard-one-tan.vercel.app/
- Cron automations are active but some jobs require proper channel/auth tuning.
- Supabase logging hard-gate is enabled in agent prompts and script workflow.
- 2026-03-14: Added keepalive policy for multiple Supabase free-tier projects using cron `supabase-keepalive-every-3days` (every 3 days, 12:00 AM Asia/Shanghai) with alert-only delivery.
- 2026-03-14: Preferred mission-control Git repo for sync: https://github.com/digitalmerch4862/DMerch-Mission-Control.git
- 2026-03-22: Committed to the new Mission Control layout — long-term summary, daily stacks, and checkpoints. Daily notes now follow template with timestamp/topic/action.
