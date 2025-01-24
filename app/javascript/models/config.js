export default class Config {
  constructor() {
    const config = localStorage.getItem("config");
    this.data = {};

    if (config) {
      this.data = JSON.parse(config);
    }
    // else {
    //   // temporary to help me debug
    //   const dataToSave = {
    //     "the-realreal": {
    //       name: "The RealReal",
    //       organization: "",
    //       authors: "",
    //       token: "",
    //     },
    //     enigma: {
    //       name: "Enigma",
    //       organization: "enigma-Co",
    //       authors: "arturcp",
    //       token: "",
    //     },
    //   };

    //   localStorage.setItem("config", JSON.stringify(dataToSave));
    //   this.data = dataToSave;
    // }
  }

  current() {
    return this.data;
  }

  getConfig(slug) {
    return this.data[slug];
  }

  save(slug, config) {
    this.data[slug] = config;
    localStorage.setItem("config", JSON.stringify(this.data));
  }
}
