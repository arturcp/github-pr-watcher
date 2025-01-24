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
    "users",
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
      this.users = currentConfig.users || [];
    } else {
      this.nameTarget.value = "";
      this.nameTarget.disabled = false;
      this.organizationTarget.value = "";
      this.tokenTarget.value = "";
      this.users = [];
    }

    this.renderUsers();
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
    if (!this.users) {
      this.users = [];
    }

    const user = this.userTarget.value.trim();
    if (user && user !== "" && !this.users.includes(user)) {
      this.users.push(user.trim());
      this.userTarget.value = "";
      this.renderUsers();
    }
    this.userTarget.focus();
  }

  renderUsers() {
    this.usersTarget.innerHTML = "";
    this.users.forEach((user, index) => {
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
        this.users.splice(index, 1);
        this.renderUsers();
      });
      menuItem.appendChild(trashIcon);

      this.usersTarget.appendChild(menuItem);
    });
  }

  save() {
    this.config.save(this.slug, {
      name: this.nameTarget.value,
      organization: this.organizationTarget.value,
      token: this.tokenTarget.value,
      users: this.users,
    });

    const event = new CustomEvent("group-config:changed", { bubbles: true });
    window.dispatchEvent(event);
  }
}
