/// <reference types="node" />
import fastify from 'fastify';
export declare const app: fastify.FastifyInstance<import("http").Server, import("http").IncomingMessage, import("http").ServerResponse>;
export declare const setCors: () => fastify.FastifyInstance<import("http").Server, import("http").IncomingMessage, import("http").ServerResponse>;
