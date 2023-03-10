# State Observables
Simple observable for handling state and its updates in any typescript application.It allows you to create a simple observable and add some subscribers to it. Whenever any updates happen on the observable it gets broadcasted to all subscribers depending on it's dependencies.

## Creating Observable

**Observable value should always be JSON.** Default initial value of the observable is `{}`. You can create the obsersable easily with some initial value in it:

```ts
const observable = new StateObservables<type>(initialValue, isBehaviorObservable);
```

Second parameter `isBehaviorObservable` is a boolean value whose default value is `false`. Behavior observable means that whenever a subscriber is registered it is executed immediately with current observable value.

**Example:**

```ts
const observable = new StateObservables<{a:number}>({ a: 1 }); // creating with initial value
```

**Example 2:**

```ts
const observable = new StateObservables<{id: number, name: string}>({ id: 123, name: 'Amit' }, true); // creating behavior observable with initial value
```

## Adding Subscribers

You can add any number of subscribers for an observable. These are the callback functions which gets executed on every value update.

```ts
observable.subscribe({
  func: callbackFunction,
  isImmediate: boolean,
  key: string,
  dependencies: Array<string>,
});
```

* **func:** Subscriber callback function to execute on every update. The parameter passed to the function is value in observable.
* **dependencies:** List of name of dependencies which is used to execute callback when any of them changes. Empty dependency list means execute on every update. **Dependency changes are detected by JSON passed in `next` method. The keys in the JSON passed is considered as new value updates and dependency changes.**
* **isImmediate:** If the value is `true` the callback function is executed immediately with current value in observer. `isBehaviorObservable` is the default value of this option. Setting this value will override the behavior of `isBehaviorObservable` option set during initialization. **Optional**.
* **key:** Key is used to make sure no duplicate subscriber is registered. Default key is `main` and every subscriber is registered with a key. **Optional**.

**Example:**

```ts
observable.subscribe({
  func: (val) => {
    console.log("id is updated: ", val);
  },
  dependencies: ['id'],
  key: 'index',
});
```

## Updating Value

The `next` method allows you to update value in an observable. For every call to this method all subscriber function is executed depending on their dependency list (if list is empty, for any change subscriber is executed). It simply uses spread operator to merge provided JSON value with current state JSON. The optional second parameter accepts boolean value to either update the state JSON or overwrite it with passed JSON value. **When overwriting all subscribers will be called.**

It triggers value update with new value. Keys in value determines what dependencies are being updated to broadcast to subscribers. If value is a function, it will be provided with the current state and keys in returned value will be used to trigger dependencies update and subscribers.

```ts
observable.next(value|Function, shouldOverWrite);
```

**Example:**

```ts
observable.next({ id: 500 });
observable.next((x) => ({ id: x.id + 1 }));
```


## Unsubscribing Subscribers By Key

Removing subscribers from observable is very easy using `unsubscribe` method. It has an optional parameter key whose default value is `main`.

```ts
observable.unsubscribe(key);
```

**Example:**

```ts
observable.unsubscribe('index');
```

## Unsubscribing All Subscribers

The `dispose` method allows you to remove all subscribers from observables.

```ts
observable.dispose();
```

## Resetting Observable

The `reset` method allows you to reset value of observable to the passed initial value.

```ts
observable.reset();
```

## Getting Protected Observable

The `pipe` method allows you to get protected version of observable which does not allows changing values except reset functionality. It provides only these methods: `subscribe`, `unsubscribe` and `reset`.

```ts
observable.pipe();
```
