import axios from "axios";
import jsdom from "jsdom";
const { JSDOM } = jsdom;

const url = 'https://krisha.kz/prodazha/kvartiry/almaty/?das[_sys.hasphoto]=1&das[floor_not_first]=1&das[floor_not_last]=1&das[house.year][from]=2010&das[house.year][to]=2021&das[live.rooms]=2&das[live.square][from]=45&das[map.complex]=876&das[price][to]=45000000';

(async () => {
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
  const items = document.querySelectorAll('.a-card__main-info');
  console.log(items.length);
})()
