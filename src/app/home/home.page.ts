import { Component, OnInit } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ModalController } from '@ionic/angular';
import { SettingAlarmComponent } from './setting-alarm/setting-alarm.component';
import { Storage } from '@ionic/storage';
import { SettingBreakTimerComponent } from './setting-break-timer/setting-break-timer.component';
import { SettingOptionComponent } from './setting-option/setting-option.component';

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
//this.reorderToggle = this.settingOption.offerReorderToggle() 
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

  async editSettingOption() {
    const modal = await this.modalController.create({
      component: SettingOptionComponent,
    });
    return await modal.present();
  }

  async ngOnInit() {
    this.viewStorageData();
    LocalNotifications.requestPermissions();
    // await LocalNotifications.addListener('localNotificationReceived', async (notification) => {
    //   await console.log('notification received!!', notification);
    // });
    // 예약 알림 전체 취소
    console.log('RRRRRRRR:',this.reorderToggle);
  }
  async viewStorageData() {
    this.storageData = []
    const storage = await this.storage.create();
    await storage.forEach((value) => {
      this.storageData.push(value);
    })
    this.storageData.sort((firstEl, nextEl) => firstEl[0].schedule.at - nextEl[0].schedule.at)
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

  async removeAlarm1(key) {
    await this.storage.get(key).then(async list => {
      list.map(async e=> {
      const cancelOptions = { notifications: e };
      await LocalNotifications.cancel(cancelOptions);
      })
      await this.storage.remove(key);
    });
    await this.viewStorageData();
  }

  // For reorder
  onItemReorder({ detail }: any) {
    detail.complete(true);
  }
  
  button() {
    console.log('RRRRRRRR:',this.reorderToggle);
  }
}