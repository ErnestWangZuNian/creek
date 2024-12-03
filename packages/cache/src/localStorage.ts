
import { Global } from './common';

function _localStorage() {
    return Global.localStorage
}

export const localStorage = {
    read(key: string) {
        return _localStorage().getItem(key)
    },
    write(key: string, value: string) {
        _localStorage().setItem(key, value)
    },
    remove(key: string) {
        _localStorage().removeItem(key)
    },
    clearAll() {
        _localStorage().clear()
    },
    each(callback: (key: string, value: string) => void) {
        for (let i = _localStorage().length - 1; i >= 0; i--) {
            const key = _localStorage().key(i);
            if (key) {
                callback(key, localStorage.read(key) as string)
            }

        }
    }
};


