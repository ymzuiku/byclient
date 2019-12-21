import WebSocket from 'ws';
import { ILessOptions } from './createLess';
export interface IWss extends WebSocket.Server {
    onConnection: (ws: WebSocket) => any;
    onMessage: (ws: WebSocket) => any;
}
interface IWSParams {
    lessOptions?: ILessOptions;
    server: any;
    lessEvent?: any;
}
declare const createWss: (params: IWSParams) => IWss;
export { createWss };
