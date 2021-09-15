import { Component, ViewChild } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { IonSlides, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import * as moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-setting-alarm',
  templateUrl: './setting-alarm.component.html',
  styleUrls: ['./setting-alarm.component.scss'],
})
export class SettingAlarmComponent {
  title: string = null;
  titlePlaceholder: string = moment(new Date()).format().slice(0,16);
  content: string = null;
  notifications = []
  time: any;
  weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  weekday = []

  timerOff: any;
  workTime = 0;
  breakTime = 0;
  breakCount = 0;

  private _storage: Storage | null = null;

  constructor(
    private modalCtrl: ModalController,
    private storage: Storage,
  ) {
    this._storage = this.storage;
  }
  
  set(key: string, value: any) {
    this._storage?.set(key, value);
  }

  dismissModal() {
    this.modalCtrl.dismiss();
  }

  createNotificaiton(key:string, id:number, time:Date) {
    var notificationSetting: object = []

    if (this.breakTime == 0) {
      this.weekday.forEach(day => {
        notificationSetting = {
          title: this.title == null ? this.titlePlaceholder : this.title,
          body: this.content == null ? this.titlePlaceholder : this.content,
          id: id,
          schedule: {
            on: {
              weekday: +day,
              hour: time.getHours(),
              minute: time.getMinutes(),
              second: 0,
            }
          },
          key: key,
          timerOff: this.timerOff,
          workTime: this.workTime,
          breakTime: this.breakTime,
          breakCount: this.breakCount,
        }
        this.notifications.push(notificationSetting);
      })
    }
    else {
      notificationSetting = {
        title: this.title == null ? this.titlePlaceholder : this.title,
        body: this.content == null ? this.titlePlaceholder : this.content,
        id: id,
        schedule: {
          on: {
            hour: time.getHours(),
            minute: time.getMinutes(),
            second: 0,
          }
        },
        key: key,
        timerOff: this.timerOff,
        workTime: this.workTime,
        breakTime: this.breakTime,
        breakCount: this.breakCount,
        // at: new Date(Date.now() + 1000),
        // allowWhileIdle:true,
        // every:'minute',
        // count: 3,
        // actionTypeId:'CHAT_MSG',
      }
      this.notifications.push(notificationSetting);
    }
    return this.notifications.map(e => {
      console.log('Alarm create !',e);
      LocalNotifications.schedule({ notifications: [e] });
    });
  }

  async saveAndDismissModal() {
    let onTime = Date.parse(this.time);
    let offTime = Date.parse(this.timerOff);
    let count = this.breakCount;
    let uuid = uuidv4();

    if (this.timerOff) {
      while (onTime < offTime) {
        const time = new Date(onTime)
        let randomId = Math.random() * 100000
        let dataList = await this.createNotificaiton(uuid, randomId, time)
        console.log('time:',time)

        onTime += await (this.workTime * 1000 * 60)
        await this.createRestNotificaiton(onTime)
        onTime += await (this.breakTime * 1000 * 60)
      }
    }
    else {
      const time = new Date(onTime)
      let randomId = Math.random() * 100000
      this.createNotificaiton(uuid, randomId, time)
    }
    await this.storage.set(uuid, this.notifications)
    this.modalCtrl.dismiss();
  }

  async createRestNotificaiton(time: number) {
    const restTime = new Date(time)
    console.log('restTime:',restTime);
    await LocalNotifications.schedule({
      notifications: [{
          title: 'Time for rest !',
          body: `It's time for rest`,
          id: Math.random() * 100000,
          schedule: {
            at: restTime
          }
        }]
    })
  }

  // For slides
  @ViewChild(IonSlides) slides: IonSlides;

  ionViewDidEnter() {
    this.slides.update();
  }

  async lockSwipes(lock: boolean) {
    await this.slides.lockSwipes(lock);
  }

  next(slide, index) {
    slide.slideTo(index)
  }
}