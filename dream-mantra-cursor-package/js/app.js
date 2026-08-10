// Dream Mantra — Test Portal (static mockup)
// Loads content from data/data.json and wires up tab / sub-tab / wizard navigation.
// No scoring/formula logic — front-end only.

const ICONS = {
  user: "👤",
  chat: "💬",
  clipboard: "📋",
  target: "🎯",
  briefcase: "💼",
};

let DATA = null;
let activeTab = "taketest";
let activeInstrument = null;
let wizardStepIndex = 0;

async function loadData() {
  const res = await fetch("data/data.json");
  DATA = await res.json();
}

// ---------- Header nav ----------
function renderNav() {
  const nav = document.getElementById("dm-nav");
  nav.innerHTML = DATA.nav
    .map(
      (item) => `
      <button class="nav-pill" data-tab="${item.id}" onclick="showTab('${item.id}')">
        <span>${ICONS[item.icon] || ""}</span><span>${item.label}</span>
      </button>`,
    )
    .join("");
  document.getElementById("dm-username").textContent = DATA.user.name;
  updateNavActive();
}

function updateNavActive() {
  document.querySelectorAll(".nav-pill").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === activeTab);
  });
}

function showTab(id) {
  activeTab = id;
  document.querySelectorAll(".tab-page").forEach((el) => el.classList.remove("active"));
  document.getElementById("tab-" + id).classList.add("active");
  updateNavActive();
}

// ---------- Take test ----------
function statusLabel(status) {
  if (status === "completed") return "Completed";
  if (status === "in_progress") return "In progress";
  return "Not started";
}

function statusAction(status) {
  if (status === "completed") return "Open";
  if (status === "in_progress") return "Continue";
  return "Start test";
}

function renderTakeTest() {
  document.getElementById("taketest-dreamzid").textContent = DATA.user.dreamzId || "—";

  const banner = document.getElementById("class-banner");
  if (DATA.user.academicStage) {
    banner.outerHTML = `<p class="page-subtitle" style="margin-top:12px;">Your class: <strong>${DATA.user.academicStage}</strong></p>`;
  } else {
    banner.innerHTML = `
      <p>Pick your academic / professional stage on your profile to set your class.</p>
      <button class="btn btn-primary btn-pill" style="margin-top:8px;" onclick="showTab('profile')">View Profile</button>`;
  }

  const subtabs = document.getElementById("sm-subtabs");
  subtabs.innerHTML = DATA.instruments
    .map(
      (i) => `<button class="sm-subtab" data-sm="${i.id}" onclick="showSmTab('${i.id}')">${i.title}</button>`,
    )
    .join("");

  const overview = document.getElementById("sm-overview");
  overview.innerHTML = DATA.instruments
    .map(
      (i) => `
      <div class="instrument-card status-${i.status}">
        <h2>${i.title}</h2>
        <p class="hint">${i.hint}</p>
        <div class="instrument-footer">
          <span class="badge ${i.status}">${statusLabel(i.status)}</span>
          <button class="btn ${i.status === "not_started" ? "btn-primary" : "btn-outline"}" onclick="showSmTab('${i.id}')">${statusAction(i.status)}</button>
        </div>
      </div>`,
    )
    .join("");
}

function progressPct(instrument) {
  return Math.round((instrument.answered / instrument.total) * 100);
}

function buildSmScreen(instrument) {
  const pct = progressPct(instrument);
  const remaining = instrument.total - instrument.answered;
  const isComplete = pct >= 100;

  return `
    <div class="sm-screen">
      <div class="sm-grid">
        <aside class="sm-sidebar">
          <div class="sm-sidebar-header">
            <p class="name font-display">DREAM MANTRA</p>
            <p class="tag">Test Portal</p>
          </div>
          <div class="sm-sidebar-body">
            <div>
              <p style="font-size:14px;font-weight:600;margin:0;">Your Progress</p>
              <div class="progress-ring-wrap">
                <svg viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#ECECEC" stroke-width="3" />
                  <circle cx="18" cy="18" r="15.5" fill="none" stroke="#FF6A3D" stroke-width="3"
                    stroke-dasharray="${pct} 100" stroke-linecap="round" />
                </svg>
                <div class="progress-ring-label">
                  <p class="pct">${pct}%</p>
                  ${isComplete ? '<p class="done">Completed</p>' : ""}
                </div>
              </div>
              <p class="q-count">${instrument.answered} / ${instrument.total} Questions</p>
            </div>

            <div class="overview-box">
              <p class="label">Question Overview</p>
              <ul>
                <li><span class="k">✓ Answered</span><span class="v">${instrument.answered}</span></li>
                <li><span class="k">⏱ Remaining</span><span class="v">${remaining}</span></li>
                <li><span class="k">⏭ Skipped</span><span class="v">0</span></li>
              </ul>
            </div>

            <div class="important-box">
              <p class="title">Important</p>
              <ul>
                <li>✓ There are no right or wrong answers</li>
                <li>✓ Be authentic — honest responses help us understand you better</li>
                <li>✓ Your responses are confidential</li>
                <li>✓ Use Save & Next to save progress as you go</li>
              </ul>
            </div>
          </div>
        </aside>

        <div class="sm-main">
          <div class="sm-topcard">
            <div class="sm-topcard-row">
              <div>
                <h1 class="sm-title font-display">${instrument.title}</h1>
                <p class="sm-tag">${instrument.tag}</p>
                <p class="sm-hint">Answer honestly — there are no right or wrong answers.</p>
              </div>
              <div class="sm-meta">
                <div class="range-chip">Questions ${Math.min(instrument.answered + 1, instrument.total)}–${Math.min(instrument.answered + 10, instrument.total)} of ${instrument.total}</div>
                <div class="user-chip">
                  <div class="user-avatar">${DATA.user.name.trim().charAt(0).toUpperCase()}</div>
                  <div>
                    <p class="n">${DATA.user.name}</p>
                    <p class="l">EN</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="candidate-box">
            <p class="title">Candidate Information</p>
            <div class="candidate-grid">
              <div class="field"><label>Name</label><input readonly value="${DATA.user.name}" /></div>
              <div class="field"><label>Dream Mantra ID</label><input readonly value="${DATA.user.dreamzId || "—"}" /></div>
              <div class="field"><label>Date</label><input readonly value="10 Aug 2026" /></div>
            </div>
          </div>

          <div class="question-card">
            <div class="q-number">${String(Math.min(instrument.answered + 1, instrument.total)).padStart(2, "0")}</div>
            <div class="q-body">
              <p class="q-prompt">${instrument.question}</p>
              <div class="q-options">
                ${instrument.options
                  .map(
                    (opt, i) => `
                    <button class="q-option ${i === 1 ? "selected" : ""}" onclick="selectOption(this)">
                      <span class="q-letter">${String.fromCharCode(65 + i)}</span>
                      <span class="q-option-label">${opt}</span>
                      <span class="q-check ${i === 1 ? "on" : ""}">${i === 1 ? "✓" : ""}</span>
                    </button>`,
                  )
                  .join("")}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="sm-footer">
        <div class="sm-footer-inner">
          <div class="progress-track">
            <p>${instrument.answered} / ${instrument.total} Answered</p>
            <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
          </div>
          <div style="display:flex;flex-wrap:wrap;align-items:center;gap:8px;">
            <button class="btn btn-outline">← Previous</button>
            <button class="btn btn-outline">🔖 Save & Exit</button>
            <button class="btn btn-primary">Next Question →</button>
          </div>
        </div>
      </div>
    </div>`;
}

function selectOption(btn) {
  btn.parentElement.querySelectorAll(".q-option").forEach((el) => {
    el.classList.remove("selected");
    el.querySelector(".q-check").classList.remove("on");
    el.querySelector(".q-check").textContent = "";
  });
  btn.classList.add("selected");
  const check = btn.querySelector(".q-check");
  check.classList.add("on");
  check.textContent = "✓";
}

function showSmTab(id) {
  activeInstrument = id;
  document.getElementById("sm-overview").style.display = id ? "none" : "grid";
  const wrap = document.getElementById("sm-tests-wrap");
  const instrument = DATA.instruments.find((i) => i.id === id);
  wrap.innerHTML = instrument ? buildSmScreen(instrument) : "";
  document.querySelectorAll(".sm-subtab").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.sm === id);
  });
}

// ---------- Ask questions ----------
function renderAsk() {
  const wrap = document.getElementById("chat-messages");
  wrap.innerHTML = DATA.askMessages
    .map((m) => {
      const mine = m.role === "user";
      return `
        <div class="msg-row ${mine ? "end" : "start"}">
          <div class="bubble ${mine ? "mine" : "theirs"}">
            <p class="who">${mine ? "You" : "Counsellor"}</p>
            <p class="body">${m.body}</p>
            <p class="time">${m.time}</p>
          </div>
        </div>`;
    })
    .join("");
  wrap.scrollTop = wrap.scrollHeight;

  document.getElementById("chat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const input = document.getElementById("chat-input");
    const body = input.value.trim();
    if (!body) return;
    DATA.askMessages.push({ role: "user", body, time: "Just now" });
    input.value = "";
    renderAsk();
  });
}

// ---------- Profile wizard ----------
function fieldHtml(field) {
  const spanClass = field.span === 2 ? "span-2" : "";
  let control = "";
  if (field.type === "select") {
    control = `<select id="f-${field.key}">
      <option value="">Select…</option>
      ${field.options.map((o) => `<option ${field.value === o ? "selected" : ""}>${o}</option>`).join("")}
    </select>`;
  } else if (field.type === "textarea") {
    control = `<textarea id="f-${field.key}" rows="3">${field.value || ""}</textarea>`;
  } else if (field.type === "date") {
    control = `<input type="date" id="f-${field.key}" />`;
  } else {
    control = `<input type="text" id="f-${field.key}" value="${field.value || ""}" />`;
  }
  return `
    <div class="form-field ${spanClass}">
      <label for="f-${field.key}">${field.label}</label>
      ${control}
      ${field.help ? `<p class="help">${field.help}</p>` : ""}
    </div>`;
}

function renderWizardSteps() {
  const nav = document.getElementById("wizard-steps");
  nav.innerHTML = DATA.profileSteps
    .map((step, i) => {
      const active = i === wizardStepIndex;
      const done = i < wizardStepIndex;
      return `
        <button class="wizard-step-btn ${active ? "active" : ""} ${done ? "done" : ""}" onclick="showWizardStep(${i})">
          <span class="step-icon">${done ? "✓" : ICONS[step.icon] || ""}</span>
          <span class="step-text">
            <span class="t">${step.title}</span>
            <span class="s">${step.subtitle}</span>
          </span>
        </button>`;
    })
    .join("");
}

function renderWizardStepContent() {
  const step = DATA.profileSteps[wizardStepIndex];
  const content = document.getElementById("wizard-step-content");

  let body = `
    <div class="wizard-step-head">
      <span class="icon">${ICONS[step.icon] || ""}</span>
      <div>
        <h2 class="font-display">${step.title}</h2>
        <p>${step.subtitle}</p>
      </div>
    </div>`;

  if (step.id === "basics") {
    body += `
      <div class="wizard-form">
        <div class="form-field">
          <label>Email</label>
          <input value="${DATA.user.email}" readonly />
          <p class="help">Login email — set by Admin / Dream Team only</p>
        </div>
        <div class="form-grid">
          ${step.fields.map(fieldHtml).join("")}
        </div>
      </div>`;
  } else if (step.id === "review") {
    body += `
      <div class="wizard-form">
        <div class="form-grid">
          <div class="form-field">
            <label>Dream Mantra ID</label>
            <input value="${DATA.user.dreamzId || "—"}" readonly style="font-family:monospace;" />
            <p class="help">Assigned by Admin / Dream Team — you cannot edit this</p>
          </div>
          <div class="form-field">
            <label>Class / SM package</label>
            <input value="${DATA.user.academicStage || "Not assigned yet"}" readonly />
            <p class="help">Set from your academic / professional stage answer</p>
          </div>
        </div>
        <div class="review-summary">
          <h3>Registration summary</h3>
          <div class="review-row"><dt>Name</dt><dd>${DATA.user.name}</dd></div>
          <div class="review-row"><dt>Email</dt><dd>${DATA.user.email}</dd></div>
        </div>
        <p style="font-size:12px;color:var(--muted-foreground);display:flex;align-items:center;gap:6px;">🔒 You can update your information anytime from your profile settings.</p>
      </div>`;
  } else {
    body += `<div class="wizard-form">${step.fields.map(fieldHtml).join("")}</div>`;
  }

  content.innerHTML = body;

  // wire the academic stage select (basics step) back into DATA.user + take-test tab
  const stageSelect = document.getElementById("f-academicStage");
  if (stageSelect) {
    stageSelect.value = DATA.user.academicStage || "";
    stageSelect.addEventListener("change", (e) => {
      DATA.user.academicStage = e.target.value;
      renderTakeTest();
    });
  }
}

function updateWizardProgress() {
  const total = DATA.profileSteps.length;
  const pct = Math.round(((wizardStepIndex + 1) / total) * 100);
  document.getElementById("wizard-step-label").textContent = `Step ${wizardStepIndex + 1} of ${total}`;
  document.getElementById("wizard-step-pct").textContent = `${pct}%`;
  document.getElementById("wizard-progress-fill").style.width = `${pct}%`;
  document.getElementById("wizard-back-btn").style.display = wizardStepIndex === 0 ? "none" : "inline-flex";
  document.getElementById("wizard-continue-btn").textContent =
    wizardStepIndex === total - 1 ? "Confirm & Save" : "Continue →";
}

function showWizardStep(i) {
  wizardStepIndex = i;
  renderWizardSteps();
  renderWizardStepContent();
  updateWizardProgress();
}

function wizardNext() {
  if (wizardStepIndex < DATA.profileSteps.length - 1) showWizardStep(wizardStepIndex + 1);
}
function wizardBack() {
  if (wizardStepIndex > 0) showWizardStep(wizardStepIndex - 1);
}

// ---------- init ----------
async function init() {
  await loadData();
  document.getElementById("stat-dreamzid").textContent = DATA.user.dreamzId || "—";

  renderNav();
  renderTakeTest();
  renderAsk();
  showWizardStep(0);

  document.getElementById("wizard-continue-btn").addEventListener("click", wizardNext);
  document.getElementById("wizard-back-btn").addEventListener("click", wizardBack);

  showTab("taketest");
}

init();
