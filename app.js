const data = {
  barriers: [
    ["Cost", "Financial cost of joining or operating"],
    ["Staff time", "Extra time required from staff"],
    ["Training", "Training or learning requirements"],
    ["Technical complexity", "Technology feels difficult to use"],
    ["Customer resistance", "Customers may not understand or use it"],
    ["Lack of space", "Limited physical space"],
    ["Extra administration", "Additional paperwork or admin"],
    ["Setup effort", "Effort required to get started"]
  ],
  benefits: [
    ["More customers", "Attract new or environmentally conscious customers"],
    ["Cost savings", "Reduce costs or waste"],
    ["Sustainability reputation", "Strengthen sustainability reputation"],
    ["Customer loyalty", "Encourage repeat customers"],
    ["Community impact", "Create positive local impact"],
    ["Reduced waste", "Reduce materials or waste"],
    ["Differentiation", "Stand out from competitors"]
  ],
  support: [
    ["University support", "Practical support from the university"],
    ["Funding / grants", "Financial help with implementation"],
    ["Marketing toolkit", "Ready-made promotional materials"],
    ["Digital platform", "A simple digital tool or app"],
    ["Student ambassadors", "Students helping with implementation"],
    ["Training materials", "Simple guidance and training"],
    ["Technical support", "Help with technology"],
    ["Promotional materials", "Physical materials for customers"]
  ]
};

const POWER_AUTOMATE_URL = "https://default65b52940f4b641bd833d3033ecbcf6.e1.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/00/workflows/9484b84cbf5749f4924daba3eba0c157/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=cSw9OPZGspKquOVioiy0CPMAFPrhyI5OhsO_W5ZhuMY";

let step = 0;
let consent = false;
let selections = { barriers: [], benefits: [], support: [] };
let weights = { barriers: {}, benefits: {}, support: {} };
let decision = "";
let magic = "";
const responseId = crypto.randomUUID();
let participant = {
  email: "",
  industry: "",
  employees: "",
  postcode: "",
  address: ""
};
let submitState = { status: "idle", message: "" };

const titles = [
  "Consent",
  "Participant details",
  "Barriers",
  "Benefits",
  "Support",
  "Weight",
  "Balance",
  "Your view",
  "About CircuBee",
  "Would you participate?",
  "Summary"
];

function progress() {
  document.getElementById("progress").innerHTML = titles
    .map((_, i) => `<span class="dot ${i <= step ? "on" : ""}"></span>`)
    .join("");
}

function render() {
  progress();
  const a = document.getElementById("app");

  if (step === 0) {
    a.innerHTML = `
      <div class="card">
        <h2>Before you start</h2>
        <p>
          This short activity explores what would encourage or prevent a local business from participating in a circular rewards scheme called CircuBee.
        </p>
        <div class="notice">
          <b>Event context:</b><br>
          This activity is for the 2026 ESRC Festival event, held by Salford Business School, for initial preliminary data collection and research for the CircuBee project, which aims to promote a circular, sustainable, local community-based business-circle economy.
        </div>
        <div class="notice">
          <b>What will be collected?</b><br>
          Your email address, industry sector, number of employees, postcode, address, your choices in the game, the importance you give them, your participation decision, and any optional written response.
        </div>
        <div class="notice">
          <b>How will your answers be used?</b><br>
          If you agree below, your answers may be used as anonymised/aggregated preliminary research evidence to help develop the CircuBee project, future funding applications, publications and a potential pilot. Taking part is voluntary. You can use the game without agreeing to share your answers for research.
        </div>
        <div class="notice">
          <b>Researchers for this event:</b><br><br>
          <b>Kate Han</b> — k.han3@salford.ac.uk — <a href="https://www.salford.ac.uk/our-staff/kate-han" target="_blank" rel="noopener noreferrer">Profile</a><br>
          <b>Ruth Hudson</b> — R.A.Hudson@salford.ac.uk — <a href="https://www.salford.ac.uk/our-staff/ruth-hudson" target="_blank" rel="noopener noreferrer">Profile</a><br>
          <b>Ashraful Alam</b> — m.a.alam@salford.ac.uk — <a href="https://www.salford.ac.uk/our-staff/md-ashraful-alam" target="_blank" rel="noopener noreferrer">Profile</a>
        </div>
        <div class="notice">
          <b>Reminder:</b><br>
          Promotional photos will be taken at the social science research event. If a participant does not wish to be photographed, please inform the staff.
        </div>
        <div class="consent">
          <label>
            <input type="checkbox" ${consent ? "checked" : ""} onchange="consent=this.checked;render()">
            <span>
              <b>I agree to share my answers for the research purposes described above.</b><br>
              <small>If you do not tick this box, your answers will not be treated as research data and the activity can still be completed for engagement purposes.</small>
            </span>
          </label>
        </div>
        <div class="actions">
          <span></span>
          <button class="btn" onclick="start()">${consent ? "Agree & start" : "Start without sharing research data"}</button>
        </div>
      </div>
    `;
    return;
  }

      if (step === 1) {
        const industryOptions = [
          "N/A (student / not business)",
          "Retail",
          "Food and drink / hospitality",
          "Health and beauty",
          "Professional services",
          "Creative / media",
          "Education / training",
          "Manufacturing",
          "Construction / trades",
          "Technology / digital",
          "Transport / logistics",
          "Charity / social enterprise",
          "Other"
        ];

        const employeeOptions = [
          "N/A",
          "0 (sole trader / student)",
          "1-9",
          "10-49",
          "50-249",
          "250+"
        ];

        const emailInvalid = participant.email.trim() !== "" && !isValidEmail(participant.email);
        const postcodeInvalid = participant.postcode.trim() !== "" && !isValidPostcode(participant.postcode);

        a.innerHTML = `
          <div class="card">
            <h2>Participant details</h2>
            <p>Please provide the details below for preliminary data collection.</p>

            <p><b>Email address</b></p>
            <input
              type="email"
              value="${escapeHtml(participant.email)}"
              oninput="setParticipant('email', this.value)"
              placeholder="name@example.com"
              class="${emailInvalid ? "field-invalid" : ""}"
              style="width:100%;padding:12px;border:2px solid var(--line);border-radius:11px;font:inherit;"
            >
            ${emailInvalid ? '<div class="validation-message">Reminder: Please enter a valid email format, for example name@example.com.</div>' : ""}

            <p><b>Industry sector</b></p>
            <select
              onchange="setParticipant('industry', this.value)"
              style="width:100%;padding:12px;border:2px solid var(--line);border-radius:11px;font:inherit;background:white;"
            >
              <option value="">Select an option</option>
              ${industryOptions
                .map(
                  (option) =>
                    `<option value="${escapeHtml(option)}" ${participant.industry === option ? "selected" : ""}>${option}</option>`
                )
                .join("")}
            </select>

            <p><b>Number of employees</b></p>
            <select
              onchange="setParticipant('employees', this.value)"
              style="width:100%;padding:12px;border:2px solid var(--line);border-radius:11px;font:inherit;background:white;"
            >
              <option value="">Select an option</option>
              ${employeeOptions
                .map(
                  (option) =>
                    `<option value="${escapeHtml(option)}" ${participant.employees === option ? "selected" : ""}>${option}</option>`
                )
                .join("")}
            </select>

            <p><b>Postcode</b></p>
            <input
              type="text"
              value="${escapeHtml(participant.postcode)}"
              oninput="setParticipant('postcode', this.value)"
              placeholder="e.g. M5 4WT"
              class="${postcodeInvalid ? "field-invalid" : ""}"
              style="width:100%;padding:12px;border:2px solid var(--line);border-radius:11px;font:inherit;"
            >
            ${postcodeInvalid ? '<div class="validation-message">Reminder: Please enter a valid postcode format, for example M5 4WT or OL9 7AA.</div>' : ""}

            <p><b>Address</b></p>
            <textarea
              oninput="setParticipant('address', this.value)"
              placeholder="Business or organisation address"
            >${escapeHtml(participant.address)}</textarea>

            <div class="actions">
              <button class="btn secondary" onclick="prev()">Back</button>
              <button class="btn" ${!participantDetailsComplete() ? "disabled" : ""} onclick="next()">Continue</button>
            </div>
          </div>
        `;
        return;
      }

      if (step >= 2 && step <= 4) {
        const key = ["barriers", "benefits", "support"][step - 2];
    const head = {
      barriers: "🔴 Barriers",
      benefits: "🟢 Motivations / Benefits",
      support: "🔵 Enablers / Support"
    }[key];
    const q = {
      barriers: "What makes participation difficult?",
      benefits: "What would make participation worthwhile?",
      support: "What would make participation easier or more achievable?"
    }[key];

    a.innerHTML = `
      <div class="card">
        <h2>${head}</h2>
        <p>${q}</p>
        <p><b>Choose up to 3.</b> Selected: ${selections[key].length}/3</p>
        <div class="tokens">
          ${data[key]
            .map(
              (x, i) => `
                <button class="token ${key === "barriers" ? "red" : key === "benefits" ? "green" : "blue"} ${selections[key].includes(i) ? "selected" : ""}" onclick="toggle('${key}',${i})">
                  ${x[0]}
                  <small>${x[1]}</small>
                </button>
              `
            )
            .join("")}
        </div>
        <div class="actions">
          <button class="btn secondary" onclick="prev()">Back</button>
          <button class="btn" ${!selections[key].length ? "disabled" : ""} onclick="next()">Continue</button>
        </div>
      </div>
    `;
    return;
  }

  if (step === 5) {
    a.innerHTML = `
      <div class="card">
        <h2>Weight your priorities</h2>
        <p>Give each selected item a weight: <b>1 = useful, 2 = important, 3 = critical.</b></p>
        ${["barriers", "benefits", "support"]
          .map(
            (k) => `
              <h3>${k === "barriers" ? "🔴 Barriers" : k === "benefits" ? "🟢 Benefits" : "🔵 Support"}</h3>
              ${selections[k]
                .map(
                  (i) => `
                    <div class="choice">
                      <b>${data[k][i][0]}</b>
                      <div>
                        ${[1, 2, 3]
                          .map(
                            (n) => `
                              <button class="btn ${weights[k][i] === n ? "" : "secondary"}" style="margin:6px 4px 0 0" onclick="setWeight('${k}',${i},${n})">${n}</button>
                            `
                          )
                          .join("")}
                      </div>
                    </div>
                  `
                )
                .join("")}
            `
          )
          .join("")}
        <div class="actions">
          <button class="btn secondary" onclick="prev()">Back</button>
          <button class="btn" onclick="next()">See my balance</button>
        </div>
      </div>
    `;
    return;
  }

  if (step === 6) {
    const r = score("barriers");
    const g = score("benefits") + score("support");
    const d = g - r;

    a.innerHTML = `
      <div class="card">
        <h2>Your balance</h2>
        <div class="scale">
          <div class="pan">
            <h3>🔴 Barriers</h3>
            <div class="score">${r}</div>
            <small>points</small>
          </div>
          <div class="beam"></div>
          <div class="pan">
            <h3>🟢 + 🔵 Benefits & Support</h3>
            <div class="score">${g}</div>
            <small>points</small>
          </div>
        </div>
        <p style="text-align:center;font-weight:700">
          ${
            d > 0
              ? "Benefits and support outweigh the barriers."
              : d < 0
                ? "The barriers outweigh the benefits and support."
                : "The balance is even."
          }
        </p>
        <div class="actions">
          <button class="btn secondary" onclick="prev()">Back</button>
          <button class="btn" onclick="next()">Continue</button>
        </div>
      </div>
    `;
    return;
  }

  if (step === 7) {
    const magicHints = [
      "More information",
      "Meet the whole research team",
      "Know other participants' thoughts",
      "Other ideas"
    ];

    a.innerHTML = `
      <div class="card">
        <h2>What would change your view?</h2>
        <p>What is the single thing CircuBee could provide that would make you more likely to participate?</p>
        <div class="suggestions">
          ${magicHints
            .map(
              (hint) => `<button type="button" class="suggestion-btn" onclick="appendMagicSuggestion('${hint.replace(/'/g, "\\'")}')">${hint}</button>`
            )
            .join("")}
        </div>
        <textarea id="magic" placeholder="Optional response — click a suggestion above or type your own idea.">${escapeHtml(magic)}</textarea>
        <div class="actions">
          <button class="btn secondary" onclick="prev()">Back</button>
          <button class="btn" onclick="magic=document.getElementById('magic').value;next()">Continue</button>
        </div>
      </div>
    `;
    return;
  }

  if (step === 8) {
    a.innerHTML = `
      <div class="card">
        <h2>About CircuBee</h2>
        <p>CircuBee is a local circular rewards scheme designed to support sustainable shopping and community-based participation. It aims to help local businesses and customers reconnect around reuse, waste reduction, and environmentally responsible choices.</p>

        <div class="notice">
          <b>Participation is free</b><br>
          This research is free to join, and no money is expected from participants. There is no payment required to take part in this project or in the activities described here.
        </div>

        <div class="notice">
          <b>Project background</b><br>
          This project began from interest in circular economy research and was motivated by the goal of expanding sustainability awareness and increasing community engagement through neighbourhood business networks. The first phase will focus on Salford University, the MediaCity neighbourhood, and local daily routines, commuter patterns, and customer behaviour. The project started from the idea in April 2026 and is designed to explore circular economy thinking through practical community-based research.
        </div>

        <div class="notice">
          <b>Research plan</b><br>
          This project is exploring how local businesses might participate in a circular rewards model and what would encourage or prevent adoption. The research will help us understand barriers, motivations, and practical support needs before testing a future pilot. The first run is centred around Salford University and the MediaCity neighbourhood, with future research expanding to wider public commuting and everyday work routines.
        </div>

        <div class="notice">
          <b>Timeline</b><br>
          The project began in April 2026. Planned activities include the Social Science Festival from October to November 2026, followed by further data collection and research until December 2026. This will then extend into a larger commercial research project expected to benefit more people across 2027.
        </div>

        <div class="notice">
          <b>Research team</b><br>
          <b>Kate Han</b> — k.han3@salford.ac.uk — <a href="https://www.salford.ac.uk/our-staff/kate-han" target="_blank" rel="noopener noreferrer">Profile</a><br>
          <small>Dr. Kate Han is a Lecturer in Digital Business at Salford Business School, University of Salford. Her research focuses on artificial intelligence, simulation and optimisation, digital twins, machine learning, and data engineering, with applications in intelligent transport systems, sustainability, and digital transformation. She also has a strong interest in innovative teaching and learning and the responsible adoption of AI in higher education.</small><br><br>
          <b>Ruth Hudson</b> — R.A.Hudson@salford.ac.uk — <a href="https://www.salford.ac.uk/our-staff/ruth-hudson" target="_blank" rel="noopener noreferrer">Profile</a><br>
          <small>Dr Ruth Hudson is an experienced higher education curriculum developer, leader, multi-disciplinary researcher, learning and teaching specialist, and project lead for Carbon Literacy at Salford Business School. Ruth has also developed HE programmes internationally, including the development of global student exchanges. Her expertise extends to leading a digital transformation teaching and learning project in HE, transforming active learning for student engagement and graduate outcomes.</small><br><br>
          <b>Ashraful Alam</b> — m.a.alam@salford.ac.uk — <a href="https://www.salford.ac.uk/our-staff/md-ashraful-alam" target="_blank" rel="noopener noreferrer">Profile</a><br>
          <small>Dr. Ashraful Alam is an Associate Professor of Sustainability &amp; Programme Leader for MSc Finance at the University of Salford. Before joining Salford, he gained experience teaching at the University of York and Leeds Beckett University. Moreover, he previously held an Assistant Professor position at the University of Dhaka, Bangladesh. He completed his PhD from the University of York. His main area of research revolves around sustainability, innovation, governance, and fintech. He has an extensive publication record with over 20 publications, including 4* and 3* ABS-listed journals. Additionally, he has experience securing both internal and external bids as a Principal and co-investigator. He has supervised 7 PhD students to completion and welcomes interesting PhD applications.</small>
        </div>

        <div class="notice">
          <b>Contact details</b><br>
          If you have any questions about the study, please contact the research team using the email addresses above. You are free to ask questions before deciding whether to take part.
        </div>

        <div class="notice">
          <b>Download study documents</b><br>
          <ul>
            <li><a href="Participant%20Information%20Sheet%20%E2%80%93%20CircuBee%20Sustainable%20Business%20Participation%20Study.docx" download>Participant Information Sheet</a></li>
            <li><a href="Participant%20Consent%20Form%20%E2%80%93%20CircuBee%20Study.docx" download>Participant Consent Form</a></li>
            <li><a href="Research%20Participant%20Risk%20Assessment%20%E2%80%93%20CircuBee%20Project.docx" download>Research Participant Risk Assessment</a></li>
          </ul>
        </div>

        <div class="actions">
          <button class="btn secondary" onclick="prev()">Back</button>
          <button class="btn" onclick="next()">Continue</button>
        </div>
      </div>
    `;
    return;
  }

  if (step === 9) {
    a.innerHTML = `
      <div class="card">
        <h2>Would you participate?</h2>
        <p>How likely would you be to participate in a local circular rewards scheme?</p>
        <div class="notice">
          <b>Participation is free</b><br>
          This research is free to join, and no money is expected from participants. There is no payment required to take part.
        </div>
        <div class="notice">
          <b>Potential benefits for participants:</b><br>
          Participating may help you learn more about sustainable local business models, contribute to research that supports greener community initiatives, and potentially benefit from future opportunities such as local rewards, pilot activities, and practical insights into circular business approaches.
        </div>
        ${[
          ["no", "Definitely would not participate"],
          ["probably-no", "Probably would not participate"],
          ["probably-yes", "Probably would participate"],
          ["yes", "Definitely would participate"]
        ]
          .map(
            (x) => `
              <button class="choice ${decision === x[0] ? "selected" : ""}" onclick="decision='${x[0]}';render()">${x[1]}</button>
            `
          )
          .join("")}
        <div class="actions">
          <button class="btn secondary" onclick="prev()">Back</button>
          <button class="btn" ${!decision ? "disabled" : ""} onclick="next()">Continue</button>
        </div>
      </div>
    `;
    return;
  }

  if (step === 10) {
    a.innerHTML = `
      <div class="card">
        <h2>Follow-up contact</h2>
        <p>Depending on your response, a researcher may contact you about future activities related to this study. If you are approached, the research team may ask for further information or invite you to take part in later stages of the research.</p>

        <div class="notice">
          <b>Research team contact details</b><br>
          <b>Kate Han</b> — k.han3@salford.ac.uk<br>
          <b>Ruth Hudson</b> — R.A.Hudson@salford.ac.uk<br>
          <b>Ashraful Alam</b> — m.a.alam@salford.ac.uk<br>
        </div>

        <div class="notice">
          <b>Withdrawal</b><br>
          You can still withdraw from the research at any time during the following activities or later stages of the project. If you do not wish to be contacted for follow-up research, please inform the staff or contact the research team using the email addresses above.
        </div>

        <div class="actions">
          <button class="btn secondary" onclick="prev()">Back</button>
          <button class="btn" onclick="next()">Continue</button>
        </div>
      </div>
    `;
    return;
  }

      if (step === 11) {
    a.innerHTML = `
      <div class="card">
        <h2>Thank you</h2>
        <p>Your Balance Challenge is complete.</p>
        <div class="notice">
          Please stay for the group discussion at the end of the activity. Participants will receive a £10 Amazon voucher.
        </div>
        <div class="grid">
          <div class="cat red">
            <h3>Barriers</h3>
            <p>${selections.barriers.map((i) => data.barriers[i][0]).join(", ") || "None"}</p>
          </div>
          <div class="cat green">
            <h3>Benefits</h3>
            <p>${selections.benefits.map((i) => data.benefits[i][0]).join(", ") || "None"}</p>
          </div>
          <div class="cat blue">
            <h3>Support</h3>
            <p>${selections.support.map((i) => data.support[i][0]).join(", ") || "None"}</p>
          </div>
        </div>
        <div class="notice">
          <b>Email:</b> ${escapeHtml(participant.email)}<br>
          <b>Industry sector:</b> ${escapeHtml(participant.industry)}<br>
          <b>Employees:</b> ${escapeHtml(participant.employees)}<br>
          <b>Postcode:</b> ${escapeHtml(participant.postcode)}<br>
          <b>Address:</b> ${escapeHtml(participant.address)}<br>
          <b>Participation:</b> ${decisionLabel()}<br>
          <b>Research sharing:</b> ${consent ? "Agreed" : "Not agreed"}<br>
          <b>Your response ID:</b> ${responseId}<br>
          <b>Your additional idea:</b> ${magic || "None provided"}
        </div>
        ${
          consent
            ? '<div class="notice"><b>Research data note:</b> Please keep your response ID if you may want to withdraw your response later. You can submit this response to the secure research flow for OneDrive storage and also download a local copy.</div>'
            : '<div class="notice"><b>Research data note:</b> You did not agree to research sharing, so this response will not be submitted to the research storage flow.</div>'
        }
        ${submitState.status !== "idle" ? `<div class="notice"><b>Submission status:</b> ${submitState.message}</div>` : ""}
        <div class="actions">
          ${consent ? `<button class="btn" ${submitState.status === "sending" ? "disabled" : ""} onclick="submitResponse()">${submitState.status === "sending" ? "Submitting..." : "Submit to research storage"}</button>` : "<span></span>"}
          <button class="btn secondary" onclick="downloadResults()">Download my response</button>
          <button class="btn" onclick="location.reload()">Play again</button>
        </div>
      </div>
    `;
  }
}

function start() {
  step = 1;
  render();
}

function setParticipant(field, value) {
  participant[field] = value;
  render();
}

function appendMagicSuggestion(suggestion) {
  const textarea = document.getElementById("magic");
  if (!textarea) return;

  const current = textarea.value.trim();
  const nextValue = current ? `${current}; ${suggestion}` : suggestion;
  textarea.value = nextValue;
  textarea.focus();
  textarea.setSelectionRange(textarea.value.length, textarea.value.length);
}

function isValidEmail(value) {
  const email = value.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPostcode(value) {
  const postcode = value.trim();
  return /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(postcode);
}

function participantDetailsComplete() {
  return (
    isValidEmail(participant.email) &&
    participant.industry.trim() &&
    participant.employees.trim() &&
    isValidPostcode(participant.postcode) &&
    participant.address.trim()
  );
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function toggle(k, i) {
  const a = selections[k];
  const p = a.indexOf(i);
  if (p > -1) {
    a.splice(p, 1);
  } else if (a.length < 3) {
    a.push(i);
  }
  render();
}

function setWeight(k, i, n) {
  weights[k][i] = n;
  render();
}

function score(k) {
  return selections[k].reduce((s, i) => s + (weights[k][i] || 1), 0);
}

function formatSelectedItems(key) {
  const items = selections[key].map((i) => {
    const label = data[key][i][0];
    const weight = weights[key][i] || 1;
    return `${label} (${weight})`;
  });

  return items.length ? items.join("; ") : "None";
}

function buildSpreadsheetRow() {
  return {
    ResponseID: responseId,
    Timestamp: new Date().toISOString(),
    ResearchConsent: consent ? "Yes" : "No",
    Email: participant.email.trim(),
    IndustrySector: participant.industry,
    Employees: participant.employees,
    Postcode: participant.postcode.trim(),
    Address: participant.address.trim(),
    Barriers: formatSelectedItems("barriers"),
    Benefits: formatSelectedItems("benefits"),
    Enablers: formatSelectedItems("support"),
    Decision: decisionLabel(),
    WhatWouldChangeMyMind: magic || ""
  };
}

function decisionLabel() {
  return {
    no: "Definitely would not participate",
    "probably-no": "Probably would not participate",
    "probably-yes": "Probably would participate",
    yes: "Definitely would participate"
  }[decision] || "Not selected";
}

function next() {
  if (step === 9 && decision === "no") {
    step = 11;
    render();
    return;
  }

  step++;
  render();
}

function prev() {
  step--;
  render();
}

function buildResponsePayload() {
  return {
    record_id: responseId,
    ...buildSpreadsheetRow()
  };
}

async function submitResponse() {
  if (!consent) {
    submitState = {
      status: "error",
      message: "Research sharing was not agreed, so submission is disabled."
    };
    render();
    return;
  }

  submitState = { status: "sending", message: "Submitting response..." };
  render();

  try {
    const out = buildResponsePayload();
    const res = await fetch(POWER_AUTOMATE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(out)
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    submitState = {
      status: "success",
      message: `Submitted successfully. Keep response ID ${responseId} for withdrawal requests.`
    };
  } catch (err) {
    submitState = {
      status: "error",
      message: "Submission failed. You can still download your response and retry later."
    };
  }

  render();
}

function downloadResults() {
  const out = buildResponsePayload();

  const text = JSON.stringify(out, null, 2);
  const blob = new Blob([text], { type: "application/json" });
  const u = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = u;
  a.download = "circubee-response-" + Date.now() + ".json";
  a.click();
  URL.revokeObjectURL(u);
}

render();
