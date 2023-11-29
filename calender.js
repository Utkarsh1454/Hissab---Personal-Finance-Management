// Function to generate a calendar for a specified year and month

function generateCalendar(year, month) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const numDays = lastDay.getDate();
    const startDay = firstDay.getDay();
    const currentDate = new Date(); // Get the current date

    let tableBody = '';

    let day = 1;
    for (let i = 0; i < 6; i++) {
        let row = '<tr>';
        for (let j = 0; j < 7; j++) {
            if ((i === 0 && j < startDay) || day > numDays) {
                row += '<td></td>';
            } else {
                // Check if the current date matches the generated date
                const isCurrentDate = currentDate.getFullYear() === year &&
                                      currentDate.getMonth() === month &&
                                      currentDate.getDate() === day;

                // Highlight the current date
                row += `<td ${isCurrentDate ? 'class="current-date"' : ''}>${day}</td>`;
                day++;
            }
        }
        row += '</tr>';
        tableBody += row;
        if (day > numDays) break;
    }

    document.querySelector('#calendar tbody').innerHTML = tableBody;
    document.querySelector('#currentMonth').textContent = firstDay.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Function to change the displayed month

function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    generateCalendar(currentDate.getFullYear(), currentDate.getMonth());
}

// Get the current date
const currentDate = new Date();
const currentYear = currentDate.getFullYear();
const currentMonth = currentDate.getMonth();

// Generate the calendar for the current month
generateCalendar(currentYear, currentMonth);
