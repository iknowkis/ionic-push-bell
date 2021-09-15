import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-setting-break-timer',
  templateUrl: './setting-break-timer.component.html',
  styleUrls: ['./setting-break-timer.component.scss'],
})
export class SettingBreakTimerComponent implements OnInit {

  constructor(
    private modalCtrl: ModalController,) { }

  ngOnInit() {}
  dismissModal() {
    this.modalCtrl.dismiss();
  }
}
