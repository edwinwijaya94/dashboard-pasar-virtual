import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Daterangepicker } from 'ng2-daterangepicker';
import { DataTableModule } from "angular2-datatable";
import { AmChartsModule } from "@amcharts/amcharts3-angular";

import { VirtualmarketComponent } from './virtualmarket.component';
import { routing } from './virtualmarket.routing';

import { VmFilterComponent, VmFilterService } from './vm-filter';
import { vmHelper } from './vmHelper';
import { VmOverviewComponent, VmOverviewService } from './vm-overview';
import { VmTransactionComponent, VmTransactionService } from './vm-transaction';
// import { VmProductComponent, VmProductService } from './vm-product';
// import { VmShopperComponent, VmShopperService } from './vm-shopper';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgaModule,
    NgbModule,
    routing,
    Daterangepicker,
    DataTableModule,
    AmChartsModule,
  ],
  declarations: [
    VirtualmarketComponent,
    VmFilterComponent,
    VmOverviewComponent,
    VmTransactionComponent,
    // VmProductComponent,
    // VmShopperComponent,
  ],
  providers: [
    vmHelper,
    VmFilterService,
    VmOverviewService,
    VmTransactionService,
    // VmProductService,
    // VmShopperService,
  ]
})
export class VirtualmarketModule {}