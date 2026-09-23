// helpers


const $ = (id) => document.getElementById(id);

function log(message) {
  const li = document.createElement("li");
  const time = new Date().toLocaleTimeString();
  li.innerHTML = `<span class="time">${time}</span>${message}`;
  $("log").prepend(li);
  console.log(message);
}

const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;


const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// count/status/lastTime are only visible inside createTask,
// so every task gets its own counter and nobody can change it from outside
function createTask(name, { failChance = 0.3, onChange = () => {} } = {}) {
  let count = 0;
  let status = "idle"; // idle | loading | completed | failed
  let lastTime = null; // ms

  function setStatus(newStatus) {
    status = newStatus;
    onChange();
  }

  async function run() {
    count++;
    lastTime = null;
    setStatus("loading");

    const start = performance.now();
    const ms = randomBetween(500, 2000);

    try {
      await delay(ms); // fake request
      if (Math.random() < failChance) {
        throw new Error(`${name} failed (server error)`);
      }
      lastTime = Math.round(performance.now() - start);
      setStatus("completed");
      return { name, time: lastTime };
    } catch (error) {
      lastTime = Math.round(performance.now() - start);
      setStatus("failed");
      throw error; // rethrow so .catch / allSettled see it
    }
  }

  function reset() {
    count = 0;
    lastTime = null;
    setStatus("idle");
  }

  return {
    name,
    run,
    reset,
    getCount: () => count,
    getStatus: () => status,
    getTime: () => lastTime,
  };
}

// ui

const tasks = ["Load Users", "Load Posts", "Load Comments"].map((name) =>
  createTask(name, { onChange: render })
);

const STATUS_LABEL = {
  idle: "Idle",
  loading: "Loading…",
  completed: "Completed",
  failed: "Failed",
};

function render() {
  const rows = tasks.map((task, i) => {
    const status = task.getStatus();
    const time = task.getTime();
    return `
      <tr>
        <td>${task.name}</td>
        <td><span class="badge ${status}">${STATUS_LABEL[status]}</span></td>
        <td>${task.getCount()}</td>
        <td>${time === null ? "—" : time + " ms"}</td>
        <td>
          <button data-run="${i}" ${status === "loading" ? "disabled" : ""}>Run</button>
          <button data-reset="${i}" ${status === "loading" ? "disabled" : ""}>Reset</button>
        </td>
      </tr>`;
  });
  $("taskRows").innerHTML = rows.join("");
}

// one listener for all the row buttons
$("taskRows").addEventListener("click", (e) => {
  const runIndex = e.target.dataset.run;
  const resetIndex = e.target.dataset.reset;

  if (runIndex !== undefined) {
    const task = tasks[runIndex];
    log(`▶ ${task.name} started`);
    task
      .run()
      .then((r) => log(`✔ ${r.name} Completed (${r.time} ms)`))
      .catch((err) => log(`✖ ${err.message}`));
  }

  if (resetIndex !== undefined) {
    tasks[resetIndex].reset();
    log(`↺ ${tasks[resetIndex].name} reset`);
  }
});


// run all


function setButtonsDisabled(disabled) {
  ["runAllBtn", "compareBtn", "resetAllBtn"].forEach((id) => ($(id).disabled = disabled));
}

$("runAllBtn").addEventListener("click", async () => {
  setButtonsDisabled(true);
  $("allStatus").textContent = "Running all tasks…";
  log("▶ Run All started");

  // allSettled waits for everything, even if some tasks fail
  const results = await Promise.allSettled(tasks.map((t) => t.run()));

  results.forEach((r, i) => {
    if (r.status === "fulfilled") log(`✔ ${tasks[i].name} Completed (${r.value.time} ms)`);
    else log(`✖ ${r.reason.message}`);
  });

  const ok = results.filter((r) => r.status === "fulfilled").length;
  $("allStatus").textContent =
    `All tasks finished — ${ok} completed, ${results.length - ok} failed.`;
  log("■ All tasks finished");
  setButtonsDisabled(false);
});

$("resetAllBtn").addEventListener("click", () => {
  tasks.forEach((t) => t.reset());
  $("allStatus").textContent = "";
  log("↺ All tasks reset");
});


// sequential vs concurrent


async function runSequential() {
  const start = performance.now();
  for (const task of tasks) {
    try {
      await task.run();
    } catch {
      // failed, just go to the next one
    }
  }
  return Math.round(performance.now() - start);
}

async function runConcurrent() {
  const start = performance.now();
  await Promise.allSettled(tasks.map((t) => t.run()));
  return Math.round(performance.now() - start);
}

$("compareBtn").addEventListener("click", async () => {
  setButtonsDisabled(true);
  $("seqResult").textContent = "running…";
  $("conResult").textContent = "waiting…";
  $("compareExplain").textContent = "";

  const seqTime = await runSequential();
  const seqTimes = tasks.map((t) => t.getTime());
  $("seqResult").textContent = `${seqTime} ms`;
  log(`Sequential: ${seqTime} ms (tasks: ${seqTimes.join(" + ")})`);

  $("conResult").textContent = "running…";
  const conTime = await runConcurrent();
  const conTimes = tasks.map((t) => t.getTime());
  $("conResult").textContent = `${conTime} ms`;
  log(`Concurrent: ${conTime} ms (slowest task: ${Math.max(...conTimes)} ms)`);

  const sum = seqTimes.reduce((a, b) => a + b, 0);
  $("compareExplain").innerHTML =
    `Sequential ≈ <b>sum</b> of all delays (${seqTimes.join(" + ")} = ${sum} ms), ` +
    `because every <code>await</code> waits for the previous task before the next one even starts. ` +
    `Concurrent ≈ the <b>slowest</b> task (max = ${Math.max(...conTimes)} ms), ` +
    `because all timers are started at once and wait in parallel inside the browser — ` +
    `JavaScript itself is still single-threaded, it just doesn't block while waiting.`;

  setButtonsDisabled(false);
});


// event loop demo


// my guess before running it
const EXPECTED = [
  "A: script start",
  "B: async start",
  "C: script end",
  "D: promise 1",
  "E: promise 2",
  "F: async after await",
  "G: promise 2 → then",
  "H: timeout 1",
  "I: timeout 2",
  "J: microtask inside timeout 2",
  "K: timeout 3",
];

function eventLoopDemo(out) {
  out("A: script start");

  setTimeout(() => out("H: timeout 1"), 0);

  setTimeout(() => {
    out("I: timeout 2");
    Promise.resolve().then(() => out("J: microtask inside timeout 2"));
  }, 0);

  setTimeout(() => out("K: timeout 3"), 0);

  Promise.resolve().then(() => out("D: promise 1"));

  Promise.resolve()
    .then(() => out("E: promise 2"))
    .then(() => out("G: promise 2 → then"));

  async function asyncDemo() {
    out("B: async start");
    await null;
    out("F: async after await");
  }
  asyncDemo();

  out("C: script end");
}

$("demoCode").textContent = eventLoopDemo.toString();
$("expectedList").innerHTML = EXPECTED.map((l) => `<li>${l}</li>`).join("");

$("eventLoopBtn").addEventListener("click", () => {
  const actual = [];
  $("actualList").innerHTML = "";
  $("eventLoopVerdict").textContent = "";
  console.clear();

  eventLoopDemo((line) => {
    console.log(line);
    actual.push(line);
  });

  // wait until all the timers above are done
  setTimeout(() => {
    $("actualList").innerHTML = actual
      .map((line, i) => `<li class="${line === EXPECTED[i] ? "match" : "mismatch"}">${line}</li>`)
      .join("");
    const same = actual.length === EXPECTED.length && actual.every((l, i) => l === EXPECTED[i]);
    $("eventLoopVerdict").textContent = same
      ? "✔ Prediction matches the real output."
      : "✖ Some lines differ from the prediction (shown in red).";
    log("Event Loop demo finished — see console for raw output");
  }, 50);
});


$("clearLogBtn").addEventListener("click", () => ($("log").innerHTML = ""));

render();
