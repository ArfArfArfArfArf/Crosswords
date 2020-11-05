export default class BosstonGlobeParser {
  setUrl(url) {
    return fetch(url)
      .then((response) => response.text())
      .then((text) => new window.DOMParser().parseFromString(text, "text/xml"))
      .then((data) => this.parse(data));
  }

  parse(data) {
    console.log(data);
    const puzTable = data.getElementById('puzzle');

    console.log(puzTable);

    return {};
  }
}
