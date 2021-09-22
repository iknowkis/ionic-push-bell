import { Component, OnInit } from '@angular/core';
import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';
import { ModalController } from '@ionic/angular';
import { SettingAlarmComponent } from './setting-alarm/setting-alarm.component';
import { Storage } from '@ionic/storage';
import { SettingBreakTimerComponent } from './setting-break-timer/setting-break-timer.component';
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
  public storageData:Array<Array<LocalNotificationSchema>> = []
  public weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  public reorderToggle = false;
  public selectedTheme: String;
  public selectedLanguage: String;

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

    let arr=[];
    dataList.map((e:any)=>arr.push(e.schedule.on.weekday));
    
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
        timerOff: data.extra.timerOff!='Invalid Date' ? new Date(Date.parse(data.extra.timerOff)).toISOString():0,
        workTime: data.extra.workTime,
        breakTime: data.extra.breakTime,
        breakCount: data.extra.breakCount,
      },
    });
    modal.onDidDismiss().then(async () => {
      this.viewStorageData();
    });
    return await modal.present();
  })
}

  async editSettingOption() {
    const modal = await this.modalController.create({
      component: SettingOptionComponent,
      componentProps: {
        _reorderToggle: this.reorderToggle,
        _selectedTheme: this.selectedTheme,
        _selectedLanguage: this.selectedLanguage,
      }
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
    let pending = await LocalNotifications.getPending();
    console.log('pending', pending);
    await LocalNotifications.addListener('localNotificationReceived', (notification) => {
      console.log('notification received!!', notification);

    })
  }
  
  async viewStorageData() {
    this.storageData = []
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
    await storage.forEach((value) => {
      this.storageData.push(value);
    })
    this.storageData.sort((firstEl:any, nextEl:any) =>
    (nextEl[0].extra.deactivateValue.value -firstEl[0].extra.deactivateValue.value) ||
    (firstEl[0].schedule.on.hour - nextEl[0].schedule.on.hour) ||
    (firstEl[0].schedule.on.minute - nextEl[0].schedule.on.minute))
    
    await this.storage.set('themeValue', this.selectedTheme)
    await this.storage.set('languageValue', this.selectedLanguage)
  }
  
  getWeekday(data) {
    return this.weekdays[data.schedule.on.weekday].slice(0,3).toUpperCase()
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

  // For reorder
  onItemReorder({ detail }: any) {
    detail.complete(true);
  }
}