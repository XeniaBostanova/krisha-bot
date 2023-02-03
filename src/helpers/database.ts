import { FirebaseApp, initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { child, Database, get, getDatabase, onChildAdded, onChildChanged, onChildMoved, onChildRemoved, ref, set } from "firebase/database";
import { conf } from "../../config.js";


class DatabaseServise {
  app: FirebaseApp;
  db: Database;
  constructor() {
    try {
      this.app = initializeApp({
        ...conf.firebase
      })
      const auth = getAuth();
      signInWithEmailAndPassword(auth, conf.authFirebase.email, conf.authFirebase.password)
        .catch(function (error) {
          const { code, message } = error;
          console.log(`${code} - ${message}`);
      });
      this.db = getDatabase(this.app);
      console.log('Инициализировано');

    } catch {
        console.error('Приложение работает без базы данных!');
    }
  }

  //получить все сохраненные объявления
  getSavedAds(taskId: string): Promise <Collection<Ad>> {
    return new Promise((resolve, reject) => {
      get(child(ref(this.db), 'ads/' + taskId))
        .then((snapshot) => {
          if (snapshot.exists) {
            resolve(snapshot.val() || {});
          } else {
            reject('Нет данных');
          }
        })
        .catch ((error) => {
          reject(error);
        });
    })
  }

  //добавить новое объявление
  setNewAd(ad: Ad): Promise <any> {
    return new Promise((resolve, reject) => {
      set(ref(this.db, 'ads' + '/' + ad.id), ad)
        .then(()=> resolve(''))
        .catch(error => reject(error));
    })
  }

  //получить все задачи
  getTasks(): Promise <Collection<Task>> {
    return new Promise((resolve, reject) => {
      get(child(ref(this.db), 'tasks'))
        .then(snapshot => resolve(snapshot.val()))
        .catch(error => reject(error))
    })
  }

  //подписка на изменение задачи в firebase
  subscribeToTaskChange() {
    let activatePause = true;

    return new Promise(resolve => {
      onChildChanged(ref(this.db, 'tasks'), (sn) => resolve(sn.val()));
      onChildMoved(ref(this.db, 'tasks'), (sn) => resolve(sn.val()));
      onChildRemoved(ref(this.db, 'tasks'), (sn) => resolve(sn.val()));
      onChildAdded(ref(this.db, 'tasks'), (sn) => {
        setTimeout(() => {
          activatePause = false;
        })
        if(!activatePause) {
          resolve(sn.val())
        }
      });
    })
  }
}

const db = new DatabaseServise();
export default db;

export interface Collection <T> {
  [key: string]: T
}

export interface Ad {
  title: string,
  address: string,
  owner: string,
  id: string,
  price: string,
  url: string
}

export interface Task {
  id: string,
  cron: string,
  query: string,
  complex: string
}
