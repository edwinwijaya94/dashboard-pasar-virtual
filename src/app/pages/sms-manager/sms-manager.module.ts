import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';

import { SmsManagerComponent } from './sms-manager.component';
import { routing } from './sms-manager.routing';

import { SmsListComponent, SmsListService } from './sms-list';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgaModule,
    routing,
  ],
  declarations: [
    SmsManagerComponent,
    SmsListComponent
  ],
  providers: [
  	SmsListService
  ]
})
export class SmsManagerModule {}