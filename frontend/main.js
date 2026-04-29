console.log("loaded");

const months = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const today = new Date();
let currentMonth = today.getMonth();
let currentYear  = today.getFullYear();
let selectedDay  = today.getDate();

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
    if (isToday)    cls += ' today';
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
    if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    selectedDay = 1;
    renderCalendar();
    renderEvents();
    renderWeekView();
  });
}

if (nextArrow) {
  nextArrow.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) { currentMonth = 0; currentYear++; }
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

    const m    = String(currentMonth + 1).padStart(2, '0');
    const d    = String(selectedDay).padStart(2, '0');
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

    eventTitleInput.value      = '';
    eventTimeInput.value       = '';
    addEventForm.style.display = 'none';
    renderEvents();
    renderWeekView();
  });
}

// ── Delete event ──────────────────────────────────────────────────────────────

function deleteEvent(id) {
  saveEvents(getEvents().filter(e => e.id !== id));
  renderEvents();
  renderWeekView();
}

// ── Render events for selected day ────────────────────────────────────────────

function renderEvents() {
  if (!eventsEl) return;
  const m = String(currentMonth + 1).padStart(2, '0');
  const d = String(selectedDay).padStart(2, '0');
  const selectedDate = `${currentYear}-${m}-${d}`;

  const dayEvents = getEvents().filter(e => e.date === selectedDate);

  if (dayEvents.length === 0) {
    eventsEl.innerHTML = '<p class="no-events">No events for this day.</p>';
    return;
  }

  eventsEl.innerHTML = dayEvents.map(e => `
    <div class="event-item">
      <div class="event-info">
        <span class="event-title">${e.title}</span>
        ${e.time ? `<span class="event-time-tag">${e.time}</span>` : ''}
      </div>
      <button class="delete-event-btn" data-id="${e.id}" title="Remove event">×</button>
    </div>
  `).join('');

  eventsEl.querySelectorAll('.delete-event-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteEvent(Number(btn.dataset.id)));
  });
}


// ===== SIMPLE TODO FUNCTION =====
// get tasks from localStorage (or empty array if none)
function getTasks() {
  return JSON.parse(localStorage.getItem('tasks') || '[]');
}
// save tasks to localStorage
function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addTask() {
  const input = document.getElementById('taskInput');
  const taskList = document.getElementById('taskList');

  if (!input || !taskList) return;

  const taskText = input.value.trim();
  if (!taskText) return;

  const task = {
    id: Date.now(),   // unique ID
    text: taskText,   // task text
    completed: false  // checkbox state
  };

  // save to localStorage
  const tasks = getTasks();
  tasks.push(task);
  saveTasks(tasks);

  // render on screen
  createTaskElement(task);

  input.value = ' ';
}

function createTaskElement(task) {
  const taskList = DocumentTimeline.getElementById('taskList');
  if (!taskList) return;

  // main container
  const taskItem = document.createElement('div');
  taskItem.style.display = 'flex';
  taskItem.style.justifyContent = 'space-between';

  // left side (checkbox + text)
  const taskLeft = document.createElement('div');
  taskLeft.style.display = 'flex';
  taskLeft.style.gap = '10px';

  // checkbox
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = task.completed;

  // task text
  const taskLabel = document.createElement('span');
  taskLabel.textContent = task.text;

  // apply style if checked
  function updateStyle() {
    taskLabel.style.textDecoration = checkbox.checked ? 'line-through' : 'none';
  }
  updateStyle();

  // when checkbox changes the storage updates
  checkbox.addEventListener('change', () => {
    const tasks = getTasks().map(t =>
      t.id === task.id ? { ...t, completed: checkbox.checked } : t
    );
    saveTasks(tasks);
    updateStyle();
  });

  // delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.textContent = 'x';

  // remove the task from storage + UI
  deleteBtn.addEventListener('click', () => {
    const tasks = getTasks().filter(t => t.id !== task.id);
    saveTasks(tasks);
    taskItem.remove();
  });

  // build structure
  taskLeft.appendChild(checkbox);
  taskLeft.appendChild(taskLabel);
  taskItem.appendChild(taskLeft);
  taskItem.appendChild(deleteBtn);

  taskList.appendChild(taskItem);
}

// load saved tasks and rebuild UI on page refresh
function loadTasks() {
  const tasks = getTasks();
  tasks.forEach(task => createTaskElement(task));
}

const taskInputEl = document.getElementById('taskInput');

if (taskInputEl) {
  taskInputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTask();
    }
  });
}

// ===== WEEK VIEW =====

const timeColumnEl = document.getElementById('time-column');
const weekHeaderEl = document.getElementById('week-header');
const weekBodyEl = document.getElementById('week-body');
const weekTitleEl = document.querySelector('.week-title');
const weekBodyWrapperEl = document.querySelector('.week-body-wrapper');

const HOUR_HEIGHT = 64;

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
  if (!lineEl) return;
  if (!weekBodyEl) return;

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
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  requestAnimationFrame(initializeApp);
}

setInterval(updateCurrentTimeLine, 60000);

// AI Integration
// history of the chat for multiple chats 
const chatHistory =[];
function initChat(){
  const messagesEl = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const sendButton = document.getElementById('send-chat');
  if(!messagesEl|| !chatInput || !sendButton) return;

  //adding text box font 
  appendChatBubble('assistant', "Hi there I am your calender AI. Ask me questions like \"What do I have today\" or \"Add a busy block on Monday 2pm to 5pm\".");
  sendButton.addEventListener('click', sendChatMessage);
  chatInput.addEventListener('keydown', (e) => {
    if(e.key === 'Enter') sendChatMessage();
  });
}
function appendChatBubble(role,text){
  const messagesEl = document.getElementById('chat-messages');
  if(!messagesEl)
    return null;
const bubble = document.createElement('div');
//size of bubble and shape
bubble.style.cssText = `
  border-radius: 14px;
  font-size: 0.8rem;
  padding: 8px 12px;
  max-width: 85%;
  word-break: break-word;
  line-height: 1.50;
  ${role === 'user'

  //color
  ? 'background:var(--primary-clr); color:white;align-self:flex-end;margin-left:auto;border-bottom-right-radius:4px;'
  : 'background: #f0f0f4; color:#2f3443; align-self:flex-start;border-bottom-left-radius:4px;'}
  `;
  bubble.textContent = text;
  messagesEl.appendChild(bubble);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  return bubble;
}
//not done yet tbd 
//cont

function startLoadingBubble(){
  const messagesEl = document.getElementById('chat-messages');
  if(!messagesEl) return null;

  const bubble = document.createElement('div');
  bubble.style.cssText= `
  padding: 8px 14px;
  font-size: 1 rem;
  border-radius: 14px;
  border-bottom-left-radius: 4px;
  max-width: 65px;
  background: #f0f0f4;
  color: #885;
  align-self: flex-start;
  letter-spacing: 2px;
  `;
  bubble.textContent ='...';

//animations of ...
let frame = 0; 
const dots =['.', '..', '...'];
const timer = setInterval(()=>{
  bubble.textContent= dots[frame %3 ];
  frame++;
  }, 400);
  bubble._stopAnimation = () => clearInterval(timer);
messagesEl.appendChild(bubble);
messagesEl.scrollTop = messagesEl.scrollHeight;
return bubble;
}
// working on async functions
async function sendChatMessage(){
  const chatInput = document.getElementById('chat-input');
  if(!chatInput) return;
  const userText = chatInput.value.trim();
  if(!userText) return;
  chatInput.value = '';
  appendChatBubble('user', userText);
  // adding to history collection
  chatHistory.push({role: 'user', content: userText});
  const loadingBubble= startLoadingBubble();
  // live data
  const messagesWithContext = chatHistory.map((msg, i) => {
    if (i === chatHistory.length - 1 && msg.role === 'user') {
    return {
      role: 'user',
      content: `${msg.content}\n\n[Current calandar events: \n${JSON.stringify(getEvents(),null,2)}]`
      };
    }
    return msg;
  });
  // checks local host (server)
try{
  const response = await fetch ("http://127.0.0.1:3000/chat",{
    method: "POST",
    headers: {
    "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: userText,
      events: getEvents()
    })
  });
  if(loadingBubble){
    loadingBubble._stopAnimation();
    loadingBubble.remove();
  }
  if(!response.ok){
    const error = await response.json().catch(()=> ({}));
    throw new Error(error.error?.message || `HTTP ${response.status}`);
  }
  const data = await response.json();

  let replyText =
  typeof data.reply === 'string' ? data.reply :
  typeof data.message === 'string' ? data.message :
  typeof data.content === 'string' ? data.content :
  typeof data.content?.[0]?.text === 'string' ? data.content[0].text :
  'No response from OpenAI';

  // parse JSON from AI for start and end times
try {
  const parsed = JSON.parse(replyText.trim());
  if (parsed.action === 'add') {
    const startTime = parsed.startTime || parsed.time || '09:00';
    const endTime = (parsed.endTime && parsed.endTime !== parsed.startTime)
    ? parsed.endTime
    : minutesToTime((timeToMinutes(startTime) || 540) + 60);
    const events =  getEvents();
    replyText = `Added "${parsed.title}" to your calendar on ${parsed.date} from ${startTime} to ${endTime}.`;

    events.push({
      id: Date.now(),
      title: parsed.title,
      date: parsed.date,
      startTime: startTime,
      endTime: endTime
    });
    saveEvents(events);
    renderEvents();
    renderWeekView();
  } else if (parsed.action === 'delete') { 
    const events = getEvents().filter (e => e.title !== parsed.title);
    saveEvents(events);
    renderEvents();
    renderWeekView();
    replyText = `Removed "${parsed.title}" from your calendar.`;
  } 
}
catch (_) {
  // normal text response, do nothing
}

chatHistory.push({ role: 'assistant', content: replyText }); 
appendChatBubble('assistant', replyText);
  } catch (error) {
    if (loadingBubble) {
      loadingBubble._stopAnimation();
      loadingBubble.remove();
    }
    appendChatBubble('assistant', 'Error communicating with OpenAI API');
  }

}
document.addEventListener('DOMContentLoaded', initChat);