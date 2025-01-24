import { Controller } from "@hotwired/stimulus";
import Config from "models/config";

export default class extends Controller {
  delete(event) {
    const config = new Config();
    const element = event.currentTarget;
    const slug = element.dataset.slug;

    if (!slug) {
      return;
    }
    const currentConfig = config.getConfig(slug);

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        config.delete(slug);
        const event = new CustomEvent("group-config:changed", {
          bubbles: true,
        });
        this.element.dispatchEvent(event);

        Swal.fire({
          title: "Deleted!",
          text: `Group ${currentConfig.name} has been deleted.`,
          icon: "success",
        }).then((result) => {
          // redirect user to /
          window.location.href = "/";
        });
      }
    });
  }
}
