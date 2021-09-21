import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { SettingAlarmModule } from './setting-alarm/setting-alarm.module';
import { SettingOptionModule } from './setting-option/setting-option.module';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [
    HomePage
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    SettingAlarmModule,
    SettingOptionModule,
    TranslateModule,
  ],
})
export class HomePageModule {}
