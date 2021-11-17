import { Component, OnInit } from '@angular/core';
import { LocalNotifications, ILocalNotification } from '@ionic-native/local-notifications';
import { ModalController } from '@ionic/angular';
import { SettingAlarmComponent } from './setting-alarm/setting-alarm.component';
import { Storage } from '@ionic/storage';
import { SettingOptionComponent } from './setting-option/setting-option.component';
import { OverlayEventDetail } from '@ionic/core';
import { ThemeService } from '../services/theme/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '../services/alert/alert.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  public storageData: Array<Array<any>> = []
  public weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  public reorderToggle = false;
  public storageKeys = [];
  public selectedTheme: String;
  public selectedLanguage: String;
  public dataListReorded: boolean;

  constructor(
    public modalController: ModalController,
    private storage: Storage,
    private theme: ThemeService,
    public translate: TranslateService,
    public alrtService: AlertService,
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
    return dataList[0].data.deactivateValue.value == false ? 'deactivatedIonCard' : '';
  }

  async editAlarmModal(keyForEdit) {
    // const modal = await this.modalController.create({
    //   component: SettingBreakTimerComponent,
    // });
    // return await modal.present();
    await this.storage.get(keyForEdit).then(async dataList => {
      const data = dataList[0];

      let arr = [];
      dataList.map((e: any) => arr.push(e.trigger.every.weekday));

      const modal = await this.modalController.create({
        component: SettingAlarmComponent,
        componentProps: {
          toolbarColor: 'primary',
          headerTitle: 'Edit push',
          title: data.title,
          content: data.text,
          keyForEdit: keyForEdit,
          time: new Date(Date.parse(data.data.time)).toISOString(),
          weekday: new Set(arr),
          statusValue: data.data.deactivateValue,
          timerOff: data.data.timerOff != 'Invalid Date' ? new Date(Date.parse(data.data.timerOff)).toISOString() : 0,
          workTime: data.data.workTime,
          breakTime: data.data.breakTime,
          breakCount: data.data.breakCount,
        },
      });
      modal.onDidDismiss().then(async () => {
        if (this.dataListReorded != true) {
          this.dataListReorded = false;
          await this.storage.set('sortValue', this.dataListReorded)
          await this.viewStorageData();
        }
        else this.storageData.map(async (list, i) => {
          if (list[0].data.key == keyForEdit) {
            (await this.storage.keys()).map(async key => {
              if (key == 'languageValue' || key == 'themeValue' ||
                key == 'sortValue' || key == 'sortedDataList') { }
              else if (this.storageKeys.includes(key) == false) {
                this.storageKeys.push(key);
                this.storageKeys.splice(this.storageKeys.indexOf(keyForEdit), 1);
                this.storageData.splice(i, 0, (await this.storage.get(key)));
                this.storageData.splice(i + 1, 1);
                await this.storage.set('sortedDataList', this.storageData);
              }
            })
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
        _selectedTheme: this.selectedTheme,
        _selectedLanguage: this.selectedLanguage,
        _dataListReorded: this.dataListReorded,
        _reorderToggle: this.reorderToggle,
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
    await LocalNotifications.requestPermission();
    // await LocalNotifications.addListener('localNotificationReceived', (notification) => {
    //   console.log('notification received!!', notification);
    // })
  }
  
  async viewStorageData() {
    const storage = await this.storage.create();

    // Apply theme
    await this.storage.get('themeValue').then(data => {
      this.selectedTheme = data == undefined ? 'default' : data;
    });
    await this.theme.activeTheme(this.selectedTheme);
    await this.storage.remove('themeValue');

    // Translate language
    await this.storage.get('languageValue').then(data => {
      this.selectedLanguage = data == undefined ? 'en' : data;
    });
    await this.translate.addLangs(['en', 'kr']);
    await this.translate.setDefaultLang(this.selectedLanguage as string);
    await this.storage.remove('languageValue');
    
    // Get storage sort value
    await this.storage.get('sortValue').then(data => {
      this.dataListReorded = data == undefined ? undefined : data;
    });
    await this.storage.remove('sortValue');

    // Get storage data list
    if(this.storageData.length==0 && this.dataListReorded==true) {
      this.storage.get('sortedDataList').then(async data => {
        this.storageData = data;
        if(data.length==0) {this.dataListReorded = undefined}
      });
    }
    await this.storage.remove('sortedDataList');
    if(this.storageData.length!=0 && this.storageKeys.length==0) {
      await this.storageData.map(data=> {
        this.storageKeys.push(data[0].data.key)
      })
    }

    // Sort by time
    if (this.dataListReorded != true) {
      if (this.dataListReorded != undefined || this.storageKeys.length != (await storage.keys()).length) {
        this.storageData = [];
        this.storageKeys = [];
        await storage.forEach((value, key) => {
          this.storageData.push(value);
          this.storageKeys.push(key)
        })
        this.storageData.sort((firstEl: any, nextEl: any) =>
          (nextEl[0].data.deactivateValue.value - firstEl[0].data.deactivateValue.value) ||
          (firstEl[0].trigger.every.hour - nextEl[0].trigger.every.hour) ||
          (firstEl[0].trigger.every.minute - nextEl[0].trigger.every.minute))
        this.dataListReorded = undefined;
      }
    }
    else if (this.storageKeys.length != 0) {
      (await storage.keys()).map(async key => {
        if (this.storageKeys.includes(key) == false) {
          this.storageData.unshift(await storage.get(key));
          this.storageKeys.push(key);
        }
      })
    }

    await this.storage.set('themeValue', this.selectedTheme)
    await this.storage.set('languageValue', this.selectedLanguage)
    await this.storage.set('sortValue', this.dataListReorded)
    if(this.dataListReorded==true) {
      await this.storage.set('sortedDataList', this.storageData)
    }
  }
  
  getWeekday(data) {
    return this.weekdays[data.trigger.every.weekday].slice(0, 3).toUpperCase()
  }

  removeAlert(key) {
    this.alrtService.deleteAlert().then(result => {
      if (result) this.removeAlarm(key);
    })
  }

  async removeAlarm(key) {
    await this.storage.get(key).then(async list => {
      await this.storage.remove(key);
      this.storageData.map((e, i) => e[0].data.key == list[0].data.key ? this.storageData.splice(i, 1) : 0);
      this.storageKeys.map((e, i) => e == key ? this.storageKeys.splice(i, 1) : 0);
      if(this.dataListReorded==true) {
        await this.storage.set('sortedDataList', this.storageData)
      }
      const cancelOptions = { notifications: list };
      await LocalNotifications.cancel(cancelOptions);
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
    await this.storage.set('sortValue', this.dataListReorded)
    await this.storage.set('sortedDataList', this.storageData)
    detail.complete(true);
  }

  reorderDone() {
    this.reorderToggle = !this.reorderToggle;
  }
}