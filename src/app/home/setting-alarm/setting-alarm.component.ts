import { Component, ViewChild } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { IonSlides, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import * as moment from 'moment';

@Component({
  selector: 'app-setting-alarm',
  templateUrl: './setting-alarm.component.html',
  styleUrls: ['./setting-alarm.component.scss'],
})
export class SettingAlarmComponent {
  title: string = ''
  titlePlaceholder: string = `Alarm ${moment(new Date()).format()}`;
  content: string = '';
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

  createNotificaiton() {
    var notificationSetting: object = []
    const time = new Date(Date.parse(this.time))

    if (this.breakTime == 0) {
      this.weekday.forEach(day => {
        notificationSetting = {
          title: this.title,
          body: this.content,
          id: Date.now(),
          schedule: {
            on: {
              weekday: +day,
              hour: time.getHours(),
              minute: time.getMinutes(),
              second: 0,
            }
          },
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
        title: this.title,
        body: this.content,
        id: Date.now(),
        schedule: {
          on: {
            hour: time.getHours(),
            minute: time.getMinutes(),
            second: 0,
          }
        },
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
    console.log('notifications:', this.notifications)
    return this.notifications;
  }

  public set(key: string, value: any) {
    this._storage?.set(key, value);
  }

  dismissModal() {
    this.modalCtrl.dismiss();
  }

  async saveAndDismissModal() {
    let onTime = Date.parse(this.time)
    let offTime = Date.parse(this.timerOff)


    if (this.timerOff) {
      while (onTime < offTime)
        this.createNotificaiton().map(e => {
          LocalNotifications.schedule({ notifications: [e] })
          setTimeout(async () => this.breakTime * 1000 * 60);
        })
      onTime += onTime + (this.breakTime * 1000 * 60)
    }
    else {
      this.createNotificaiton().map(e => {
        LocalNotifications.schedule({ notifications: [e] })
      })
    }
    for (let notification of this.notifications) {
      await this.storage.set(notification.id, this.notifications)
    }
    this.modalCtrl.dismiss();
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

  // submit() {
  //   this.storage.set(this.notificationSetting.title, this.notificationSetting);

  //   LocalNotifications.registerActionTypes({
  //     types:[
  //       {
  //         id: 'CHAT_MSG',   
  //         actions:[
  //           {         
  //             id: 'respond',
  //             title: 'Respond',
  //             input: true
  //           }
  //         ]
  //       }
  //     ]
  //   });
  //   LocalNotifications.schedule({
  //     notifications: [this.notificationSetting]
  //   });
  // }
}