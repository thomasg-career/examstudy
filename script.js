// Storage helpers
function saveData(key, data){ localStorage.setItem(key, JSON.stringify(data)); }
function loadData(key){ return JSON.parse(localStorage.getItem(key)) || []; }

let timetable = loadData("timetable");
let sessions = loadData("sessions");
let timer=null, time=0, currentSubject="";

// Tabs
function showTab(id){
  document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  if(id==="dashboard") updateChart();
}

// Timetable
function renderTimetable(){
  const container=document.getElementById("timetableCards");
  container.innerHTML="";
  const select=document.getElementById("subjectSelect");
  select.innerHTML='<option value="">-- Select Subject --</option>';

  timetable.forEach((exam,i)=>{
    const card=document.createElement("div");
    card.className="exam-card";
    let daysLeft = calcDaysLeft(exam.date);
    card.innerHTML=`
      <h3>${exam.subject}</h3>
      <p>📅 ${exam.date} ${exam.time? "⏰ "+exam.time:""}</p>
      <span>${daysLeft>=0? daysLeft+" days left":"Done"}</span>
      <br><br><button class="glow-btn danger" onclick="deleteExam(${i})">❌ Remove</button>
    `;
    container.appendChild(card);

    let opt=document.createElement("option");
    opt.value=exam.subject; opt.textContent=exam.subject;
    select.appendChild(opt);
  });
  updateDaysLeft();
}
function addExam(){
  const subject=document.getElementById("subject").value;
  const date=document.getElementById("date").value;
  const timeVal=document.getElementById("time").value;
  if(!subject||!date) return alert("Fill subject and date!");
  timetable.push({subject,date,time:timeVal});
  saveData("timetable",timetable); renderTimetable();
}
function deleteExam(i){
  timetable.splice(i,1); saveData("timetable",timetable); renderTimetable();
}
function calcDaysLeft(date){
  let d=new Date(date), today=new Date();
  return Math.ceil((d-today)/(1000*60*60*24));
}

// Timer
function startTimer(){
  const select=document.getElementById("subjectSelect");
  const custom=document.getElementById("customSubject").value.trim();
  currentSubject=custom||select.value;
  if(!currentSubject) return alert("Pick or type subject!");
  if(timer) return;
  timer=setInterval(()=>{
    time++;
    document.getElementById("timerDisplay").textContent=`${Math.floor(time/60)}m ${time%60}s`;
  },1000);
}
function pauseTimer(){ clearInterval(timer); timer=null; }
function saveSession(){
  if(!currentSubject) return;
  const minutes=Math.floor(time/60);
  if(!minutes) return alert("Too short!");
  const today=new Date().toISOString().split("T")[0];
  sessions.push({subject:currentSubject,minutes,date:today});
  saveData("sessions",sessions);
  renderSessions(); updateStats(); updateChart();
  pauseTimer(); time=0; document.getElementById("timerDisplay").textContent="0m 0s";
}

// Sessions
function renderSessions(){
  const list=document.getElementById("sessions"); list.innerHTML="";
  sessions.forEach(s=>{
    const li=document.createElement("li");
    li.textContent=`${s.subject} - ${s.minutes} min (${s.date})`;
    list.appendChild(li);
  });
}
function updateStats(){
  const totalMinutes=sessions.reduce((a,b)=>a+b.minutes,0);
  document.getElementById("totalHours").textContent=(totalMinutes/60).toFixed(1)+" hrs";
  document.getElementById("totalSessions").textContent=sessions.length;
}

// Days left
function updateDaysLeft(){
  if(timetable.length===0){ document.getElementById("daysLeft").textContent="–"; return; }
  const today=new Date();
  const examDates=timetable.map(e=>new Date(e.date)).filter(d=>d>=today);
  if(examDates.length===0){ document.getElementById("daysLeft").textContent="–"; return; }
  const nearest=Math.min(...examDates);
  const diff=Math.ceil((nearest-today)/(1000*60*60*24));
  document.getElementById("daysLeft").textContent=diff+" days";
}

// Chart
let chart=null;
function updateChart(){
  const ctx=document.getElementById("studyChart");
  const dataByDate={};
  sessions.forEach(s=>{ dataByDate[s.date]=(dataByDate[s.date]||0)+s.minutes; });
  const labels=Object.keys(dataByDate);
  const values=Object.values(dataByDate);
  if(chart) chart.destroy();
  chart=new Chart(ctx,{type:"bar",data:{labels,datasets:[{label:"Minutes",data:values,backgroundColor:"#2563eb"}]}});
}

// Quotes
const quotes=[
  "Stay focused, stay positive!",
  "Small steps lead to big success.",
  "Believe in yourself!",
  "Consistency beats intensity."
];
setInterval(()=>{
  document.getElementById("quoteBox").textContent=quotes[Math.floor(Math.random()*quotes.length)];
},5000);

// Settings
function toggleDarkMode(){ document.body.classList.toggle("dark"); }
function resetAll(){
  if(!confirm("Reset everything?")) return;
  localStorage.clear(); timetable=[]; sessions=[];
  renderTimetable(); renderSessions(); updateStats(); updateChart();
}

// Live clock
setInterval(()=>{ document.getElementById("liveClock").textContent=new Date().toLocaleTimeString(); },1000);

// Init
renderTimetable(); renderSessions(); updateStats(); updateChart();
