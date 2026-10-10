# infra/gateway (planned)

Reverse proxy (nginx or Caddy) and the only public entry point: TLS, routing `/api/*` to core-api and
`/api/payments/*` to payment-service, and setting `X-Request-Id`. Added when there is more than one service
to route to.
