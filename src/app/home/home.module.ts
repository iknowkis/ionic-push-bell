import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { SettingAlarmModule } from './setting-alarm/setting-alarm.module';
import { SettingOptionModule } from './setting-option/setting-option.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    SettingAlarmModule,
    SettingOptionModule,
  ],
  declarations: [
    HomePage
  ],
})
export class HomePageModule {}
