import { Component, OnInit } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ModalController } from '@ionic/angular';
import { SettingAlarmComponent } from './setting-alarm/setting-alarm.component';
import { Storage } from '@ionic/storage';

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
      component: SettingAlarmComponent
    });

    modal.onDidDismiss().then(async (e) => {
      this.viewStorageData();
    });

    return await modal.present();
  }
  // async editSettingAlarmModal() {
  //   const modal = await this.modalController.create({
  //     component: SettingAlarmComponent,
  //     componentProps: {value: 123},
  //   });
  //   return await modal.present();
  // }

  async removeAlarm(key) {
    this.viewStorageData();
    await this.storage.get(key).then(async list => {
      const cancelOptions = { notifications: list };
      await LocalNotifications.cancel(cancelOptions);
    });
    await this.storage.remove(key);
    this.viewStorageData();
  }

  async ngOnInit() {
    this.viewStorageData();
    LocalNotifications.requestPermissions();
    console.log('getPending:', await LocalNotifications.getPending());
    // await LocalNotifications.addListener('localNotificationReceived', async (notification) => {
    //  await console.log('notification received!!',notification);
    //  });
  }

  async viewStorageData() {
    this.storageData = []
    const storage = await this.storage.create();
    const storageKeys = await storage.keys()
    storageKeys.map(async (value) => this.storageData.push(await this.storage.get(value)))
    console.log('storageKeys:', storageKeys) //
    console.log('storageData:', this.storageData) //
  }

  toggleReorder() {
    this.reorderToggle=!this.reorderToggle;
  }
  // async cancelNotification() {
  //   await LocalNotifications.getPending().then(list => {
  //     console.log('getPending():',list);
  //     if (!list.notifications.length) return;
  //     const notifications = list.notifications.map(li => { return { id: li.id }; });
  //     return LocalNotifications.cancel({ notifications })
  //   });
  // }
}