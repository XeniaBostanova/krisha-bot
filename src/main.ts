import axios from "axios";
import jsdom from "jsdom";
import { Ad, Collection } from "./helpers/database.js";
import { pause } from "./helpers/utils.js";
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
    const adTitle = node.querySelector('.a-card__title ').textContent;
    newAds[adTitle] = {
      title: adTitle,
      owner: node.querySelector('.owners__label').textContent.trim(),
      price: node.querySelector('.a-card__price').textContent.replace(/\r?\n/g, "").trim(),
      url: node.querySelector('.a-card__image  ').getAttribute('href'),
    }
  })

  console.log(newAds);

  //получить коллекцию сохраненных объявлений с firebase

  //сравнить 2 коллекции

})()
