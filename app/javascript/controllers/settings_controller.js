import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["toggleSwitch"];
  static AUTO_REFRESH_INTERVAL = 300000;

  connect() {
    const autoRefresh = localStorage.getItem("autoRefresh") === "true";
    this.toggleSwitchTarget.checked = autoRefresh;

    // If auto-refresh is enabled, start the interval
    if (autoRefresh) {
      this.startAutoRefresh();
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
}
