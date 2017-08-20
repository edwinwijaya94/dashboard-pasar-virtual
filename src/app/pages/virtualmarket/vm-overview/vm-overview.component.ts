import {Component, OnInit} from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import {BaThemeConfigProvider, colorHelper, layoutPaths} from '../../../theme';
import { AmChartsService } from "@amcharts/amcharts3-angular";

import {VmOverviewService} from './vm-overview.service';
import {vmHelper} from '../vmHelper';
import {VmFilterService} from '../vm-filter';

declare var moment:any;

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Component({
  selector: 'vm-overview',
  templateUrl: './vm-overview.html',
  // styleUrls: ['./pieChart.scss']
})

export class VmOverviewComponent {
    public layoutColors = this._baConfig.get().colors;
    // this.colors = [layoutColors.primary, layoutColors.warning, layoutColors.danger, layoutColors.info, layoutColors.success, layoutColors.primaryDark];
    
    // COLORS
    public trackColor = 'rgba(0,0,0,0)';
    public pieColor = this.vmHelper.colors.primary.green;

    public colors = this.vmHelper.colors.primary;
    public chartColors = [this.colors.blue, this.colors.yellow, this.colors.green, this.colors.red];
    
    public chart: any;
    public productPageIndex = 1;
    public productPageSize = 5;
    public productList:any;
    public updatedProductList:any;
    public shopperPageIndex = 1;
    public shopperPageSize = 5;
    public shopperList:any;
    public updatedShopperList:any;
    public transactionTrend:any;

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
        value: this.vmHelper.formatNumber(0,true,false,0),
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
        color: this.pieColor,
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
      availability: {
        color: this.pieColor,
        description: 'Ketersediaan Produk',
        info: '',
        value: this.vmHelper.formatNumber(0,false,false,0),
        percent: 0,
        showPie: false,
        showChange: true,
        change: 0,
        prevValue: 0,
        icon:'ion-arrow-up-b',
        iconColor: this.colors.green,
        colSize: 2,
      },
      fluctuation: {
        description: 'Fluktuasi Harga',
        value: this.vmHelper.formatNumber(0,false,false,0),
        showPie: false,
        showChange: true,
        icon:'ion-arrow-up-b',
        iconColor: this.colors.green,
        colSize: 2,
      },
      avg_rating: {
        color: this.pieColor,
        description: 'Rating Garendong',
        info: '',
        value: this.vmHelper.formatNumber(0,false,false,0),
        percent: 0,
        showPie: false,
        showChange: true,
        change: 0,
        prevValue: 0,
        icon:'ion-arrow-up-b',
        iconColor: this.colors.green,
        colSize: 2,
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

    public noData = false;
    public transactionHistory = {metric : 'count'};

    constructor(private http: Http, private _baConfig:BaThemeConfigProvider, private vmFilterService: VmFilterService, private vmOverviewService: VmOverviewService, private vmHelper: vmHelper, private AmCharts: AmChartsService) {
      this.initProductList();
      this.initShopperList();
      this.vmFilterService.periodChange$.subscribe(period => {
        this.startDate = period.startDate;
        this.endDate = period.endDate;
        this.getData(this.startDate, this.endDate);
      });
      // this.getData(this.startDate, this.endDate);
    }

    public getData(startDate: any, endDate: any): void {
      this.vmOverviewService.getTransactionStats(startDate, endDate)
        .subscribe(data => {
          this.showSuccessRate(data.transaction_status);
          this.showTransaction(data.transaction);
          this.drawPlatformChart(data.app_platform); 
        });
      
      this.vmOverviewService.getBuyerStats(startDate, endDate)
        .subscribe(data => {
          this.showBuyerStats(data.unique_buyers);
        });

      this.vmOverviewService.getProductStats(startDate, endDate)
        .subscribe(data => {
          this.showProductStats(data.availability);
          this.showFluctuation(data.fluctuation);
        });

      this.vmOverviewService.getProductList(startDate, endDate)
        .subscribe(data => {
          this.showProducts(data);
        });
        
      this.vmOverviewService.getFeedbackStats(startDate, endDate)
        .subscribe(data => {
          this.showFeedbackReason(data.feedback);
        });

      this.vmOverviewService.getShopperStats(startDate, endDate)
        .subscribe(data => {
          this.showShopperData(data, '');
        });
    }

    public showSuccessRate(data: any) {
      for(var i=0; i<data.length; i++){
        if(data[i].status == 'success')
          data[i].fillColor = this.colors.green;
        else
          data[i].fillColor = '#d1cfcf';
      }
      this.chart = this.AmCharts.makeChart('vmOverviewTransactionStatus',this.getBarChartOptions(data, this.colors, 'status'));
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
    }

    public drawPlatformChart(data: any) {
      for(var i=0; i<data.length; i++){
        data[i].fillColor = this.colors.yellow;
      }
      this.chart = this.AmCharts.makeChart('vmTransactionPlatform',this.getBarChartOptions(data, this.colors, 'name'));
    }

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
      stat.value = this.vmHelper.formatNumber(parseInt(stat.value),false,false,0);
      stat.change = this.vmHelper.formatNumber(stat.change,false,false,0)+'%';
      this.stats.transaction_count = stat;

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
      stat.change = this.vmHelper.formatNumber(stat.change,false,false,0)+'%';
      this.stats.transaction_value = stat;
    }

    public showBuyerStats(data: any) {
      
      //buyer count
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
      stat.change = this.vmHelper.formatNumber(stat.change,false,false,0)+'%';
      this.stats.unique_buyers = stat;
      
    }

    public showProductStats(data: any) {
      //product availability
      var stat = <any>{};
      stat.description = this.stats.availability.description;
      stat.info = this.stats.availability.info;
      stat.showPie = this.stats.availability.showPie;
      stat.showChange = this.stats.availability.showChange;
      stat.value = parseFloat(data.current);
      stat.prevValue = parseFloat(data.prev);
      var change = (stat.value-stat.prevValue).toFixed(2);
      stat.change = isFinite(parseFloat(change))? change:0;
      if(stat.change>=0) {
        stat.icon = 'ion-arrow-up-b';
        stat.iconColor = this.colors.green;
      } else {
        stat.change *= -1;
        stat.icon = 'ion-arrow-down-b';
        stat.iconColor = this.colors.red;
      }
      stat.colSize = this.stats.availability.colSize;
      stat.value = isFinite(stat.value)? (this.vmHelper.formatNumber(stat.value,false,false,0)+'%'):'-';
      stat.change = this.vmHelper.formatNumber(stat.change,false,false,0);
      this.stats.availability = stat;
    }

    public showFluctuation(data: any) {
      //product fluctuation
      var stat = <any>{};
      stat.description = this.stats.fluctuation.description;
      stat.showPie = this.stats.fluctuation.showPie;
      stat.showChange = this.stats.fluctuation.showChange;
      stat.value = parseFloat(data);
      if(stat.value>=0) {
        stat.icon = 'ion-arrow-up-b';
        stat.iconColor = this.colors.red;
      } else {
        stat.value *= -1;
        stat.icon = 'ion-arrow-down-b';
        stat.iconColor = this.colors.green;
      }
      stat.value = isFinite(stat.value)? (this.vmHelper.formatNumber(stat.value,false,false,0)+'%'):'-';
      this.stats.fluctuation = stat;
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
    };

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
            balloonFunction: function(item, graph) {
              var value = item.values.value;
              var hoverInfo = 'Jumlah Pembeli:<br> <b>'+value+'</b>';
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
        categoryLabelFunction: function(valueText, date, categoryAxis) {
          if(data.granularity == 'month')
            return this.vmHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
          else if(data.granularity == 'day')
            return date.getDate()+' '+this.vmHelper.formatMonth(date.getMonth());
        }
      };
      
      return this.vmHelper.getLineChartOptions(options);
    }

    // chart options
    public getTransactionChartOptions (data: any, metric: any, label: any, colors: any) {
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

      var valueLabelFunction: any = function(y: any): void {
        return this.vmHelper.formatNumber(y,false,true,0);
      };

      var options = {
        color: this.layoutColors.defaultText,
        data: data.transaction,
        title: title,
        gridColor: this.layoutColors.border,
        // valueLabelFunction: function(y) {
        //   return this.vmHelper.formatNumber(y,false,true);
        // }, 
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
            // balloonFunction: function(item, graph) {
            //   var value = item.values.value;
            //   var hoverInfo = '';
            //   hoverInfo += 'Jumlah: <b>'+'[[count]]'+'</b><br> ';
            //   hoverInfo += 'Nilai: <b>'+this.vmHelper.formatNumber(value,true,false)+'</b>';
            //   return hoverInfo;
            // },
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
        categoryLabelFunction: function(valueText, date, categoryAxis) {
          if(data.granularity == 'month')
            return this.vmHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
          else if(data.granularity == 'day')
            return date.getDate()+' '+this.vmHelper.formatMonth(date.getMonth());
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
    };

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
    };

    public changeMetric() {
      this.drawTransactionTrend(this.transactionTrend, this.transactionHistory.metric, this.colors);
    };

    // PRODUCT
    public initProductList() {
      this.productList = {
        totalRows: 0,
        // page: 1,
        // rowsPerPage: 5,
        displayedPages: 1,
        product:[]
      };
    }

    public showProducts(data: any) {
      this.productList.totalRows = data.total_rows;
      // this.productList.product = data.product;

      this.updatedProductList = data.product;
      // copy references
      this.productList.product = [].concat(this.updatedProductList);
    }

    public formatNumber (number: any) {
      return this.vmHelper.formatNumber(number,false,false,0);
    }

    public getArrowIcon (value: any) {
      if(value >= 0)
        return 'ion-arrow-up-b';
      else
        return 'ion-arrow-down-b';
    }

    public getArrowColor(value: any) {
      if(value >= 0)
        return this.colors.green;
      else
        return this.colors.red;
    }

    public changeProductPage(newPage: any) {
      // this.getProductList(this.startDate, this.endDate, this.productList.page, this.productList.rowsPerPage);
      this.productPageIndex = newPage;
    }

    // GARENDONG
    public initShopperList() {
      this.shopperPageIndex = 1;
      this.shopperPageSize = 5;
      this.shopperList = {
        totalRows: 0,
        avgRating: 0 + ' / 5',
        // pageIndex: 1,
        // pageSize: 5,
        displayedPages: 1,
        shopper:[]
      };
    };
    

    public shopperListOptions = {
      selected: {
        label: 'Rating Tertinggi',
        value: 'highest',
        color: this.colors.green
      },
      options: [
        {
          label: 'Rating Tertinggi',
          value: 'highest',
          color: this.colors.green
        },
        {
          label: 'Rating Terendah',
          value: 'lowest',
          color: this.colors.red
        }
      ]
    }

    

    public showShopperData (data: any, sortBy: any) {
      //stats
      // this.stats.shopperCount.value = data.shopper_count.current;
      // var countChange = (data.shopper_count.current-data.shopper_count.prev);
      // countChange = isFinite(countChange)? countChange:0;
      // if(countChange>=0) {
      //   this.stats.shopperCount.icon = 'ion-arrow-up-b';
      //   this.stats.shopperCount.iconColor = this.colors.green;
      // } else {
      //   countChange *= -1;
      //   this.stats.shopperCount.icon = 'ion-arrow-down-b';
      //   this.stats.shopperCount.iconColor = this.colors.red;
      // }
      // this.stats.shopperCount.change = countChange;

      this.stats.avg_rating.value = parseFloat(data.avg_rating.current);
      var ratingChange = (data.avg_rating.current-data.avg_rating.prev);
      ratingChange = isFinite(ratingChange)? ratingChange:0;
      if(ratingChange>=0) {
        this.stats.avg_rating.icon = 'ion-arrow-up-b';
        this.stats.avg_rating.iconColor = this.colors.green;
      } else {
        ratingChange *= -1;
        this.stats.avg_rating.icon = 'ion-arrow-down-b';
        this.stats.avg_rating.iconColor = this.colors.red;
      }
      this.stats.avg_rating.value = isFinite(this.stats.avg_rating.value)? this.vmHelper.formatNumber(this.stats.avg_rating.value,false,false,0): '-';
      this.stats.avg_rating.change = this.formatRating(parseFloat(ratingChange.toFixed(2)));

      // shopper list
      this.updatedShopperList = data.shopper;
      // copy references
      this.shopperList.shopper = [].concat(this.updatedShopperList);
    }

    

    public showFeedbackReason (data: any) {
      if(this.chart != undefined) {
        $('#vmOverviewFeedbackReason').empty();
      }

      if(data.length == 0) {
        this.noData = true;
      } else {
        for(var i=0; i<data.length; i++){
          data[i].fillColor = this.colors.yellow;
        }
        this.chart = this.AmCharts.makeChart('vmOverviewFeedbackReason',this.getBarChartOptions(data, this.colors, 'reason'));
        this.noData = false;
      }
    }

    public formatRating (rating: any) {
      return this.vmHelper.formatNumber(rating,false,false,0);
    }

    
}