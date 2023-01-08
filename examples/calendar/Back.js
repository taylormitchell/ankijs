let today = new Date();
let currentMonth = today.getMonth();
let currentYear = today.getFullYear();
let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let monthAndYear = document.getElementById("monthAndYear");

function getCalendar(month, year) {
  let firstDay = new Date(year, month).getDay();

  let tbl = document.createElement("tbody");

  let row = document.createElement("tr");
  for (let i = 0; i < 7; i++) {
    let cell = document.createElement("th");
    cellText = document.createTextNode("SMTWTFS"[i]);
    cell.appendChild(cellText);
    row.appendChild(cell);
  }
  tbl.appendChild(row);

  let date = 1;
  for (let i = 0; i < 6; i++) {
    let row = document.createElement("tr");

    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDay) {
        cell = document.createElement("td");
        cellText = document.createTextNode("");
        cell.appendChild(cellText);
        row.appendChild(cell);
      } else if (date > daysInMonth(month, year)) {
        break;
      } else {
        cell = document.createElement("td");
        cellText = document.createTextNode(date);
        if (
          date === today.getDate() &&
          year === today.getFullYear() &&
          month === today.getMonth()
        ) {
          cell.classList.add("today");
        } // color today's date
        cell.appendChild(cellText);
        row.appendChild(cell);
        date++;
      }
    }

    tbl.appendChild(row);
  }
  return tbl;
}

function daysInMonth(iMonth, iYear) {
  return 32 - new Date(iYear, iMonth, 32).getDate();
}

const cal = getCalendar(currentMonth, currentYear);
document.querySelector(".back.side").appendChild(cal);
const style = document.createElement("style");
style.innerHTML = `
  .today {
    background-color: #f0f0f0;
  }

  td {
    width: 50px;
    height: 50px;
    text-align: center;
    border: 1px solid black;
  }

`;
document.querySelector(".back.side").appendChild(style);
