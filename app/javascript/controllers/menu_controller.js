import { Controller } from "@hotwired/stimulus";
import Config from "models/config";

export default class extends Controller {
  connect() {
    const config = new Config().current();

    if (config) {
      this.load(config);
    }
  }

  load(config) {
    Object.keys(config).forEach((key) => {
      const menuItem = document.createElement("a");
      menuItem.classList.add("py-2", "cursor-pointer", "hover:bg-zinc-100");
      menuItem.innerText = config[key].name;
      menuItem.setAttribute("href", `/${key}`);
      this.element.appendChild(menuItem);
    });
  }
}
