import { Component, ViewChild } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { IonSlides, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage-angular';
import { TranslateService } from '@ngx-translate/core';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-setting-alarm',
  templateUrl: './setting-alarm.component.html',
  styleUrls: ['./setting-alarm.component.scss'],
})
export class SettingAlarmComponent {
  toolbarColor = 'warning'
  headerTitle = 'Add push'
  title: string = null
  titlePlaceholder: string = `Setting at ${new Date().getMonth()}/${new Date().getDate()} ${new Date().getHours()}:${new Date().getMinutes() < 10 ? '0'+new Date().getMinutes():new Date().getMinutes()}`;
  content: string = null
  notifications = []
  time: Date;
  weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  weekday = []
  weekdayPlaceholder = []
  weekdayPlace: any;
  timerOff: Date
  workTime = 0
  breakTime = 0
  breakCount = 0
  statusArray = [
    {name: 'Activate', value: true},
    {name: 'Deactivate', value: false}
  ]
  // Default statusValue is 'true'
  statusValue = this.statusArray[0];
  keyForEdit = ''

  private _storage: Storage | null = null;

  constructor(
    private modalCtrl: ModalController,
    private storage: Storage,
  ) {
    this._storage = this.storage;
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
    let offTime = count==0 ? Date.parse(this.timerOff?.toString()) :
      onTime + ((this.workTime + this.breakTime) * count * 1000 * 60);

    // break count만 입력되었다면 푸시 마감 시간 지정
    // ****** timerOff 실시간 반영되도록 수정해야 함 ********
    this.timerOff = count==0 ? this.timerOff : new Date(offTime);
    if (this.breakTime) {
      while (onTime < offTime) {
        await this.workNotificaiton(uuid, new Date(onTime));

        onTime += await (this.workTime * 1000 * 60);
        await this.breakNotificaiton(uuid, onTime, count);
        
        onTime += await (this.breakTime * 1000 * 60);
        await console.log('onTime 3: ', onTime);

        if(await this.breakCount!=0) {
          await count--;
          if (await count == 0) break;
        }
      }
    }
    else {
      await this.workNotificaiton(uuid, new Date(onTime))
    }
    // 편집 시 기존 데이터 삭제
    this?.removeAlarm(this.keyForEdit)
    // DB 저장
    await console.log('Before save on storage:', this.notifications);
    await this.storage.set(uuid, this.notifications)
    // Push 보내기
    if (this.statusValue.value == true) {
      await this.notifications.map(async (e) => {
        await LocalNotifications.schedule({ notifications: [e] });
      });
    }
    await this.dismissModal();
  }

  async workNotificaiton(key:string, time:Date) {
    var notificationSetting: object = []
    
    if(this.weekday.length==0) {this.weekday = [time.getDay()]}
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
            at: time, // 삭제해야 하나?
          },
          extra: {
            key: key,
            time: time,
            timerOff: new Date(this.timerOff),
            workTime: this.workTime,
            breakTime: this.breakTime,
            breakCount: this.breakCount,
            deactivateValue: this.statusValue,
          },
          sound: "beep.wav"
        }
        await this.notifications.push(notificationSetting);
      })
  }

  async breakNotificaiton(key: string, time: number, count:number) {
    var breakNotificationSetting: object = []
    const timeForBreak = new Date(time)
    console.log('breakTime:',timeForBreak);
    if(this.weekday.length==0) {this.weekday = [timeForBreak.getDay()]}
    this.weekday.forEach(async day => {
    breakNotificationSetting={
          title: `It's time for a break 😀`,
          body: `Count for break: ${this.breakCount+1-count}/${this.breakCount}`,
          id: Math.floor(Math.random() * Math.pow(10,8)),
          schedule: {
            on: {
              weekday: +day,
              hour: timeForBreak.getHours(),
              minute: timeForBreak.getMinutes(),
              second: 0,
            },
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
  })
}

  set(key: string, value: any) {
    this._storage?.set(key, value);
  }

  async removeAlarm(key) {
    await this.storage.get(key).then(async list => {
      console.log('remove:',list);
      const cancelOptions = { notifications: list };
      await LocalNotifications.cancel(cancelOptions);
    });
    await this.storage.remove(key);
  }

  dismissModal() {
    this.modalCtrl.dismiss();
  }

  // For slides
  @ViewChild(IonSlides) slides: IonSlides;

  ionViewDidEnter() {
    this.slides.update();
    this.weekday.forEach((v,k)=> this.weekdayPlaceholder.push(" "+this.weekdays[v]))
  }

  async lockSwipes(lock: boolean) {
    await this.slides.lockSwipes(lock);
  }

  next(slide, index) {
    slide.slideTo(index)
  }
}