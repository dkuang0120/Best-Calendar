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

// ── localStorage helpers ──────────────────────────────────────────────────────

function getEvents() {
  return JSON.parse(localStorage.getItem('events') || '[]');
}

function saveEvents(events) {
  localStorage.setItem('events', JSON.stringify(events));
}

// ── Calendar rendering ────────────────────────────────────────────────────────

function renderCalendar() {
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

prevArrow.addEventListener('click', () => {
  currentMonth--;
  if (currentMonth < 0) { currentMonth = 11; currentYear--; }
  selectedDay = 1;
  renderCalendar();
  renderEvents();
});

nextArrow.addEventListener('click', () => {
  currentMonth++;
  if (currentMonth > 11) { currentMonth = 0; currentYear++; }
  selectedDay = 1;
  renderCalendar();
  renderEvents();
});

// ── Day selection ─────────────────────────────────────────────────────────────

daysGrid.addEventListener('click', (e) => {
  const dayEl = e.target.closest('[data-day]');
  if (!dayEl) return;
  selectedDay = parseInt(dayEl.dataset.day);
  renderCalendar();
  renderEvents();
});

// ── Toggle form ───────────────────────────────────────────────────────────────

addEventBtn.addEventListener('click', () => {
  const open = addEventForm.style.display === 'flex';
  addEventForm.style.display = open ? 'none' : 'flex';
});

// ── Add event ─────────────────────────────────────────────────────────────────

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
  events.push({ id: Date.now(), title, date, time });
  saveEvents(events);

  eventTitleInput.value      = '';
  eventTimeInput.value       = '';
  addEventForm.style.display = 'none';
  renderEvents();
});

// ── Delete event ──────────────────────────────────────────────────────────────

function deleteEvent(id) {
  saveEvents(getEvents().filter(e => e.id !== id));
  renderEvents();
}

// ── Render events for selected day ────────────────────────────────────────────

function renderEvents() {
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

// ── Init ──────────────────────────────────────────────────────────────────────

renderCalendar();
renderEvents();
