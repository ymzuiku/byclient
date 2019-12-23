/// <reference types="node" />
import fastify from 'fastify';
import { ILessOptions } from './createLess';
export declare const app: fastify.FastifyInstance<import("http").Server, import("http").IncomingMessage, import("http").ServerResponse>;
export declare const setCors: () => fastify.FastifyInstance<import("http").Server, import("http").IncomingMessage, import("http").ServerResponse>;
export declare const setServerLess: (options: ILessOptions) => Promise<import("./createWss").IWss | undefined>;
export declare const setMethodLess: (methods: any) => Promise<import("./createWss").IWss>;
