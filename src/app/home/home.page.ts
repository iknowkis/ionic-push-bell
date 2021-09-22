import { Component, OnInit } from '@angular/core';
import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';
import { ModalController } from '@ionic/angular';
import { SettingAlarmComponent } from './setting-alarm/setting-alarm.component';
import { Storage } from '@ionic/storage';
import { SettingOptionComponent } from './setting-option/setting-option.component';
import { OverlayEventDetail } from '@ionic/core';
import { ThemeService } from '../services/theme/theme.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  public storageData: Array<Array<LocalNotificationSchema>> = []
  public weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  public reorderToggle = false;
  public selectedTheme: String;
  public selectedLanguage: String;
  public storageKeys = [];
  public dataListReorded: boolean;

  constructor(
    public modalController: ModalController,
    private storage: Storage,
    private theme: ThemeService,
    public translate: TranslateService,
  ) {
  }

  async openSettingAlarmModal() {
    const modal = await this.modalController.create({
      component: SettingAlarmComponent,
    });
    modal.onDidDismiss().then(async () => {
      this.viewStorageData();
    });
    return await modal.present();
  }

  deactivatedIonCard(dataList) {
    return dataList[0].extra.deactivateValue.value == false ? 'deactivatedIonCard' : '';
  }

  async editAlarmModal(key) {
    // const modal = await this.modalController.create({
    //   component: SettingBreakTimerComponent,
    // });
    // return await modal.present();
    await this.storage.get(key).then(async dataList => {
      const data = dataList[0]

      let arr = [];
      dataList.map((e: any) => arr.push(e.schedule.on.weekday));

      const modal = await this.modalController.create({
        component: SettingAlarmComponent,
        componentProps: {
          toolbarColor: 'primary',
          headerTitle: 'Edit push',
          title: data.title,
          content: data.body,
          keyForEdit: key,
          time: new Date(Date.parse(data.extra.time)).toISOString(),
          weekday: new Set(arr),
          statusValue: data.extra.deactivateValue,
          timerOff: data.extra.timerOff != 'Invalid Date' ? new Date(Date.parse(data.extra.timerOff)).toISOString() : 0,
          workTime: data.extra.workTime,
          breakTime: data.extra.breakTime,
          breakCount: data.extra.breakCount,
        },
      });
      modal.onDidDismiss().then(async () => {
        if (this.dataListReorded != true) {
          this.dataListReorded = false;
          this.viewStorageData();
        }
        else this.storageData.map(async (list, i) => {
          if (list[0].extra.key == key) {
            (await this.storage.keys()).map(async k => {
              if (k == 'languageValue' || k == 'themeValue') { }
              else if (this.storageKeys.includes(k) == false) {
                this.storageData.splice(i, 0, await this.storage.get(k));
                this.storageKeys.push(k);
              }
            })
            this.storageData.splice(i + 1, 1);
            this.storageKeys.splice(this.storageKeys.indexOf(key), 1);
          }
        })
      });
      return await modal.present();
    })
  }

  async editSettingOption() {
    const modal = await this.modalController.create({
      component: SettingOptionComponent,
      componentProps: {
        _reorderToggle: this.reorderToggle,
        _dataListReorded: this.dataListReorded,
        _selectedTheme: this.selectedTheme,
        _selectedLanguage: this.selectedLanguage,
      }
    });
    modal.present();
    modal.onDidDismiss().then(async (detail: OverlayEventDetail) => {
      this.reorderToggle = detail.data[0];
      this.dataListReorded = detail.data[1];
      this.viewStorageData();
    });
  }

  async ngOnInit() {
    await this.viewStorageData();
    await LocalNotifications.requestPermissions();
    let pending = await LocalNotifications.getPending();
    console.log('pending', pending);
    // await LocalNotifications.addListener('localNotificationReceived', (notification) => {
    //   console.log('notification received!!', notification);
    // })
  }
  
  async viewStorageData() {
    const storage = await this.storage.create();
    //To apply theme
    await this.storage.get('themeValue').then(async data => {
      this.selectedTheme = data == undefined ? 'default' : data;
    });
    await this.theme.activeTheme(this.selectedTheme);
    await this.storage.remove('themeValue');
    //To translate language
    await this.storage.get('languageValue').then(async data => {
      this.selectedLanguage = data == undefined ? 'en' : data;
    });
    await this.translate.addLangs(['en', 'kr']);
    await this.translate.setDefaultLang(this.selectedLanguage as string);
    await this.storage.remove('languageValue');
    //To get storageData
    if (this.dataListReorded != true) {
      if (this.dataListReorded != undefined || this.storageKeys.length != (await storage.keys()).length) {
        this.storageData = [];
        this.storageKeys = [];
        await storage.forEach((value, key) => {
          this.storageData.push(value);
          this.storageKeys.push(key)
        })
        this.storageData.sort((firstEl: any, nextEl: any) =>
          (nextEl[0].extra.deactivateValue.value - firstEl[0].extra.deactivateValue.value) ||
          (firstEl[0].schedule.on.hour - nextEl[0].schedule.on.hour) ||
          (firstEl[0].schedule.on.minute - nextEl[0].schedule.on.minute))
        this.dataListReorded = undefined;
      }
    }
    else (await storage.keys()).map(async key => this.storageKeys.includes(key) ? 0 :
      [this.storageData.unshift(await storage.get(key)), this.storageKeys.push(key)])

    await this.storage.set('themeValue', this.selectedTheme)
    await this.storage.set('languageValue', this.selectedLanguage)
  }
  
  getWeekday(data) {
    return this.weekdays[data.schedule.on.weekday].slice(0, 3).toUpperCase()
  }

  async removeAlarm(key) {
    await this.storage.get(key).then(async list => {
      const cancelOptions = { notifications: list };
      await LocalNotifications.cancel(cancelOptions);
      await this.storage.remove(key);
      this.storageData.map((e, i) => e[0].extra.key == list[0].extra.key ? this.storageData.splice(i, 1) : 0);
      this.storageKeys.map((e, i) => e == key ? this.storageKeys.splice(i, 1) : 0);
    })

    this.viewStorageData();
  }

  // For reorder
  async onItemReorder({ detail }: any) {
    let temp = []
    let n = detail.from > detail.to ? 0 : 1
    temp = await this.storageData[detail.from]
    await this.storageData.splice(detail.to + n, 0, temp)
    await this.storageData.splice(detail.from - n + 1, 1)
    this.storageData = this.storageData;
    this.dataListReorded = true;
    detail.complete(true);
  }

  reorderDone() {
    this.reorderToggle = !this.reorderToggle;
  }
}