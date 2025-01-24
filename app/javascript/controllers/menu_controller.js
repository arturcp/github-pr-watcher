import { Controller } from "@hotwired/stimulus";
import Config from "models/config";

export default class extends Controller {
  connect() {
    this.element.addEventListener("form:saved", this.load.bind(this));

    this.load();
  }

  disconnect() {
    this.element.removeEventListener("form:saved", this.load.bind(this));
  }

  load(event) {
    const config = new Config().current();

    if (config) {
      this.show(config);
    }
  }

  show(config) {
    Object.keys(config).forEach((key) => {
      const menuItem = document.createElement("a");
      menuItem.classList.add("py-2", "cursor-pointer", "hover:bg-zinc-100");
      menuItem.innerText = config[key].name;
      menuItem.setAttribute("href", `/${key}`);
      this.element.appendChild(menuItem);
    });
  }
}
