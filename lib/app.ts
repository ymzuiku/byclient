import fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import { createLess, ILessOptions } from './createLess';
import { createWss } from './createWss';

export const app = fastify({
  logger: process.env.log !== 'false',
  disableRequestLogging: true,
});

export const setCors = () => app.register(fastifyCors);

export const setRestfulLess = async (options: ILessOptions) => {
  const less = await createLess(options);
  app.post(options.url || '/less', async (req, rep) => {
    less(req.body, rep.send);
  });
  if (options.useWss) {
    return createWss({ server: app.server, lessEvent: less });
  }

  return;
};
