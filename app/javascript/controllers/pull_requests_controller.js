import { Controller } from "@hotwired/stimulus";
import Config from "models/config";

export default class extends Controller {
  static targets = ["emptyState", "title"];

  connect() {
    const url = new URL(window.location.href);
    const slug = url.pathname.split("/").pop();
    const config = new Config();
    const groupConfig = config.getConfig(slug);

    if (!groupConfig) {
      this.showEmptyState();
      console.error(`No config found for slug: ${slug}`);
      return;
    }

    this.titleTarget.innerHTML = groupConfig.name;

    fetch("/pull_requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        authors: groupConfig.authors.join(","),
        organization: groupConfig.organization,
        token: groupConfig.token,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        this.hideEmptyState();
        console.log(data);
        const insufficientScope =
          data && data.length > 0 && data[0].type === "INSUFFICIENT_SCOPES";

        if (insufficientScope) {
          Swal.fire({
            icon: "error",
            title: "Invalid token",
            text: data[0].message,
          });
        } else if (!data) {
          this.showEmptyState();
        } else {
        }
      })
      .catch((error) => {
        console.error("Error fetching pull requests:", error);
      });
  }

  insuficientScope(data) {}

  showEmptyState() {
    this.emptyStateTarget.classList.remove("hidden");
  }

  hideEmptyState() {
    this.emptyStateTarget.classList.add("hidden");
  }
}
