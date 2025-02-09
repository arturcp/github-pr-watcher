import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["githubHandleInput", "toggleSwitch"];
  static AUTO_REFRESH_INTERVAL = 1200000;

  connect() {
    const autoRefresh = localStorage.getItem("autoRefresh") === "true";
    this.toggleSwitchTarget.checked = autoRefresh;

    if (autoRefresh) {
      this.startAutoRefresh();
    }

    const githubHandle = localStorage.getItem("githubHandle") || "";
    if (this.hasGithubHandleInputTarget) {
      this.githubHandleInputTarget.value = githubHandle;
    }
  }

  saveGithubHandle(event) {
    const githubHandle = event.target.value.trim();
    localStorage.setItem("githubHandle", githubHandle);
  }

  startAutoRefresh() {
    this.refreshInterval = setInterval(() => {
      location.reload();
    }, this.constructor.AUTO_REFRESH_INTERVAL);
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }

  toggleAutoRefresh(event) {
    const isEnabled = event.target.checked;

    localStorage.setItem("autoRefresh", isEnabled);

    if (isEnabled) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  }
}
