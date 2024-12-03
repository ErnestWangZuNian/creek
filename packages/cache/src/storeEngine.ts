
import { CREEK_STORE, CreekStorage, StorageOptions, Store } from './common';

// 生成key
function generateKeyByNamespace(key: string, namespace?: string) {
    let namespacePrefix = `${CREEK_STORE}`;
    if (namespace) {
        const legalNamespaces = /^[a-zA-Z0-9_\-]*$/;
        if (legalNamespaces.test(namespace)) {
            namespacePrefix = `${CREEK_STORE}_${namespace}`;
        } else {
            throw new Error('@creek/store namespaces can only have alphanumerics + underscores and dashes');
        }
    }
    return `${namespacePrefix}_${key}`;
}

function serialize<V>(value: V) {
    return JSON.stringify(value);
};

function deserialize<V>(value: V) {
    try {
        const _value = value as string;
        return JSON.parse(_value) as V;
    } catch {
        return value as unknown as V;
    }
};


// 主函store
export function createCreekStore<T>(storage: CreekStorage<T>, options: StorageOptions = {}) {

    const namespace = options.namespace || '';

    // 返回store对象
    const result: Store<T> = {
        get: (key: string) => {
            const value = storage.read(generateKeyByNamespace(key, namespace));
            return deserialize(value);
        },

        set: (key: string, value: T) => {
            if (value === undefined) {
                storage.remove(generateKeyByNamespace(key, namespace));
            } else {
                storage.write(generateKeyByNamespace(key, namespace), serialize(value));
            }
        },

        remove: (key: string) => {
            storage.remove(generateKeyByNamespace(key, namespace));
        },

        clearAll: () => {
            storage.clearAll();
        },

        each: (callback: (key: string, value: T) => void) => {
            storage.each((key, value) => {
                callback(key, value)
            });
        },
    };

    return result;
};
