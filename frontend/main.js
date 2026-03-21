const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

let currentMonth = 0; // start at January

const monthNameEl = document.querySelector('.calendar-header .month-name');
const prevArrow = document.querySelector('.calendar-header .arrow.prev');
const nextArrow = document.querySelector('.calendar-header .arrow.next');

function updateMonth() {
  monthNameEl.textContent = months[currentMonth];
  // placeholder: you could also update day cells here
}

prevArrow.addEventListener('click', () => {
  currentMonth = (currentMonth - 1 + months.length) % months.length;
  updateMonth();
});

nextArrow.addEventListener('click', () => {
  currentMonth = (currentMonth + 1) % months.length;
  updateMonth();
});

// Initial render
updateMonth();
