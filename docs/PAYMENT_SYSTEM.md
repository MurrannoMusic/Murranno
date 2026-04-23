# Murranno Payment & Wallet System Architecture

## Executive Summary
The Murranno Payment System is a professional-grade fintech module designed to handle global music royalties and secure payouts. It operates on a **"Security-First, Ledger-Second"** philosophy, separating the physical movement of funds (The Vault) from the digital tracking of debt (The Ledger).

---

## 1. Core Architecture: The "Ledger vs. Vault" Split

### The Ledger (Digital Tracking)
The ledger resides in **Supabase** and acts as the "Bookkeeper." It tracks exactly who is owed what, but it does not hold physical cash.
- **`wallet_balance`**: Tracks `available_balance` (ready for withdrawal), `pending_balance` (clearing royalties), and `total_earnings`.
- **`withdrawal_transactions`**: A detailed record of every payout request.
- **`wallet_transactions`**: The master record of all credits (royalties) and debits (withdrawals).

### The Vault (Physical Cash)
The actual money resides in secure financial institutions and payment gateways:
- **Paystack Merchant Balance**: Holds funds for active payouts and processed subscriptions.
- **Corporate Escrow Accounts**: Where global royalty payments (USD/EUR) are received before being allocated to artists in Naira.

---

## 2. Income & Earnings Flow
1.  **Reporting**: Music stores (Spotify, Apple Music, etc.) send monthly performance reports.
2.  **Allocation**: Murranno's backend parses these reports and calculates the net share for each artist.
3.  **Crediting**: A new entry is inserted into the ledger, increasing the artist's `pending_balance`.
4.  **Clearing**: After a standard holding period (e.g., 30–60 days), funds are moved from `pending` to `available` balance.

---

## 3. Payout & Withdrawal Workflow
1.  **KYC Verification**: Artists must complete identity verification. NIN-only verification is supported to reduce friction.
2.  **Payout Method**: Artists add a bank account. An Edge Function triggers Paystack to create a `recipient_code`.
3.  **Initiation**: User requests a withdrawal.
4.  **Verification**: The system checks the **Transaction PIN** and captures device metadata (IP/User-Agent).
5.  **Settlement**: Depending on the amount and risk, the system either:
    - Triggers an **Instant Transfer** (for small amounts).
    - Schedules a **Delayed Transfer** (for mid-range amounts).
    - Flags for **Admin Review** (for large amounts or anomalies).

---

## 4. Advanced Security Layers (New Improvements)

### A. Ledger Integrity (Immutable Ledger)
- **Chained Hashing**: Every transaction is cryptographically linked to the one before it. If a row is edited manually in the database, the hash chain breaks, alerting the system to tampering.
- **Append-Only Triggers**: Database-level locks prevent any `UPDATE` or `DELETE` on the transaction tables. The ledger is "write-once," ensuring a perfect audit trail.
- **Reconciliation Engine**: Internal RPCs verify that the `wallet_balance` perfectly matches the sum of all transaction entries.

### B. Settlement Safety
- **Idempotency Keys**: Prevents accidental "Double Payouts" if a user clicks the button twice or a network request retries.
- **Velocity Limits**: A 24-hour rolling cap (default: ₦500,000) limits the potential loss in case of an account breach.
- **High-Value Gating (OTP)**: Withdrawals over ₦100,000 require a second-factor OTP sent to the user's email.
- **Payout Lock**: A 24-48 hour cooling-off period is enforced after sensitive changes (like password resets or bank account updates) before funds can be moved.

---

## 5. Administrative Controls
- **Maker-Checker Logic**: (Configurable) Large transactions require approval from two separate admins before execution.
- **Audit Logs**: Every admin action (approval, rejection, or flagging) is logged with a timestamp and IP address.
- **Refund Logic**: Rejection of a withdrawal automatically triggers a secure refund RPC, returning funds to the user's `available_balance` safely.

---

## 6. Technical Stack
- **Backend**: Supabase Edge Functions (Deno/TypeScript).
- **Database**: PostgreSQL with `pgcrypto` for hashing and custom triggers.
- **Gateway**: Paystack (Transfers, Recipients, Webhooks).
- **Media**: Cloudinary (Signed uploads for ID documents).
