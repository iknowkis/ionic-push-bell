import { Component } from '@angular/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { ModalController } from '@ionic/angular';
import { HomePage } from '../home.page';

@Component({
  selector: 'app-setting-option',
  templateUrl: './setting-option.component.html',
  styleUrls: ['./setting-option.component.scss'],
})
export class SettingOptionComponent{

  public _reorderToggle: boolean;

  constructor(
    private modalCtrl: ModalController,
    private homPage: HomePage,
    ) {this._reorderToggle = this.homPage.reorderToggle }

   changeReorderToggle() {
    this.homPage.reorderToggle = false;
    this.dismissModal();
   }

  dismissModal() {
    this.modalCtrl.dismiss();
  }

  async getPending() {
    let pending = await LocalNotifications.getPending();
    console.log('pending', pending);
    this.dismissModal();
  }

  async clear() {
    await LocalNotifications.getPending().then(list => {
          console.log('getPending():',list);
          if (!list.notifications.length) return;
          const notifications = list.notifications.map(li => { return { id: li.id }; });
          return LocalNotifications.cancel({ notifications })
        });
    await LocalNotifications.removeAllListeners();
    this.dismissModal();
  }
}
