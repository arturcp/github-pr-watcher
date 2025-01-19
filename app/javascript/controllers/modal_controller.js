import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["modal"];

  connect() {}

  open() {
    this.modalTarget.classList.remove("hidden");
    this.modalTarget.classList.add("opacity-100");
    this.modalTarget.classList.remove("opacity-0");
  }

  close() {
    this.modalTarget.classList.remove("opacity-100");
    this.modalTarget.classList.add("opacity-0");

    // Ensure `hidden` is added after the animation ends
    this.modalTarget.addEventListener(
      "transitionend",
      () => {
        this.modalTarget.classList.add("hidden");
      },
      { once: true } // Ensures the listener is removed after it's triggered
    );
  }

  stopClose(event) {
    event.stopPropagation();
  }
}
