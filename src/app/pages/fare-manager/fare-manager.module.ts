import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';

import { FareManagerComponent } from './fare-manager.component';
import { routing } from './fare-manager.routing';

import { FareListComponent, FareListService } from './fare-list';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgaModule,
    routing,
  ],
  declarations: [
    FareManagerComponent,
    FareListComponent
  ],
  providers: [
  	FareListService
  ]
})
export class FareManagerModule {}