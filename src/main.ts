import axios from "axios";
import jsdom from "jsdom";
import db, { Ad, Collection } from "./helpers/database.js";
import { compareCollections, pause } from "./helpers/utils.js";
const { JSDOM } = jsdom;

const url = 'https://krisha.kz/prodazha/kvartiry/almaty/?das[_sys.hasphoto]=1&das[floor_not_first]=1&das[floor_not_last]=1&das[house.year][from]=2010&das[house.year][to]=2021&das[live.rooms]=2&das[live.square][from]=47&das[map.complex]=997&das[price][to]=45000000';

(async () => {

  //необходимо, чтобы firebase успела инициализироваться
  await pause(500);

  let html: string;

  try {
    const resp = await axios.get(url);
    html = resp.data;


  } catch(error) {
    if(axios.isAxiosError(error)) {
      console.log(error);
    } else {
      console.log(error);
    }
  }

  const dom = new JSDOM(html);
  const document = dom.window.document;
  const items = document.querySelectorAll('.a-card__inc');

  //создать коллекцию новых объявлений
  const newAds: Collection<Ad> = {};

  items.forEach((node) => {
    const adId = node.querySelector('.a-card__image  ').getAttribute('href').replace(/\D+/g, "");
    newAds[adId] = {
      title: node.querySelector('.a-card__title ').textContent,
      owner: node.querySelector('.owners__label').textContent.trim(),
      id: adId,
      price: node.querySelector('.a-card__price').textContent.replace(/\r?\n/g, "").trim(),
      url: node.querySelector('.a-card__image  ').getAttribute('href'),
    }
  })

  console.log(newAds);

  //получить коллекцию сохраненных объявлений с firebase

  const savedAds = await db.getSavedAds();

  //сравнить 2 коллекции

  const newTitleAd = compareCollections(savedAds, newAds);
  console.log(newTitleAd);

})()
