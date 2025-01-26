import { Controller } from "@hotwired/stimulus";
import Config from "models/config";

export default class extends Controller {
  static targets = [
    "errors",
    "groupsButton",
    "groupsList",
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
    this.loadGroups();
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
      this.slugTarget.innerHTML = this.slug;
    } else {
      this.nameTarget.value = "";
      this.nameTarget.disabled = false;
      this.organizationTarget.value = "";
      this.tokenTarget.value = "";
      this.authors = [];
      this.slugTarget.innerHTML = "";
    }

    this.renderAuthors();
  }

  loadGroups() {
    const config = new Config().current();
    const groups = Object.keys(config);

    if (groups.length > 0) {
      this.groupsButtonTarget.classList.remove("hidden");
      this.tokenTarget.style.paddingRight = "52px";
    } else {
      this.groupsButtonTarget.classList.add("hidden");
      this.tokenTarget.style.paddingRight = "";
    }
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
    const currentConfig = this.config.getConfig(this.slug) || {};
    this.config.save(this.slug, {
      ...currentConfig,
      name: this.nameTarget.value,
      organization: this.organizationTarget.value,
      token: this.tokenTarget.value,
      authors: this.authors,
    });

    const event = new CustomEvent("group-config:changed", { bubbles: true });
    window.dispatchEvent(event);
  }

  selectGroup(group, token) {
    this.tokenTarget.value = token;
    this.groupsListTarget.classList.add("hidden");
  }

  showGroupsList() {
    const config = new Config().current();
    const groups = Object.keys(config);
    const listElement = this.groupsListTarget.querySelector("ul");

    // If the dropdown is already visible, hide it
    if (!this.groupsListTarget.classList.contains("hidden")) {
      this.groupsListTarget.classList.add("hidden");
      return;
    }

    listElement.innerHTML = "";

    groups.forEach((group) => {
      const li = document.createElement("li");
      li.textContent = group;
      li.classList.add("cursor-pointer", "hover:bg-gray-100", "p-2", "text-sm");
      li.addEventListener("click", () =>
        this.selectGroup(group, config[group].token)
      );
      listElement.appendChild(li);
    });

    this.groupsListTarget.classList.remove("hidden");
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
}
