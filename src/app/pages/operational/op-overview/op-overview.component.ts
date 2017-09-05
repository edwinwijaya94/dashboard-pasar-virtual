import {Component, OnInit} from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import {BaThemeConfigProvider, colorHelper, layoutPaths} from '../../../theme';
import { AmChartsService } from "@amcharts/amcharts3-angular";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import {OpOverviewService} from './op-overview.service';
import {opHelper} from '../opHelper';
import {OpFilterService} from '../op-filter';

import { OpProductTrendComponent } from './op-product-trend.component';

declare var moment:any;
import 'easy-pie-chart/dist/jquery.easypiechart.js';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Component({
  selector: 'op-overview',
  templateUrl: './op-overview.html',
  // styleUrls: ['./pieChart.scss']
})

export class OpOverviewComponent {
    public layoutColors = this._baConfig.get().colors;
    
    // COLORS
    public trackColor = 'rgba(0,0,0,0)';
    public pieColor = this.opHelper.colors.primary.green;

    public colors = this.opHelper.colors.primary;
    public chartColors = [this.colors.blue, this.colors.yellow, this.colors.green, this.colors.red];
    
    public chart: any;
    public productPageIndex = 1;
    public productPageSize = 5;
    public productList:any;

    public unavailablePageIndex = 1;
    public unavailablePageSize = 5;
    public unavailableList:any;

    public noData = false;

    public startDate = this.opHelper.defDate.start;
    public endDate = this.opHelper.defDate.end;

    // FILTER
    public nameQuery = "";
    public categoryQuery = "";
    
    // DEFAULT CHART SETTINGS
    public stats: any = {
      product_availability: {
        color: this.pieColor,
        description: 'Tersedia',
        info: '',
        value: this.opHelper.formatNumber(0,false,false, 0),
        percent: 0,
        showPie: true,
        showChange: false,
        change: 0,
        prevValue: 0,
        icon:'ion-arrow-up-b',
        iconColor: this.colors.green,
        colSize: 6,
      },
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
        colSize: 6,
      },
      fluctuation: {
        description: 'Fluktuasi Harga',
        value: this.opHelper.formatNumber(0,false,false, 0),
        showPie: false,
        showChange: true,
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

    // EVENTS
    constructor(private http: Http, private _baConfig:BaThemeConfigProvider, private opFilterService: OpFilterService, private opOverviewService: OpOverviewService, private opHelper: opHelper, private AmCharts: AmChartsService, private modalService: NgbModal) {
      this.initProductList();
      this.opFilterService.periodChange$.subscribe(period => {
        this.startDate = period.startDate;
        this.endDate = period.endDate;
        this.getData(this.startDate, this.endDate);
      });
    }

    public getData(startDate: any, endDate: any) {
      this.opOverviewService.getOverview(startDate, endDate)
        .subscribe(data => {
          this.showProduct(data.product);
          this.showTransaction(data.transaction);
          this.showFluctuation(data.fluctuation);
        });
    }

    // PRODUCT
    public initProductList() {
      this.productPageIndex = 1;
      this.unavailablePageIndex = 1;
      this.productPageSize = 5;
      this.unavailableList = {
        totalRows: 0,
        displayedPages: 1,
        product:[]
      };
      this.productList = {
        totalRows: 0,
        displayedPages: 1,
        product:[]
      };
    }

    public  _loadPieCharts() {

      jQuery('.chart').each(function () {
        let chart = jQuery(this);
        chart.easyPieChart({
          easing: 'easeOutBounce',
          onStep: function (from, to, percent) {
            jQuery(this.el).find('.percent').text(Math.round(percent));
          },
          barColor: jQuery(this).attr('data-rel'),
          trackColor: 'rgba(0,0,0,0)',
          size: 84,
          scaleLength: 0,
          animation: false,
          lineWidth: 9,
          lineCap: 'round',
        });
      });
    }

    public showProduct(data: any) {
      // availability rates
      var available, notAvailable;
      var items = data.availability;
      for(var i=0; i<items.length; i++ ) {
        if(items[i].is_available == true) {
          available = parseInt(items[i].count);
        }
        else if (items[i].is_available == false) {
          notAvailable = parseInt(items[i].count);
        }
      }
      var percentage = (available + notAvailable)>0 ? Math.round(available / (available + notAvailable) * 100) : 0;
      // update chart
      this.stats.product_availability.value = available+'/'+(available+notAvailable);
      this.stats.product_availability.percent = percentage;

      setTimeout (() => {
          this._loadPieCharts();
      }, 1000);

      // unavailable list
      this.unavailableList.product = data.unavailable_list;
      
      // product list
      this.productList.product = data.list;
    };

    public showTransaction(data: any) {
      // transaction count
      var stat = <any>{};
      stat.description = this.stats.transaction_count.description;
      stat.info = this.stats.transaction_count.info;
      stat.showPie = this.stats.transaction_count.showPie;
      stat.showChange = this.stats.transaction_count.showChange;
      stat.value = parseInt(data.count.current);
      stat.prevValue = parseInt(data.count.prev);
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
      stat.change = this.opHelper.formatNumber(stat.change,false,false, 0);
      this.stats.transaction_count = stat;

      // transaction status
      var items = data.status;
      for(var i=0; i<items.length; i++){
        if(items[i].status == 'success')
          items[i].fillColor = this.colors.green;
        else
          items[i].fillColor = '#d1cfcf';
      }
      data.status = items;
      this.chart = this.AmCharts.makeChart('opTransactionStatus',this.getBarChartOptions(data.status, this.colors, 'status'));

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

      return this.opHelper.getBarChartOptions(options);
    };

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
      stat.value = isFinite(stat.value)? (this.opHelper.formatNumber(stat.value,false,false, 0)+'%'):'-';
      this.stats.fluctuation = stat;
    }

    // PRODUCT TREND
     public viewTrend(product: any) {
      var startDate = this.startDate;
      var endDate = this.endDate;

      // this.selectedProduct = product;
      this.opOverviewService.getProductTrend(startDate, endDate, product.id)
        .subscribe(data => {
          if(data.trend.granularity=='day') {
            for(var i=0; i<data.trend.length-1; i++) {
              var date = moment(data.trend[i+1].date, 'YYYY-MM-DD');
              if(date.isAfter(moment(),'day'))
                data.trend[i].dashLength = 2;  
              else
                data.trend[i].dashLength = 0;  
            }
          } else {
            for(var i=0; i<data.trend.length-1; i++) {
              data.trend[i].dashLength = 0;  
            }
          }
          // this.productTrendData = data;
          
          const activeModal = this.modalService.open(OpProductTrendComponent, {size: 'lg', windowClass: 'pv-product-trend-modal'});
          // activeModal.componentInstance.modalTitle = 'Produk';
          activeModal.componentInstance.selectedProduct = product;
          activeModal.componentInstance.productTrendData = data;

        });
    };

    public formatNumber(number: any) {
      return this.opHelper.formatNumber(parseFloat(number),false,false, 0);
    };

    public formatRating(rating: any) {
      return this.opHelper.formatNumber(rating,false,false, 0);
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

    public reloadProductStatus() {
      this.opOverviewService.getOverview(this.startDate, this.endDate)
        .subscribe(data => {
          this.showProduct(data.product);
          this.showTransaction(data.transaction);
          this.showFluctuation(data.fluctuation);
        });
    }

    public sorter = {
      count: function(value) {
        return parseInt(value.count);
      },
      avgPrice: function(value) {
        return parseInt(value.avg_price);
      },
      availability: function(value) {
        return parseFloat(value.availability);
      }
    };

    
}