//our root app component
import {Component, NgModule, OnInit} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import { DaterangepickerConfig } from 'ng2-daterangepicker';

import {vmHelper} from '../vmHelper';
import {VmFilterService} from './vm-filter.service';
declare var moment:any;

@Component({
  selector: 'vm-filter',
  templateUrl: './vm-filter.html',
  // providers: [VmFilterComponent],
  // styleUrls: ['./app.component.css']
})

// class Period {
//     constructor(public startDate: any, public endDate: any) {
//     }
// }

export class VmFilterComponent implements OnInit {
    
    public startDate = this.vmHelper.defDate.start;
    public endDate = this.vmHelper.defDate.end;
    public dateRange = '';

    constructor(private daterangepickerOptions: DaterangepickerConfig, private vmFilterService: VmFilterService, private vmHelper: vmHelper) {
        this.daterangepickerOptions.settings = {
            startDate: this.startDate,
            endDate: this.endDate,
            locale: { format: 'YYYY-MM-DD' },
            alwaysShowCalendars: true,
            ranges: {
                'Bulan Ini': [moment().startOf('month'), moment()],
                '30 Hari': [moment().subtract(29, 'days'), moment()],
                '3 Bulan': [moment().subtract(3, 'months'), moment()],
                '1 Tahun': [moment().subtract(1, 'years'), moment()],
                'Tahun Ini': [moment().startOf('year'), moment()]
            },
            maxDate: this.endDate,
            showDropdowns: true,
        };
        
        this.dateRange = this.vmHelper.formatDateRange(this.startDate, this.endDate);
    }

    ngOnInit() {
      setTimeout (() => {
          this.vmFilterService.changePeriod(this.startDate.format('YYYY-MM-DD'), this.endDate.format('YYYY-MM-DD'));
      }, 1000)
        
    }

    private selectedDate(value: any) {
        this.startDate = value.start;
        this.endDate = value.end;
        this.dateRange = this.vmHelper.formatDateRange(this.startDate, this.endDate);
        this.vmFilterService.changePeriod(this.startDate.format('YYYY-MM-DD'), this.endDate.format('YYYY-MM-DD'));
    }

}