import { Component, OnInit } from '@angular/core';
import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';
import { ModalController } from '@ionic/angular';
import { SettingAlarmComponent } from './setting-alarm/setting-alarm.component';
import { Storage } from '@ionic/storage';
import { SettingBreakTimerComponent } from './setting-break-timer/setting-break-timer.component';
import { SettingOptionComponent } from './setting-option/setting-option.component';
import { OverlayEventDetail } from '@ionic/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  storageData:Array<Array<LocalNotificationSchema>> = []
  weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  reorderToggle = true;

  constructor(
    public modalController: ModalController,
    private storage: Storage,
  ) { }

  async openSettingAlarmModal() {
    const modal = await this.modalController.create({
      component: SettingAlarmComponent,
    });
    modal.onDidDismiss().then(async () => {
      this.viewStorageData();
    });
    return await modal.present();
  }

  async editSettingAlarmModal() {
    // const modal = await this.modalController.create({
    //   component: SettingBreakTimerComponent,
    // });
    // return await modal.present();
    let arr=[]
    this.storageData[0].map((e:any)=>arr.push(e.schedule.on.weekday))
    console.log('AAA',arr)

    const modal = await this.modalController.create({
      component: SettingAlarmComponent,
      componentProps: {
        title: this.storageData[0][0].title,
        content: this.storageData[0][0].body,
        time: this.storageData[0][0].schedule.at.toString(),
        weekday: arr,
      },
    });
    modal.onDidDismiss().then(async () => {
      this.viewStorageData();
    });
    return await modal.present();
  }

  async editSettingOption() {
    const modal = await this.modalController.create({
      componentProps: {
        _reorderToggle: this.reorderToggle,
      },
      component: SettingOptionComponent,
    });
    modal.present();
    modal.onDidDismiss().then(async (detail: OverlayEventDetail) => {
      this.reorderToggle = detail.data;
      this.viewStorageData();
    });
  }

  async ngOnInit() {
    await this.viewStorageData();
    await LocalNotifications.requestPermissions();
    await LocalNotifications.addListener('localNotificationReceived', async (notification) => {
      await console.log('notification received!!', notification);
    })
  }

  async viewStorageData() {
    this.storageData = []
    const storage = await this.storage.create();
    await storage.forEach((value) => {
      this.storageData.push(value);
    })
    this.storageData.sort((firstEl:any, nextEl:any) => firstEl[0].schedule.at - nextEl[0].schedule.at)
  }

  async removeAlarm(key) {
    await this.storage.get(key).then(async list => {
      console.log('remove:',list);
      const cancelOptions = { notifications: list };
      await LocalNotifications.cancel(cancelOptions);
    });
    await this.storage.remove(key);
    this.viewStorageData();
  }

  // async removeAlarm1(key) {
  //   await this.storage.get(key).then(async list => {
  //     list.map(async e=> {
  //     const cancelOptions = { notifications: e };
  //     await LocalNotifications.cancel(cancelOptions);
  //     })
  //     await this.storage.remove(key);
  //   });
  //   await this.viewStorageData();
  // }

  async clear() {
    await LocalNotifications.getPending().then(list => {
          console.log('getPending():',list);
          if (!list.notifications.length) return;
          const notifications = list.notifications.map(li => { return { id: li.id }; });
          return LocalNotifications.cancel({ notifications })
        });
    await LocalNotifications.removeAllListeners();
    await await this.storage.clear();
    this.viewStorageData();
  }

  // 삭제 예정
  async getPending() {
    let pending = await LocalNotifications.getPending();
    console.log('pending', pending);
  }

  // For reorder
  onItemReorder({ detail }: any) {
    detail.complete(true);
  }
}