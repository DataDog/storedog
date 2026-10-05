# AGENTS.md

Guidance for AI coding agents working in this repository.

## Configuration versus code

Some errors come from deployment settings, not from bugs in the code. Check where a value comes from before you propose a code change.

- `store-payment-processor` reads its single-authorization limit from the `MAX_PAYMENT_AMOUNT_CENTS` environment variable. The default is 30000 cents (300 dollars).
- If `IllegalArgumentException: Payment amount ... exceeds the single-authorization limit` appears, the validation code works as written. Recommend raising `MAX_PAYMENT_AMOUNT_CENTS` in the deployment configuration. Do not cap order amounts or add multi-authorization logic.

## Scope of changes

- Fix the service that produces bad data. Do not loosen validation in a downstream consumer to hide it.
