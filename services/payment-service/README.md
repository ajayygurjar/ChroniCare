# payment-service (planned, Phase 3)

Java 21 + Spring Boot service for appointment booking fees: creates provider orders, verifies webhook
signatures, keeps the payment ledger in its own database (`payments_db`) and publishes `payment.succeeded`
through a transactional outbox. It validates the JWTs that core-api issues.

Not started. See [../../docs/architecture.md](../../docs/architecture.md).
