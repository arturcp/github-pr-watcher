import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  connect() {
    // console.log(this.element);

    let config = localStorage.getItem("config");

    if (config) {
      config = JSON.parse(config);
      console.log(config);
      this.load(config);
    }
  }

  load(config) {
    Object.keys(config).forEach((key) => {
      const menuItem = document.createElement("a");
      menuItem.classList.add("py-2", "cursor-pointer", "hover:bg-zinc-100");
      menuItem.innerText = config[key].name;
      menuItem.setAttribute("href", `/${config[key].slug}`);
      this.element.appendChild(menuItem);
    });
  }
}
