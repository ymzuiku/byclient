import fastify from 'fastify';
import fastifyCors from 'fastify-cors';

export const app = fastify({
  logger: true,
  disableRequestLogging: true,
});

app.register(fastifyCors);
