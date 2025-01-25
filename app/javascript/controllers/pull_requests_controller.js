import { Controller } from "@hotwired/stimulus";
import Config from "models/config";

export default class extends Controller {
  static targets = [
    "emptyState",
    "filters",
    "header",
    "prList",
    "reviewFilter",
    "stateFilter",
    "title",
  ];

  connect() {
    const url = new URL(window.location.href);
    const slug = url.pathname.split("/").pop();
    this.config = new Config();
    const groupConfig = this.config.getConfig(slug);

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
      .then((response) => {
        if (!response.ok) {
          if (response.status === 422) {
            throw new Error("Unprocessable Entity");
          }
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        this.hideEmptyState();

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
        if (error.message === "Unprocessable Entity") {
          Swal.fire({
            icon: "error",
            title: "Unauthorized",
            html: `<div class="text-left text-sm">Check the group's configuration, it seems your token is either invalid or does not have enough scope. <br /> <br /> <div> Remember that the token must have the <strong>repo</strong> and <strong>read:org</strong> permissions, and if you are filtering by organization, you need to authorize the token on the organization before continuing. </div> </div>`,
          });
        } else {
          console.error("Error fetching pull requests:", error);
          this.buildPRList([]);
        }
      });
  }

  showEmptyState() {
    this.emptyStateTarget.classList.remove("hidden");
    this.filtersTarget.classList.add("hidden");
    this.headerTarget.classList.add("hidden");
  }

  buildPRList(pullRequests) {
    this.prListTarget.innerHTML = "";

    const filteredPRs = this.applyFilters(pullRequests);

    if (filteredPRs.length === 0) {
      this.prListTarget.innerHTML = `<p class="text-gray-500">No pull requests match the selected filters.</p>`;
      return;
    }

    const currentUrls = new Set();

    filteredPRs.forEach((pr) => {
      const isChecked = this.groupConfig.reviewed?.includes(pr.url) || false;
      const { elapsedTime, colorClass } = this.calculateTimeElapsed(
        pr.created_at
      );
      currentUrls.add(pr.url);

      const listItem = document.createElement("li");
      listItem.className = `flex items-start gap-4 p-4 rounded-lg shadow-sm border border-gray-200 my-1 ${
        isChecked ? "bg-gray-100" : "bg-white"
      }`;

      listItem.innerHTML = `
        <input type="checkbox" class="w-5 h-5 rounded focus:ring-2 focus:ring-indigo-300 accent-slate-900"
                 data-action="change->pull-requests#togglePullRequest"
                 data-url="${pr.url}"
                 ${isChecked ? "checked" : ""} />
        <div>
          <p class="text-lg font-semibold text-gray-800">${pr.title}</p>
          <p class="text-sm text-gray-500">
            <span class="text-indigo-500">${
              pr.repository
            }</span> • Opened by <span class="font-medium">${pr.author}</span>
            <span class="${colorClass}">(${elapsedTime})</span>
          </p>
        </div>
      `;

      this.prListTarget.appendChild(listItem);
    });

    // Cleanup: Remove URLs from groupConfig.reviewed that are no longer in the list of PRs
    this.cleanupGroupConfig(currentUrls);
  }

  applyFilters(pullRequests) {
    const reviewFilter = this.reviewFilterTarget.value;
    const stateFilter = this.stateFilterTarget.value;
    const currentUser = "arturcp";

    return pullRequests.filter((pr) => {
      const isReviewed = this.groupConfig.reviewed?.includes(pr.url);
      const requiresMyReview = pr.reviewers.includes(currentUser);

      const stateMatches =
        stateFilter === "all" ||
        (stateFilter === "reviewed" && isReviewed) ||
        (stateFilter === "not-reviewed" && !isReviewed);

      const reviewMatches =
        reviewFilter === "all" ||
        (reviewFilter === "my-review" && requiresMyReview);

      return stateMatches && reviewMatches;
    });
  }

  cleanupGroupConfig(currentUrls) {
    const storedUrls = this.groupConfig.reviewed || [];
    const updatedUrls = storedUrls.filter((url) => currentUrls.has(url));
    this.groupConfig.reviewed = updatedUrls;
  }

  togglePullRequest(event) {
    const checkbox = event.target;
    const prUrl = checkbox.dataset.url;

    if (checkbox.checked) {
      if (!this.groupConfig.reviewed) {
        this.groupConfig.reviewed = [];
      }

      if (!this.groupConfig.reviewed.includes(prUrl)) {
        this.groupConfig.reviewed.push(prUrl);
      }

      checkbox.parentElement.classList.add("bg-gray-100");
    } else {
      const index = this.groupConfig.reviewed?.indexOf(prUrl);
      if (index !== -1) {
        this.groupConfig.reviewed.splice(index, 1);
        checkbox.parentElement.classList.remove("bg-gray-100");
      }
    }

    this.config.save(this.slug);
  }

  calculateTimeElapsed(createdAt) {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffInMs = now - createdDate;
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    let elapsedTime = "";
    let colorClass = "text-green-600";

    if (diffInDays === 0) {
      elapsedTime = "today";
    } else if (diffInDays === 1) {
      elapsedTime = "yesterday";
    } else {
      elapsedTime = `${diffInDays} days ago`;
      if (diffInDays > 30) {
        colorClass = "text-red-600";
      }
    }

    return { elapsedTime, colorClass };
  }

  reloadList() {
    this.list();
  }
}
