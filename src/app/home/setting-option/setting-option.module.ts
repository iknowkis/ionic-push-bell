import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SettingOptionComponent } from './setting-option.component';
import { HomePage } from '../home.page';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [
    SettingOptionComponent
  ],
  providers: [
    HomePage
  ]
})
export class SettingOptionModule { }
