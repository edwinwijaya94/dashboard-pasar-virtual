
import { Component, AfterViewInit, Input} from '@angular/core';
import { Headers, Http, Response } from '@angular/http';
import { BaThemeConfigProvider, colorHelper, layoutPaths } from '../../../theme';
import { AmChartsService } from "@amcharts/amcharts3-angular";
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

// import { OpProductService } from './op-product.service';
import { opHelper } from '../opHelper';
import { OpFilterService } from '../op-filter';

declare var moment:any;

// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/catch';

@Component({
  selector: 'op-product-trend',
  templateUrl: './product-trend-modal.html',
})

export class OpProductTrendComponent implements AfterViewInit {
  @Input() selectedProduct;
  @Input() productTrendData;
  // public  selectedProduct;
  // public  productTrendData;

  // COLORS
  public layoutColors = this._baConfig.get().colors;   
  public trackColor = 'rgba(0,0,0,0)';
  public pieColor = this.opHelper.colors.primary.green;

  public colors = this.opHelper.colors.primary;

  // DATA
  public chart: any;

  constructor(private http: Http, private _baConfig:BaThemeConfigProvider, private opFilterService: OpFilterService, private opHelper: opHelper, private AmCharts: AmChartsService, private activeModal: NgbActiveModal) {
  	
  }

  ngAfterViewInit() {
    // draw chart
    this.drawTrendChart();
  }

  public closeModal() {
    this.activeModal.close();
  }

  // TREND AND PREDICTION
  public getChartOptions(data: any, colors: any) {

    var dateFormat;
    if(data.granularity == 'month')
      dateFormat = 'YYYY-MM';
    else if(data.granularity == 'day') {
      dateFormat = 'YYYY-MM-DD';

      var startPoint, endPoint;
      for(var i=0; i<data.trend.length-1; i++) {
        var date = moment(data.trend[i+1].date, 'YYYY-MM-DD');
        if(date.isAfter(moment(),'day')) {
          var startDate = new Date(data.trend[i].date);
          startPoint = startDate;
          break;
        }
      }
      var endDate = new Date(data.trend[data.trend.length-1].date);
      endPoint = endDate;  
    }

    var countValueLabelFunction = (y) => {
      return this.opHelper.formatNumber(y,false,true, 0);
    } 
    var priceValueLabelFunction = (y) => {
      return this.opHelper.formatNumber(y,true,true, 0);
    }

    var options = {
      color: this.layoutColors.defaultText,
      data: data.trend,
      title: 'Tren Produk',
      gridColor: this.layoutColors.border,
      
      graphs: [
        {
          id: 'g1',
          valueAxis: 'v1',
          title: 'Tren Permintaan',
          balloonFunction: (item, graph) => {
            var value = item.values.value;
            var hoverInfo = this.opHelper.formatNumber(value,false,false,0);
            return hoverInfo;
          },
          bullet: 'round',
          bulletSize: 8,
          lineColor: colors.blue,
          lineThickness: 2,
          type: 'line',
          valueField: 'count',
          dashLengthField: 'dashLength'
        },
        {
          id: 'g2',
          valueAxis: 'v2',
          title: 'Tren Harga',
          // balloonText: 'Jumlah: <b>[[count]]</b><br>Nilai: <b>Rp [[value]]</b>',
          balloonFunction:(item, graph) => {
            var value = item.values.value;
            var hoverInfo = this.opHelper.formatNumber(value,true,false,0);
            return hoverInfo;
          },
          bullet: 'round',
          bulletSize: 8,
          lineColor: '#FF9900',
          lineThickness: 2,
          type: 'line',
          valueField: 'price',
          dashLengthField: 'dashLength'
        }
      ],
      dataDateFormat: dateFormat,
      categoryField: 'date',
      categoryLabelFunction: (valueText, date, categoryAxis) => {
        if(data.granularity == 'month')
          return this.opHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
        else if(data.granularity == 'day')
          return date.getDate()+' '+this.opHelper.formatMonth(date.getMonth());
      },
      valueAxes: [{
        id:'v1',
        axisColor: colors.blue,
        axisThickness: 2,
        axisAlpha: 1,
        position: 'left',
        labelFunction: countValueLabelFunction,
        minimum: 0,
        integersOnly: true,
      }, {
        id:'v2',
        axisColor: '#FF9900',
        axisThickness: 2,
        axisAlpha: 1,
        position: 'right',
        labelFunction: priceValueLabelFunction,
        minimum: 0,
        integersOnly: true,
      },],
    };
    
    var chartOptions = this.opHelper.getLineChartOptions(options);
    if(data.granularity == 'day') {
      chartOptions.categoryAxis.guides = [{
        date: startPoint,
        toDate: endPoint,
        lineColor: this.layoutColors.warning,
        lineAlpha: 1,
        fillAlpha: 0.2,
        fillColor: this.layoutColors.warning,
        dashLength: 2,
        inside: true,
        labelRotation: 0,
        label: 'Prediksi',
        position: 'top'
      }];
    }
    chartOptions.legend = {
      useGraphSettings: true,
      valueFunction: function(graphDataItem, valueText) {
        return '';
      },
      valueWidth:0
    };
    chartOptions.chartCursor.categoryBalloonEnabled = true;
    chartOptions.chartCursor.categoryBalloonFunction = (date) => {
      if(data.granularity == 'month')
        return this.opHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
      else if(data.granularity == 'day')
        return date.getDate()+' '+this.opHelper.formatMonth(date.getMonth());
    };
    return chartOptions;
  };

  public drawTrendChart() {
    this.chart = this.AmCharts.makeChart('opProductTrend',this.getChartOptions(this.productTrendData, this.colors));
  };

  public formatPrice(number: any) {
    if(number < 0)
      number *= -1;
    return this.opHelper.formatNumber(parseInt(number),true,false,0);
  };

  public formatNumber(number: any) {
    if(number < 0)
      number *= -1;
    return this.opHelper.formatNumber(parseInt(number),false,false,0);
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

}
