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
    const wss = await createWss({ server: app.server, lessEvent: less });
    return wss;
  }

  return;
};

export const setMethodLess = async (methods: any) => {
  async function methodCheck(body: any) {
    if (!body || !body.method) {
      return { error: 'need method' };
    }
    const method = methods[body.method];
    if (!method) {
      return { error: 'method is undefined' };
    }

    try {
      const data = await method(body);

      return data;
    } catch (err) {
      app.log.error(err);
      return { error: 'method run error', info: err };
    }
  }

  app.post('/methods', async (req, rep) => {
    const body = req.body;
    const res = await methodCheck(body);
    return rep.send(res || { error: 'method is no callbak' });
  });

  const wss = await createWss({ server: app.server, lessEvent: methodCheck });

  return wss;
};
