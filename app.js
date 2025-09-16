/* ================== CONFIG ================== */
const SERVICE = "your-service-id"; // From Skapi Dashboard
const OWNER = "your-owner-id";     // From Skapi Dashboard
const GOOGLE_CLIENT_ID = "your-google-client-id";
const CLIENT_SECRET_NAME = "ggltoken"; // Name you'll use in Skapi Dashboard
const OPENID_LOGGER_ID = "google";
// ⚠️ Update this if you use a different local server port!
const REDIRECT_URL = window.location.origin + window.location.pathname;
const GEMINI_API_KEY = "your-gemini-api-key";

/* ============================================ */

const skapi = new Skapi(SERVICE, OWNER);

// DOM refs
const googleBtn = document.getElementById("googleBtn");
const logoutBtn = document.getElementById("logout");
const authDiv = document.getElementById("auth");
const profile = document.getElementById("profile");
const resumeSection = document.getElementById("resume-section");
const nameEl = document.getElementById("name");
const emailEl = document.getElementById("email");
const picEl = document.getElementById("pic");
const resumeText = document.getElementById("resumeText");
const summarizeBtn = document.getElementById("summarizeBtn");
const summaryDiv = document.getElementById("summary");
const saveSummaryBtn = document.getElementById("saveSummaryBtn");
const savedSection = document.getElementById("saved-section");
const savedSummariesDiv = document.getElementById("savedSummaries");

let latestSummary = "";

// Google login
function googleLogin() {
  const state = Math.random().toString(36).slice(2);
  let url = "https://accounts.google.com/o/oauth2/v2/auth";
  url += "?client_id=" + encodeURIComponent(GOOGLE_CLIENT_ID);
  url += "&redirect_uri=" + encodeURIComponent(REDIRECT_URL);
  url += "&response_type=code";
  url += "&scope=" + encodeURIComponent("openid email profile");
  url += "&prompt=consent";
  url += "&access_type=offline";
  url += "&state=" + encodeURIComponent(state);
  window.location.href = url;
}

async function skapiOpenIdLogin(id, token) {
  if (typeof skapi.openIdLogin === "function") {
    return skapi.openIdLogin({ id, token });
  } else if (typeof skapi.openidLogin === "function") {
    return skapi.openidLogin({ id, token });
  }
}

async function handleRedirect() {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  if (!code) return;
  try {
    const tokenResp = await skapi.clientSecretRequest({
      clientSecretName: CLIENT_SECRET_NAME,
      url: "https://oauth2.googleapis.com/token",
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: {
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: "$CLIENT_SECRET", // Skapi injects the real secret here
        redirect_uri: REDIRECT_URL,
        grant_type: "authorization_code",
      },
    });
    const accessToken = tokenResp.access_token;
    await skapiOpenIdLogin(OPENID_LOGGER_ID, accessToken);
    history.replaceState(null, "", REDIRECT_URL);
    const profileResp = await skapi.getProfile();
    showProfile(profileResp);
  } catch (err) {
    console.error("Redirect handling failed:", err);
  }
}

function showProfile(user) {
  nameEl.textContent = user.name || user.given_name || "Friend";
  emailEl.textContent = user.email || "";
  if (user.picture) picEl.src = user.picture;
  document.querySelector("h2").textContent = `Hello ${user.name || "Friend"} 🚀`;
  authDiv.classList.add("hidden");
  profile.classList.remove("hidden");
  resumeSection.classList.remove("hidden");
  savedSection.classList.remove("hidden");
  loadSummaries();
}

// Load saved summaries
async function loadSummaries() {
  try {
    const records = await skapi.getRecords({
      table: { name: "resume_summaries", access_group: "private" },
      limit: 10,
    });

    savedSummariesDiv.innerHTML = "";

    if (!records.list?.length) {
      savedSummariesDiv.innerHTML = "<p>No saved summaries yet.</p>";
      return;
    }

    records.list.forEach(rec => {
      const div = document.createElement("div");
      div.className = "saved-item";

      div.innerHTML = `
        <p><strong>${new Date(rec.data.date).toLocaleString()}</strong></p>
        <ul>${rec.data.summary
          .split("\n")
          .map(s => `<li>${s.trim()}</li>`)
          .join("")}</ul>
        <hr/>
      `;

      savedSummariesDiv.appendChild(div);
    });
  } catch (err) {
    console.error("Load summaries error:", err);
    savedSummariesDiv.innerHTML = "<p> Failed to load summaries.</p>";
  }
}

// Summarize with Gemini
summarizeBtn.addEventListener("click", async () => {
  const text = resumeText.value.trim();
  if (!text) {
    alert("Please paste your résumé text first.");
    return;
  }
  summaryDiv.innerHTML = "Summarizing...";
  summaryDiv.style.padding = "20px";
  saveSummaryBtn.classList.add("hidden");

  try {
    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=" +
      GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: "Summarize this résumé in 5 bullet points:\n\n" + text }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    let summary = data.candidates?.[0]?.content?.parts?.[0]?.text || "No summary returned.";
    summary = summary.replace(/^\*+/gm, "").trim();

    latestSummary = summary;
    summaryDiv.style.padding = "20px";
    summaryDiv.innerHTML =
      "<h4>Resume Summary:</h4><ul>" +
      summary.split("\n").map(s => `<li>${s.trim()}</li>`).join("") +
      "</ul>";

    saveSummaryBtn.classList.remove("hidden");
  } catch (err) {
    console.error("Gemini API error:", err);
    summaryDiv.innerHTML = "Failed to summarize résumé.";
  }
});

// Save summary in Skapi
saveSummaryBtn.addEventListener("click", async () => {
  if (!latestSummary) return;
  try {
    await skapi.postRecord(
      { summary: latestSummary, date: new Date().toISOString() },
      { table: { name: "resume_summaries", access_group: "private" } }
    );
    alert("✅ Summary saved!");
    loadSummaries();
  } catch (err) {
    console.error("Save error:", err);
    alert("Failed to save summary.");
  }
});

// Init
googleBtn.addEventListener("click", googleLogin);
logoutBtn.addEventListener("click", async () => {
  await skapi.logout();
  profile.classList.add("hidden");
  authDiv.classList.remove("hidden");
  resumeSection.classList.add("hidden");
  savedSection.classList.add("hidden");
  document.querySelector("h2").textContent = "Resume Summarizer 🚀";
});

(async () => {
  try {
    const pr = await skapi.getProfile();
    summaryDiv.style.padding = "0px";
    if (pr) {
      showProfile(pr);
      return;
    }
  } catch { }
  await handleRedirect();
})();
