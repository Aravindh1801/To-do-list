(function () {
  "use strict";

  var STORAGE_KEY = "todo-app-state-v1";

  var elTodayDate = document.getElementById("todayDate");
  var elPendingSection = document.getElementById("pendingSection");
  var elPendingList = document.getElementById("pendingList");
  var elTodaySection = document.getElementById("todaySection");
  var elTodayList = document.getElementById("todayList");
  var elEmptyState = document.getElementById("emptyState");
  var elAddForm = document.getElementById("addForm");
  var elTaskInput = document.getElementById("taskInput");

  // ---------- date helpers (local time, not UTC) ----------

  function todayKey() {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function formatDateKey(key) {
    var parts = key.split("-").map(Number);
    var d = new Date(parts[0], parts[1] - 1, parts[2]);
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  }

  function formatHeaderDate() {
    var d = new Date();
    return d.toLocaleDateString(undefined, {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  // ---------- state ----------

  function loadState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { lastOpenDate: null, tasks: [] };
      var parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.tasks)) {
        return { lastOpenDate: null, tasks: [] };
      }
      return parsed;
    } catch (e) {
      return { lastOpenDate: null, tasks: [] };
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // On a new day: drop tasks that were completed, carry the rest forward
  // as "pending", keeping their original date.
  function rollDayIfNeeded(state) {
    var today = todayKey();
    if (state.lastOpenDate && state.lastOpenDate !== today) {
      state.tasks = state.tasks
        .filter(function (t) { return !t.completed; })
        .map(function (t) {
          return Object.assign({}, t, { pending: true });
        });
    }
    state.lastOpenDate = today;
    return state;
  }

  var state = rollDayIfNeeded(loadState());
  saveState(state);

  // ---------- rendering ----------

  function makeTaskEl(task) {
    var li = document.createElement("li");
    li.className = "task-item";
    if (task.pending) li.classList.add("is-pending");
    if (task.priority) li.classList.add("is-priority");
    if (task.completed) li.classList.add("is-completed");
    li.dataset.id = task.id;

    var check = document.createElement("button");
    check.type = "button";
    check.className = "check-btn";
    check.setAttribute(
      "aria-label",
      task.completed ? "Mark as not done" : "Mark as done"
    );
    check.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 12 9 17 20 6"></polyline></svg>';
    check.addEventListener("click", function () {
      toggleComplete(task.id);
    });

    var body = document.createElement("div");
    body.className = "task-body";

    var text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;
    body.appendChild(text);

    if (task.pending) {
      var dateEl = document.createElement("span");
      dateEl.className = "task-date";
      dateEl.textContent = "Since " + formatDateKey(task.createdDate);
      body.appendChild(dateEl);
    }

    var actions = document.createElement("div");
    actions.className = "task-actions";

    var priorityBtn = document.createElement("button");
    priorityBtn.type = "button";
    priorityBtn.className = "priority-btn" + (task.priority ? " is-active" : "");
    priorityBtn.setAttribute(
      "aria-label",
      task.priority ? "Remove priority" : "Mark as priority"
    );
    priorityBtn.innerHTML =
      '<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v18"></path><path d="M5 4h11l-3 4 3 4H5"></path></svg>';
    priorityBtn.addEventListener("click", function () {
      togglePriority(task.id);
    });

    var deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "delete-btn";
    deleteBtn.setAttribute("aria-label", "Delete task");
    deleteBtn.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="6" x2="18" y2="18"></line><line x1="6" y1="18" x2="18" y2="6"></line></svg>';
    deleteBtn.addEventListener("click", function () {
      deleteTask(task.id);
    });

    actions.appendChild(priorityBtn);
    actions.appendChild(deleteBtn);

    li.appendChild(check);
    li.appendChild(body);
    li.appendChild(actions);

    return li;
  }

  function sortForDisplay(tasks) {
    return tasks.slice().sort(function (a, b) {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      if (a.priority !== b.priority) return a.priority ? -1 : 1;
      return 0;
    });
  }

  function render() {
    elTodayDate.textContent = formatHeaderDate();

    var pending = sortForDisplay(state.tasks.filter(function (t) { return t.pending; }));
    var today = sortForDisplay(state.tasks.filter(function (t) { return !t.pending; }));

    elPendingList.innerHTML = "";
    pending.forEach(function (t) { elPendingList.appendChild(makeTaskEl(t)); });
    elPendingSection.hidden = pending.length === 0;

    elTodayList.innerHTML = "";
    today.forEach(function (t) { elTodayList.appendChild(makeTaskEl(t)); });

    elEmptyState.hidden = state.tasks.length !== 0;
  }

  // ---------- actions ----------

  function addTask(text) {
    var trimmed = text.trim();
    if (!trimmed) return;
    state.tasks.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
      text: trimmed,
      completed: false,
      priority: false,
      pending: false,
      createdDate: state.lastOpenDate,
    });
    saveState(state);
    render();
  }

  function toggleComplete(id) {
    var task = state.tasks.find(function (t) { return t.id === id; });
    if (!task) return;
    task.completed = !task.completed;
    saveState(state);
    render();
  }

  function togglePriority(id) {
    var task = state.tasks.find(function (t) { return t.id === id; });
    if (!task) return;
    task.priority = !task.priority;
    saveState(state);
    render();
  }

  function deleteTask(id) {
    var li = document.querySelector('.task-item[data-id="' + id + '"]');
    state.tasks = state.tasks.filter(function (t) { return t.id !== id; });
    saveState(state);
    if (li) {
      li.classList.add("is-removing");
      window.setTimeout(render, 150);
    } else {
      render();
    }
  }

  // ---------- events ----------

  elAddForm.addEventListener("submit", function (e) {
    e.preventDefault();
    addTask(elTaskInput.value);
    elTaskInput.value = "";
    elTaskInput.focus();
  });

  // Catch a rollover if the app is left open across midnight.
  window.setInterval(function () {
    var before = state.lastOpenDate;
    state = rollDayIfNeeded(state);
    if (state.lastOpenDate !== before) {
      saveState(state);
      render();
    }
  }, 60 * 1000);

  render();

  // ---------- PWA install support ----------

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("service-worker.js").catch(function () {});
    });
  }
})();
