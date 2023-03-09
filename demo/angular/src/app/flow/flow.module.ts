import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlowPage } from './flow.page';

import { FlowPageRoutingModule } from './flow-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: FlowPage }]),
    FlowPageRoutingModule,
  ],
  declarations: [FlowPage]
})
export class FlowPageModule {}
