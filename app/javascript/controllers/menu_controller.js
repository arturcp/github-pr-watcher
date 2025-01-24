import { Controller } from "@hotwired/stimulus";
import Config from "models/config";

export default class extends Controller {
  connect() {
    window.addEventListener("group-config:changed", this.load.bind(this));

    this.load();
  }

  disconnect() {
    window.removeEventListener("group-config:changed", this.load.bind(this));
  }

  load() {
    const config = new Config().current();

    if (config) {
      this.show(config);
    }
  }

  show(config) {
    this.element.querySelectorAll("a").forEach((menuItem) => {
      menuItem.remove();
    });

    Object.keys(config).forEach((key) => {
      const menuItem = document.createElement("a");
      menuItem.classList.add("py-2", "cursor-pointer", "hover:bg-zinc-100");
      menuItem.innerText = config[key].name;
      menuItem.setAttribute("href", `/${key}`);
      this.element.appendChild(menuItem);
    });
  }
}
