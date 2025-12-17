const form = document.getElementById("tx-form");
const tbody = document.getElementById("tx-tbody");
const totalIncomeEl = document.getElementById("total-income");
const totalExpenseEl = document.getElementById("total-expense");
const balanceEl = document.getElementById("balance");
const calendarEl = document.getElementById("calendar");

document.getElementById("date-input").value = new Date().toISOString().split("T")[0];

let records = JSON.parse(localStorage.getItem("records")) || [];

function save() { localStorage.setItem("records", JSON.stringify(records)); }

function renderSummary() {
  let i=0, e=0;
  records.forEach(r => r.type==='收入'?i+=r.amount:e+=r.amount);
  totalIncomeEl.textContent=i;
  totalExpenseEl.textContent=e;
  balanceEl.textContent=i-e;
}

function renderTable() {
  tbody.innerHTML="";
  records.forEach(r=>{
    const tr=document.createElement("tr");
    tr.innerHTML=`<td>${r.date}</td><td>${r.type}</td><td>${r.amount}</td><td>${r.category}</td><td>${r.note}</td><td><button onclick="del(${r.id})">刪</button></td>`;
    tbody.appendChild(tr);
  });
}

function renderCalendar() {
  calendarEl.innerHTML="";
  const today=new Date();
  const year=today.getFullYear();
  const month=today.getMonth();

  const firstDay=new Date(year,month,1).getDay();
  const lastDate=new Date(year,month+1,0).getDate();

  // 生成空白前置格
  for(let i=0;i<firstDay;i++){
    const empty=document.createElement("div");
    calendarEl.appendChild(empty);
  }

  // 生成日子格
  for(let d=1;d<=lastDate;d++){
    const dateStr=`${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const dayDiv=document.createElement("div");
    dayDiv.className="cal-day";
    dayDiv.textContent=d;

    const record=records.find(r=>r.date===dateStr);
    if(record){
      dayDiv.classList.add(record.type==='收入'?'cal-income':'cal-expense');
    }

    calendarEl.appendChild(dayDiv);
  }
}

form.addEventListener("submit",e=>{
  e.preventDefault();
  const fd=new FormData(form);
  records.push({
    id:Date.now(),
    type:fd.get("type"),
    amount:+fd.get("amount"),
    category:fd.get("category"),
    date:fd.get("date"),
    note:fd.get("note")
  });
  save(); renderAll(); form.reset();
});

window.del=id=>{
  records=records.filter(r=>r.id!==id);
  save(); renderAll();
};

function renderAll(){ renderSummary(); renderTable(); renderCalendar(); }
renderAll();

/* 漢堡選單 */
const ham=document.getElementById("hamburger");
const menu=document.getElementById("side-menu");
const overlay=document.getElementById("menu-overlay");
const menuClear=document.getElementById("menu-clear");

ham.onclick=()=>{ menu.classList.add("open"); overlay.classList.add("open"); };
overlay.onclick=()=>{ menu.classList.remove("open"); overlay.classList.remove("open"); };
menuClear.onclick=()=>{ if(confirm("確定清空？")){ records=[]; save(); renderAll(); menu.classList.remove("open"); overlay.classList.remove("open"); } };
