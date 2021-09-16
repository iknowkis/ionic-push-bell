import { Component, OnInit } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ModalController } from '@ionic/angular';
import { SettingAlarmComponent } from './setting-alarm/setting-alarm.component';
import { Storage } from '@ionic/storage';
import { SettingBreakTimerComponent } from './setting-break-timer/setting-break-timer.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  storageData = []
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

  // async edit() {
  //   const modal = await this.modalController.create({
  //     component: SettingBreakTimerComponent,
  //     componentProps: {
  //       title: this.storageData[0].title,
  //       content: this.storageData[0].content,
  //     },
  //   });
  //   return await modal.present();
  // }
  
  async editSettingAlarmModal() {
    const modal = await this.modalController.create({
      component: SettingBreakTimerComponent,
    });
    return await modal.present();
  }

  async ngOnInit() {
    this.viewStorageData();
    LocalNotifications.requestPermissions();
    console.log('getPending:', await LocalNotifications.getPending());
    // await LocalNotifications.addListener('localNotificationReceived', async (notification) => {
    //   await console.log('notification received!!', notification);
    // });
    // 예약 알림 전체 취소
    // await LocalNotifications.getPending().then(list => {
    //       console.log('getPending():',list);
    //       if (!list.notifications.length) return;
    //       const notifications = list.notifications.map(li => { return { id: li.id }; });
    //       return LocalNotifications.cancel({ notifications })
    //     });
    // await LocalNotifications.removeAllListeners();
  }

  async getPending() {
    let pending = await LocalNotifications.getPending();
    console.log('pending', pending);
  }

  async clear() {
    await LocalNotifications.getPending().then(list => {
          console.log('getPending():',list);
          if (!list.notifications.length) return;
          const notifications = list.notifications.map(li => { return { id: li.id }; });
          return LocalNotifications.cancel({ notifications })
        });
    await LocalNotifications.removeAllListeners();
  }

  async viewStorageData() {
    this.storageData = []
    const storage = await this.storage.create();
    await storage.forEach((value) => {
      this.storageData.push(value);
    })
    this.storageData.sort((firstEl, nextEl) => firstEl[0].schedule.at - nextEl[0].schedule.at)
  }

  async removeAlarm1(key) {
    await key.map(data=> this.storage.get(data.id)).then(async list => {
      const cancelOptions = { notifications: list };
      await LocalNotifications.cancel(cancelOptions);
      await this.storage.remove(key);
    });
    await this.viewStorageData();
  }

  async removeAlarm(key) {
    await this.storage.get(key).then(async list => {
      const cancelOptions = { notifications: list };
      await LocalNotifications.cancel(cancelOptions);
    });
    await this.storage.remove(key);
    this.viewStorageData();
  }

  onItemReorder({ detail }: any) {
    detail.complete(true);
  }

  toggleReorder() {
    this.reorderToggle = !this.reorderToggle;
  }
  
  // items = [1, 2, 3, 4, 5];
  // doReorder(event: CustomEvent) {
  //   console.log('Before complete', this.items);
  //   this.items = event.detail.complete(this.items);
  //   console.log('After complete', this.items);
  // }
}