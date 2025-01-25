import { Controller } from "@hotwired/stimulus";
import Config from "models/config";

export default class extends Controller {
  static targets = ["emptyState", "prList", "title"];

  connect() {
    const url = new URL(window.location.href);
    const slug = url.pathname.split("/").pop();
    const config = new Config();
    const groupConfig = config.getConfig(slug);

    if (!groupConfig) {
      this.showEmptyState();
      console.error(`No config found for slug: ${slug}`);
      return;
    }

    this.titleTarget.innerHTML = groupConfig.name;

    this.groupConfig = groupConfig;

    this.list();
  }

  hideEmptyState() {
    this.emptyStateTarget.classList.add("hidden");
  }

  list() {
    this.prListTarget.innerHTML = `<img class="w-20 animate-spin" src="https://unpkg.com/@tabler/icons-png@3.29.0/icons/outline/loader-2.png" alt="Refresh" />`;
    fetch("/pull_requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        authors: this.groupConfig.authors.join(","),
        organization: this.groupConfig.organization,
        token: this.groupConfig.token,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        this.hideEmptyState();
        console.log(data);
        const insufficientScope =
          data && data.length > 0 && data[0].type === "INSUFFICIENT_SCOPES";

        if (insufficientScope) {
          Swal.fire({
            icon: "error",
            title: "Invalid token",
            text: data[0].message,
          });
        } else if (!data) {
          this.showEmptyState();
        } else {
          this.buildPRList(data);
        }
      })
      .catch((error) => {
        console.error("Error fetching pull requests:", error);
      });
  }

  showEmptyState() {
    this.emptyStateTarget.classList.remove("hidden");
  }

  buildPRList(pullRequests) {
    this.prListTarget.innerHTML = "";

    pullRequests.forEach((pr) => {
      const timeElapsed = this.calculateTimeElapsed(pr.created_at);

      const listItem = document.createElement("li");
      listItem.className =
        "flex items-start gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200 my-1";

      listItem.innerHTML = `
        <input type="checkbox" class="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-300" />
        <div>
          <p class="text-lg font-semibold text-gray-800">${pr.title}</p>
          <p class="text-sm text-gray-500">
            <span class="text-indigo-500">${pr.repository}</span> • Opened by <span class="font-medium">${pr.author}</span>
            <span class="text-green-600">(${timeElapsed})</span>
          </p>
        </div>
      `;

      this.prListTarget.appendChild(listItem);
    });
  }

  calculateTimeElapsed(createdAt) {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffInMs = now - createdDate;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "today";
    if (diffInDays === 1) return "yesterday";
    return `${diffInDays} days ago`;
  }
}
