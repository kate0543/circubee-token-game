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
const teamAvatars = {
  kate: "👩🏻‍🔬",
  ruth: "👩🏼‍🔬",
  ashraful: "👨🏾‍🔬"
};

let step = 0;
let consent = false;
let selections = { barriers: [], benefits: [], support: [] };
let weights = { barriers: {}, benefits: {}, support: {} };
let decision = "";
let magic = "";
const responseId = crypto.randomUUID();
let participant = {
  avatar: "🐝",
  email: "",
  industry: "",
  employees: "",
  postcode: "",
  address: ""
};
let submitState = { status: "idle", message: "" };
const validationState = { email: false, postcode: false };
let participantDetailsChecked = false;

const titles = [
  "Consent",
  "Participant details",
  "Barriers",
  "Benefits",
  "Enablers",
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

  const roundStatus = document.getElementById("round-status");
  const impactStatus = document.getElementById("impact-status");
  const choiceStatus = document.getElementById("choice-status");
  if (roundStatus) {
    roundStatus.textContent = step < 2 ? "Setup" : `${Math.min(step - 1, 3)}/3`;
  }
  if (impactStatus) {
    impactStatus.textContent = step < 5 ? "Pending" : score("benefits") + score("support") - score("barriers");
  }
  if (choiceStatus) choiceStatus.textContent = Object.values(selections).reduce((total, items) => total + items.length, 0);
}

function render() {
  progress();
  const a = document.getElementById("app");

  if (step === 0) {
    a.innerHTML = `
      <div class="card">
        <span class="mission-label">Your mission starts here</span>
        <h2>🐝 Build your CircuBee champion</h2>
        <p>
          You are the decision-maker for a local business. Your mission: build a brilliant CircuBee launch plan, one token at a time. Spot the trouble, chase the good stuff, and unlock the enablers!
        </p>
        <div class="game-signal"><span class="signal-icon">🍯</span> Make smart moves, collect your tokens, and see whether your plan can tip the balance!</div>
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
          <span class="team-avatar">${teamAvatars.kate}</span> <b>Kate Han</b> — k.han3@salford.ac.uk — <a href="https://www.salford.ac.uk/our-staff/kate-han" target="_blank" rel="noopener noreferrer">Profile</a><br>
          <span class="team-avatar">${teamAvatars.ruth}</span> <b>Ruth Hudson</b> — R.A.Hudson@salford.ac.uk — <a href="https://www.salford.ac.uk/our-staff/ruth-hudson" target="_blank" rel="noopener noreferrer">Profile</a><br>
          <span class="team-avatar">${teamAvatars.ashraful}</span> <b>Ashraful Alam</b> — m.a.alam@salford.ac.uk — <a href="https://www.salford.ac.uk/our-staff/md-ashraful-alam" target="_blank" rel="noopener noreferrer">Profile</a>
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
          <button class="btn" onclick="start()">${consent ? "🐝 Enter the hive" : "🐝 Start the challenge"}</button>
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

        const emailInvalid = participantDetailsChecked && !isValidEmail(participant.email);
        const postcodeInvalid = participantDetailsChecked && !isValidPostcode(participant.postcode);
        const industryMissing = participantDetailsChecked && !participant.industry.trim();
        const employeesMissing = participantDetailsChecked && !participant.employees.trim();
        const addressMissing = participantDetailsChecked && !participant.address.trim();

        a.innerHTML = `
          <div class="card">
            <span class="mission-label">Player setup</span>
            <h2>🛠️ Set up your business</h2>
            <div class="player-avatar" title="Your industry avatar">${participant.avatar}</div>
            <p><b>${participant.avatar} Your industry avatar</b> — choose your sector below and your character will match it.</p>
            <p>Tell us who is entering the challenge. Fill every field to unlock Round 1 and get your first token mission.</p>

            <p><b>Email address</b></p>
            <input
              id="participant-email"
              type="email"
              required
              value="${escapeHtml(participant.email)}"
              oninput="setParticipant('email', this.value)"
              onblur="setParticipant('email', this.value); validationState.email = true; render();"
              placeholder="name@example.com"
              class="${emailInvalid ? "field-invalid" : ""}"
              style="width:100%;padding:12px;border:2px solid var(--line);border-radius:11px;font:inherit;"
            >
            ${emailInvalid ? `<div class="validation-message">Please enter a valid email format, for example name@example.com.</div>` : ""}

            <p><b>Industry sector</b></p>
            <select
              id="participant-industry"
              required
              onchange="setParticipant('industry', this.value); render()"
              class="${industryMissing ? "field-required" : ""}"
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
              ${industryMissing ? '<div class="validation-message">Please select an industry sector.</div>' : ""}

            <p><b>Number of employees</b></p>
            <select
              id="participant-employees"
              required
              onchange="setParticipant('employees', this.value)"
              class="${employeesMissing ? "field-required" : ""}"
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
              ${employeesMissing ? '<div class="validation-message">Please select the number of employees.</div>' : ""}

            <p><b>Postcode</b></p>
            <input
              id="participant-postcode"
              type="text"
              required
              value="${escapeHtml(participant.postcode)}"
              oninput="setParticipant('postcode', this.value)"
              onblur="setParticipant('postcode', this.value); validationState.postcode = true; render();"
              placeholder="e.g. M5 4WT"
              class="${postcodeInvalid ? "field-invalid" : ""}"
              style="width:100%;padding:12px;border:2px solid var(--line);border-radius:11px;font:inherit;"
            >
            ${postcodeInvalid ? '<div class="validation-message">Please enter a valid postcode format, for example M5 4WT or OL9 7AA.</div>' : ""}

            <p><b>Address</b></p>
            <textarea
              id="participant-address"
              required
              oninput="setParticipant('address', this.value)"
              class="${addressMissing ? "field-required" : ""}"
              placeholder="Business or organisation address"
            >${escapeHtml(participant.address)}</textarea>
            ${addressMissing ? '<div class="validation-message">Please enter a business or organisation address.</div>' : ""}

            <div class="actions">
              <button class="btn secondary" onclick="prev()">Back</button>
              <button class="btn" onclick="continueFromParticipantDetails()">Unlock Round 1 🐝</button>
            </div>
          </div>
        `;
        return;
      }

      if (step >= 2 && step <= 4) {
        const key = ["barriers", "benefits", "support"][step - 2];
    const head = {
      barriers: "🔴 Barriers",
      benefits: "🟢 Benefits",
      support: "🔵 Enablers"
    }[key];
    const round = {
      barriers: ["Round 1: Spot the friction", "Your business has limited time and attention. Which barrier tokens could block the CircuBee launch?", "Choose up to 3 barrier tokens for your watchlist."],
      benefits: ["Round 2: Find the spark", "Which benefit tokens could get customers and staff excited about CircuBee?", "Choose up to 3 benefit tokens to power up your business."],
      support: ["Round 3: Unlock enablers", "Which enabler tokens could give your CircuBee launch the boost it needs?", "Choose up to 3 enabler tokens to unlock."]
    }[key];

    a.innerHTML = `
      <div class="card">
        <span class="mission-label">Your next move 🐝</span>
        <h2>${round[0]}</h2>
        <div class="round-banner"><span><b>${head}</b><br>${round[1]}</span><span class="selection-count">${selections[key].length}/3 tokens</span></div>
        <p><b>${round[2]}</b> Tap a token to collect it. Tap again to send it back to the hive.</p>
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
          <button class="btn" ${!selections[key].length ? "disabled" : ""} onclick="next()">Lock in tokens 🔒</button>
        </div>
      </div>
    `;
    return;
  }

  if (step === 5) {
    a.innerHTML = `
      <div class="card">
        <span class="mission-label">Power-up round ⚡</span>
        <h2>Assign points to your tokens</h2>
        <div class="round-banner"><span><b>How important is each token?</b><br>Choose a small, medium, or large coin for every selected token. The larger the coin, the bigger its pull on your final balance.</span><span class="selection-count">1-3 points</span></div>
        <p>Tap <b>1</b>, <b>2</b>, or <b>3</b> for each token. <b>1</b> means useful, <b>2</b> means important, and <b>3</b> means critical.</p>
        ${["barriers", "benefits", "support"]
          .map(
            (k) => `
              <h3>${k === "barriers" ? "🔴 Barriers" : k === "benefits" ? "🟢 Benefits" : "🔵 Enablers"}</h3>
              ${selections[k]
                .map(
                  (i) => `
                    <div class="choice">
                      <div class="token-score-label"><b>${data[k][i][0]}</b></div>
                      <div class="weight-controls" aria-label="Assign importance points">
                        ${[1, 2, 3]
                          .map(
                            (n) => `
                              <button class="btn weight-btn ${weights[k][i] === n ? "" : "secondary"}" aria-label="Assign ${n} points" title="${n} point${n === 1 ? "" : "s"}" onclick="setWeight('${k}',${i},${n})"><span class="coin-face coin-${n}">${n}</span></button>
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
          <button class="btn" onclick="next()">Reveal the balance ⚖️</button>
        </div>
      </div>
    `;
    return;
  }

  if (step === 6) {
    const r = score("barriers");
    const g = score("benefits") + score("support");
    const d = g - r;
    const readiness = d > 0 ? "Your CircuBee plan is ready to roll!" : d < 0 ? "Your plan needs a power-up" : "A close call! Your plan is balanced";
    const resultTone = d > 0 ? "You have built strong momentum." : d < 0 ? "A few more enablers could tip the balance." : "You are right on the line between yes and no.";
    const barrierWinner = d < 0;
    const positiveWinner = d > 0;

    a.innerHTML = `
      <div class="card">
        <span class="mission-label">Game complete 🎉</span>
        <h2>⚖️ Strategy showdown!</h2>
        <div class="score-callout"><span class="signal-icon">🐝</span> ${readiness}</div>
        <p style="text-align:center">${resultTone} Watch your tokens take their places on the balance scale!</p>
        <div class="scale">
          <div class="pan ${barrierWinner ? "winner" : ""}">
            <h3>🔴 Barriers</h3>
            <div class="score">${r}</div>
            <small>points</small>
            ${barrierWinner ? '<span class="winner-badge">🏆 Winning side</span>' : ""}
          </div>
          <div class="beam"></div>
          <div class="pan ${positiveWinner ? "winner" : ""}">
            <h3>🟢 + 🔵 Benefits & Enablers</h3>
            <div class="score">${g}</div>
            <small>points</small>
            ${positiveWinner ? '<span class="winner-badge">🏆 Winning side</span>' : ""}
          </div>
        </div>
        <p style="text-align:center;font-weight:700">
          ${
            d > 0
              ? "Benefits and enablers are winning this round!"
              : d < 0
                ? "The barriers are putting up a strong fight."
                : "It is a perfectly even match."
          }
        </p>
        <div class="actions">
          <button class="btn secondary" onclick="prev()">Back</button>
          <button class="btn" onclick="next()">Share your final thought 💬</button>
        </div>
      </div>
    `;
    return;
  }

  if (step === 7) {
    const magicHints = [
      "📚 More information",
      "👋 Meet the whole research team",
      "👥 Know other participants' thoughts",
      "💡 Other ideas"
    ];

    a.innerHTML = `
      <div class="card">
        <span class="mission-label">Reflection &amp; feedback 💬</span>
        <h2>What would change your view?</h2>
        <p>The game is complete! What could give CircuBee an even bigger buzz for you?</p>
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
        <span class="mission-label">Inside the hive 🐝</span>
        <h2>About CircuBee</h2>
        <div class="about-hero">
          <h3>Small changes. Local connections. A bigger circular buzz.</h3>
          <p>CircuBee explores how local businesses and customers can turn everyday choices into a more sustainable community network. Think rewards, reuse, less waste, and more reasons to shop locally.</p>
        </div>

        <div class="hive-facts">
          <div class="hive-fact"><strong>📍 Start local</strong>Salford University and the MediaCity neighbourhood are the first places we are exploring.</div>
          <div class="hive-fact"><strong>♻️ Think circular</strong>We are looking at reuse, waste reduction, sustainable choices, and community connection.</div>
          <div class="hive-fact"><strong>🐝 Build together</strong>Businesses, customers, students, and researchers can help shape what comes next.</div>
        </div>

        <div class="notice">
          <b>🎟️ Participation is free</b><br>
          This research is free to join, and no money is expected from participants. There is no payment required to take part in this project or in the activities described here.
        </div>

        <div class="notice">
          <b>🌱 Where the idea came from</b><br>
          This project grew from an interest in circular economy research and a simple question: how can neighbourhood business networks make sustainable choices easier and more engaging? The first phase looks at local daily routines, commuter patterns, and customer behaviour around Salford University and MediaCity.
        </div>

        <div class="notice">
          <b>🧭 What we are figuring out</b><br>
          Which barriers get in the way? Which benefits create momentum? Which enablers could help a business take the first step? Your Balance Challenge helps us explore those questions before a future pilot is tested.
        </div>

        <div class="notice">
          <b>🗓️ The journey so far</b><br>
          The project began in April 2026. Planned activities include the Social Science Festival from October to November 2026, further data collection until December 2026, and a larger commercial research project expected to benefit more people across 2027.
        </div>

        <div class="notice">
          <b>👋 Meet the research team</b>
          <div class="team-grid">
            <div class="team-member"><span class="team-avatar">${teamAvatars.kate}</span><b>Kate Han</b><br><a href="https://www.salford.ac.uk/our-staff/kate-han" target="_blank" rel="noopener noreferrer">View profile</a><small>Lecturer in Digital Business. Her research spans AI, simulation, digital twins, sustainability, and digital transformation.</small></div>
            <div class="team-member"><span class="team-avatar">${teamAvatars.ruth}</span><b>Ruth Hudson</b><br><a href="https://www.salford.ac.uk/our-staff/ruth-hudson" target="_blank" rel="noopener noreferrer">View profile</a><small>Higher education curriculum developer, researcher, teaching specialist, and Carbon Literacy project lead.</small></div>
            <div class="team-member"><span class="team-avatar">${teamAvatars.ashraful}</span><b>Ashraful Alam</b><br><a href="https://www.salford.ac.uk/our-staff/md-ashraful-alam" target="_blank" rel="noopener noreferrer">View profile</a><small>Associate Professor of Sustainability whose research focuses on sustainability, innovation, governance, and fintech.</small></div>
          </div>
        </div>

        <div class="notice">
          <b>Contact details</b><br>
          If you have any questions about the study, please contact the research team using the email addresses above. You are free to ask questions before deciding whether to take part.
        </div>

        <div class="notice">
          <b>📄 Explore the study documents</b><br>
          <ul class="document-list">
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
        <span class="mission-label">Choose your next move 🎯</span>
        <h2>Would you join the hive?</h2>
        <p>After playing through the challenge, how likely are you to take part in a local circular rewards scheme?</p>
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
          <button class="btn" ${!decision ? "disabled" : ""} onclick="next()">Lock in my decision 🔒</button>
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
          <span class="team-avatar">${teamAvatars.kate}</span> <b>Kate Han</b> — k.han3@salford.ac.uk<br>
          <span class="team-avatar">${teamAvatars.ruth}</span> <b>Ruth Hudson</b> — R.A.Hudson@salford.ac.uk<br>
          <span class="team-avatar">${teamAvatars.ashraful}</span> <b>Ashraful Alam</b> — m.a.alam@salford.ac.uk<br>
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
        <span class="mission-label">Mission complete 🎉</span>
        <h2>🐝 You made the buzz!</h2>
        <p>Your Balance Challenge is complete. Here is the strategy you built for your business.</p>
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
            <h3>Enablers</h3>
            <p>${selections.support.map((i) => data.support[i][0]).join(", ") || "None"}</p>
          </div>
        </div>
        <div class="notice">
          <b>Player avatar:</b> ${participant.avatar}<br>
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

  if (field === "industry") {
    participant.avatar = industryAvatar(value);
  }

  if (field === "email" || field === "postcode") {
    validationState[field] = validationState[field] || !!value.trim();
  }
}

function industryAvatar(industry) {
  if (industry.includes("Retail")) return "🛍️";
  if (industry.includes("Food and drink")) return "🍽️";
  if (industry.includes("Health and beauty")) return "💆";
  if (industry.includes("Professional services")) return "💼";
  if (industry.includes("Creative / media")) return "🎨";
  if (industry.includes("Education / training")) return "📚";
  if (industry.includes("Manufacturing")) return "🏭";
  if (industry.includes("Construction")) return "🦺";
  if (industry.includes("Technology / digital")) return "💻";
  if (industry.includes("Transport / logistics")) return "🚚";
  if (industry.includes("Charity / social enterprise")) return "🤝";
  if (industry.includes("student")) return "🎓";
  return industry ? "♻️" : "🐝";
}

function syncParticipantDetails() {
  const fields = {
    email: "participant-email",
    industry: "participant-industry",
    employees: "participant-employees",
    postcode: "participant-postcode",
    address: "participant-address"
  };

  Object.entries(fields).forEach(([field, id]) => {
    const element = document.getElementById(id);
    if (element) setParticipant(field, element.value);
  });
}

function continueFromParticipantDetails() {
  participantDetailsChecked = true;
  syncParticipantDetails();

  if (participantDetailsComplete()) {
    next();
    return;
  }

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
    PlayerAvatar: participant.avatar,
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
