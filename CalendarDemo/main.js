const months = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const today = new Date();
let currentMonth  = today.getMonth();
let currentYear   = today.getFullYear();
let selectedDay   = today.getDate();

const monthNameEl       = document.querySelector('.date');
const prevArrow         = document.querySelector('.prev');
const nextArrow         = document.querySelector('.next');
const daysGrid          = document.querySelector('.days');
const eventsEl          = document.querySelector('.events');
const addEventBtn       = document.querySelector('.add-event-btn');
const addEventForm      = document.querySelector('.add-event-form');
const saveEventBtn      = document.getElementById('save-event');
const eventTitleInput   = document.getElementById('event-title');
const eventTimeInput    = document.getElementById('event-time');
const selectedDateLabel = document.getElementById('selected-date-label');

const taskInputEl       = document.getElementById('taskInput');

const timeColumnEl      = document.getElementById('time-column');
const weekHeaderEl      = document.getElementById('week-header');
const weekBodyEl        = document.getElementById('week-body');
const weekTitleEl       = document.querySelector('.week-title');
const weekBodyWrapperEl = document.querySelector('.week-body-wrapper');

const chatMessagesEl    = document.getElementById('chat-messages');
const chatInputBoxEl    = document.getElementById('chat-input');
const sendChatBtnEl     = document.getElementById('send-chat');

const HOUR_HEIGHT = 64;

function isSameDate(a, b) {
  return a.getDate() === b.getDate() &&
         a.getMonth() === b.getMonth() &&
         a.getFullYear() === b.getFullYear();
}

// ── localStorage helpers ──────────────────────────────────────────────────────

function getEvents() {
  return JSON.parse(localStorage.getItem('events') || '[]');
}

function saveEvents(events) {
  localStorage.setItem('events', JSON.stringify(events));
}

function addEventsToStore(newEvents) {
  const events = getEvents();
  events.push(...newEvents);
  saveEvents(events);
  renderEvents();
  renderWeekView();
}

// ── Assistant demo helpers ────────────────────────────────────────────────────

function appendChatBubble(text, sender = 'assistant') {
  if (!chatMessagesEl) return;

  const bubble = document.createElement('div');
  bubble.style.padding = '10px 12px';
  bubble.style.borderRadius = '14px';
  bubble.style.marginBottom = '10px';
  bubble.style.maxWidth = '100%';
  bubble.style.whiteSpace = 'pre-wrap';
  bubble.style.lineHeight = '1.4';
  bubble.style.fontSize = '0.92rem';
  bubble.style.display = 'block';

  if (sender === 'user') {
    bubble.style.background = 'rgba(179, 138, 221, 0.18)';
    bubble.style.alignSelf = 'flex-end';
  } else {
    bubble.style.background = 'rgba(0, 0, 0, 0.05)';
    bubble.style.alignSelf = 'flex-start';
  }

  bubble.textContent = text;
  chatMessagesEl.appendChild(bubble);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

function appendRecommendationCard(title, description, onConfirm) {
  if (!chatMessagesEl) return;

  const card = document.createElement('div');
  card.style.background = '#fff';
  card.style.border = '1px solid rgba(0, 0, 0, 0.08)';
  card.style.borderRadius = '14px';
  card.style.padding = '12px';
  card.style.marginBottom = '10px';
  card.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.04)';

  const titleEl = document.createElement('div');
  titleEl.textContent = title;
  titleEl.style.fontWeight = '600';
  titleEl.style.marginBottom = '6px';

  const descriptionEl = document.createElement('div');
  descriptionEl.textContent = description;
  descriptionEl.style.fontSize = '0.9rem';
  descriptionEl.style.lineHeight = '1.4';
  descriptionEl.style.marginBottom = '10px';

  const actions = document.createElement('div');
  actions.style.display = 'flex';
  actions.style.gap = '8px';

  const confirmBtn = document.createElement('button');
  confirmBtn.type = 'button';
  confirmBtn.textContent = 'Confirm';
  confirmBtn.style.border = 'none';
  confirmBtn.style.borderRadius = '999px';
  confirmBtn.style.padding = '8px 12px';
  confirmBtn.style.cursor = 'pointer';
  confirmBtn.style.background = 'rgba(179, 138, 221, 0.95)';
  confirmBtn.style.color = '#fff';

  const declineBtn = document.createElement('button');
  declineBtn.type = 'button';
  declineBtn.textContent = 'Decline';
  declineBtn.style.border = '1px solid rgba(0, 0, 0, 0.1)';
  declineBtn.style.borderRadius = '999px';
  declineBtn.style.padding = '8px 12px';
  declineBtn.style.cursor = 'pointer';
  declineBtn.style.background = '#fff';

  confirmBtn.addEventListener('click', () => {
    onConfirm();
    actions.innerHTML = '<span style="font-size:0.88rem; color:#5b6472;">Added to calendar.</span>';
  });

  declineBtn.addEventListener('click', () => {
    actions.innerHTML = '<span style="font-size:0.88rem; color:#5b6472;">Skipped.</span>';
  });

  actions.appendChild(confirmBtn);
  actions.appendChild(declineBtn);

  card.appendChild(titleEl);
  card.appendChild(descriptionEl);
  card.appendChild(actions);

  chatMessagesEl.appendChild(card);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
}

function parseMonthDayDate(rawText) {
  const match = rawText.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})\b/i);
  if (!match) return null;

  const monthNames = months.map((month) => month.toLowerCase());
  const monthIndex = monthNames.indexOf(match[1].toLowerCase());
  if (monthIndex === -1) return null;

  const day = Number(match[2]);
  const year = currentYear;

  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getNextWeekdayDate(targetWeekday) {
  const now = new Date();
  const result = new Date(now);
  result.setHours(0, 0, 0, 0);

  const delta = (targetWeekday - result.getDay() + 7) % 7 || 7;
  result.setDate(result.getDate() + delta);

  return result;
}

function createWeeklyAssignmentTasks(title, weekdayNumber, count = 6) {
  const tasks = [];
  const firstDate = getNextWeekdayDate(weekdayNumber);

  for (let i = 0; i < count; i++) {
    const taskDate = new Date(firstDate);
    taskDate.setDate(firstDate.getDate() + (i * 7));

    const dateString = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, '0')}-${String(taskDate.getDate()).padStart(2, '0')}`;

    tasks.push({
      title,
      date: dateString
    });
  }

  return tasks;
}

function buildMockSyllabusRecommendations(inputText) {
  const text = inputText.toLowerCase();
  const recommendations = [];

  if (text.includes('weekly assignment')) {
    let weekdayNumber = 5;
    if (text.includes('monday')) weekdayNumber = 1;
    if (text.includes('tuesday')) weekdayNumber = 2;
    if (text.includes('wednesday')) weekdayNumber = 3;
    if (text.includes('thursday')) weekdayNumber = 4;
    if (text.includes('friday')) weekdayNumber = 5;
    if (text.includes('saturday')) weekdayNumber = 6;
    if (text.includes('sunday')) weekdayNumber = 0;

    recommendations.push({
      type: 'weekly-assignment',
      title: 'Add weekly assignment to to-do list',
      description: 'Detected a recurring weekly assignment from the syllabus. Add the next 6 weekly assignment reminders to the to-do list?',
      createTasks: () => createWeeklyAssignmentTasks('Weekly Assignment', weekdayNumber, 6)
    });
  }

  const examLines = inputText
    .split('\n')
    .filter((line) => /exam|midterm|final|quiz/i.test(line));

  examLines.forEach((line, index) => {
    const parsedDate = parseMonthDayDate(line);
    if (!parsedDate) return;

    const cleanTitle = line.trim().replace(/\s+/g, ' ');

    recommendations.push({
      type: 'exam-date',
      title: 'Add exam date to weekly schedule',
      description: `Detected "${cleanTitle}". Add it to the weekly calendar when that date is in view?`,
      createEvents: () => [{
        id: Date.now() + 100 + index,
        title: cleanTitle,
        date: parsedDate,
        time: '09:00',
        startTime: '09:00',
        endTime: '11:00'
      }]
    });
  });

  return recommendations;
}

function handleAssistantSubmission(rawText) {
  const text = rawText.trim();
  if (!text) return;

  appendChatBubble(text, 'user');

  const recommendations = buildMockSyllabusRecommendations(text);

  if (recommendations.length === 0) {
    appendChatBubble(
      'I did not detect a weekly assignment or exam dates in that text yet. For the demo, try including lines such as "Weekly assignment due every Friday" or "Midterm Exam - October 14".',
      'assistant'
    );
    return;
  }

  appendChatBubble(
    'I analyzed the syllabus text and found a few calendar suggestions. Review each one below.',
    'assistant'
  );

  recommendations.forEach((recommendation) => {
    appendRecommendationCard(
      recommendation.title,
      recommendation.description,
      () => {
        if (recommendation.createEvents) {
          addEventsToStore(recommendation.createEvents());
        }
        if (recommendation.createTasks) {
          addTasksToTodoList(recommendation.createTasks());
        }
      }
    );
  });
}

// ── Calendar rendering ────────────────────────────────────────────────────────

function renderCalendar() {
  if (!monthNameEl || !daysGrid) return;
  monthNameEl.textContent = `${months[currentMonth]} ${currentYear}`;

  const firstDay    = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const prevDays    = new Date(currentYear, currentMonth, 0).getDate();

  let html = '';

  for (let i = firstDay - 1; i >= 0; i--) {
    html += `<div class="prev-date">${prevDays - i}</div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const isToday    = d === today.getDate() &&
                       currentMonth === today.getMonth() &&
                       currentYear  === today.getFullYear();
    const isSelected = d === selectedDay;
    let cls = '';
    if (isToday) cls += ' today';
    if (isSelected) cls += ' active';
    html += `<div class="${cls.trim()}" data-day="${d}">${d}</div>`;
  }

  const totalCells = firstDay + daysInMonth;
  const trailing   = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);

  for (let n = 1; n <= trailing; n++) {
    html += `<div class="next-date">${n}</div>`;
  }

  daysGrid.innerHTML = html;
  updateSelectedDateLabel();
}

function updateSelectedDateLabel() {
  if (!selectedDateLabel) return;
  const d = String(selectedDay).padStart(2, '0');
  const m = String(currentMonth + 1).padStart(2, '0');
  selectedDateLabel.textContent = `Adding to: ${currentYear}-${m}-${d}`;
}

// ── Navigation ────────────────────────────────────────────────────────────────

if (prevArrow) {
  prevArrow.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    selectedDay = 1;
    renderCalendar();
    renderEvents();
    renderWeekView();
  });
}

if (nextArrow) {
  nextArrow.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    selectedDay = 1;
    renderCalendar();
    renderEvents();
    renderWeekView();
  });
}

// ── Day selection ─────────────────────────────────────────────────────────────

if (daysGrid) {
  daysGrid.addEventListener('click', (e) => {
    const dayEl = e.target.closest('[data-day]');
    if (!dayEl) return;
    selectedDay = parseInt(dayEl.dataset.day, 10);
    renderCalendar();
    renderEvents();
    renderWeekView();
  });
}

// ── Toggle form ───────────────────────────────────────────────────────────────

if (addEventBtn && addEventForm) {
  addEventBtn.addEventListener('click', () => {
    const open = addEventForm.style.display === 'flex';
    addEventForm.style.display = open ? 'none' : 'flex';
  });
}

// ── Add event ─────────────────────────────────────────────────────────────────

if (saveEventBtn && eventTitleInput && eventTimeInput) {
  saveEventBtn.addEventListener('click', () => {
    const title = eventTitleInput.value.trim();
    const time  = eventTimeInput.value;

    if (!title) {
      alert('Please enter an event title.');
      return;
    }

    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(selectedDay).padStart(2, '0');
    const date = `${currentYear}-${m}-${d}`;

    const events = getEvents();
    events.push({
      id: Date.now(),
      title,
      date,
      time,
      startTime: time,
      endTime: time ? minutesToTime((timeToMinutes(time) || 540) + 60) : '10:00'
    });
    saveEvents(events);

    eventTitleInput.value = '';
    eventTimeInput.value = '';
    addEventForm.style.display = 'none';
    renderEvents();
    renderWeekView();
  });
}

// ── Delete event ──────────────────────────────────────────────────────────────

function deleteEvent(id) {
  saveEvents(getEvents().filter((e) => e.id !== id));
  renderEvents();
  renderWeekView();
}

// ── Render events for selected day ────────────────────────────────────────────

function renderEvents() {
  if (!eventsEl) return;

  const m = String(currentMonth + 1).padStart(2, '0');
  const d = String(selectedDay).padStart(2, '0');
  const selectedDate = `${currentYear}-${m}-${d}`;

  const dayEvents = getEvents().filter((e) => e.date === selectedDate);

  if (dayEvents.length === 0) {
    eventsEl.innerHTML = '<p class="no-events">No events for this day.</p>';
    return;
  }

  eventsEl.innerHTML = dayEvents.map((e) => `
    <div class="event-item">
      <div class="event-info">
        <span class="event-title">${e.title}</span>
        ${e.time ? `<span class="event-time-tag">${e.time}</span>` : ''}
      </div>
      <button class="delete-event-btn" data-id="${e.id}" title="Remove event">×</button>
    </div>
  `).join('');

  eventsEl.querySelectorAll('.delete-event-btn').forEach((btn) => {
    btn.addEventListener('click', () => deleteEvent(Number(btn.dataset.id)));
  });
}

// ===== SIMPLE TODO FUNCTION =====

function addTask(taskText = null) {
  const input = document.getElementById('taskInput');
  const taskList = document.getElementById('taskList');

  if (!taskList) return;

  const resolvedText = (taskText ?? input?.value ?? '').trim();
  if (!resolvedText) return;

  const taskItem = document.createElement('div');
  taskItem.style.display = 'flex';
  taskItem.style.alignItems = 'center';
  taskItem.style.justifyContent = 'space-between';
  taskItem.style.gap = '10px';
  taskItem.style.padding = '8px 0';

  const taskLeft = document.createElement('div');
  taskLeft.style.display = 'flex';
  taskLeft.style.alignItems = 'center';
  taskLeft.style.gap = '10px';
  taskLeft.style.flex = '1';
  taskLeft.style.minWidth = '0';

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.style.cursor = 'pointer';
  checkbox.style.flexShrink = '0';

  const taskLabel = document.createElement('span');
  taskLabel.textContent = resolvedText;
  taskLabel.style.flex = '1';
  taskLabel.style.minWidth = '0';

  const deleteBtn = document.createElement('button');
  deleteBtn.type = 'button';
  deleteBtn.textContent = '×';
  deleteBtn.setAttribute('aria-label', 'Remove task');
  deleteBtn.title = 'Remove task';
  deleteBtn.style.width = '24px';
  deleteBtn.style.height = '24px';
  deleteBtn.style.borderRadius = '50%';
  deleteBtn.style.border = '1px solid rgba(0, 0, 0, 0.15)';
  deleteBtn.style.background = 'transparent';
  deleteBtn.style.cursor = 'pointer';
  deleteBtn.style.lineHeight = '1';
  deleteBtn.style.flexShrink = '0';
  deleteBtn.style.opacity = '0';
  deleteBtn.style.pointerEvents = 'none';
  deleteBtn.style.transition = 'opacity 0.15s ease';

  deleteBtn.addEventListener('click', () => {
    taskItem.remove();
  });

  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      taskLabel.style.textDecoration = 'line-through';
      taskLabel.style.opacity = '0.6';
    } else {
      taskLabel.style.textDecoration = 'none';
      taskLabel.style.opacity = '1';
    }
  });

  taskItem.addEventListener('mouseenter', () => {
    deleteBtn.style.opacity = '1';
    deleteBtn.style.pointerEvents = 'auto';
  });

  taskItem.addEventListener('mouseleave', () => {
    deleteBtn.style.opacity = '0';
    deleteBtn.style.pointerEvents = 'none';
  });

  taskLeft.appendChild(checkbox);
  taskLeft.appendChild(taskLabel);
  taskItem.appendChild(taskLeft);
  taskItem.appendChild(deleteBtn);
  taskList.appendChild(taskItem);

  if (input) {
    input.value = '';
  }
}

function addTasksToTodoList(newTasks) {
  newTasks.forEach((task) => {
    const label = task.date ? `${task.title} (${task.date})` : task.title;
    addTask(label);
  });
}

if (taskInputEl) {
  taskInputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTask();
    }
  });
}

// ===== WEEK VIEW =====

function getStartOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatWeekdayShort(date) {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
}

function formatTimeLabel(hour) {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const normalized = hour % 12 === 0 ? 12 : hour % 12;
  return `${normalized} ${suffix}`;
}

function formatEventTime(time) {
  if (!time) return 'All day';
  const [h, m] = time.split(':').map(Number);
  const suffix = h >= 12 ? 'PM' : 'AM';
  const normalized = h % 12 === 0 ? 12 : h % 12;
  const minutes = String(m).padStart(2, '0');
  return `${normalized}:${minutes} ${suffix}`;
}

function timeToMinutes(time) {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  return (h * 60) + m;
}

function minutesToTime(minutes) {
  const safeMinutes = Math.max(0, Math.min(23 * 60 + 59, minutes));
  const hours = Math.floor(safeMinutes / 60);
  const mins = safeMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function formatEventRange(startTime, endTime) {
  if (!startTime && !endTime) return 'All day';
  if (startTime && endTime) {
    return `${formatEventTime(startTime)} - ${formatEventTime(endTime)}`;
  }
  if (startTime) return formatEventTime(startTime);
  return formatEventTime(endTime);
}

function createWeekEventForDate(dateString) {
  const title = window.prompt('Enter class title:');
  if (!title || !title.trim()) return;

  const startTimeInput = window.prompt('Enter start time (HH:MM, 24-hour format):', '09:00');
  if (!startTimeInput) return;

  const endTimeInput = window.prompt('Enter end time (HH:MM, 24-hour format):', '10:00');
  if (!endTimeInput) return;

  const startMinutes = timeToMinutes(startTimeInput);
  const endMinutes = timeToMinutes(endTimeInput);

  if (startMinutes === null || endMinutes === null || Number.isNaN(startMinutes) || Number.isNaN(endMinutes)) {
    window.alert('Please enter valid times in HH:MM format.');
    return;
  }

  if (endMinutes <= startMinutes) {
    window.alert('End time must be later than start time.');
    return;
  }

  const events = getEvents();
  events.push({
    id: Date.now(),
    title: title.trim(),
    date: dateString,
    time: startTimeInput,
    startTime: startTimeInput,
    endTime: endTimeInput
  });
  saveEvents(events);
  renderEvents();
  renderWeekView();
}

function renderTimeColumn() {
  if (!timeColumnEl) return;

  let html = '<div class="time-column-track">';
  for (let hour = 0; hour < 24; hour++) {
    html += `<div class="time-slot-label">${formatTimeLabel(hour)}</div>`;
  }
  html += '</div>';

  timeColumnEl.innerHTML = html;
  timeColumnEl.style.overflow = 'hidden';
}

function syncTimeColumnScroll() {
  if (!timeColumnEl || !weekBodyWrapperEl) return;

  const trackEl = timeColumnEl.querySelector('.time-column-track');
  if (!trackEl) return;

  trackEl.style.transform = `translateY(${-weekBodyWrapperEl.scrollTop}px)`;
}

function renderWeekHeader() {
  if (!weekHeaderEl) return;

  const selectedDate = new Date(currentYear, currentMonth, selectedDay);
  const weekStart = getStartOfWeek(selectedDate);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);

  if (weekTitleEl) {
    weekTitleEl.textContent = `${months[weekStart.getMonth()]} ${weekStart.getDate()} - ${months[weekEnd.getMonth()]} ${weekEnd.getDate()}`;
  }

  let html = '';
  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + i);

    const isSelected =
      dayDate.getDate() === selectedDay &&
      dayDate.getMonth() === currentMonth &&
      dayDate.getFullYear() === currentYear;

    const isTodayInWeek = isSameDate(dayDate, today);

    html += `
      <div class="week-header-day ${isSelected ? 'active' : ''} ${isTodayInWeek ? 'today-column' : ''}" data-date="${dayDate.toISOString().split('T')[0]}">
        <div class="week-header-day-name">${formatWeekdayShort(dayDate)}</div>
        <div class="week-header-day-num">${dayDate.getDate()}</div>
      </div>
    `;
  }

  weekHeaderEl.innerHTML = html;
}

function renderWeekColumns() {
  if (!weekBodyEl) return;

  const selectedDate = new Date(currentYear, currentMonth, selectedDay);
  const weekStart = getStartOfWeek(selectedDate);

  let html = '<div class="current-time-line" id="current-time-line"></div>';

  for (let day = 0; day < 7; day++) {
    const dayDate = new Date(weekStart);
    dayDate.setDate(weekStart.getDate() + day);
    const dateString = dayDate.toISOString().split('T')[0];

    html += `<div class="week-day-column" data-weekday="${day}" data-date="${dateString}">`;

    for (let hour = 0; hour < 24; hour++) {
      html += `<div class="hour-cell"></div>`;
    }

    html += `</div>`;
  }

  weekBodyEl.innerHTML = html;

  weekBodyEl.querySelectorAll('.week-day-column').forEach((column) => {
    column.addEventListener('click', (e) => {
      if (e.target.closest('.week-event')) return;
      const dateString = column.dataset.date;
      if (!dateString) return;
      createWeekEventForDate(dateString);
    });
  });
}

function renderWeekEvents() {
  if (!weekBodyEl) return;

  const selectedDate = new Date(currentYear, currentMonth, selectedDay);
  const weekStart = getStartOfWeek(selectedDate);
  const allEvents = getEvents();

  allEvents.forEach((event) => {
    const eventDate = new Date(`${event.date}T00:00:00`);
    const diffDays = Math.floor((eventDate - weekStart) / (1000 * 60 * 60 * 24));

    if (diffDays < 0 || diffDays > 6) return;

    const dayColumn = weekBodyEl.querySelector(`.week-day-column[data-weekday="${diffDays}"]`);
    if (!dayColumn) return;

    const startTime = event.startTime || event.time || '09:00';
    const endTime = event.endTime || minutesToTime((timeToMinutes(startTime) || 540) + 60);

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);

    if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) return;

    const top = (startMinutes / 60) * HOUR_HEIGHT;
    const height = Math.max(((endMinutes - startMinutes) / 60) * HOUR_HEIGHT, 36);

    const eventEl = document.createElement('div');
    eventEl.className = 'week-event';
    eventEl.style.top = `${top + 4}px`;
    eventEl.style.height = `${height - 8}px`;

    const titleEl = document.createElement('div');
    titleEl.className = 'week-event-title';
    titleEl.textContent = event.title;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.textContent = '×';
    deleteBtn.setAttribute('aria-label', 'Delete event');
    deleteBtn.title = 'Delete event';
    deleteBtn.style.position = 'absolute';
    deleteBtn.style.top = '6px';
    deleteBtn.style.right = '6px';
    deleteBtn.style.width = '20px';
    deleteBtn.style.height = '20px';
    deleteBtn.style.border = 'none';
    deleteBtn.style.borderRadius = '50%';
    deleteBtn.style.background = 'rgba(0, 0, 0, 0.12)';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.style.lineHeight = '1';
    deleteBtn.style.fontSize = '0.95rem';
    deleteBtn.style.display = 'none';

    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteEvent(event.id);
    });

    eventEl.addEventListener('mouseenter', () => {
      deleteBtn.style.display = 'block';
    });

    eventEl.addEventListener('mouseleave', () => {
      deleteBtn.style.display = 'none';
    });

    eventEl.appendChild(titleEl);
    eventEl.appendChild(deleteBtn);
    dayColumn.appendChild(eventEl);
  });
}

function updateCurrentTimeLine() {
  const lineEl = document.getElementById('current-time-line');
  if (!lineEl || !weekBodyEl) return;

  const selectedDate = new Date(currentYear, currentMonth, selectedDay);
  const weekStart = getStartOfWeek(selectedDate);
  const now = new Date();

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  if (now < weekStart || now >= weekEnd) {
    lineEl.style.display = 'none';
    return;
  }

  lineEl.style.display = 'block';

  const dayOffset = now.getDay();
  const minutesToday = (now.getHours() * 60) + now.getMinutes();
  const top = (minutesToday / 60) * HOUR_HEIGHT;

  lineEl.style.top = `${top}px`;

  const colWidth = weekBodyEl.clientWidth / 7;
  lineEl.style.left = `${dayOffset * colWidth}px`;
  lineEl.style.width = `${colWidth}px`;
  lineEl.style.right = 'auto';
}

function renderWeekView() {
  renderWeekHeader();
  renderTimeColumn();
  renderWeekColumns();
  renderWeekEvents();
  updateCurrentTimeLine();
  syncTimeColumnScroll();
}

// ── Assistant input handlers ──────────────────────────────────────────────────

if (sendChatBtnEl && chatInputBoxEl) {
  sendChatBtnEl.addEventListener('click', () => {
    const value = chatInputBoxEl.value;
    if (!value.trim()) return;
    handleAssistantSubmission(value);
    chatInputBoxEl.value = '';
  });
}

if (chatInputBoxEl) {
  chatInputBoxEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = chatInputBoxEl.value;
      if (!value.trim()) return;
      handleAssistantSubmission(value);
      chatInputBoxEl.value = '';
    }
  });
}

// ── Init ──────────────────────────────────────────────────────────────────────

function initializeApp() {
  renderCalendar();
  renderEvents();
  renderWeekView();
  updateCurrentTimeLine();

  if (weekBodyWrapperEl) {
    weekBodyWrapperEl.addEventListener('scroll', () => {
      syncTimeColumnScroll();
      updateCurrentTimeLine();
    });
  }

  if (chatMessagesEl && !chatMessagesEl.dataset.demoReady) {
    chatMessagesEl.dataset.demoReady = 'true';
    appendChatBubble(
      'Demo mode ready. Paste a syllabus snippet with weekly assignments and exam dates, and I will suggest actions with confirm or decline buttons.',
      'assistant'
    );
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  requestAnimationFrame(initializeApp);
}

setInterval(updateCurrentTimeLine, 60000);