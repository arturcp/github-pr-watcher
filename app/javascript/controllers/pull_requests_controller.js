import { Controller } from "@hotwired/stimulus";
import Config from "models/config";

export default class extends Controller {
  static targets = [
    "emptyState",
    "filters",
    "header",
    "prList",
    "prTypeFilter",
    "reviewFilter",
    "stateFilter",
    "title",
  ];

  connect() {
    window.addEventListener("group-config:changed", this.initialize.bind(this));
    this.initialize();
  }

  disconnect() {
    window.removeEventListener(
      "group-config:changed",
      this.initialize.bind(this)
    );
  }

  initialize() {
    this.config = new Config();
    this.loadGroupConfig();
    this.titleTarget.innerHTML = this.groupConfig.name;
    this.loadFilters();
    this.list();
  }

  loadGroupConfig() {
    const url = new URL(window.location.href);
    const slug = url.pathname.split("/").pop();
    const groupConfig = this.config.getConfig(slug);

    if (!groupConfig) {
      this.showEmptyState();
      console.error(`No config found for slug: ${slug}`);
      return;
    }

    this.groupConfig = groupConfig;
  }

  hideEmptyState() {
    this.emptyStateTarget.classList.add("hidden");
  }

  list() {
    this.saveFilters();
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
        group: this.slug,
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
          this.updateTabBadge(0);
        } else {
          // Cleanup: Remove URLs from groupConfig.reviewed that are no longer in the list of PRs
          const currentUrls = new Set(data.map((pr) => pr.url));
          this.cleanupGroupConfig(currentUrls);

          this.buildPRList(data);

          // Calculate unreviewed PRs and update the tab badge
          const unreviewedPRs = data.filter(
            (pr) => !this.groupConfig.reviewed?.includes(pr.url)
          );
          this.updateTabBadge(unreviewedPRs.length);
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
          this.updateTabBadge(0);
        }
      });
  }

  loadFilters() {
    const url = new URL(window.location.href);

    const savedFilters = JSON.parse(
      localStorage.getItem(`filters-${url.pathname}`)
    );

    if (savedFilters) {
      if (this.hasReviewFilterTarget && savedFilters.reviewFilter) {
        this.reviewFilterTarget.value = savedFilters.reviewFilter;
      }

      if (this.hasStateFilterTarget && savedFilters.stateFilter) {
        this.stateFilterTarget.value = savedFilters.stateFilter;
      }

      if (this.hasPrTypeFilterTarget && savedFilters.prTypeFilter) {
        this.prTypeFilterTarget.value = savedFilters.prTypeFilter;
      }
    }
  }

  saveFilters() {
    const url = new URL(window.location.href);

    const filters = {
      reviewFilter: this.reviewFilterTarget.value,

      stateFilter: this.stateFilterTarget.value,

      prTypeFilter: this.prTypeFilterTarget.value,
    };

    localStorage.setItem(`filters-${url.pathname}`, JSON.stringify(filters));
  }

  showEmptyState() {
    this.emptyStateTarget.classList.remove("hidden");
    this.filtersTarget.classList.add("hidden");
    this.headerTarget.classList.add("hidden");
  }

  updateTabBadge(count) {
    const baseTitle = "GitHub PR Watcher";
    if (count > 0) {
      document.title = `(${count}) ${baseTitle}`;
    } else {
      document.title = baseTitle;
    }
  }

  buildPRList(pullRequests) {
    this.prListTarget.innerHTML = "";

    const filteredPRs = this.applyFilters(pullRequests);

    if (filteredPRs.length === 0) {
      this.prListTarget.innerHTML = `<p class="text-gray-500">No pull requests match the selected filters.</p>`;
      return;
    }

    filteredPRs.forEach((pr) => {
      const isApproved = this.isPrApproved(pr);
      const isChecked = this.groupConfig.reviewed?.includes(pr.url);
      const isFavorited =
        this.groupConfig.favorites?.find(
          (pullRequest) => pullRequest.url === pr.url
        ) !== undefined;
      const { elapsedTime, colorClass } = this.calculateTimeElapsed(
        pr.created_at
      );

      const bgColor = this.prItemBgColor(pr);
      const draftClasses = `border-2 border-dashed border-slate-300 after:content-['Draft'] after:absolute after:top-1/2 after:right-20 after:-translate-y-1/2 after:text-3xl after:font-bold after:text-gray-200 after:pointer-events-none after:z-10`;
      const listItem = document.createElement("li");
      listItem.className = `flex items-start gap-4 p-4 rounded-lg shadow-sm ${
        pr.is_draft ? draftClasses : "border"
      } border-gray-200 my-1 mr-2 relative ${bgColor}`;

      const checkbox = `<input type="checkbox" class="w-5 h-5 rounded focus:ring-2 focus:ring-indigo-300 accent-slate-900 ${
        isApproved ? "hidden" : ""
      }" data-action="change->pull-requests#togglePullRequest" data-url="${
        pr.url
      }" ${isChecked ? "checked" : ""} />`;

      const approvedMark = `<img class="w-6 h-6 ${
        isApproved ? "" : "hidden"
      }" src="https://unpkg.com/@tabler/icons-png@3.29.0/icons/outline/check.png" alt="Approved" />`;

      const prTitle = `<a href="${pr.url}" target="_blank" class="hover:underline">${pr.title}</a>`;

      const commentsAndApprovals = `<div class="flex gap-1 mr-4 items-center float-left bg-gray-100 px-2 rounded-md">
        <img class="w-4 h-4" src="https://unpkg.com/@tabler/icons-png@3.29.0/icons/filled/message.png" alt="Comments" />
        <span class="text-sm">${pr.comments}</span>
        <span class="ml-1 text-gray-300">|</span>
        <img class="w-4 h-4" src="https://unpkg.com/@tabler/icons-png@3.29.0/icons/outline/check.png" alt="Approvals" />
        <span class="text-sm ${
          pr.approvals >= 2 ? "text-green-600" : "text-red-500"
        }">${pr.approvals}</span>
      </div>`;

      const repositoryAndAuthor = `<div class="float-left">
          <span class="text-indigo-500">${pr.repository}</span> • Opened by <span class="font-medium">${pr.author}</span>
          <span class="${colorClass}">(${elapsedTime})</span>
         </div>`;

      const favoriteButton = `<button class="heart-button p-2 rounded-full hover:bg-gray-100 transition-colors top-4 right-4 absolute"
            data-action="click->favorites#toggleFavorite"
            data-url="${pr.url}"
            data-title="${pr.title}"
            data-repository="${pr.repository}"
            data-author="${pr.author}"
            data-created-at="${pr.created_at}">
          <img class="w-6 h-6" src="https://unpkg.com/@tabler/icons-png@3.29.0/icons/${
            isFavorited ? "filled" : "outline"
          }/heart.png" alt="Favorite" />
        </button>`;

      listItem.innerHTML = `
        ${checkbox}
        ${approvedMark}
        <div>
          <p class="text-lg font-semibold text-gray-800">
            ${prTitle}
          </p>
          <p class="text-sm text-gray-500">
            ${commentsAndApprovals}
            ${repositoryAndAuthor}
          </p>
        </div>
        ${favoriteButton}
      `;

      this.prListTarget.appendChild(listItem);
    });
  }

  prItemBgColor(pr) {
    const isApproved = this.isPrApproved(pr);
    const isChecked = this.groupConfig.reviewed?.includes(pr.url) || isApproved;
    const bgColor = isApproved
      ? "bg-green-50"
      : isChecked
      ? "bg-gray-100"
      : "bg-white";

    return bgColor;
  }

  isPrApproved(pr) {
    const currentUser = localStorage.getItem("githubHandle") || "";
    const currentUserApproval =
      currentUser !== ""
        ? pr.reviews.find(
            (r) => r.author === currentUser && r.state === "APPROVED"
          )
        : null;

    const isApproved =
      currentUserApproval !== null && currentUserApproval !== undefined;

    return isApproved;
  }

  applyFilters(pullRequests) {
    const reviewFilter = this.reviewFilterTarget.value;
    const stateFilter = this.stateFilterTarget.value;
    const prTypeFilter = this.prTypeFilterTarget.value;
    const currentUser = localStorage.getItem("githubHandle") || "";

    return pullRequests.filter((pr) => {
      const isReviewed = this.groupConfig.reviewed?.includes(pr.url);
      const isApproved = this.isPrApproved(pr);
      const requiresMyReview = pr.reviewers.includes(currentUser);

      const stateMatches =
        stateFilter === "all" ||
        (stateFilter === "reviewed" && (isReviewed || isApproved)) ||
        (stateFilter === "not-reviewed" && !isReviewed && !isApproved) ||
        (stateFilter === "approved" && isApproved) ||
        (stateFilter === "not-approved" && !isApproved);

      const reviewMatches =
        reviewFilter === "all" ||
        (reviewFilter === "my-review" && requiresMyReview);

      const prTypeMatches =
        prTypeFilter === "all" ||
        (prTypeFilter === "drafts" && pr.is_draft) ||
        (prTypeFilter === "not-drafts" && !pr.is_draft);

      return stateMatches && reviewMatches && prTypeMatches;
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
    checkbox.parentElement.classList.remove("bg-green-50");

    if (checkbox.checked) {
      if (!this.groupConfig.reviewed) {
        this.groupConfig.reviewed = [];
      }

      if (!this.groupConfig.reviewed.includes(prUrl)) {
        this.groupConfig.reviewed.push(prUrl);
      }

      checkbox.parentElement.classList.add("bg-gray-100");
      checkbox.parentElement.classList.remove("bg-white");
    } else {
      const index = this.groupConfig.reviewed?.indexOf(prUrl);
      if (index !== -1) {
        this.groupConfig.reviewed.splice(index, 1);
        checkbox.parentElement.classList.remove("bg-gray-100");
        checkbox.parentElement.classList.add("bg-white");
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
