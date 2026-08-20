# CircuBee Balance Challenge

An interactive decision game for stakeholder engagement and social-science research. Players act as the decision-maker for a local business and build a CircuBee launch strategy.

## Run locally

Open the project in a browser from the local folder, or use the GitHub Pages deployment:

[Open token game follow this link](https://kate0543.github.io/circubee-token-game/)

## GitHub Pages

In the repository, go to **Settings → Pages** and under **Build and deployment** choose:

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/ (root)**

Save the setting. GitHub Pages will publish the site at the repository's Pages URL.

## Current flow

The application now includes a mission-based game journey:

- mission briefing and consent information
- player/business setup with participant details validation
- Round 1: identify barriers that could stop the launch
- Round 2: choose benefits that could create momentum
- Round 3: unlock enablers that could make the idea workable
- energy allocation to show which cards matter most
- strategy balance and readiness outcome
- “What would change your view?” optional response
- “About CircuBee” information page
- participation decision
- follow-up contact page for participants who are open to future contact
- thank-you and summary screen

## Included research documents

The project folder contains downloadable Word documents for participants:

- Participant Information Sheet
- Participant Consent Form
- Research Participant Risk Assessment

These are linked from the About CircuBee page and can be downloaded directly in the browser.

## Current features

- Mission framing with live round, balance, and token HUD
- Barrier, benefit, and enabler tokens
- Maximum three selections per category
- Priority weighting from 1–3 energy
- Balance calculation with a readiness result
- Participation decision
- Optional “What would change your view?” response with clickable suggestion chips
- Email and postcode format validation
- Research-team contact and withdrawal information
- Local JSON export of the participant's responses
- Responsive layout for desktop and mobile

## Research / ethics note

The current site does not send responses to a server or database by default. The **Download my response** function saves a JSON file locally on the participant's device. The project also includes participant information, consent, and risk-assessment documents for review and use in research and ethics processes.

If responses are later collected centrally for research, the data-collection mechanism, privacy notice, consent process, and storage arrangements should be reviewed under the relevant institutional ethics and data-protection requirements before deployment.
