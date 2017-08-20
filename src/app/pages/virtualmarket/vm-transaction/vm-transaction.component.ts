import {Component, OnInit} from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import {BaThemeConfigProvider, colorHelper, layoutPaths} from '../../../theme';
import { AmChartsService } from "@amcharts/amcharts3-angular";

import {VmTransactionService} from './vm-transaction.service';
import {vmHelper} from '../vmHelper';
import {VmFilterService} from '../vm-filter';

declare var moment:any;

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Component({
  selector: 'vm-transaction',
  templateUrl: './vm-transaction.html',
  // styleUrls: ['./pieChart.scss']
})

export class VmTransactionComponent {
    public layoutColors = this._baConfig.get().colors;
    
    // COLORS
    public trackColor = 'rgba(0,0,0,0)';
    public pieColor = this.vmHelper.colors.primary.green;

    public colors = this.vmHelper.colors.primary;
    public chartColors = [this.colors.green, this.colors.yellow, this.colors.blue, this.colors.red];
    
    public chart: any;
    public transactionTrend: any;
    public buyerTrend: any
    public transactionHistory = {metric: 'distribution'};
    public noData = false;

    public startDate = this.vmHelper.defDate.start;
    public endDate = this.vmHelper.defDate.end;

    // DEFAULT CHART SETTINGS
    public stats: any = {
      transaction_count: {
        color: this.pieColor,
        description: 'Jumlah Transaksi',
        info: '',
        value: 0,
        percent: 0,
        showPie: false,
        showChange: true,
        change: 0,
        prevValue: 0,
        icon:'ion-arrow-up-b',
        iconColor: this.colors.green,
        colSize: 4,
      },
      transaction_value: {
        color: this.pieColor,
        description: 'Nilai Transaksi',
        info: '',
        value: this.vmHelper.formatNumber(0,true,false, 0),
        percent: 0,
        showPie: false,
        showChange: true,
        change: 0,
        prevValue: 0,
        icon:'ion-arrow-up-b',
        iconColor: this.colors.green,
        colSize: 4,
      },
      unique_buyers: {
        description: 'Jumlah Pembeli',
        info: 'Persentase perbandingan dihitung dengan periode sebelumnya',
        value: 0,
        percent: 0,
        showPie: false,
        showChange: true,
        change: 0,
        prevValue: 0,
        icon:'ion-arrow-up-b',
        iconColor: this.colors.green,
        colSize: 2,
      },
      transaction_avg: {
        color: this.pieColor,
        description: 'Rata-Rata Transaksi',
        info: '',
        value: this.vmHelper.formatNumber(0,true,false, 0),
        percent: 0,
        showPie: false,
        showChange: true,
        change: 0,
        prevValue: 0,
        icon:'ion-arrow-up-b',
        iconColor: this.colors.green,
        colSize: 3,
      },
    };

    public options = {
      barColor: this.pieColor,
      trackColor: this.trackColor,
      size: 84,
      scaleLength: 0,
      animate: { duration: 1000, enabled: true },
      lineWidth: 9,
      lineCap: 'round',
    };

    constructor(private http: Http, private _baConfig:BaThemeConfigProvider, private vmFilterService: VmFilterService, private vmTransactionService: VmTransactionService, private vmHelper: vmHelper, private AmCharts: AmChartsService) {
      this.vmFilterService.periodChange$.subscribe(period => {
        this.startDate = period.startDate;
        this.endDate = period.endDate;
        this.getData(this.startDate, this.endDate);
      });
    }

    public getData(startDate: any, endDate: any) {

      this.vmTransactionService.getTransactionStats(startDate, endDate)
        .subscribe(data => {
          this.showSuccessRate(data.transaction_status);
          this.showTransaction(data.transaction);
          this.drawPlatformChart(data.app_platform); 
          // status trends
          var statuses = [];
          for(var i=0; i<data.transaction_status_trend.statuses.length; i++){
            statuses.push(data.transaction_status_trend.statuses[i].status);
          }
          var statusTrend = this.vmHelper.fixLineChartNullValues(data.transaction_status_trend.trend, data.transaction_status_trend.granularity, statuses); // add null points as zero
          data.transaction_status_trend.trend = statusTrend;
          this.showStatusTrend(data.transaction_status_trend);

          // platform trends
          var platforms = [];
          for(var i=0; i<data.app_platform_trend.platforms.length; i++){
            platforms.push(data.app_platform_trend.platforms[i].platform);
          }
          var platformTrend = this.vmHelper.fixLineChartNullValues(data.app_platform_trend.trend, data.app_platform_trend.granularity, platforms); // add null points as zero
          data.app_platform_trend.trend = platformTrend;
          this.showPlatformTrend(data.app_platform_trend);
        });
  
      this.vmTransactionService.getBuyerStats(startDate, endDate)
        .subscribe(data => {
          this.showBuyerStats(data.unique_buyers);
        });

      this.vmTransactionService.getTransactionHistory(startDate, endDate)
        .subscribe(data => {
          data.transaction = this.vmHelper.fixLineChartNullValues(data.transaction, data.granularity, ['count', 'value']); // add null points as zero
          this.transactionTrend = data; // update data
          this.drawTransactionTrend(this.transactionTrend, this.transactionHistory.metric, this.colors);
        });

      this.vmTransactionService.getBuyerHistory(startDate, endDate)
        .subscribe(data => {
          data.buyer = this.vmHelper.fixLineChartNullValues(data.buyer, data.granularity, ['count']); // add null points as zero
          this.buyerTrend = data; // update data
          this.drawBuyerTrend(this.buyerTrend, this.colors);
        });

      // this.getStats(startDate, endDate);
      // this.getHistory(startDate, endDate);
    }

    public showSuccessRate(data: any) {
      for(var i=0; i<data.length; i++){
        if(data[i].status == 'success')
          data[i].fillColor = this.colors.green;
        else
          data[i].fillColor = '#d1cfcf';
      }
      this.chart = this.AmCharts.makeChart('vmTransactionStatus',this.getBarChartOptions(data, this.colors, 'status'));
    }

    // chart options
    public getBarChartOptions(data: any, colors: any, categoryField: any) { 
      
      var options = {
        color: this.layoutColors.defaultText,
        data: data,
        // title: 'Metode',
        gridColor: this.layoutColors.border,
        valueLabelFunction: function(y) {
          var yValue;
          if(y>=1000000000)
            yValue = (y/1000000000).toString() + ' mi';
          else if(y>=1000000)
            yValue = (y/1000000).toString() + ' jt';
          else if (y>=1000)
            yValue = (y/1000).toString() + ' rb';
          else 
            yValue = y.toString();

          return yValue;
        }, 
        graphs: [
          {
            id: 'g1',
            balloonFunction: function(item, graph) {
              var value = item.values.value;
              var hoverInfo = 'Jumlah:<br> <b>'+value+'</b>';
              return hoverInfo;
            },
            lineAlpha: 0,
            fillColorsField: 'fillColor',
            fillAlphas: 1,
            type: 'column',
            valueField: 'count',
          }
        ],
        rotate: true,
        categoryField: categoryField,
      };

      return this.vmHelper.getBarChartOptions(options);
    };

    public drawPlatformChart(data: any) {
      for(var i=0; i<data.length; i++){
        data[i].fillColor = this.colors.yellow;
      }
      this.chart = this.AmCharts.makeChart('vmTransactionPlatform',this.getBarChartOptions(data, this.colors, 'name'));
    };

    public showTransaction(data: any) {
      // transaction count
      var stat = <any>{};
      stat.description = this.stats.transaction_count.description;
      stat.info = this.stats.transaction_count.info;
      stat.showPie = this.stats.transaction_count.showPie;
      stat.showChange = this.stats.transaction_count.showChange;
      stat.value = parseInt(data.count.current.count);
      stat.prevValue = parseInt(data.count.prev.count);
      var change = ((stat.value-stat.prevValue)/(stat.prevValue)*100).toFixed(2);
      stat.change = isFinite(parseFloat(change))? change:0;
      if(stat.change>=0) {
        stat.icon = 'ion-arrow-up-b';
        stat.iconColor = this.colors.green;
      } else {
        stat.change *= -1;
        stat.icon = 'ion-arrow-down-b';
        stat.iconColor = this.colors.red;
      }
      stat.colSize = this.stats.transaction_count.colSize;
      // format number
      stat.value = this.vmHelper.formatNumber(parseInt(stat.value),false,false, 0);
      stat.change = this.vmHelper.formatNumber(stat.change,false,false, 0)+'%';
      this.stats.transaction_count = stat;

      // transaction average value
      var stat = <any>{};
      stat.description = this.stats.transaction_avg.description;
      stat.info = this.stats.transaction_avg.info;
      stat.showPie = this.stats.transaction_avg.showPie;
      stat.showChange = this.stats.transaction_avg.showChange;
      stat.value = parseInt(data.value.current.average);
      stat.prevValue = parseInt(data.value.prev.average);
      var change = ((stat.value-stat.prevValue)/(stat.prevValue)*100).toFixed(2);
      stat.change = isFinite(parseFloat(change))? change:0;
      if(stat.change>=0) {
        stat.icon = 'ion-arrow-up-b';
        stat.iconColor = this.colors.green;
      } else {
        stat.change *= -1;
        stat.icon = 'ion-arrow-down-b';
        stat.iconColor = this.colors.red;
      }
      stat.colSize = this.stats.transaction_avg.colSize;
      // format currency
      stat.value = this.vmHelper.formatNumber(stat.value,true,false, 0);
      stat.change = this.vmHelper.formatNumber(stat.change,false,false, 0)+'%';
      this.stats.transaction_avg = stat;

      // transaction value
      stat = {};
      stat.description = this.stats.transaction_value.description;
      stat.info = this.stats.transaction_value.info;
      stat.showPie = this.stats.transaction_value.showPie;
      stat.showChange = this.stats.transaction_value.showChange;
      stat.value = data.value.current.value;
      stat.prevValue = parseInt(data.value.prev.value);
      var change = ((stat.value-stat.prevValue)/(stat.prevValue)*100).toFixed(2);
      stat.change = isFinite(parseFloat(change))? change:0;
      if(stat.change>=0) {
        stat.icon = 'ion-arrow-up-b';
        stat.iconColor = this.colors.green;
      } else {
        stat.change *= -1;
        stat.icon = 'ion-arrow-down-b';
        stat.iconColor = this.colors.red;
      }
      stat.colSize = this.stats.transaction_value.colSize;
      // format numbers
      stat.value = this.vmHelper.formatNumber(parseInt(stat.value),true,true, 2);
      stat.change = this.vmHelper.formatNumber(stat.change,false,false, 0)+'%';
      this.stats.transaction_value = stat;
    }

    public showBuyerStats(data: any) {
      
        //transaction count
        var stat = <any>{};
        stat.description = this.stats.unique_buyers.description;
        stat.info = this.stats.unique_buyers.info;
        stat.showPie = this.stats.unique_buyers.showPie;
        stat.showChange = this.stats.unique_buyers.showChange;
        stat.value = parseInt(data.current_period);
        stat.prevValue = parseInt(data.prev_period);
        var change = ((stat.value-stat.prevValue)/(stat.prevValue)*100).toFixed(2);
        stat.change = isFinite(parseFloat(change))? change:0;
        if(stat.change>=0) {
          stat.icon = 'ion-arrow-up-b';
          stat.iconColor = this.colors.green;
        } else {
          stat.change *= -1;
          stat.icon = 'ion-arrow-down-b';
          stat.iconColor = this.colors.red;
        }
        stat.colSize = this.stats.unique_buyers.colSize;
        stat.change = this.vmHelper.formatNumber(stat.change,false,false, 0)+'%';
        this.stats.unique_buyers = stat;
      
    }

    public drawBuyerTrend(data: any, colors: any) {
      var label = '';
      if(this.chart != undefined) {
        $('#vmBuyerByHistory').empty();
      }
       
      if(data.buyer.length == 0) {
        this.noData = true;
      } else {
        this.chart = this.AmCharts.makeChart('vmBuyerByHistory',this.getBuyerChartOptions(data, label, colors));
        this.noData = false;
      }
    }

    public getBuyerChartOptions(data: any, label: any, colors: any) { 
      var dateFormat;
      if(data.granularity == 'month')
        dateFormat = 'YYYY-MM';
      else if(data.granularity == 'day')
        dateFormat = 'YYYY-MM-DD';

      var options = {
        color: this.layoutColors.defaultText,
        data: data.buyer,
        title: 'Jumlah Pembeli',
        gridColor: this.layoutColors.border,
        valueLabelFunction: function(y) {
          var yValue;
          if(y>=1000000000)
            yValue = (y/1000000000).toString() + ' mi';
          else if(y>=1000000)
            yValue = (y/1000000).toString() + ' jt';
          else if (y>=1000)
            yValue = (y/1000).toString() + ' rb';
          else 
            yValue = y.toString();

          return yValue;
        }, 
        graphs: [
          {
            id: 'g1',
            balloonFunction: (item, graph) => {
              var date = new Date(item.category);
              var formattedDate;
              if(data.granularity == 'month')
                formattedDate = this.vmHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
              else if(data.granularity == 'day')
                formattedDate =  date.getDate()+' '+this.vmHelper.formatMonth(date.getMonth());

              var value = item.values.value;
              var hoverInfo = formattedDate+'<br> Jumlah:<br> <b>'+this.vmHelper.formatNumber(value,false,false, 0)+'</b>';
              return hoverInfo;
            },
            bullet: 'round',
            bulletSize: 8,
            lineColor: colors.blue,
            lineThickness: 2,
            type: 'line',
            valueField: 'count'
          }
        ],
        dataDateFormat: dateFormat,
        categoryField: 'date',
        categoryLabelFunction: (valueText, date, categoryAxis) => {
          if(data.granularity == 'month')
            return this.vmHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
          else if(data.granularity == 'day')
            return date.getDate()+' '+this.vmHelper.formatMonth(date.getMonth());
        }
      };
      
      return this.vmHelper.getLineChartOptions(options);
    }

    // chart options
    public getTransactionChartOptions(data: any, metric: any, label: any, colors: any) {
      var title = '';
      if(metric == 'count')
        title = 'Jumlah Transaksi';
      else if(metric == 'value')
        title = 'Nilai Transaksi';

      var dateFormat;
      if(data.granularity == 'month')
        dateFormat = 'YYYY-MM';
      else if(data.granularity == 'day')
        dateFormat = 'YYYY-MM-DD';

      var valueLabelFunction = (y) => {
        return this.vmHelper.formatNumber(y,false,true, 0);
      };

      var options = {
        color: this.layoutColors.defaultText,
        data: data.transaction,
        title: title,
        gridColor: this.layoutColors.border,
        graphs: [
          {
            id: 'g1',
            valueAxis: 'v1',
            title: 'Jumlah Transaksi',
            balloonText: '',
            bullet: 'round',
            bulletSize: 8,
            lineColor: this.layoutColors.warning,
            lineThickness: 2,
            type: 'line',
            valueField: 'count'
          },
          {
            id: 'g2',
            valueAxis: 'v2',
            title: 'Nilai Transaksi',
            balloonText: 'Jumlah: <b>[[count]]</b><br>Nilai: <b>Rp [[value]]</b>',
            bullet: 'round',
            bulletSize: 8,
            lineColor: this.layoutColors.success,
            lineThickness: 2,
            type: 'line',
            valueField: 'value'
          }
        ],
        dataDateFormat: dateFormat,
        categoryField: 'date',
        categoryAxis: {
             gridThickness: 0
        },
        categoryLabelFunction: (valueText, date, categoryAxis) => {
          var formattedMonth = this.vmHelper.formatMonth(date.getMonth());
          if(data.granularity == 'month')
            return formattedMonth+' \''+date.getFullYear().toString().substr(-2);
          else if(data.granularity == 'day')
            return date.getDate()+' '+formattedMonth;
        },
        valueAxes: [{
          id:'v1',
          axisColor: this.layoutColors.warning,
          axisThickness: 2,
          axisAlpha: 1,
          position: 'left',
          labelFunction: valueLabelFunction,
          minimum: 0,
          integersOnly: true,
        }, {
          id:'v2',
          axisColor: this.layoutColors.success,
          axisThickness: 2,
          axisAlpha: 1,
          position: 'right',
          labelFunction: valueLabelFunction,
          minimum: 0,
          integersOnly: true,
        },],
      };
      
      var chartOptions = this.vmHelper.getLineChartOptions(options);
      chartOptions.legend = {
        useGraphSettings: true,
        valueFunction: function(graphDataItem, valueText) {
          return '';
        },
        valueWidth:0
      };
      return chartOptions;
    }

    public drawTransactionTrend(data: any, metric: any, colors: any) {
      var label = '';
      if(metric == 'count')
        label = 'Jumlah Transaksi'
      else if(metric == 'value')
        label = 'Nilai Transaksi'

      if(this.chart != undefined) {
        $('#vmTransactionByHistory').empty();
      }

      if(data.transaction.length == 0) {
        this.noData = true;
      } else {
        this.chart = this.AmCharts.makeChart('vmTransactionByHistory',this.getTransactionChartOptions(data, metric, label, colors));
        this.noData = false;
      }
    }

    public changeMetric() {
      this.drawTransactionTrend(this.transactionTrend, this.transactionHistory.metric, this.colors);
    };

    public showStatusTrend(data: any) {
      if(this.chart != undefined) {
        $('#vmTransactionStatusTrend').empty();
      }

      if(data.trend.length == 0) {
        this.noData = true;
      } else {
        this.chart = this.AmCharts.makeChart('vmTransactionStatusTrend',this.getStatusTrendChartOptions(data, this.chartColors));
        this.noData = false;
      }
    }

    public getStatusTrendChartOptions(data: any, colors: any) {

      var dateFormat;
      if(data.granularity == 'month')
        dateFormat = 'YYYY-MM';
      else if(data.granularity == 'day')
        dateFormat = 'YYYY-MM-DD';

      var valueLabelFunction = function(y) {
        return this.vmHelper.formatNumber(y,false,true, 0);
      };

      // settings
      var graphs = [];
      var valueAxes = [];
      for(var i=0; i<data.statuses.length; i++){
        graphs.push({
          id: 'g'+(i+1),
          valueAxis: 'v1',
          title: data.statuses[i].status,
          balloonText: '[['+data.statuses[i].status+']]',
          bullet: 'round',
          bulletSize: 8,
          lineColor: colors[i%colors.length],
          lineThickness: 2,
          type: 'line',
          valueField: data.statuses[i].status,
        });
      }
      
      var options = {
        color: this.layoutColors.defaultText,
        data: data.trend,
        title: '',
        gridColor: this.layoutColors.border,
        graphs: graphs,
        dataDateFormat: dateFormat,
        categoryField: 'date',
        categoryAxis: {
             gridThickness: 0
        },
        categoryLabelFunction: function(valueText, date, categoryAxis) {
          if(data.granularity == 'month')
            return this.vmHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
          else if(data.granularity == 'day')
            return date.getDate()+' '+this.vmHelper.formatMonth(date.getMonth());
        },
        valueAxes: [{
          id:'v1',
          axisColor: '#000000',
          axisThickness: 2,
          axisAlpha: 1,
          position: 'left',
          labelFunction: valueLabelFunction,
          minimum: 0,
          integersOnly: true,
        }],
      };
      
      var chartOptions = this.vmHelper.getLineChartOptions(options);
      chartOptions.legend = {
        useGraphSettings: true,
        valueFunction: function(graphDataItem, valueText) {
          return '';
        },
        valueWidth:0
      };
      chartOptions.chartCursor.categoryBalloonEnabled = true;
      chartOptions.chartCursor.categoryBalloonFunction = function(date) {
        if(data.granularity == 'month')
          return this.vmHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
        else if(data.granularity == 'day')
          return date.getDate()+' '+this.vmHelper.formatMonth(date.getMonth());
      };
      return chartOptions;
    }

    public showPlatformTrend(data: any) {
      if(this.chart != undefined) {
        $('#vmTransactionPlatformTrend').empty();
      }

      if(data.trend.length == 0) {
        this.noData = true;
      } else {
        this.chart = this.AmCharts.makeChart('vmTransactionPlatformTrend',this.getPlatformTrendChartOptions(data, this.chartColors));
        this.noData = false;
      }
    }

    public getPlatformTrendChartOptions(data: any, colors: any) {

      var dateFormat;
      if(data.granularity == 'month')
        dateFormat = 'YYYY-MM';
      else if(data.granularity == 'day')
        dateFormat = 'YYYY-MM-DD';

      var valueLabelFunction = function(y) {
        return this.vmHelper.formatNumber(y,false,true, 0);
      };

      // settings
      var graphs = [];
      var valueAxes = [];
      for(var i=0; i<data.platforms.length; i++){
        graphs.push({
          id: 'g'+(i+1),
          valueAxis: 'v1',
          title: data.platforms[i].platform,
          balloonText: '[['+data.platforms[i].platform+']]',
          bullet: 'round',
          bulletSize: 8,
          lineColor: colors[i%colors.length],
          lineThickness: 2,
          type: 'line',
          valueField: data.platforms[i].platform,
        });
      }
      
      var options = {
        color: this.layoutColors.defaultText,
        data: data.trend,
        title: '',
        gridColor: this.layoutColors.border,
        graphs: graphs,
        dataDateFormat: dateFormat,
        categoryField: 'date',
        categoryAxis: {
             gridThickness: 0
        },
        categoryLabelFunction: function(valueText, date, categoryAxis) {
          if(data.granularity == 'month')
            return this.vmHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
          else if(data.granularity == 'day')
            return date.getDate()+' '+this.vmHelper.formatMonth(date.getMonth());
        },
        valueAxes: [{
          id:'v1',
          axisColor: '#000000',
          axisThickness: 2,
          axisAlpha: 1,
          position: 'left',
          labelFunction: valueLabelFunction,
          minimum: 0,
          integersOnly: true,
        }],
      };
      
      var chartOptions = this.vmHelper.getLineChartOptions(options);
      chartOptions.legend = {
        useGraphSettings: true,
        valueFunction: function(graphDataItem, valueText) {
          return '';
        },
        valueWidth:0
      };
      chartOptions.chartCursor.categoryBalloonEnabled = true;
      chartOptions.chartCursor.categoryBalloonFunction = function(date) {
        if(data.granularity == 'month')
          return this.vmHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
        else if(data.granularity == 'day')
          return date.getDate()+' '+this.vmHelper.formatMonth(date.getMonth());
      };
      return chartOptions;
    }


    public formatRating(rating: any) {
      return this.vmHelper.formatNumber(rating,false,false, 0);
    }

}