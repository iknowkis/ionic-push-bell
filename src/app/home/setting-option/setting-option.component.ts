import { Component } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
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
  
  constructor (
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

  async deleteAlert() {
    const alert = await this.alrCtrl.create({
      header: this.translate.instant('Clear all notifications'),
      message: this.translate.instant('Do you really want to clear all notifications?'),
      buttons: [
        { text: this.translate.instant('Agree'),
        handler: () => this.clear()
        },
        { text: this.translate.instant('Disagree'),
          role: 'cancel',
        }
      ]
    });
    await alert.present();
  }

  async dismissModal() {
    await this.storage.remove('languageValue');
    await this.storage.set('languageValue', this._selectedLanguage)
    await this.modalCtrl.dismiss(this._reorderToggle);
  }
  
  ionViewDidEnter() {
  }

  async getPending() {
    let pending = await LocalNotifications.getPending();
    console.log('pending', pending);
    this.dismissModal();
  }

  async clear() {
    await LocalNotifications.getPending().then(list => {
      console.log('getPending():', list);
      if (!list.notifications.length) return;
      const notifications = list.notifications.map(li => { return { id: li.id }; });
      return LocalNotifications.cancel({ notifications })
    });
    await LocalNotifications.removeAllListeners();
    await await this.storage.clear();
    this.dismissModal();
  }
}
