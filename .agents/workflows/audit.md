---
description: Run a full health, security, and financial integrity audit of the ticketing system.
---

# 🕵️ Ticketing System Audit Workflow (/audit)

When the user types `/audit`, follow these precise steps to ensure the ticketing platform is operating optimally and there are no hidden data corruptions.

## Step 1: Execute the System Audit Script
// turbo
1. Run `npx tsx src/scripts/audit-ticketing.ts`
2. Wait for the output. 

## Step 2: Analyze the Script Results
Read the output of the script carefully. 
- Are there any `[FAIL]` messages?
- Are there orphaned records or stale pending tickets locking inventory?
- Did the Stripe Sync check flag any unpaid records?
- Did the Booking Simulation (Health Check) succeed?
- Are there warnings about Active Tickets missing Medical Waivers in the Legal & Compliance section?

## Step 3: TypeScript Build Verification
// turbo
1. Run `npx tsc --noEmit` to scan the entire codebase for stealthy TypeScript typing errors (especially in checkout and webhooks).
2. If errors exist in `src/app/api/checkout/route.ts` or `src/app/api/webhook/stripe/route.ts`, note them down as critical.

## Step 4: Report Findings to the User
Use the `notify_user` tool to present a clean, concise markdown report to the user summarizing the health of their platform.

Include the following sections in your report:
- **📊 Database Integrity**: (Pass/Fail) Note any orphaned tickets or stale locks.
- **💰 Financial Sync**: (Pass/Fail) Mention if active tickets are perfectly mapped to Stripe Paid statuses.
- **🛡️ Booking Engine Health**: (Pass/Fail) Result of the simulation.
- **💻 Code Health**: (Pass/Fail) Result of the `tsc` check.
- **⚖️ Legal Compliance**: Summarize the marketing opt-in numbers and strictly warn if there are active tickets missing medical waivers.

If there are failures, immediately offer to fix them and provide the path to the files you suspect are causing the issue.
