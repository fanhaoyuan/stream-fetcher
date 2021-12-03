/* eslint-disable no-use-before-define */
import { PayloadTransformerOptions } from 'fatcher-middleware-payload-transformer';
import { ResponseFormatterOptions } from 'fatcher-middleware-response-formatter';
import { AborterOptions } from 'fatcher-middleware-aborter';

export type RequestMethod = 'get' | 'post' | 'delete' | 'put' | 'head' | 'options' | 'patch';

export type PrimitiveType = number | string | boolean;

/**
 * Deeply Immutable Object.
 */
export type ImmutableRecord<T> = { readonly [K in keyof T]: Immutable<T[K]> };

/**
 * Immutable type for any
 */
export type Immutable<T> = T extends PrimitiveType
    ? T
    : T extends (...args: any[]) => void
    ? T
    : T extends object
    ? ImmutableRecord<T>
    : T;

/**
 * Deeply Writable Object.
 */
export type WritableRecord<T> = { -readonly [K in keyof T]: Writable<T[K]> };

/**
 * Writable type for any.
 */
export type Writable<T> = T extends PrimitiveType
    ? T
    : T extends (...args: any[]) => void
    ? T
    : T extends object
    ? WritableRecord<T>
    : T;

export type Flatten<T> = T extends WritableRecord<infer R> ? (R extends ImmutableRecord<infer V> ? V : T) : T;

export interface Middleware {
    /**
     * Middleware name
     */
    name: string;

    /**
     * Should middleware apply.
     *
     * If `false`, middlewares will filter in register middleware
     *
     * If `true`, middleware will always run in request.
     *
     * If `function`, middleware will run with return true or void.
     *
     * @default true
     */
    apply?: ((context: Immutable<RequestContext>) => boolean) | boolean;

    /**
     * Middleware function.
     */
    use(context: Immutable<RequestContext>, next: MiddlewareNext): Promise<Response> | Response;
}

export interface RequestOptions extends PayloadTransformerOptions, ResponseFormatterOptions, AborterOptions {
    /**
     * The prefix url with http request.
     *
     * It will splice into the front of url.
     *
     * @default '/'
     */
    baseURL: string;

    /**
     * URL to request.
     */
    url: string;

    /**
     * Middleware to register.
     *
     * @default []
     */
    middlewares: ((() => Middleware) | Middleware)[];

    /**
     * Request Payload.
     *
     * Payload will automatically transform on basis of `method` and `Content-headers`.
     *
     * - Method `get` will transform to `URL Parameters`
     *
     * Other method will automatically transform on basis of `Content-headers`
     *
     * - ContentType `'application/json'` will stringify to `string`.
     *
     * - ContentType `'application/x-www-form-urlencoded'` will use `qs` to stringify.
     *
     * - ContentType `'multipart/form-data'` will use `FormData` to send.
     *
     * Else ContentType will not transform and provide a custom __middleware__ to transform it.
     *
     * @default {}
     */
    payload: Record<string, any>;

    /**
     * Request headers.
     *
     *
     * @default
     * {
     *   'Content-Type': 'application/json'
     * }
     */
    headers: Record<string, string | null>;

    /**
     * Request Method
     *
     * @default 'get'
     */
    method: RequestMethod;

    /**
     * Whether send http request with credentials.
     *
     * - If `true`, will `always` sent request with credentials.
     *
     * - If `false`, will `never` sent request with credentials.
     *
     * - If `'auto'`, will sent request with credentials by `same-origin`.
     *
     * @default 'auto'
     */
    withCredentials: 'auto' | boolean;

    /**
     * Http request body
     *
     * If auto transform payload, you would not use this option.
     */
    body: ReadableStream | FormData | string | null;
}

export interface RequestContext extends Record<string, any> {
    /**
     * Request Options
     */
    options: RequestOptions;
}

export interface Response<T = any> {
    status: number;
    statusText: string;
    data: T;
    headers: Record<string, string>;
    options: RequestOptions;
}

export interface PatchRequestContext extends Record<string, any> {
    options?: Partial<RequestOptions>;
}
export interface MiddlewareNext<T = ReadableStream<Uint8Array>> {
    (context?: PatchRequestContext): Promise<Response<T>> | Response<T>;
}
