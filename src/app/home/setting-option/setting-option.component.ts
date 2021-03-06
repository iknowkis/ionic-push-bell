import { Component } from '@angular/core';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { AlertController, ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { ThemeService } from 'src/app/services/theme/theme.service';

@Component({
  selector: 'app-setting-option',
  templateUrl: './setting-option.component.html',
  styleUrls: ['./setting-option.component.scss'],
})
export class SettingOptionComponent {

  public _reorderToggle: boolean;
  public _selectedTheme: String;
  public _selectedLanguage: String;
  public _dataListReorded: boolean;

  constructor(
    private modalCtrl: ModalController,
    private storage: Storage,
    private theme: ThemeService,
    public translate: TranslateService,
    public alrCtrl: AlertController
  ) {
  }

  async dynamicTheme() {
    await this.theme.activeTheme(this._selectedTheme);
    await this.storage.remove('themeValue');
    await this.storage.set('themeValue', this._selectedTheme)
  }

  async sortByTime() {
    this._dataListReorded = !this._dataListReorded;
    await this.storage.set('sortValue', this._dataListReorded)
    await this.dismissModal();
  }

  async sortAlert() {
    const alert = await this.alrCtrl.create({
      header: this.translate.instant('Sort by time'),
      subHeader: this.translate.instant('(Customized sorting will disappear)'),
      message: this.translate.instant('Do you really want to sort by time?'),
      buttons: [
        {
          text: this.translate.instant('Agree'),
          handler: () => this.sortByTime()
        },
        {
          text: this.translate.instant('Disagree'),
          role: 'cancel',
        }
      ]
    });
    await alert.present();
  }
  
  async deleteAlert() {
    const alert = await this.alrCtrl.create({
      header: this.translate.instant('Clear all notifications'),
      message: this.translate.instant('Do you really want to clear all notifications?'),
      buttons: [
        {
          text: this.translate.instant('Agree'),
          handler: () => this.clear()
        },
        {
          text: this.translate.instant('Disagree'),
          role: 'cancel',
        }
      ]
    });
    await alert.present();
  }

  async dismissModal() {
    await this.storage.remove('languageValue');
    await this.storage.set('languageValue', this._selectedLanguage)
    await this.modalCtrl.dismiss([this._reorderToggle, this._dataListReorded]);
  }

  reorderToggleEnterToHome() {
    if (this._reorderToggle == false) {
      setTimeout(() => this.dismissModal(), 300)
    }
  }

  async getPending() {
    let pending = await LocalNotifications.getAll();
    console.log('pending', pending);
    this.dismissModal();
  }

  async clear() {
    LocalNotifications.cancelAll;
    await this.storage.clear();
    this.dismissModal();
  }
}