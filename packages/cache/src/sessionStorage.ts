
import { Global } from './common';

function _sessionStorage() {
    return Global.sessionStorage
}

export const sessionStorage = {
    read(key: string) {
        return _sessionStorage().getItem(key)
    },
    write(key: string, value: string) {
        _sessionStorage().setItem(key, value)
    },
    remove(key: string) {
        _sessionStorage().removeItem(key)
    },
    clearAll() {
        _sessionStorage().clear()
    },
    each(callback: (key: string, value: string) => void) {
        for (let i = _sessionStorage().length - 1; i >= 0; i--) {
            const key = _sessionStorage().key(i);
            if (key) {
                callback(key, sessionStorage.read(key) as string)
            }

        }
    }
};


