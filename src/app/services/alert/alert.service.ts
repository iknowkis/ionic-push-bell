import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  constructor(
    private storage: Storage,
    public translate: TranslateService,
    public alrtCtrl: AlertController,
  ) { }

  async deleteAlert(): Promise<boolean> {

    return new Promise(async (resolve, reject) => {
      const alert = await this.alrtCtrl.create({
        header: `Delete push`,
        message: `Do you really want to delete this push?`,
        buttons: [
          {
            text: 'Agree',
            handler: () => {
              resolve(true);
            },
          },
          {
            text: 'Disagree',
            role: 'cancel',
            handler: _ => resolve(false),
          }
        ]
      });
      await alert.present();
    })
  }
}