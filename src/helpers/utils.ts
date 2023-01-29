import { Ad, Collection } from "./database.js";

export function pause(val: 500) {
  return new Promise(resolve => {
    setTimeout(resolve, val);
  })
}

export function compareCollections(src: Collection<Ad>, updates: Collection<Ad>): string[] {
  const srcKeys = Object.keys(src);
  return Object.keys(updates).filter(key => !srcKeys.includes(key));
}


// export function compareCollections(src: Collection<Ad>, updates: Collection<Ad>): string[] {
//   return Object.keys[updates].filter(key => !src[key]);
// }
