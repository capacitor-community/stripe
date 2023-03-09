import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { IdentityPageRoutingModule } from './identity-routing.module';

import { IdentityPage } from './identity.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    IdentityPageRoutingModule
  ],
  declarations: [IdentityPage]
})
export class IdentityPageModule {}
