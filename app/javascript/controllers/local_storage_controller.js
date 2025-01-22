import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  connect() {
    const dataToSave = {
      "6687da58-86a5-4174-80d2-58f64f0b6242": {
        name: "The RealReal",
        organization: "",
        authors: "",
        token: "",
        slug: "the-realreal",
      },
      "ef8cb28f-4b79-4d02-8e60-00d7b1933d3a": {
        name: "Enigma",
        organization: "enigma-Co",
        authors: "arturcp",
        token: "",
        slug: "enigma",
      },
    };

    localStorage.setItem("config", JSON.stringify(dataToSave));
  }

  store(event) {
    console.log("store");
    // event.preventDefault();
  }
}
