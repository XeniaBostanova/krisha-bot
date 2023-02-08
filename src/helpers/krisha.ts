import axios from "axios";
import jsdom from "jsdom";
import db, { Ad, Collection, Task } from "./database.js";
import { compareCollections } from "./utils.js";
const { JSDOM } = jsdom;

export class Krisha {
  private baseUrl = 'https://krisha.kz/prodazha/kvartiry/almaty';
  private _updateAds: Collection<Ad>;
  private _task: Task;

  constructor(task: Task) {
    this._task = task;
  }

  get updateAds() {
    return this._updateAds;
  }
  //метод получения новых объявлений
  async getAdsIds(): Promise<string[]> {
    //получить коллекцию сохраненных объявлений с firebase
    const savedAds = await db.getSavedAds(this._task.id);

    for (const complex of this._task.complex) {
      const html = await this.fetchAds(this.baseUrl, complex);
      this._updateAds = {...this._updateAds, ...this.getAdsFromDom(html)}
    }

    const newIds = compareCollections(savedAds, this._updateAds);
    console.log(`Обнаружено ${newIds.length} новых объявлений`);
    return newIds;
  }

  //метод запроса объявлений
  private async fetchAds(baseUrl: string, complex: string): Promise<string> {//html страница в виде строки
    let html: string;

    try {
      const resp = await axios.get(`${baseUrl}/?das[_sys.hasphoto]=1&das[floor_not_first]=1&das[floor_not_last]=1&das[house.year][from]=2010&das[house.year][to]=2021&das[live.rooms][]=1&das[live.rooms][]=2&das[live.square][from]=45&das[map.complex]=${complex}&das[price][to]=45000000`);
      html = resp.data;

    } catch(error) {
      if(axios.isAxiosError(error)) {
        console.log(error);
      } else {
        console.log(error);
      }
    }

    return html;
  }

  //метод парсинга с крыши
  private getAdsFromDom(html: string) {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const items = document.querySelectorAll('.a-card__inc');

    //создать коллекцию новых объявлений
    const newAds: Collection<Ad> = {};

    items.forEach((node) => {
      const adId = node.querySelector('.a-card__image  ').getAttribute('href').replace(/\D+/g, "");
      newAds[adId] = {
        title: node.querySelector('.a-card__title ').textContent,
        address: node.querySelector('.a-card__subtitle ').textContent.trim(),
        owner: node.querySelector('.owners__label').textContent.trim(),
        id: adId,
        price: node.querySelector('.a-card__price').textContent.replace(/\r?\n/g, "").trim(),
        url: node.querySelector('.a-card__image  ').getAttribute('href'),
      }
    })

    return newAds;
  }

}
