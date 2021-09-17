import { Component, ViewChild } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { IonSlides, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-setting-alarm',
  templateUrl: './setting-alarm.component.html',
  styleUrls: ['./setting-alarm.component.scss'],
})
export class SettingAlarmComponent {
  title: string = null;
  titlePlaceholder: string = `Setting at ${new Date().getMonth()}/${new Date().getDay()} ${new Date().getHours()}:${new Date().getMinutes() < 10 ? '0'+new Date().getMinutes():new Date().getMinutes()}`;
  content: string = null;
  notifications = []
  time: Date;
  weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  weekday = []
  timerOff: Date;
  workTime = 0;
  breakTime = 0;
  breakCount = 0;
  repeatValue: boolean;

  private _storage: Storage | null = null;

  constructor(
    private modalCtrl: ModalController,
    private storage: Storage,
  ) {
    this._storage = this.storage;
  }
  
  dismissModal() {
    this.modalCtrl.dismiss();
  }

  async workNotificaiton(key:string, time:Date) {
    var notificationSetting: object = []
    if(this.weekday.length==0) {this.weekday = [time.getDay()]}
    if (this.breakTime == 0) {
      this.weekday.forEach(async day => {
        notificationSetting = {
          title: this.title == null ? this.titlePlaceholder : this.title,
          body: this.content == null ? this.titlePlaceholder : this.content,
          id: Math.floor(Math.random() * Math.pow(10,8)),
          schedule: {
            on: {
              weekday: +day,
              hour: time.getHours(),
              minute: time.getMinutes(),
              second: 0,
            },
            // at: time,
            // repeats: this.repeatValue = new Date(Date.now()) == time ? true: false,
          },
          extra: {
            key: key,
            timerOff: new Date(this.timerOff),
            workTime: this.workTime,
            breakTime: this.breakTime,
            breakCount: this.breakCount,
          },
          sound: "beep.wav"
        }
        await this.notifications.push(notificationSetting);
      })
    }
    else {
      notificationSetting = {
        title: this.title == null ? this.titlePlaceholder : this.title,
        body: this.content == null ? this.titlePlaceholder : this.content,
        id: Math.floor(Math.random() * Math.pow(10,8)),
        schedule: {
          on: {
            hour: time.getHours(),
            minute: time.getMinutes(),
            second: 0,
          },
          // at: time
        },
        sound: "beep.wav",
        extra: {
          key: key,
          timerOff: new Date(this.timerOff),
          workTime: this.workTime,
          breakTime: this.breakTime,
          breakCount: this.breakCount,
        }
      },
        await this.notifications.push(notificationSetting);
    }
  }

  set(key: string, value: any) {
    this._storage?.set(key, value);
  }
  
  async saveAndDismissModal() {
    let uuid = uuidv4();
    let onTime = Date.parse(this.time.toString());
    onTime = onTime - (onTime % (60 * 1000));

    // Exception 처리로 count 10번으로 세팅
    let count = this.breakCount == 0 && this.breakTime!=0 && this.timerOff==undefined ?
      10 : this.breakCount;
    this.breakCount = count; // 위에 합치기 // 예외 처리로 10 지정해준 거 반영

    // 푸시 마감 시간 지정
    let offTime = this.timerOff != undefined ? Date.parse(this.timerOff.toString()) :
      onTime + ((this.workTime + this.breakTime) * count * 1000 * 60);

    // break count만 입력되었다면 푸시 마감 시간 지정
    this.timerOff = this.timerOff != undefined ? this.timerOff : new Date(offTime);
    await console.log('1');
    if (this.breakTime) {
      while (onTime < offTime) {
        let time = await new Date(onTime);
        await this.workNotificaiton(uuid, time);

        onTime += await (this.workTime * 1000 * 60);
        
        await this.breakNotificaiton(uuid, onTime, count);
        onTime += await (this.breakTime * 1000 * 60);
        await console.log('onTime 3: ',onTime);

        if(await this.breakCount!=0) {
          await count--;
          if(await count==0) break;
        }
      }
    }
    else {
      let time = await new Date(onTime);
      await this.workNotificaiton(uuid, time)
    }
    await console.log('Before save on storage:',this.notifications);
    await this.storage.set(uuid, this.notifications)
    // Push 보내기
    await this.notifications.map(async (e) => {
      await LocalNotifications.schedule({ notifications: [e] });
    });
    await this.modalCtrl.dismiss();
  }

  async breakNotificaiton(key:string, time: number, count:number) {
    var breakNotificationSetting: object = []
    const timeForBreak = new Date(time)
    console.log('breakTime:',timeForBreak);
    breakNotificationSetting={
          title: `It's time for a break 😀`,
          body: `Count for break: ${this.breakCount+1-count}/${this.breakCount}`,
          id: Math.floor(Math.random() * Math.pow(10,8)),
          schedule: {
            at: timeForBreak,
          },
          extra: {
            key: key,
            timerOff: new Date(this.timerOff),
            workTime: this.workTime,
            breakTime: this.breakTime,
            breakCount: this.breakCount,
          },
          sound: "beep.wav"
        }
    return await this.notifications.push(breakNotificationSetting);
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