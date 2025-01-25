import { Controller } from "@hotwired/stimulus";
import Config from "models/config";

export default class extends Controller {
  static targets = [
    "errors",
    "name",
    "organization",
    "saveButton",
    "slug",
    "token",
    "user",
    "authors",
  ];

  connect() {
    this.config = new Config();
  }

  load(event) {
    const element = event.currentTarget;
    this.slug = element.dataset.slug;

    if (this.slug) {
      const currentConfig = this.config.getConfig(this.slug);

      this.nameTarget.value = currentConfig.name;
      this.nameTarget.disabled = true;
      this.organizationTarget.value = currentConfig.organization;
      this.tokenTarget.value = currentConfig.token;
      this.authors = currentConfig.authors || [];
    } else {
      this.nameTarget.value = "";
      this.nameTarget.disabled = false;
      this.organizationTarget.value = "";
      this.tokenTarget.value = "";
      this.authors = [];
    }

    this.renderAuthors();
  }

  slugify() {
    const name = this.nameTarget.value;
    this.slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    this.slugTarget.innerHTML = this.slug;
    if (this.config.getConfig(this.slug)) {
      this.slugTarget.style.color = "#9b0d0d";
      this.saveButtonTarget.disabled = true;
      this.errorsTarget.innerHTML = "This name already exists, choose another";
    } else {
      this.slugTarget.style.color = "inherit";
      this.saveButtonTarget.disabled = false;
      this.errorsTarget.innerHTML = "";
    }
  }

  addUser() {
    if (!this.authors) {
      this.authors = [];
    }

    const user = this.userTarget.value.trim();
    if (user && user !== "" && !this.authors.includes(user)) {
      this.authors.push(user.trim());
      this.userTarget.value = "";
      this.renderAuthors();
    }
    this.userTarget.focus();
  }

  renderAuthors() {
    this.authorsTarget.innerHTML = "";
    this.authors.forEach((user, index) => {
      const menuItem = document.createElement("li");
      menuItem.classList.add(
        "py-1",
        "hover:bg-zinc-100",
        "flex",
        "justify-between",
        "items-center",
        "border-b"
      );

      const userName = document.createElement("span");
      userName.innerText = user;
      menuItem.appendChild(userName);

      const trashIcon = document.createElement("span");
      trashIcon.innerHTML = "🗑️";
      trashIcon.classList.add("cursor-pointer", "ml-2");
      trashIcon.addEventListener("click", () => {
        this.authors.splice(index, 1);
        this.renderAuthors();
      });
      menuItem.appendChild(trashIcon);

      this.authorsTarget.appendChild(menuItem);
    });
  }

  save() {
    this.config.save(this.slug, {
      name: this.nameTarget.value,
      organization: this.organizationTarget.value,
      token: this.tokenTarget.value,
      authors: this.authors,
    });

    const event = new CustomEvent("group-config:changed", { bubbles: true });
    window.dispatchEvent(event);
  }
}
