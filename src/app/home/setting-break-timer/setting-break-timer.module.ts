import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SettingBreakTimerComponent } from './setting-break-timer.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [SettingBreakTimerComponent]
})
export class SettingAlarmModule { }
