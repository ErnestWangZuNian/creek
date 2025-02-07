
import { AxiosError } from 'axios';

import * as rawTaro from '@tarojs/taro';


export function merge(...args: any[]): any {
    const result: Record<string, any> = {};

    function assignValue(val: any, key: string) {
        if (isObject(result[key]) && isObject(val)) {
            result[key] = merge(result[key], val);
        } else if (isObject(val)) {
            result[key] = merge({}, val);
        } else if (Array.isArray(val)) {
            result[key] = val.slice();
        } else {
            result[key] = val;
        }
    }

    for (const obj of args) {
        if (isObject(obj)) {
            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    assignValue(obj[key], key);
                }
            }
        }
    }

    return result;
}

export function isString(val: unknown): val is string {
    return typeof val === 'string';
}

/**
 * Determines if a value is a plain object
 */
export function isObject(val: unknown): val is Record<string, unknown> {
    return val !== null && typeof val === 'object' && !Array.isArray(val);
}
// Utility functions for URL handling
function isAbsoluteURL(url: string): boolean {
    // Protocol relative URLs are considered absolute
    return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}

function combineURLs(baseURL: string, relativeURL: string): string {
    return relativeURL
        ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
        : baseURL;
}

/**
 * Creates a full URL by combining a base URL and a relative URL
 */
export function buildFullPath(baseURL: string | undefined, requestedURL: string): string {
    if (baseURL && !isAbsoluteURL(requestedURL)) {
        return combineURLs(baseURL, requestedURL);
    }
    return requestedURL;
}

/**
 * Builds the final URL with parameters
 */
export function buildUrl(
    url: string,
    params?: Record<string, any>,
    options?: {
        encode?: (val: string) => string;
        serializer?: (params: Record<string, any>) => string;
    }
): string {
    if (!params) {
        return url;
    }

    const encode = options?.encode || encodeURIComponent;

    if (options?.serializer) {
        return url + (url.indexOf('?') === -1 ? '?' : '&') + options.serializer(params);
    }

    const parts: string[] = [];

    Object.entries(params).forEach(([key, val]) => {
        if (val === null || typeof val === 'undefined') {
            return;
        }

        let values: any[] = [];
        if (Array.isArray(val)) {
            values = val;
            key = key + '[]';
        } else {
            values = [val];
        }

        values.forEach((v) => {
            if (Object.prototype.toString.call(v) === '[object Date]') {
                v = v.toISOString();
            } else if (typeof v === 'object') {
                v = JSON.stringify(v);
            }
            parts.push(`${encode(key)}=${encode(v)}`);
        });
    });

    const serializedParams = parts.join('&');

    if (serializedParams) {
        url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
    }

    return url;
}

/**
 * Resolves or rejects a Promise based on response status
 */
export function settle<T>(resolve: (value: T) => void, reject: (reason: any) => void, response: any): void {
    const validateStatus = (status: number): boolean => {
        return status >= 200 && status < 300;
    };

    const { status, data, config, headers, statusText } = response;

    if (validateStatus(status)) {
        resolve({
            data,
            status,
            statusText,
            headers,
            config,
        } as T);
    } else {
        reject(
            new AxiosError(
                'Request failed with status code ' + status,
                'ERR_BAD_RESPONSE',
                config,
                response.request,
                response
            )
        );
    }
}


export function getTaro(): typeof rawTaro  {
    const Taro = require('@tarojs/taro') as any

    return Taro && (Taro as any).default || Taro
}