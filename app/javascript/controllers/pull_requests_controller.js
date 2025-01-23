import { Controller } from "@hotwired/stimulus";
import Config from "models/config";

export default class extends Controller {
  connect() {
    console.log("Hello, Stimulus!", this.element);
    const url = new URL(window.location.href);
    const slug = url.pathname.split("/").pop();
    const config = new Config();
    const groupConfig = config.getConfig(slug);

    if (!groupConfig) {
      console.error(`No config found for slug: ${slug}`);
      return;
    }

    fetch("/pull_requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        authors: groupConfig.authors,
        organization: groupConfig.organization,
        token: groupConfig.token,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response data
        console.log(data);
      })
      .catch((error) => {
        console.error("Error fetching pull requests:", error);
      });

    // Render pull requests
    // extra:
    // Consider using storage instead of localStorage
    // https://stackoverflow.com/questions/24279495/window-localstorage-vs-chrome-storage-local
  }
}
