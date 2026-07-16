/* ============================================================
   BTS SIO — Lycée Dick Ukeiwë · interactions
   ============================================================ */
"use strict";

/* ---------- 1. BOOT SCREEN ---------- */
const bootEl = document.getElementById("boot");
const bootLog = document.getElementById("boot-log");
const bootProgress = document.getElementById("boot-progress");
const bootSkip = document.getElementById("boot-skip");

const BOOT_LINES = [
  { t: "[    0.000001] SIO-BIOS v2.0 — Lycée Dick Ukeiwë", c: "" },
  { t: "[    0.041337] Détection CPU ............ OK", c: "b-ok" },
  { t: "[    0.133700] Chargement kernel sio.img . OK", c: "b-ok" },
  { t: "[    0.420000] Montage /dev/slam ......... OK", c: "b-ok" },
  { t: "[    0.421337] Montage /dev/sisr ......... OK", c: "b-ok" },
  { t: "[    0.980000] Connexion noumea.nc ....... 1ms", c: "b-info" },
  { t: "[    1.200000] Pare-feu activé ........... OK", c: "b-ok" },
  { t: "[    1.550000] Démarrage interface web ...", c: "b-warn" },
  { t: "", c: "" },
  { t: "Bienvenue dans le système BTS_SIO. Accès autorisé ✔", c: "b-info" },
];

let bootDone = false;

function endBoot() {
  if (bootDone) return;
  bootDone = true;
  bootEl.classList.add("done");
  document.body.style.overflow = "";
  setTimeout(() => bootEl.remove(), 700);
}

function runBoot() {
  // Ne jouer l'animation qu'une fois par session
  if (sessionStorage.getItem("booted") || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    bootEl.remove();
    return;
  }
  sessionStorage.setItem("booted", "1");
  document.body.style.overflow = "hidden";

  let i = 0;
  const total = BOOT_LINES.length;
  const interval = setInterval(() => {
    if (bootDone) { clearInterval(interval); return; }
    if (i >= total) {
      clearInterval(interval);
      setTimeout(endBoot, 550);
      return;
    }
    const line = BOOT_LINES[i];
    const span = document.createElement("span");
    span.className = line.c;
    span.textContent = line.t + "\n";
    bootLog.appendChild(span);
    bootProgress.style.width = Math.round(((i + 1) / total) * 100) + "%";
    i++;
  }, 210);

  bootSkip.addEventListener("click", endBoot);
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "Enter" || e.code === "Escape") endBoot();
  }, { once: true });
}
runBoot();

/* ---------- 2. PLUIE DE CODE (fond) ---------- */
const canvas = document.getElementById("matrix");
const ctx = canvas.getContext("2d");
const CHARS = "01<>/{}=;#$&λπ";
let columns, drops;

function resizeMatrix() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  columns = Math.floor(canvas.width / 18);
  drops = Array.from({ length: columns }, () => Math.random() * -50);
}
resizeMatrix();
addEventListener("resize", resizeMatrix);

function drawMatrix() {
  ctx.fillStyle = "rgba(7, 11, 18, 0.12)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = "14px 'JetBrains Mono', monospace";
  for (let i = 0; i < drops.length; i++) {
    const char = CHARS[Math.floor(Math.random() * CHARS.length)];
    // deux teintes : vert SLAM majoritaire, violet SISR ponctuel
    ctx.fillStyle = Math.random() > 0.92 ? "#b16cff" : "#00ffa3";
    ctx.fillText(char, i * 18, drops[i] * 18);
    if (drops[i] * 18 > canvas.height && Math.random() > 0.975) drops[i] = 0;
    drops[i]++;
  }
}
if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  setInterval(drawMatrix, 66);
}

/* ---------- 3. TYPEWRITER (hero) ---------- */
const typedEl = document.getElementById("typed");
const PHRASES = [
  "devenir développeur·se d'applications",
  "administrer des réseaux d'entreprise",
  "sécuriser des systèmes d'information",
  "construire le numérique calédonien",
];
let phraseIdx = 0, charIdx = 0, deleting = false;

function typeLoop() {
  const phrase = PHRASES[phraseIdx];
  typedEl.textContent = phrase.slice(0, charIdx);
  let delay = deleting ? 32 : 62;

  if (!deleting && charIdx === phrase.length) { deleting = true; delay = 1900; }
  else if (deleting && charIdx === 0) { deleting = false; phraseIdx = (phraseIdx + 1) % PHRASES.length; delay = 350; }
  else charIdx += deleting ? -1 : 1;

  setTimeout(typeLoop, delay);
}
typeLoop();

/* ---------- 4. RÉVÉLATION AU SCROLL + compteurs ---------- */
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    entry.target.querySelectorAll(".stat-num[data-count]").forEach(animateCount);
    if (entry.target.matches(".stat")) animateCountIn(entry.target);
    observer.unobserve(entry.target);
  });
}, { threshold: 0.18 });

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

function animateCountIn(statEl) {
  const num = statEl.querySelector(".stat-num[data-count]");
  if (num) animateCount(num);
}

function animateCount(el) {
  if (el.dataset.done) return;
  el.dataset.done = "1";
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || "";
  const dur = 1200;
  const start = performance.now();
  function frame(now) {
    const p = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* ---------- 5. NAV : menu mobile + lien actif ---------- */
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");

navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", open);
});
navLinks.querySelectorAll("a").forEach((a) =>
  a.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  })
);

const sections = [...document.querySelectorAll("main section[id]")];
const linkMap = new Map(
  [...document.querySelectorAll(".nav-link")].map((a) => [a.getAttribute("href").slice(1), a])
);
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    document.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
    const link = linkMap.get(entry.target.id);
    if (link) link.classList.add("active");
  });
}, { rootMargin: "-40% 0px -55% 0px" });
sections.forEach((s) => sectionObserver.observe(s));

/* ---------- 6. QUIZ D'ORIENTATION ---------- */
const QUESTIONS = [
  {
    q: "Un samedi libre devant ton PC, tu préfères…",
    answers: [
      { t: "Coder un petit jeu ou un site perso", w: "slam" },
      { t: "Monter un serveur Minecraft pour tes amis", w: "sisr" },
    ],
  },
  {
    q: "Le Wi-Fi de la maison tombe en panne. Ta réaction ?",
    answers: [
      { t: "J'attends que ça revienne, j'ai du code à écrire hors-ligne", w: "slam" },
      { t: "Je redémarre la box, je check les câbles, je diagnostique", w: "sisr" },
    ],
  },
  {
    q: "Ce qui te fascine le plus dans l'informatique :",
    answers: [
      { t: "Créer des applis que les gens utilisent tous les jours", w: "slam" },
      { t: "Les infrastructures invisibles qui font tourner Internet", w: "sisr" },
    ],
  },
  {
    q: "Dans un film de hacker, tu es plutôt…",
    answers: [
      { t: "Celui qui écrit le programme génial en 30 secondes", w: "slam" },
      { t: "Celui qui s'infiltre dans le réseau et contourne le pare-feu", w: "sisr" },
    ],
  },
  {
    q: "Ton projet d'équipe idéal :",
    answers: [
      { t: "Développer une appli mobile pour le lycée", w: "slam" },
      { t: "Déployer le réseau et la sécurité d'une petite entreprise", w: "sisr" },
    ],
  },
  {
    q: "Ce qui te donne le plus de satisfaction :",
    answers: [
      { t: "Voir mon code s'exécuter sans erreur du premier coup", w: "slam" },
      { t: "Un système stable, sécurisé, qui tourne 24h/24", w: "sisr" },
    ],
  },
];

const quizScreen = document.getElementById("quiz-screen");
document.getElementById("quiz-start").addEventListener("click", () => startQuiz());

function startQuiz() {
  const score = { slam: 0, sisr: 0 };
  showQuestion(0, score);
}

function showQuestion(idx, score) {
  const q = QUESTIONS[idx];
  // mélange l'ordre des réponses pour ne pas biaiser
  const answers = [...q.answers].sort(() => Math.random() - 0.5);

  quizScreen.innerHTML = `
    <p class="quiz-q"><span class="q-num">[${idx + 1}/${QUESTIONS.length}]</span> ${q.q}</p>
    <div class="quiz-answers"></div>
    <p class="quiz-progress">progression: [<span class="filled">${"█".repeat(idx)}</span>${"░".repeat(QUESTIONS.length - idx)}]</p>
  `;
  const wrap = quizScreen.querySelector(".quiz-answers");
  answers.forEach((a) => {
    const btn = document.createElement("button");
    btn.className = "quiz-answer";
    btn.textContent = "> " + a.t;
    btn.addEventListener("click", () => {
      score[a.w]++;
      if (idx + 1 < QUESTIONS.length) showQuestion(idx + 1, score);
      else showResult(score);
    });
    wrap.appendChild(btn);
  });
}

function showResult(score) {
  const total = score.slam + score.sisr;
  const pctSlam = Math.round((score.slam / total) * 100);
  const pctSisr = 100 - pctSlam;
  const isSlam = score.slam >= score.sisr;
  const tie = score.slam === score.sisr;

  const RESULTS = {
    slam: {
      name: "<SLAM/>",
      cls: "res-slam",
      desc: "Profil créateur détecté ! Le développement logiciel est fait pour toi : applications web, mobiles, bases de données… Tu aimes construire et voir tes idées prendre vie.",
    },
    sisr: {
      name: "[SISR]",
      cls: "res-sisr",
      desc: "Profil architecte détecté ! Les réseaux, les serveurs et la cybersécurité t'attendent : tu es de ceux qui font tourner (et protègent) toute l'infrastructure.",
    },
  };
  const r = RESULTS[isSlam ? "slam" : "sisr"];

  quizScreen.innerHTML = `
    <div class="quiz-result ${r.cls}">
      <p class="result-label">// analyse terminée — profil compatible :</p>
      <h3>${r.name}</h3>
      <div class="result-gauge">
        <div class="g-slam" style="width:0%"></div>
        <div class="g-sisr" style="width:0%"></div>
      </div>
      <div class="gauge-labels">
        <span class="l-slam">SLAM ${pctSlam}%</span>
        <span class="l-sisr">SISR ${pctSisr}%</span>
      </div>
      <p>${tie ? "Égalité parfaite ! Les deux options te correspondent — bonne nouvelle : la première année est commune, tu as le temps de choisir." : r.desc}</p>
      <a href="#rejoindre" class="btn btn-join mono">→ rejoindre le BTS</a>
      <br>
      <button class="quiz-restart" type="button">↻ relancer le quiz</button>
    </div>
  `;
  requestAnimationFrame(() => {
    setTimeout(() => {
      quizScreen.querySelector(".g-slam").style.width = pctSlam + "%";
      quizScreen.querySelector(".g-sisr").style.width = pctSisr + "%";
    }, 60);
  });
  quizScreen.querySelector(".quiz-restart").addEventListener("click", startQuiz);
}

/* ---------- 7. FORMULAIRE REJOINDRE ---------- */
const joinForm = document.getElementById("join-form");
const joinSuccess = document.getElementById("join-success");
const formError = document.getElementById("form-error");
const presentation = document.getElementById("f-presentation");
const charCount = document.getElementById("char-count");

presentation.addEventListener("input", () => {
  const len = presentation.value.length;
  charCount.textContent = len;
  charCount.parentElement.classList.toggle("limit", len >= 170);
});

joinForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // validation des champs obligatoires
  const required = ["f-prenom", "f-nom", "f-email", "f-consent"];
  let valid = true;
  required.forEach((id) => {
    const field = document.getElementById(id);
    const empty = field.type === "checkbox" ? !field.checked : !field.checkValidity();
    field.classList.toggle("invalid", empty);
    if (empty) valid = false;
  });

  formError.hidden = valid;
  if (!valid) return;

  // NOTE : pas de backend pour l'instant — brancher ici un service
  // d'envoi (Formspree, Netlify Forms, mailto ou API du lycée).
  // Les données sont disponibles via : new FormData(joinForm)

  joinForm.hidden = true;
  joinSuccess.hidden = false;
  joinSuccess.scrollIntoView({ behavior: "smooth", block: "center" });
});

// retire le style d'erreur dès que l'utilisateur corrige
joinForm.addEventListener("input", (e) => {
  if (e.target.classList.contains("invalid")) {
    const ok = e.target.type === "checkbox" ? e.target.checked : e.target.checkValidity();
    if (ok) e.target.classList.remove("invalid");
  }
});

document.getElementById("join-reset").addEventListener("click", () => {
  joinForm.reset();
  charCount.textContent = "0";
  joinForm.hidden = false;
  joinSuccess.hidden = true;
});
