import { Controller } from "@hotwired/stimulus";
import Config from "models/config";

export default class extends Controller {
  static targets = ["errors", "name", "saveButton", "slug"];

  connect() {
    this.config = new Config();
    console.log(this.config.current());
  }

  slugify() {
    const name = this.nameTarget.value;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    this.slugTarget.innerHTML = slug;
    if (this.config.getConfig(slug)) {
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
