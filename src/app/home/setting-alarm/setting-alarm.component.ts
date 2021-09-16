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
  titlePlaceholder: string = `Setting at ${moment(new Date()).format().slice(5,10)}`;
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

  createNotificaiton(key:string, time:Date) {
    var notificationSetting: object = []
    if(this.weekday.length==0) this.weekday = [time.getDay()]
    if (this.breakTime == 0) {
      this.weekday.forEach(day => {
        notificationSetting = {
          title: this.title == null ? this.titlePlaceholder : this.title,
          body: this.content == null ? this.titlePlaceholder : this.content,
          id: Math.random() * 100000,
          schedule: {
            on: {
              weekday: +day,
              hour: time.getHours(),
              minute: time.getMinutes(),
              second: 0,
            },
            at: time,
            repeats: true,
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
        id: Math.random() * 100000,
        schedule: {
          on: {
            hour: time.getHours(),
            minute: time.getMinutes(),
            second: 0,
          },
          at: time
        },
        key: key,
        timerOff: this.timerOff,
        workTime: this.workTime,
        breakTime: this.breakTime,
        breakCount: this.breakCount,
      }
      this.notifications.push(notificationSetting);
    }
    return this.notifications.map(e => {
      LocalNotifications.schedule({ notifications: [e] });
      console.log('Alarm create !',e);
    });
  }

  async saveAndDismissModal() {
    let uuid = uuidv4();
    let onTime = Date.parse(this.time);
    onTime = onTime - (onTime % (60 * 1000))
    // Exception 처리로 count 10번으로 세팅
    let count = this.breakCount == 0 && this.breakTime!=0 && this.timerOff==undefined ?
      this.breakCount= 10 : this.breakCount;
    // 푸시 마감 시간 지정
    let offTime = this.timerOff != undefined ? Date.parse(this.timerOff) :
      onTime + ((this.workTime + this.breakTime) * count * 1000 * 60)
    // Rest count만 입력되었다면 푸시 마감 시간 지정
    this.timerOff = this.timerOff != undefined ? this.timerOff :
      new Date(offTime - (offTime % 60 * 1000))
    // 푸시 시작 시간 지정
    let time = new Date(onTime - (onTime % 60 * 1000))
    
    if (this.breakTime) {
      while (onTime < offTime) {
        time = new Date(onTime)
        await this.createNotificaiton(uuid, time)
        onTime += await (this.workTime * 1000 * 60)
        
        await this.createRestNotificaiton(onTime)
        onTime += await (this.breakTime * 1000 * 60)
        
        if(await this.breakCount!=0) {
          await count--;
          if(await count==0) break;
        }
      }
    }
    else {
      this.createNotificaiton(uuid, time)
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