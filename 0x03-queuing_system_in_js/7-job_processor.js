import { createQueue, Job } from 'kue';

const queue = createQueue();
const BLACKLISTED_NUMBERS = ['4153518780', '4153518781'];

const sendNotification = (phoneNumber, message, job, done) => {
  let totalNotifications = 2;
  let pendingNotifications = 2;
  let sendInterval = setInterval(() => {
    if (totalNotifications - pendingNotifications <= totalNotifications / 2) {
      job.progress(totalNotifications - pendingNotifications, totalNotifications);
    }

    if (BLACKLISTED_NUMBERS.includes(phoneNumber)) {
      done(new Error(`Phone number ${phoneNumber} is blacklisted`));
      clearInterval(sendInterval);
      return;
    }

    if (totalNotifications === pendingNotifications) {
      console.log(
        `Sending notification to ${phoneNumber}`,
        `with message: ${message}`,
      );
    }
    --pendingNotifications || done();
    pendingNotifications || clearInterval(sendInterval);
  }, 1000);
}

queue.process('push_notification_code_2', 2, (job, done) => {
  sendNotification(job.data.phoneNumber, job.data.message, job, done);
});