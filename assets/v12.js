const $=(selector,scope=document)=>scope.querySelector(selector);
const $$=(selector,scope=document)=>[...scope.querySelectorAll(selector)];
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));

const body=document.body;
const boot=$("#boot");
const opening=$("#opening");
const site=$("#site");
const seal=$("#seal");
const skip=$("#skip");
const openTitle=$("#openTitle");
const openSub=$("#openSub");
const audio=$("#music");
const musicBtn=$("#musicBtn");
let openingStarted=false;

async function preloadCriticalImages(){
  const images=$$(".opening img, .hero-media img");
  await Promise.all(images.map(image=>image.decode?.().catch(()=>{})||Promise.resolve()));
  boot.classList.add("is-hidden");
  setTimeout(()=>boot.hidden=true,600);
}

async function startMusic(){
  try{
    audio.volume=.34;
    await audio.play();
    musicBtn.setAttribute("aria-pressed","true");
    musicBtn.setAttribute("aria-label","Выключить музыку");
  }catch{
    musicBtn.setAttribute("aria-pressed","false");
    musicBtn.setAttribute("aria-label","Включить музыку");
  }
}

function stopMusic(){
  audio.pause();
  musicBtn.setAttribute("aria-pressed","false");
  musicBtn.setAttribute("aria-label","Включить музыку");
}
musicBtn.addEventListener("click",()=>audio.paused?startMusic():stopMusic());

function createSparkles(){
  const layer=$("#sparkles");
  for(let i=0;i<26;i+=1){
    const particle=document.createElement("i");
    const angle=Math.random()*Math.PI*2;
    const radius=90+Math.random()*185;
    particle.style.setProperty("--x",`${Math.cos(angle)*radius}px`);
    particle.style.setProperty("--y",`${Math.sin(angle)*radius}px`);
    particle.style.animationDelay=`${Math.random()*.16}s`;
    layer.appendChild(particle);
  }
  setTimeout(()=>layer.replaceChildren(),1500);
}

function revealSite(){
  body.classList.remove("is-locked");
  site.removeAttribute("inert");
  site.setAttribute("aria-hidden","false");
  site.classList.add("is-ready");
  opening.classList.add("is-finished");
  setTimeout(()=>{opening.hidden=true;window.scrollTo({top:0,left:0})},950);
}

async function playOpening(){
  if(openingStarted)return;
  openingStarted=true;
  seal.disabled=true;
  skip.disabled=true;
  skip.style.opacity="0";
  startMusic();
  opening.classList.add("is-reacting");
  openTitle.textContent="Печать оживает";
  openSub.textContent="Свет собирается в центре";
  await wait(430);
  opening.classList.add("is-tracing");
  openTitle.textContent="Свет проходит по конверту";
  openSub.textContent="Ещё мгновение";
  await wait(720);
  createSparkles();
  opening.classList.add("is-releasing");
  openTitle.textContent="Печать снимается";
  openSub.textContent="Конверт раскрывается";
  await wait(520);
  opening.classList.add("is-opening");
  openTitle.textContent="Конверт открыт";
  openSub.textContent="Приглашение уже внутри";
  await wait(800);
  opening.classList.add("is-rising");
  openTitle.textContent="Добро пожаловать";
  openSub.textContent="Этот день мы разделим с вами";
  await wait(1250);
  revealSite();
}
seal.addEventListener("click",playOpening);
skip.addEventListener("click",()=>{if(openingStarted)return;openingStarted=true;startMusic();revealSite()});

const weddingDate=new Date("2027-06-21T17:00:00+03:00");
const plural=(number,forms)=>{
  const n=Math.abs(number)%100;
  const n1=n%10;
  if(n>10&&n<20)return forms[2];
  if(n1>1&&n1<5)return forms[1];
  if(n1===1)return forms[0];
  return forms[2];
};

function updateCountdown(){
  let milliseconds=Math.max(0,weddingDate-Date.now());
  const days=Math.floor(milliseconds/86400000);milliseconds%=86400000;
  const hours=Math.floor(milliseconds/3600000);milliseconds%=3600000;
  const minutes=Math.floor(milliseconds/60000);milliseconds%=60000;
  const seconds=Math.floor(milliseconds/1000);
  $("#d").textContent=days;
  $("#h").textContent=String(hours).padStart(2,"0");
  $("#m").textContent=String(minutes).padStart(2,"0");
  $("#s").textContent=String(seconds).padStart(2,"0");
  $("#dLabel").textContent=plural(days,["день","дня","дней"]);
  $("#hLabel").textContent=plural(hours,["час","часа","часов"]);
  $("#mLabel").textContent=plural(minutes,["минута","минуты","минут"]);
  $("#sLabel").textContent=plural(seconds,["секунда","секунды","секунд"]);
}
updateCountdown();
setInterval(updateCountdown,1000);

const menuToggle=$("#menuToggle");
const mobileMenu=$("#mobileMenu");
function closeMenu(){
  mobileMenu.hidden=true;
  menuToggle.setAttribute("aria-expanded","false");
  menuToggle.setAttribute("aria-label","Открыть меню");
}
menuToggle.addEventListener("click",()=>{
  const shouldOpen=mobileMenu.hidden;
  mobileMenu.hidden=!shouldOpen;
  menuToggle.setAttribute("aria-expanded",String(shouldOpen));
  menuToggle.setAttribute("aria-label",shouldOpen?"Закрыть меню":"Открыть меню");
});
$$("#mobileMenu a").forEach(link=>link.addEventListener("click",closeMenu));

const modal=$("#modal");
const rsvpBtn=$("#rsvpBtn");
const rsvpForm=$("#rsvpForm");
const status=$("#status");
const formNote=$("#formNote");
const rsvpEndpoint=$("meta[name='rsvp-endpoint']")?.content.trim()||"";
let returnFocus=null;
if(rsvpEndpoint)formNote.hidden=true;

function openModal(){
  returnFocus=document.activeElement;
  modal.hidden=false;
  body.classList.add("is-locked");
  setTimeout(()=>$("input[name='name']",modal).focus(),20);
}
function closeModal(){
  modal.hidden=true;
  body.classList.remove("is-locked");
  status.textContent="";
  returnFocus?.focus();
}
rsvpBtn.addEventListener("click",openModal);
$$("[data-close]").forEach(control=>control.addEventListener("click",closeModal));
document.addEventListener("keydown",event=>{
  if(event.key==="Escape"&&!modal.hidden)closeModal();
  if(event.key==="Escape"&&!mobileMenu.hidden)closeMenu();
  if(event.key==="Tab"&&!modal.hidden){
    const focusable=$$("button,input,select,textarea,a[href]",modal).filter(element=>!element.disabled&&!element.hidden);
    const first=focusable[0],last=focusable.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
  }
});

function validateForm(){
  const nameInput=$("input[name='name']",rsvpForm);
  const label=nameInput.closest("label");
  const error=$(".field-error",label);
  const valid=nameInput.value.trim().length>=2;
  label.classList.toggle("has-error",!valid);
  nameInput.setAttribute("aria-invalid",String(!valid));
  error.textContent=valid?"":"Пожалуйста, укажите имя";
  if(!valid)nameInput.focus();
  return valid;
}

rsvpForm.addEventListener("submit",async event=>{
  event.preventDefault();
  if(!validateForm())return;
  const submit=$(".submit-button",rsvpForm);
  const submitLabel=$(".submit-button span",rsvpForm);
  const data=Object.fromEntries(new FormData(rsvpForm));
  data.createdAt=new Date().toISOString();
  submit.disabled=true;
  submitLabel.textContent="Отправляем…";
  status.textContent="";
  try{
    if(rsvpEndpoint){
      const response=await fetch(rsvpEndpoint,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(data)});
      if(!response.ok)throw new Error("RSVP request failed");
      status.textContent="Спасибо! Ваш ответ отправлен молодожёнам.";
    }else{
      const saved=JSON.parse(localStorage.getItem("inviteStudioRsvp")||"[]");
      saved.push(data);
      localStorage.setItem("inviteStudioRsvp",JSON.stringify(saved));
      status.textContent="Спасибо! Ответ сохранён в демонстрационной версии.";
    }
    rsvpForm.reset();
  }catch{
    status.textContent="Не удалось отправить ответ. Попробуйте ещё раз или свяжитесь с молодожёнами.";
  }finally{
    submit.disabled=false;
    submitLabel.textContent="Отправить ответ";
  }
});

const revealObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add("is-visible");revealObserver.unobserve(entry.target)}
  });
},{threshold:.12});
$$(".reveal-on-scroll").forEach(section=>revealObserver.observe(section));

preloadCriticalImages();
