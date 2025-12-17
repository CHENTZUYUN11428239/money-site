// ==================== 原有功能保留 =====================
// .... 這裡請保留你原本收入/支出的 JS 管理與 localStorage 程式碼
// 以下僅新增與月曆有關的部分。不會覆蓋你原本功能。
// ======================================================

// ---- 月曆功能 ----
const calendarSection = document.getElementById('calendar');
const summarySection = document.getElementById('summary');
const txFormSection = document.getElementById('tx-form').closest('section');
const txTableSection = document.getElementById('tx-tbody').closest('section');
const menuLinks = document.querySelectorAll('.menu-link');

let calendarDate = new Date(); // 當前顯示的年月

// 菜單切換區塊：點各選項 section 顯示該區(含日曆)
menuLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const href = link.getAttribute('href');
    if (href && href.startsWith("#")) {
      e.preventDefault();
      // 全部關掉
      summarySection.style.display = "none";
      txFormSection.style.display = "none";
      txTableSection.style.display = "none";
      calendarSection.style.display = "none";
      // 顯示正確區塊
      if (href === "#summary") summarySection.style.display = "";
      if (href === "#tx-form") txFormSection.style.display = "";
      if (href === "#tx-tbody") txTableSection.style.display = "";
      if (href === "#calendar") {
        calendarSection.style.display = "";
        renderCalendar();
      }
    }
  });
});

// 取得所有紀錄（假設格式跟原本一致）
function getAllRecords() {
  return JSON.parse(localStorage.getItem('txs') || "[]");
}

// 切換月份
document.getElementById('prev-month').onclick = function(){
  calendarDate.setMonth(calendarDate.getMonth() - 1);
  renderCalendar();
};
document.getElementById('next-month').onclick = function(){
  calendarDate.setMonth(calendarDate.getMonth() + 1);
  renderCalendar();
};

// 渲染月曆畫面
function renderCalendar() {
  // 1. 計算每月資料
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=週日
  // 2. 提取收支紀錄以日期分類
  const allRecords = getAllRecords();
  const recordsByDate = {};
  allRecords.forEach(rec => {
    const d = rec.date; // yyyy-mm-dd
    if (!recordsByDate[d]) recordsByDate[d] = [];
    recordsByDate[d].push(rec);
  });
  // 3. 標題
  document.getElementById('calendar-month-label').textContent = `${year}年${String(month+1).padStart(2,"0")}月`;
  // 4. 產生表格
  const tbody = document.getElementById('calendar-tbody');
  tbody.innerHTML = '';
  let tr = document.createElement('tr');
  // 前面空格
  for (let i=0; i<firstDayOfWeek; i++) tr.appendChild(document.createElement('td'));
  for (let day=1; day<=daysInMonth; day++) {
    if ((tr.children.length)>=7) {
      tbody.appendChild(tr);
      tr = document.createElement('tr');
    }
    const td = document.createElement('td');
    td.classList.add('calendar-cell');
    const dstr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    td.setAttribute('data-date', dstr);
    td.innerHTML = `<div class="cal-day-num">${day}</div>`;
    // 若有紀錄，加標籤
    if (recordsByDate[dstr]) {
      const items = recordsByDate[dstr];
      let shortInfo = '';
      let incomeSum = 0, expenseSum = 0;
      items.forEach(r => {
        if (r.type === '收入') incomeSum += Number(r.amount||0);
        else expenseSum += Number(r.amount||0);
      });
      if (incomeSum>0) shortInfo += `<span class="cal-income">+${incomeSum}</span>`;
      if (expenseSum>0) shortInfo += `<span class="cal-expense">-${expenseSum}</span>`;
      td.innerHTML += `<div class="cal-brief">${shortInfo}</div>`;
      td.classList.add('has-record');
      td.style.cursor = 'pointer';
    }
    td.addEventListener('click', function(){
      showCalendarDetailModal(dstr, recordsByDate[dstr]||[], day);
    });
    tr.appendChild(td);
  }
  // 後面補空格
  while (tr.children.length<7) tr.appendChild(document.createElement('td'));
  tbody.appendChild(tr);
}

// 點某一天顯示詳細紀錄（彈窗）
function showCalendarDetailModal(dateStr, records, day){
  if (!records.length) return;
  document.getElementById('calendar-detail-date').textContent = `${dateStr} 詳細紀錄`;
  const ul = document.getElementById('calendar-detail-list');
  ul.innerHTML = '';
  records.forEach(rec => {
    const li = document.createElement('li');
    li.innerHTML = 
      `<b>[${rec.type}]</b> $${rec.amount} 
      <span class="label">${rec.category}</span>
      ${rec.note? `<span class="nt">${rec.note}</span>`: ''}
      `;
    ul.appendChild(li);
  });
  document.getElementById('calendar-detail-modal').style.display = '';
}
// 關閉 modal
document.getElementById('calendar-detail-close').onclick = function(){
  document.getElementById('calendar-detail-modal').style.display = 'none';
};

// =========== 輔助: 新增/修改/刪除紀錄後自動同步日曆 ===========
window.addEventListener('storage', function(e){
  if (calendarSection.style.display !== "none") renderCalendar();
});
if(calendarSection.style.display !== "none") renderCalendar();


/* 你原有的紀錄 新增、編輯、刪除等功能完成後，請呼叫 renderCalendar(); 來同步日曆 */
// 例如：
// function saveRecord(){ ... renderCalendar(); }
