# ai-service (planned, Phase 2)

Python worker that turns an uploaded prescription image or PDF into structured medication items.
It has no public route: it consumes `prescription.uploaded` from RabbitMQ, reads the file from object
storage and publishes `prescription.processed`. It stores nothing itself.

Not started. See [../../docs/architecture.md](../../docs/architecture.md).
