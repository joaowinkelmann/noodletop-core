export class ObservableMap<K, V> extends Map<K, V> {
    constructor(private callback: () => void) {
        super();
    }

    set(key: K, value: V) {
        const result = super.set(key, value);
        this.callback();
        return result;
    }

    delete(key: K) {
        const result = super.delete(key);
        this.callback();
        return result;
    }
}