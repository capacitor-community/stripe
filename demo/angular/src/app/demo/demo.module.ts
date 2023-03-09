import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DemoPage } from './demo.page';

import { DemoPageRoutingModule } from './demo-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    DemoPageRoutingModule
  ],
  declarations: [DemoPage]
})
export class DemoPageModule {}
