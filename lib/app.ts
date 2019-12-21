import fastify from 'fastify';
import fastifyCors from 'fastify-cors';
import { createLess, ILessOptions } from './createLess';
import { createWss } from './createWss';

export const app = fastify({
  logger: process.env.log !== 'false',
  disableRequestLogging: true,
});

export const setCors = () => app.register(fastifyCors);

export const setServerLess = async (options: ILessOptions) => {
  const less = await createLess(options);
  app.post(options.url || '/less', async (req, rep) => {
    const data = await less(req.body);
    return rep.send(data);
  });
  if (options.useWss) {
    await createWss({ server: app.server, lessEvent: less });
  }

  return;
};
