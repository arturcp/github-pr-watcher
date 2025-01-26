// app/javascript/controllers/favorites_controller.js
import { Controller } from "@hotwired/stimulus";
import Config from "models/config";

export default class extends Controller {
  static targets = ["favoritesList"];

  connect() {
    this.config = new Config();
    const urlParts = window.location.pathname.split("/");
    this.favoritesPage = urlParts[urlParts.length - 1] === "favorites";
    this.slug = this.favoritesPage
      ? urlParts[urlParts.length - 2]
      : urlParts[urlParts.length - 1];
    this.groupConfig = this.config.getConfig(this.slug);

    if (this.hasFavoritesListTarget) {
      this.renderFavorites();
    }
  }

  addNotes(event) {
    const url = event.currentTarget.dataset.url;
    const pr = this.groupConfig.favorites.find(
      (pullRequest) => pullRequest.url === url
    );

    const notes = prompt("Add notes to this pull request", pr.notes);

    if (notes === null) {
      return;
    }

    pr.notes = notes;
    this.config.save(this.slug, this.groupConfig);
    this.renderFavorites();
  }

  editNotes(event) {
    const url = event.currentTarget.dataset.url;
    const pr = this.groupConfig.favorites.find(
      (pullRequest) => pullRequest.url === url
    );

    const notes = prompt("Add notes to this pull request", pr.notes);

    if (notes === null) {
      return;
    }

    pr.notes = notes;
    this.config.save(this.slug, this.groupConfig);
    this.renderFavorites();
  }

  renderFavorites() {
    const favoritedPRs = this.groupConfig.favorites || [];

    if (favoritedPRs.length === 0) {
      this.favoritesListTarget.innerHTML = `
        <p class="text-gray-500">No favorited pull requests found.</p>
      `;
      return;
    }

    this.favoritesListTarget.innerHTML = favoritedPRs
      .map((prUrl) => this.buildFavoriteItem(prUrl))
      .join("");
  }

  buildFavoriteItem(pr) {
    return `
      <li class="bg-white p-4 rounded-lg shadow-sm border border-gray-200 my-1 relative">
        <div>
          <p class="text-lg font-semibold text-gray-800">
            <a href="${pr.url}" target="_blank" class="hover:underline">${
      pr.title
    }</a>
          </p>
          <p class="text-sm text-gray-500">
            <span class="text-indigo-500">${
              pr.repository
            }</span> • Opened by <span class="font-medium">${pr.author}</span>
          </p>
          <p>
            <button class="bg-slate-500 text-sm text-white rounded-md px-2 py-1 mt-2 ${
              pr.notes && pr.notes.length > 0 ? "hidden" : "block"
            }" data-action="click->favorites#addNotes" data-url="${pr.url}">
              Add notes
            </button>
            <div class="bg-slate-100 rounded-md cursor-pointer p-2 mt-4 ${
              pr.notes && pr.notes.length > 0 ? "block" : "hidden"
            }" data-action="click->favorites#editNotes" data-url="${pr.url}">${
      pr.notes
    }</div>
          </p>
        </div>
        <button class="heart-button p-2 rounded-full hover:bg-gray-100 transition-colors top-4 right-4 absolute"
          data-action="click->favorites#toggleFavorite"
          data-url="${pr.url}"
          data-title="${pr.title}"
          data-repository="${pr.repository}"
          data-author="${pr.author}"
          data-created-at="${pr.created_at}">
            <img class="w-6 h-6" src="https://unpkg.com/@tabler/icons-png@3.29.0/icons/outline/trash.png" alt="Remove favorite" />
        </button>
      </li>
    `;
  }

  toggleFavorite(event) {
    const url = event.currentTarget.dataset.url;
    const pr = this.groupConfig.favorites.find(
      (pullRequest) => pullRequest.url === url
    );

    const isFavorited = pr !== undefined;
    const img = event.currentTarget.querySelector("img");

    if (!this.groupConfig.favorites) {
      this.groupConfig.favorites = [];
    }

    if (isFavorited) {
      this.groupConfig.favorites = this.groupConfig.favorites.filter(
        (pullRequest) => pullRequest !== pr
      );

      img.src = img.src.replace("filled", "outline");
    } else {
      const { url, title, repository, author, createdAt } =
        event.currentTarget.dataset;
      this.groupConfig.favorites.push({
        url,
        title,
        repository,
        author,
        createdAt,
      });
      img.src = img.src.replace("outline", "filled");
    }

    this.config.save(this.slug, this.groupConfig);

    if (this.favoritesPage) {
      this.renderFavorites();
    }
  }

  removeFavorite(event) {
    const url = event.currentTarget.dataset.url;
    this.groupConfig.favorites = this.groupConfig.favorites.filter(
      (pullRequest) => pullRequest.url !== url
    );
    this.config.save(this.slug, this.groupConfig);
    this.renderFavorites();
  }
}
