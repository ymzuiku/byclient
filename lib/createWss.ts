import WebSocket from 'ws';
import { createLess, ILessOptions } from './createLess';

export interface IWss extends WebSocket.Server {
  onConnection: (ws: WebSocket) => any;
  onMessage: (ws: WebSocket) => any;
}

interface IWSParams {
  lessOptions?: ILessOptions;
  server: any;
  lessEvent?: any;
}

const createWss = (params: IWSParams) => {
  const { lessOptions, lessEvent, server } = params;

  const wss = new WebSocket.Server({ server }) as IWss;
  let less = lessEvent;
  if (!less && lessOptions) {
    less = createLess(lessOptions);
  }

  wss.on('connection', function connection(ws) {
    if (wss.onConnection) {
      wss.onConnection(ws);
    }
    ws.on('message', function incoming(data) {
      if (less) {
        const body = JSON.parse(data.toString());
        const wsName = body.wsName;
        const send = (value: any) => {
          value.wsName = wsName;
          ws.send(JSON.stringify(value));
        };
        less(body, send);
      }
      if (wss.onMessage) {
        wss.onMessage(ws);
      }
    });
  });

  return wss;
};

export { createWss };
