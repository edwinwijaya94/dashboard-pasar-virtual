import { NgModule }      from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgaModule } from '../../theme/nga.module';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { Daterangepicker } from 'ng2-daterangepicker';
import { DataTableModule } from "angular2-datatable";
import { AmChartsModule } from "@amcharts/amcharts3-angular";

import { OperationalComponent } from './operational.component';
import { routing } from './operational.routing';

import { OpFilterComponent, OpFilterService } from './op-filter';
import { opHelper } from './opHelper';
import { OpOverviewComponent, OpOverviewService, OpProductTrendComponent, OpProductFilterPipe } from './op-overview';

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
    OperationalComponent,
    OpFilterComponent,
    OpOverviewComponent,
    OpProductTrendComponent,
    OpProductFilterPipe,
  ],
  providers: [
    opHelper,
    OpFilterService,
    OpOverviewService,
  ],
  entryComponents: [OpProductTrendComponent]
})
export class OperationalModule {}