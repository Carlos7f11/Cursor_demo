const STORAGE_KEY = "todos";

const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");
const dateInput = document.getElementById("todo-date");
const list = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");
const countEl = document.getElementById("todo-count");

let todos = loadTodos();

function loadTodos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random();
}

function todayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getDateStatus(dueDate, completed) {
  if (!dueDate || completed) return null;
  const today = todayString();
  if (dueDate < today) return "overdue";
  if (dueDate === today) return "today";
  return "upcoming";
}

function addTodo(text, dueDate) {
  const trimmed = text.trim();
  if (!trimmed) return;

  todos.unshift({
    id: generateId(),
    text: trimmed,
    completed: false,
    createdAt: Date.now(),
    dueDate: dueDate || null,
  });

  saveTodos();
  renderTodos();
}

function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  todo.completed = !todo.completed;
  saveTodos();
  renderTodos();
}

function updateTodoDate(id, dueDate) {
  const todo = todos.find((t) => t.id === id);
  if (!todo) return;

  todo.dueDate = dueDate || null;
  saveTodos();
  renderTodos();
}

function deleteTodo(id) {
  todos = todos.filter((t) => t.id !== id);
  saveTodos();
  renderTodos();
}

function sortTodos(items) {
  return [...items].sort((a, b) => {
    if (a.dueDate && b.dueDate) {
      const dateDiff = a.dueDate.localeCompare(b.dueDate);
      if (dateDiff !== 0) return dateDiff;
    } else if (a.dueDate) {
      return -1;
    } else if (b.dueDate) {
      return 1;
    }
    return b.createdAt - a.createdAt;
  });
}

function renderTodos() {
  list.innerHTML = "";

  sortTodos(todos).forEach((todo) => {
    const status = getDateStatus(todo.dueDate, todo.completed);
    const li = document.createElement("li");
    li.className = "todo-item" + (todo.completed ? " completed" : "");
    li.dataset.id = todo.id;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "todo-checkbox";
    checkbox.checked = todo.completed;
    checkbox.setAttribute("aria-label", "标记完成");
    checkbox.addEventListener("change", () => toggleTodo(todo.id));

    const content = document.createElement("div");
    content.className = "todo-content";

    const span = document.createElement("span");
    span.className = "todo-text";
    span.textContent = todo.text;

    const dateRow = document.createElement("div");
    dateRow.className = "todo-date-row";

    const dateLabel = document.createElement("span");
    dateLabel.className = "todo-date-label" + (status ? ` ${status}` : "");
    dateLabel.textContent = todo.dueDate ? "截止" : "设置日期";

    const itemDateInput = document.createElement("input");
    itemDateInput.type = "date";
    itemDateInput.className = "todo-date-input" + (status ? ` ${status}` : "");
    itemDateInput.value = todo.dueDate || "";
    itemDateInput.setAttribute("aria-label", "截止日期");
    itemDateInput.addEventListener("change", () => {
      updateTodoDate(todo.id, itemDateInput.value);
    });

    dateRow.appendChild(dateLabel);
    dateRow.appendChild(itemDateInput);

    content.appendChild(span);
    content.appendChild(dateRow);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.type = "button";
    deleteBtn.setAttribute("aria-label", "删除任务");
    deleteBtn.textContent = "×";
    deleteBtn.addEventListener("click", () => deleteTodo(todo.id));

    li.appendChild(checkbox);
    li.appendChild(content);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });

  const activeCount = todos.filter((t) => !t.completed).length;
  countEl.textContent = `${activeCount} 项未完成`;
  emptyState.hidden = todos.length > 0;
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  addTodo(input.value, dateInput.value);
  input.value = "";
  dateInput.value = "";
  input.focus();
});

input.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    input.value = "";
    dateInput.value = "";
    input.blur();
  }
});

renderTodos();
