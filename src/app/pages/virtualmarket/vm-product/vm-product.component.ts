import {Component, OnInit} from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { BaThemeConfigProvider, colorHelper, layoutPaths } from '../../../theme';
import { AmChartsService } from "@amcharts/amcharts3-angular";
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import {VmProductService} from './vm-product.service';
import {vmHelper} from '../vmHelper';
import {VmFilterService} from '../vm-filter';

import { VmProductTrendComponent } from './vm-product-trend.component';

declare var moment:any;

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Component({
  selector: 'vm-product',
  templateUrl: './vm-product.html',
})

export class VmProductComponent {
    public layoutColors = this._baConfig.get().colors;
    
    // COLORS
    public trackColor = 'rgba(0,0,0,0)';
    public pieColor = this.vmHelper.colors.primary.green;

    public colors = this.vmHelper.colors.primary;
    public chartColors = [this.colors.green, this.colors.yellow, this.colors.blue, this.colors.red];
    
    public chart: any;
    public productPageIndex = 1;
    public productPageSize = 5;
    public productList = {
      totalRows: 0,
      // page: 1,
      // rowsPerPage: 5,
      displayedPages: 1,
      product:[]
    };
    public noData = false;

    public startDate = this.vmHelper.defDate.start;
    public endDate = this.vmHelper.defDate.end;

    // FILTER
    public nameQuery = "";
    public categoryQuery = "";

    // DEFAULT CHART SETTINGS
    public stats: any = {
      availability: {
        color: this.pieColor,
        description: 'Tingkat Ketersediaan',
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
      fluctuation: {
        description: 'Fluktuasi Harga',
        value: this.vmHelper.formatNumber(0,false,false, 0),
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

    constructor(private http: Http, private _baConfig:BaThemeConfigProvider, private vmFilterService: VmFilterService, private vmProductService: VmProductService, private vmHelper: vmHelper, private AmCharts: AmChartsService, private modalService: NgbModal) {
      this.vmFilterService.periodChange$.subscribe(period => {
        this.startDate = period.startDate;
        this.endDate = period.endDate;
        this.getData(this.startDate, this.endDate);
      });
    }

    public getData(startDate: any, endDate: any) {

      this.vmProductService.getStats(startDate, endDate)
        .subscribe(data => {
          this.showFluctuation(data.fluctuation)
        });
        
      this.vmProductService.getProductList(startDate, endDate)
        .subscribe(data => {
          this.showProducts(data);
          this.showAvailability(data.availability);
        });    
    }

    public showAvailability(data: any) {

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
      // format number
      stat.value = isFinite(stat.value)? (this.vmHelper.formatNumber(parseFloat(stat.value),false,false, 0)+'%'):'-';
      stat.change = this.vmHelper.formatNumber(stat.change,false,false, 0);
      this.stats.availability = stat;

      // AVAILABILITY TRENDS
      if(this.chart != undefined) {
        $('#vmProductAvailability').empty();
      }
      
      if(data.trend.trend.length == 0) {
        this.noData = true;
      } else {
        this.chart = this.AmCharts.makeChart('vmProductAvailability',this.getAvailabilityChartOptions(data.trend, this.colors));
        this.noData = false;
      }
    }

    public getAvailabilityChartOptions(data: any, colors: any) { 
      var dateFormat;
      if(data.granularity == 'month')
        dateFormat = 'YYYY-MM';
      else if(data.granularity == 'day')
        dateFormat = 'YYYY-MM-DD';

      var options = {
        color: this.layoutColors.defaultText,
        data: data.trend,
        title: 'Ketersediaan (%)',
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
              var hoverInfo = formattedDate+'<br> Ketersediaan:<br> <b>'+this.vmHelper.formatNumber(value,false,false,0)+' %</b>';
              return hoverInfo;
            },
            bullet: 'round',
            bulletSize: 8,
            lineColor: this.colors.blue,
            lineThickness: 2,
            type: 'line',
            valueField: 'availability'
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
        maximum: 100
      }];

      return chartOptions;
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
      stat.value = isFinite(stat.value)? (this.vmHelper.formatNumber(stat.value,false,false,0)+'%'):'-';
      this.stats.fluctuation = stat;
    }

    // public showUnavailableProducts(data: any) {
    //   this.unavailableProducts = data;
    // }


    // PRODUCT LIST
    public showProducts(data: any) {
      this.productList.totalRows = data.total_rows;
      this.productList.product = data.product;

      // this.updatedProductList = data.product;
      // copy references
      // this.productList.product = [].concat(this.updatedProductList);
    };

    public formatNumber(number: any) {
      return this.vmHelper.formatNumber(number,false,false, 0);
    };

    // TREND AND PREDICTION
    public viewTrend(product: any) {
      var startDate = this.startDate;
      var endDate = this.endDate;

      // this.selectedProduct = product;
      this.vmProductService.getProductTrend(startDate, endDate, product.id)
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
          
          const activeModal = this.modalService.open(VmProductTrendComponent, {size: 'lg', windowClass: 'pv-product-trend-modal'});
          // activeModal.componentInstance.modalTitle = 'Produk';
          activeModal.componentInstance.selectedProduct = product;
          activeModal.componentInstance.productTrendData = data;

        });
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