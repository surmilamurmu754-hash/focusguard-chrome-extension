
document.getElementById("startBtn").addEventListener("click", async () => {
  const duration = Number(document.getElementById("duration").value);
  const domain = document.getElementById("domain").value.trim();
  const status = document.getElementById("status");

  if (!Number.isFinite(duration) || duration <= 0 || !domain) {
    status.textContent = "Enter a valid duration and website.";
    return;
  }

  try {
    const response = await chrome.runtime.sendMessage({
      action: "startTimer",
      duration,
      domain
    });

    if (response && response.success) {
      status.textContent = "Focus session started!";
    } else {
      status.textContent = "Please check your inputs.";
    }
  } catch (error) {
    status.textContent = "Error. Reload the extension and try again.";
  }
});
