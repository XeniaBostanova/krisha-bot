import db, { Task } from "./helpers/database.js";
import { pause } from "./helpers/utils.js";
import { CronJob, CronTime } from 'cron';
import { Krisha } from "./helpers/krisha.js";

function isValidCronExpression(expression) {
  try {
    new CronTime(expression);
    return true;
  } catch (e) {
    return false;
  }
}

function createJob(task: Task): CronJob {
  console.log(`Создается задача ${task.id}`);
  if (!isValidCronExpression(task.cron)) {
    console.error(`Invalid cron expression: ${task.cron}`);
  }

  return new CronJob(task.cron, async () => {
    const krisha = new Krisha(task);
    console.log(`Запускается задача ${task.id}`);

    try {
      const newIds = await krisha.getAdsIds();

      for (const id of newIds) {
        await db.setNewAd(task.id, krisha.updateAds[id]);
        await pause(300);
      }
    } catch (err) {
      console.error(err);
    }
  });
}

async function run() {
  const jobs = []; //для хранения cronJobs
  await pause(5000);
  let fullTasks = []; //для хранения задач, полученных из firebase

  try {
    fullTasks = Object.values(await db.getTasks());
    console.log('Получен список задач');
  } catch(err) {
    console.error(err);
  }

  for (const task of fullTasks) {
    const job = createJob(task);
    job.start();
    jobs.push(job);
  }

  //подписываемся на обновление задач
  db.subscribeToTaskChange()
    .then(() => {
      jobs.forEach((j: CronJob) => j.stop());
      run();
    })

}

run();
