import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SheetPage } from './sheet.page';

import { SheetPageRoutingModule } from './sheet-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    SheetPageRoutingModule
  ],
  declarations: [SheetPage]
})
export class SheetPageModule {}
