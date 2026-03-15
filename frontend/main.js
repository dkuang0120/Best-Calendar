const months = [
'January','February','March','April','May','June',
'July','August','September','October','November','December'
];

let currentMonth = 10; // November

const monthNameEl = document.querySelector('.date');
const prevArrow = document.querySelector('.prev');
const nextArrow = document.querySelector('.next');

function updateMonth(){
    monthNameEl.textContent = months[currentMonth] + " 2026";
}

prevArrow.addEventListener('click', function(){
    currentMonth = (currentMonth - 1 + months.length) % months.length;
    updateMonth();
});

nextArrow.addEventListener('click', function(){
    currentMonth = (currentMonth + 1) % months.length;
    updateMonth();
});

updateMonth();