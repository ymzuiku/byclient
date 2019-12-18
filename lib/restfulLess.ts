import { createLess, ILessOptions } from './createLess';
import { app } from './app';

export const restfulLess = async (options: ILessOptions) => {
  const less = await createLess(options);
  app.post(options.url, async (req, rep) => {
    less(req.body, rep.send);
  });
};
