//our root app component
import {Component, NgModule, OnInit} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import { DaterangepickerConfig } from 'ng2-daterangepicker';

import {opHelper} from '../opHelper';
import {OpFilterService} from './op-filter.service';
declare var moment:any;

@Component({
  selector: 'op-filter',
  templateUrl: './op-filter.html',
  // providers: [opFilterComponent],
  // styleUrls: ['./app.component.css']
})

export class OpFilterComponent implements OnInit {
    
    public startDate = this.opHelper.defDate.start;
    public endDate = this.opHelper.defDate.end;
    public dateRange = '';

    constructor(private daterangepickerOptions: DaterangepickerConfig, private opFilterService: OpFilterService, private opHelper: opHelper) {
        this.daterangepickerOptions.settings = {
            startDate: this.startDate,
            endDate: this.endDate,
            locale: { format: 'YYYY-MM-DD' },
            alwaysShowCalendars: true,
            ranges: {
                'Minggu Ini': [moment().startOf('week'), moment()],
                'Hari Ini': [moment().startOf('day'), moment()],
                'Kemarin': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                '7 Hari': [moment().subtract(6, 'days'), moment()],
                '30 Hari': [moment().subtract(29, 'days'), moment()],
            },
            maxDate: this.endDate,
            showDropdowns: true,
        };
        
        this.dateRange = this.opHelper.formatDateRange(this.startDate, this.endDate);
    }

    ngOnInit() {
      setTimeout (() => {
          this.opFilterService.changePeriod(this.startDate.format('YYYY-MM-DD'), this.endDate.format('YYYY-MM-DD'));
      }, 1000)
        
    }

    private selectedDate(value: any) {
        this.startDate = value.start;
        this.endDate = value.end;
        this.dateRange = this.opHelper.formatDateRange(this.startDate, this.endDate);
        this.opFilterService.changePeriod(this.startDate.format('YYYY-MM-DD'), this.endDate.format('YYYY-MM-DD'));
    }

}