import { Injectable }    from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';


import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

declare var moment:any;

@Injectable()
export class opHelper {
    public  hostname = 'http://'+window.location.hostname+':8000';

    public colors = {
      primary: {
        // blue: '#4285f4',
        blue: '#2dacd1',
        green: '#34a853',
        yellow: '#dfb81c',
        red: '#ea4335',
      }
    };

    public defDate = {
    	start: moment().subtract(6, 'days'),
      end: moment(),
      label: '7 Hari'
    };

    public periodInfo = '';
    
    constructor() {}
    ngOnInit() {}

    public formatDateRange(start: any, end: any) {
    	var monthName = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    	var startDate = start.date()+' '+monthName[start.month()]+' '+start.year();
    	var endDate = end.date()+' '+monthName[end.month()]+' '+end.year();
    	return startDate+' - '+endDate;
    }                                                                                                                                                                              

	  public formatMonth(index: any) { // zero index
  		var monthName = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
  		return monthName[index];
	  }

	  public formatNumber(value: any, isCurrency: any, isSimplified: any, decimals: any) {
      // if(decimals == undefined)
      //   decimals = 0;
      // max 2 decimal places
      var formatted = '';
      if(isSimplified) {
        if(value>=1000000000)
          formatted = (value/1000000000).toFixed(decimals) + ' mi';
        else if(value>=1000000)
          formatted = (value/1000000).toFixed(decimals) + ' jt';
        else if (value>=1000)
          formatted = (value/1000).toFixed(decimals) + ' rb';
        else 
          formatted = value.toString();
      } else {
        formatted = value.toString();
      }
      formatted = formatted.replace('.', ','); // decimals separator
		  formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); // thousands separator
      if(isCurrency)
        formatted = 'Rp '+formatted;
      return formatted;
	  }
	  public fixLineChartNullValues(data: any, granularity: any, attributes: any) {
      var dateFormat;
      if(granularity == 'month')
        dateFormat = 'YYYY-MM';
      else if(granularity == 'day')
        dateFormat = 'YYYY-MM-DD';

      var result = [];
      var prevTime = null;
      for(var i=0; i<data.length; i++) {
        var item = data[i];
        // var currentTime = moment().year(item.year).month(item.month-1);
        var currentTime = moment(item.date, dateFormat);
        if (prevTime != null) {
          for (var time=prevTime.add('1',granularity); time.isBefore(currentTime,granularity); time.add('1',granularity)) {
            // if(granularity == 'month')
            //   time.add('1', 'months'); // fix JS month index starts at 0
            // var date = time.format(dateFormat);  
            var x = {
              // time: time.year()+'-'+(time.month()+1),
              // year: time.year(),
              // month: time.month()+1,
              date: time.format(dateFormat)
            }
            for(var j=0; j<attributes.length; j++) {
              x[attributes[j]] = 0;
            }
            result.push(x);
          }
        }
        result.push(item);
        prevTime = currentTime;
      }
      return result;
    }

    public getLineChartOptions(options: any): any {
      // check valueAxes
      if(options.valueAxes == null) {
        options.valueAxes = [
          {
            axisAlpha: 0,
            title: options.title,
            position: 'left',
            gridAlpha: 0.5,
            gridColor: options.gridColor,
            minimum: 0,
            integersOnly: true,
            labelFunction: options.valueLabelFunction
          }
        ];
      }

      return {
        type: 'serial',
        theme: 'blur',
        color: options.color,
        marginTop: 10,
        marginRight: 15,
        marginBottom: 10,
        dataProvider: options.data,
        valueAxes: options.valueAxes,
        graphs: options.graphs,
        dataDateFormat: options.dataDateFormat,
        categoryField: options.categoryField,
        categoryAxis: {
          parseDates: true,
          equalSpacing: true,
          labelFunction: options.categoryLabelFunction,
          gridThickness: 0
        },
        chartCursor: {
         categoryBalloonEnabled: false,
        },
        creditsPosition: 'bottom-right'
      };
    }

    public getBarChartOptions(options: any): any { 
      return {
        type: 'serial',
        theme: 'blur',
        color: options.color,
        autoMarginOffset: 15,
        // marginTop: 10,
        // marginRight: 15,
        // marginBottom: 10,
        // marginLeft: 10,
        dataProvider: options.data,
        valueAxes: [
          {
            axisAlpha: 0,
            title: options.title,
            position: 'left',
            gridAlpha: 0.5,
            gridColor: options.gridColor,
            minimum: 0,
            integersOnly: true,
            labelFunction: options.valueLabelFunction
          }
        ],
        graphs: options.graphs,
        rotate: options.rotate,
        categoryField: options.categoryField,
        categoryAxis: {
          gridThickness: 0,
          inside: true,
          color: '#000000',
        },
        creditsPosition: 'bottom-right'
      };
    }

}