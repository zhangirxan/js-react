# Task 1 — JS Runtime and Async

Open `index.html` in the browser. Plain HTML/CSS/JS, no libraries.

## Closure

`createTask` keeps `count` as a local variable. `run`, `reset` and `getCount` still use it after
`createTask` returns, so it stays alive, but it's not on the returned object (`task.count` is
`undefined`). Every `createTask` call makes a new scope, so each task has its own counter.

## Call stack example

Click **Run** on a task: click handler → `task.run()` → `setStatus()` → `render()`. `render` and
`setStatus` finish and get popped. `run` calls `delay()`, which starts a `setTimeout` and returns a
promise. At `await` `run` pauses and leaves the stack, then the handler finishes and the stack is empty.
When the timer fires, the rest of `run` comes back on the stack.

## How JS keeps going while setTimeout waits

`setTimeout` is a browser API. JS just registers the timer and moves on. The browser counts the time,
then puts the callback in the task queue, and the event loop runs it when the stack is empty.

## Event loop demo

Expected:

```
A: script start
B: async start
C: script end
D: promise 1
E: promise 2
F: async after await
G: promise 2 → then
H: timeout 1
I: timeout 2
J: microtask inside timeout 2
K: timeout 3
```

Actual: the same.

- A, B, C are synchronous. Code in an async function before the first `await` runs right away.
- The timers go to the **task queue**. The `.then` callbacks and the code after `await` go to the **microtask queue** (D, E, F).
- When the **call stack** is empty, the **event loop** runs all the microtasks: D, E, F, then G, which was added when E finished.
- Then it takes one task at a time: H, then I. I adds microtask J, and J runs before K because microtasks are drained after every task.

## Tasks vs microtasks

Tasks: `setTimeout`, `setInterval`, events. The loop runs one task per turn.
Microtasks: `.then`, code after `await`, `queueMicrotask`. They all run after the current task, before the next one.

## Promises and errors

A failed task throws inside `run`, so its promise rejects. **Run All** uses `Promise.allSettled`,
which waits for every task, even the failed ones, and then shows "All tasks finished".
`Promise.all` would stop at the first error. In the sequential version each `await` is wrapped in
`try/catch`, so one failed task doesn't stop the others.

## Sequential vs concurrent

My run: sequential ~3900 ms, concurrent ~1600 ms.

Sequential waits for each task before starting the next one, so the time is about the sum of all
delays. Concurrent starts all tasks at once, so the waiting overlaps and the time is about the slowest
task. JS is still single-threaded; only the waiting happens in parallel.
