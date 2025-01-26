export default class Config {
  constructor() {
    this.data = this.current();
  }

  current() {
    const config = localStorage.getItem("config");
    this.data = {};

    if (config) {
      this.data = JSON.parse(config);
    }

    return this.data;
  }

  delete(slug) {
    delete this.data[slug];
    localStorage.setItem("config", JSON.stringify(this.data));
  }

  getConfig(slug) {
    return this.data[slug];
  }

  save(slug, config) {
    this.data[slug] = config;
    localStorage.setItem("config", JSON.stringify(this.data));
  }
}
