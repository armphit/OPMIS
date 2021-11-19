import { Component, OnInit, ViewChild } from '@angular/core';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexDataLabels,
  ApexTitleSubtitle,
  ApexStroke,
  ApexGrid,
} from 'ng-apexcharts';
import * as moment from 'moment';

import { HttpService } from 'src/app/services/http.service';
import Swal from 'sweetalert2';
export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  grid: ApexGrid;
  stroke: ApexStroke;
  title: ApexTitleSubtitle;
};
@Component({
  selector: 'app-temperature-monitor',
  templateUrl: './temperature-monitor.component.html',
  styleUrls: ['./temperature-monitor.component.scss'],
})
export class TemperatureMonitorComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;
  public chartOptions!: Partial<ChartOptions> | any;
  public chartOptions2!: Partial<ChartOptions> | any;

  constructor(private http: HttpService) {
    this.chartOptions = {
      series: [],
      chart: {},
      dataLabels: {},
      stroke: {},
      title: {},
      grid: {},
      xaxis: {},
    };
    this.chartOptions2 = {
      series: [],
      chart: {},
      dataLabels: {},
      stroke: {},
      title: {},
      grid: {},
      xaxis: {},
    };
    this.getData();
  }

  ngOnInit(): void {}

  public dataDrug: any = null;
  public Chumidity: any = null;
  public Ctemperature: any = null;
  public async getData() {
    let formData = new FormData();
    formData.append('date', '2021-11-19');

    let drugData: any = await this.http.post('tempMonitor', formData);
    let currentTemp: any = await this.http.post('currentTemp', formData);
    let arrAVGT = [];
    let arrTIME = [];
    let arrHIGH = [];
    let arrLOW = [];
    if (drugData.connect) {
      if (drugData.response.rowCount > 0) {
        this.dataDrug = drugData.response.result;

        for (let index = 0; index < this.dataDrug.length; index++) {
          arrAVGT.push(this.dataDrug[index].AVGT);
          arrTIME.push(this.dataDrug[index].HOUR + '.00');
          arrHIGH.push(26);
          arrLOW.push(10);
        }
      } else {
        this.dataDrug = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }

    if (currentTemp.connect) {
      if (currentTemp.response.rowCount > 0) {
        currentTemp.response.result;

        this.Ctemperature = currentTemp.response.result[0].temperature;
        this.Chumidity = currentTemp.response.result[0].humidity;
      } else {
        this.Ctemperature = null;
        this.Chumidity = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }

    let data = {
      AVGT: arrAVGT,
      TIME: arrTIME,
      HIGH: arrHIGH,
      LOW: arrLOW,
    };
    this.dataCharts(data);
  }

  public async dataCharts(data: any) {
    this.chartOptions = {
      series: [
        {
          name: 'High',
          data: data.HIGH,
        },
        {
          name: 'Average',
          data: data.AVGT,
        },
        {
          name: 'Low',
          data: data.LOW,
        },
      ],
      chart: {
        width: 500,
        height: 350,
        type: 'line',
        dropShadow: {
          enabled: true,
          color: '#000',
          top: 18,
          left: 7,
          blur: 10,
          opacity: 0.2,
        },
        toolbar: {
          show: false,
        },
      },
      colors: ['#ff6961', '#61a8ff', '#61ffb8'],
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'straight',
      },
      title: {
        text: this.dataDrug[0].NAME,
        align: 'left',
      },
      grid: {
        borderColor: '#e7e7e7',
        row: {
          colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.5,
        },
      },
      markers: {
        size: [0, 5, 0],
      },
      xaxis: {
        categories: data.TIME,
        title: {
          text: 'Hour',
        },
      },
      yaxis: {
        title: {
          text: 'Degree Celsius',
        },
      },
      legend: {
        position: 'top',
        horizontalAlign: 'right',
        floating: true,
        offsetY: -25,
        offsetX: -5,
      },
    };

    // this.chartOptions = {
    //   series: [
    //     {
    //       name: 'High',
    //       data: data.HIGH,
    //     },
    //     {
    //       name: 'Average',
    //       data: data.AVGT,
    //     },
    //     {
    //       name: 'Low',
    //       data: data.LOW,
    //     },
    //   ],
    //   chart: {
    //     height: 350,
    //     type: 'line',
    //     zoom: {
    //       enabled: false,
    //     },
    //   },
    //   colors: ['#ff6961', '#61a8ff', '#61ffb8'],
    //   dataLabels: {
    //     enabled: false,
    //   },
    //   stroke: {
    //     curve: 'straight',
    //   },
    //   title: {
    //     text: this.dataDrug[0].name,
    //   },
    //   grid: {
    //     row: {
    //       colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
    //       opacity: 0.5,
    //     },
    //   },
    //   xaxis: {
    //     categories: data.TIME,
    //     title: {
    //       text: 'HOUR',
    //     },
    //   },
    //   yaxis: {
    //     title: {
    //       text: 'Degree Celsius',
    //     },
    //   },
    //   markers: {
    //     size: [0, 7, 0],
    //   },
    // };
  }
}
