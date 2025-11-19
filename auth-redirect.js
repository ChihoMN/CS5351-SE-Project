const APP_URL = "https://app.kanbased.com";
const BE_ORIGIN = "https://api.kanbased.com";

async function redirectIfAuthenticated() {
  const response = await fetch(`${BE_ORIGIN}/api/auth/get-session`, {
    credentials: "include",
  });

  if (!response.ok) {
    return;
  }

  const result = await response.text();

  if (!result) {
    return;
  }

  window.location.href = APP_URL;
}

redirectIfAuthenticated();
