const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const dateInput = document.getElementById('dateInput');
const subjectInput = document.getElementById('subjectInput');
const taskList = document.getElementById('taskList');
const filterSelect = document.getElementById('filterSelect');
const emptyMessage = document.getElementById('emptyMessage');

let tasks = JSON.parse(localStorage.getItem('studentPlannerTasks') || '[]');

const today = new Date();
const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
  .toISOString().split('T')[0];

document.getElementById('todayDate').textContent = today.toLocaleDateString(
  undefined, { weekday: 'short', month: 'short', day: 'numeric' }
);
dateInput.min = localDate;
dateInput.value = localDate;

function saveTasks() {
  localStorage.setItem('studentPlannerTasks', JSON.stringify(tasks));
}

function formatDate(dateString) {
  if (!dateString) return 'No due date';
  return new Date(`${dateString}T00:00:00`).toLocaleDateString(
    undefined, { day: 'numeric', month: 'short', year: 'numeric' }
  );
}

function updateSummary() {
  const completed = tasks.filter(task => task.completed).length;
  document.getElementById('totalCount').textContent = tasks.length;
  document.getElementById('completedCount').textContent = completed;
  document.getElementById('pendingCount').textContent = tasks.length - completed;
}

function renderTasks() {
  taskList.innerHTML = '';
  const filter = filterSelect.value;
  const visibleTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  }).sort((a, b) => a.date.localeCompare(b.date));

  emptyMessage.hidden = visibleTasks.length !== 0;

  visibleTasks.forEach(task => {
    const item = document.createElement('li');
    item.className = `task-item${task.completed ? ' is-complete' : ''}`;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Mark ${task.title} as complete`);
    checkbox.addEventListener('change', () => {
      task.completed = checkbox.checked;
      saveTasks();
      renderTasks();
    });

    const info = document.createElement('div');
    info.className = 'task-info';

    const title = document.createElement('p');
    title.className = 'task-title';
    title.textContent = task.title;

    const meta = document.createElement('p');
    meta.className = 'task-meta';
    meta.textContent = `${task.subject || 'General'} · Due ${formatDate(task.date)}`;

    info.append(title, meta);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.type = 'button';
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => {
      tasks = tasks.filter(current => current.id !== task.id);
      saveTasks();
      renderTasks();
    });

    item.append(checkbox, info, deleteButton);
    taskList.appendChild(item);
  });

  updateSummary();
}

taskForm.addEventListener('submit', event => {
  event.preventDefault();
  const title = taskInput.value.trim();
  if (!title) return;

  tasks.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    date: dateInput.value || localDate,
    subject: subjectInput.value.trim(),
    completed: false
  });

  saveTasks();
  taskForm.reset();
  dateInput.value = localDate;
  taskInput.focus();
  renderTasks();
});

filterSelect.addEventListener('change', renderTasks);
renderTasks();
