import {Component, OnInit} from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { BaThemeConfigProvider, colorHelper, layoutPaths } from '../../../theme';
import { AmChartsService } from "@amcharts/amcharts3-angular";

import {VmShopperService} from './vm-shopper.service';
import {vmHelper} from '../vmHelper';
import {VmFilterService} from '../vm-filter';

declare var moment:any;

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Component({
  selector: 'vm-shopper',
  templateUrl: './vm-shopper.html',
})

export class VmShopperComponent {
    public layoutColors = this._baConfig.get().colors;
    
    // COLORS
    public trackColor = 'rgba(0,0,0,0)';
    public pieColor = this.vmHelper.colors.primary.green;

    public colors = this.vmHelper.colors.primary;
    public chartColors = [this.colors.green, this.colors.yellow, this.colors.blue, this.colors.red];
    
    public chart: any;
    public noData = false;

    public shopperPageIndex = 1;
    public shopperPageSize = 5;
    public shopperList: any;

    public startDate = this.vmHelper.defDate.start;
    public endDate = this.vmHelper.defDate.end;

    // FILTER
    public nameQuery = "";

    // INIT DATA
    public stats: any = {
      shopperCount: {
        description: 'Garendong Aktif',
        info: '',
        value: 0,
        percent: 0,
        change: 0,
        icon:'ion-arrow-up-b',
        iconColor: this.colors.green,
      },
      avgRating: {
        description: 'Rata-Rata Rating',
        info: '',
        value: 0,
        percent: 0,
        change: 0,
        icon:'ion-arrow-up-b',
        iconColor: this.colors.green,
      },
      transactionPerShopper: {
        description: 'Transaksi per Garendong',
        info: '',
        value: 0,
        percent: 0,
        change: 0,
        icon:'ion-arrow-up-b',
        iconColor: this.colors.green,
      },
      feedback_count: {
        color: this.pieColor,
        description: 'Jumlah Ulasan',
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
    };

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
    }

    constructor(private http: Http, private _baConfig:BaThemeConfigProvider, private vmFilterService: VmFilterService, private vmShopperService: VmShopperService, private vmHelper: vmHelper, private AmCharts: AmChartsService) {
      this.initShopperList();
      this.vmFilterService.periodChange$.subscribe(period => {
        this.startDate = period.startDate;
        this.endDate = period.endDate;
        this.getData(this.startDate, this.endDate);
      });
    }

    public getData(startDate: any, endDate: any) {
      this.vmShopperService.getShopperList(startDate, endDate)
        .subscribe(data => {
          this.showShopperData(data);
        });
        
      this.vmShopperService.getFeedbackStats(startDate, endDate)
        .subscribe(data => {
          this.showFeedbackCount(data.count);
          this.showFeedbackReason(data.feedback);
        });

    };

    // SHOPPER TOPLIST
    // public getShopperList(startDate: any, endDate: any, page: any, rows: any, sort: any) {
    //   // this.loading = true;
    //   $http.get('/api/virtualmarket/shopper?type=list&start_date='+startDate+'&end_date='+endDate+'&page='+page+'&rows='+rows+'&sort='+sort)
    //     .then(function(res) {
    //       this.shopperData = res.data.data;
    //       this.showShopperData(this.shopperData, this.shopperListOptions.selected.value);
    //     })
    //     .finally(function() {
    //       // this.loading= false;
    //     });    
    // };

    public showShopperData(data: any) {
      //stats
      // shopper count
      this.stats.shopperCount.value = data.shopper_count.current;
      var countChange = (data.shopper_count.current-data.shopper_count.prev);
      countChange = isFinite(countChange)? countChange:0;
      if(countChange>=0) {
        this.stats.shopperCount.icon = 'ion-arrow-up-b';
        this.stats.shopperCount.iconColor = this.colors.green;
      } else {
        countChange *= -1;
        this.stats.shopperCount.icon = 'ion-arrow-down-b';
        this.stats.shopperCount.iconColor = this.colors.red;
      }
      this.stats.shopperCount.change = countChange;

      // avg rating
      this.stats.avgRating.value = parseFloat(data.avg_rating.current);
      var ratingChange = (data.avg_rating.current-data.avg_rating.prev);
      ratingChange = data.avg_rating.prev!=null? ratingChange:0;
      if(ratingChange>=0) {
        this.stats.avgRating.icon = 'ion-arrow-up-b';
        this.stats.avgRating.iconColor = this.colors.green;
      } else {
        ratingChange *= -1;
        this.stats.avgRating.icon = 'ion-arrow-down-b';
        this.stats.avgRating.iconColor = this.colors.red;
      }
      this.stats.avgRating.value = isFinite(this.stats.avgRating.value)? this.vmHelper.formatNumber(this.stats.avgRating.value,false,false, 0): '-';
      this.stats.avgRating.change = this.formatRating(parseFloat(ratingChange.toFixed(2)));

      // transaction per shopper
      var currentTransactionPerShopper = (parseFloat(data.transaction_count.current)/parseFloat(data.shopper_count.current)).toFixed(2);
      var prevTransactionPerShopper = (parseFloat(data.transaction_count.prev)/parseFloat(data.shopper_count.prev)).toFixed(2);
      var transactionChange = parseFloat((parseFloat(currentTransactionPerShopper) - parseFloat(prevTransactionPerShopper)).toFixed(2));
      transactionChange = isFinite(transactionChange)? transactionChange:0;
      if(transactionChange>=0) {
        this.stats.transactionPerShopper.icon = 'ion-arrow-up-b';
        this.stats.transactionPerShopper.iconColor = this.colors.green;
      } else {
        transactionChange *= -1;
        this.stats.transactionPerShopper.icon = 'ion-arrow-down-b';
        this.stats.transactionPerShopper.iconColor = this.colors.red;
      }
      this.stats.transactionPerShopper.value = isFinite(parseFloat(currentTransactionPerShopper))? this.vmHelper.formatNumber(parseFloat(currentTransactionPerShopper), false, false, 0):'-';
      this.stats.transactionPerShopper.change = this.vmHelper.formatNumber(transactionChange, false, false, 0);

      // RATING TRENDS
      if(this.chart != undefined) {
        $('#vmShopperRating').empty();
      }
      
      if(data.avg_rating.trend.trend.length == 0) {
        this.noData = true;
      } else {
        this.chart = this.AmCharts.makeChart('vmShopperRating',this.getRatingChartOptions(data.avg_rating.trend, this.colors));
        this.noData = false;
      }
      
      // shopper list
      this.shopperList.shopper = data.shopper;
    };

    public getRatingChartOptions(data: any, colors: any) { 
      var dateFormat;
      if(data.granularity == 'month')
        dateFormat = 'YYYY-MM';
      else if(data.granularity == 'day')
        dateFormat = 'YYYY-MM-DD';

      var options = {
        color: this.layoutColors.defaultText,
        data: data.trend,
        title: 'Rating',
        gridColor: this.layoutColors.border,
        valueLabelFunction: function(y) {
          return y;
        }, 
        graphs: [
          {
            id: 'g1',
            balloonFunction: (item: any, graph: any) => {
              var date = new Date(item.category);
              var formattedDate;
              if(data.granularity == 'month')
                formattedDate = this.vmHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
              else if(data.granularity == 'day')
                formattedDate =  date.getDate()+' '+this.vmHelper.formatMonth(date.getMonth());

              var value = item.values.value;
              var hoverInfo = formattedDate+'<br> Rating:<br> <b>'+this.vmHelper.formatNumber(value,false,false, 0)+'</b>';
              return hoverInfo;
            },
            bullet: 'round',
            bulletSize: 8,
            lineColor: colors.blue,
            lineThickness: 2,
            type: 'line',
            valueField: 'rating'
          }
        ],
        dataDateFormat: dateFormat,
        categoryField: 'date',
        categoryLabelFunction: (valueText: any, date: any, categoryAxis: any) => {
          if(data.granularity == 'month')
            return this.vmHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
          else if(data.granularity == 'day')
            return date.getDate()+' '+this.vmHelper.formatMonth(date.getMonth());
        }
      };
      
      var chartOptions = this.vmHelper.getLineChartOptions(options);
      chartOptions.valueAxes = [{
        maximum: 5
      }];

      return chartOptions;
    };

    // FEEDBACK STATS
    // public getFeedbackStats(startDate: any, endDate: any) {
    //   // this.loading = true;
    //   $http.get('/api/virtualmarket/feedback?type=stats&start_date='+startDate+'&end_date='+endDate)
    //     .then(function(res) {
    //       var data = res.data.data;
    //       this.showFeedbackCount(data.count);
    //       this.showFeedbackReason(data.feedback);

    //     })
    //     .finally(function() {
    //       // this.loading= false;
    //     });    
    // };

    public showFeedbackCount(data: any) {
      
      //feedback count
      var stat = <any>{};
      stat.description = this.stats.feedback_count.description;
      stat.info = this.stats.feedback_count.info;
      stat.showPie = this.stats.feedback_count.showPie;
      stat.showChange = this.stats.feedback_count.showChange;
      stat.value = parseInt(data.current);
      stat.prevValue = parseInt(data.prev);
      var change = ((stat.value-stat.prevValue)/(stat.prevValue)*100).toFixed(2);
      stat.change = isFinite(parseFloat(change))? change:0;
      if(stat.change>=0) {
        stat.icon = 'ion-arrow-up-b';
        stat.iconColor = this.colors.red;
      } else {
        stat.change *= -1;
        stat.icon = 'ion-arrow-down-b';
        stat.iconColor = this.colors.green;
      }
      stat.colSize = this.stats.feedback_count.colSize;
      stat.value = this.vmHelper.formatNumber(stat.value,false,false, 0);
      stat.change = this.vmHelper.formatNumber(stat.change,false,false, 0)+'%';
      this.stats.feedback_count = stat;
      
    }

    public showFeedbackStats(data: any) {
      this.stats.rating.transactions = data.transactions;
      if(data.value != null)
        this.stats.rating.value = this.vmHelper.formatNumber(data.value,false,false, 0) + ' / 5';
      else
        this.stats.rating.value = 0 + ' / 5';
    };

    // FEEDBACK REASON
    public showFeedbackReason(data: any) {
      this.drawChart(data, this.colors);
    };

    // chart options
    public getBarChartOptions(data: any, label: any, colors: any) { 
      
      var options = {
        color: this.layoutColors.defaultText,
        data: data,
        title: 'Ulasan',
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
              var hoverInfo = 'Jumlah Ulasan:<br> <b>'+value+'</b>';
              return hoverInfo;
            },
            lineAlpha: 0,
            fillColors: colors.yellow,
            fillAlphas: 1,
            type: 'column',
            valueField: 'count',
          }
        ],
        rotate: true,
        categoryField: 'reason',
      };

      return this.vmHelper.getBarChartOptions(options);
    };

    public drawChart =  function(data: any, colors: any) {
      var label = '';

      if(this.chart != undefined) {
        $('#vmFeedbackReason').empty();
      }

      if(data.length == 0) {
        this.noData = true;
      } else {
        this.chart = this.AmCharts.makeChart('vmFeedbackReason',this.getBarChartOptions(data, label, colors));
        this.noData = false;
      }
    };

    public formatRating(rating: any) {
      return this.vmHelper.formatNumber(rating,false,false,1);
    };

    public formatRatingChange(rating: any) {
      if(rating < 0)
        rating *= -1;
      rating = rating.toFixed(1);
      return this.vmHelper.formatNumber(rating,false,false,1);
    };

    public getArrowIcon(value: any) {
      if(value >= 0)
        return 'ion-arrow-up-b';
      else
        return 'ion-arrow-down-b';
    };

    public getArrowColor(value: any) {
      if(value >= 0)
        return this.colors.green;
      else
        return this.colors.red;
    };

    public sorter = {
      orders: function(value) {
        return parseInt(value.orders);
      },
      rating: function(value) {
        return parseFloat(value.rating);
      },
      feedbacks: function(value) {
        return parseInt(value.feedbacks);
      }
    };

}