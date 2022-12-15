type Json = {
    [key:string]: any,
}

type SubscriberOption<T> = {
    func:(val:T) => any,
    dependencies: string[],
    isImmediate?:boolean,
    key?:string,
};

type PipedObservables<T> = {
    subscribe: (options:SubscriberOption<T>) => void,
    unsubscribe: (key?:string) => void,
    dispose: () => void,
};

class StateObservables {
    private value:Json;

    private isBehaviorObservable:boolean;

    private subscribers:{[key:string]: { func: (val:Json) => any, dependencies: Json }} = {};

    constructor(value:Json = {}, isBehaviorObservable = false) {
        this.value = value;
        this.isBehaviorObservable = isBehaviorObservable;
    }

    // eslint-disable-next-line class-methods-use-this
    private array2Json(arr:string[]) {
        const map = {};

        arr.forEach((item) => {
            map[item] = true;
        });

        return map;
    }

    // check if any key of source exists in target
    // eslint-disable-next-line class-methods-use-this
    private compareJsonKeys(source, target) {
        // if source is empty then return true
        if (Object.keys(source).length < 1) {
            return true;
        }

        return Object.keys(source).some(
            (key) => target[key] !== null && target[key] !== undefined,
        );
    }

    // Broadcast value update to all subscribers
    // empty dependency list means execute on every update.
    private broadcast(dependencies:Json) {
        Object.keys(this.subscribers).forEach(async (key) => {
            if (this.compareJsonKeys(this.subscribers[key].dependencies, dependencies)) {
                this.subscribers[key].func(this.value);
            }
        });
    }

    // Trigger value update with new value. When overwrite is true, overwrite value
    next(value:Json, overwrite = false) {
        this.value = overwrite ? value : { ...this.value, ...value };
        this.broadcast(this.array2Json(Object.keys(value)));
    }

    // register a subscriber which will be executed if value update has dependency changed
    // empty dependency list means execute on every update.
    subscribe({
        func, isImmediate = this.isBehaviorObservable, key = 'main', dependencies,
    }:SubscriberOption<Json>) {
        this.subscribers[key] = {
            func, dependencies: this.array2Json(dependencies),
        };

        if (isImmediate) {
            func(this.value);
        }
    }

    // unsubscribe subscriber by key
    unsubscribe(key = 'main') {
        delete this.subscribers[key];
    }

    // unsubscribe all subscribers
    dispose() {
        Object.keys(this.subscribers).forEach((key) => {
            this.unsubscribe(key);
        });
    }

    // send protected version of observable which only allows limited functionality
    // use this to protect observable value from being updated directly and allow only updates
    pipe():PipedObservables<Json> {
        return ({
            subscribe: this.subscribe.bind(this),
            unsubscribe: this.unsubscribe.bind(this),
            dispose: this.dispose.bind(this),
        });
    }
}

export default StateObservables;
