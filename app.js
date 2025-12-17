* { box-sizing: border-box; }

body {
  margin: 0;
  font-family: sans-serif;
  background: #f5f6f8;
}

.container {
  max-width: 1100px;
  margin: auto;
  padding: 80px 20px;
}

.hamburger {
  position: fixed;
  top: 16px;
  left: 16px;
  width: 44px;
  height: 44px;
  background: #fff;
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,.2);
  z-index: 3000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.bar {
  width: 22px;
  height: 3px;
  background: #333;
  margin: 3px 0;
}

.side-menu {
  position: fixed;
  top: 0;
  left: -300px;
  width: 300px;
  height: 100vh;
  background: #fff;
  padding: 20px;
  box-shadow: 4px 0 20px rgba(0,0,0,.2);
  transition: left .3s;
  z-index: 2500;
}

.side-menu.open { left: 0; }

.menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.4);
  opacity: 0;
  pointer-events: none;
  transition: .3s;
  z-index: 2400;
}

.menu-overlay.open {
  opacity: 1;
  pointer-events: auto;
}

.menu-calendar {
  margin-top: 16px;
}

#calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  font-size: 12px;
}

.cal-day {
  padding: 6px;
  text-align: center;
  border-radius: 6px;
  background: #eee;
}

.cal-income { background: #d4f8e8; }
.cal-expense { background: #fddede; }

.summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px,1fr));
  gap: 16px;
}

.card {
  background: #fff;
  padding: 20px;
  border-radius: 16px;
}

.kpi.income { color: green; }
.kpi.expense { color: red; }
.kpi.balance { color: blue; }

.box {
  background: #fff;
  padding: 20px;
  margin-top: 24px;
  border-radius: 16px;
}

.row {
  display: grid;
  grid-template-columns: repeat(auto-fit,minmax(140px,1fr));
  gap: 10px;
}

input, select, textarea {
  width: 100%;
  padding: 8px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 10px;
}

.primary { background: #3498db; color: #fff; }
.danger { background: #e74c3c; color: #fff; }

table { width: 100%; border-collapse: collapse; }
th, td { padding: 8px; border-bottom: 1px solid #eee; }

