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
  ];

  connect() {
    this.config = new Config();
  }

  load(event) {
    const element = event.currentTarget;
    this.slug = element.dataset.slug;
    const currentConfig = this.config.getConfig(this.slug);

    this.nameTarget.value = currentConfig.name;
    this.nameTarget.disabled = true;
    this.organizationTarget.value = currentConfig.organization;
    this.tokenTarget.value = currentConfig.token;
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

  save() {
    this.config.save(this.slug, {
      name: this.nameTarget.value,
      organization: this.organizationTarget.value,
      token: this.tokenTarget.value,
    });

    const event = new CustomEvent("form:saved", { bubbles: true });
    this.element.dispatchEvent(event);
  }
}
