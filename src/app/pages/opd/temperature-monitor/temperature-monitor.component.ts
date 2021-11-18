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
    this.getData();
  }

  ngOnInit(): void {}

  public dataDrug: any = null;
  public async getData() {
    let formData = new FormData();
    formData.append('date', '2021-11-17');

    let drugData: any = await this.http.post('tempMonitor', formData);
    let arrAVGT = [];
    let arrTIME = [];
    if (drugData.connect) {
      if (drugData.response.rowCount > 0) {
        this.dataDrug = drugData.response.result;

        for (let index = 0; index < this.dataDrug.length; index++) {
          arrAVGT.push(this.dataDrug[index].AVGT);
          arrTIME.push(this.dataDrug[index].concatHOUR);
        }

        let data = {
          AVGT: arrAVGT,
          TIME: arrTIME,
        };

        this.dataCharts(data);
      } else {
        this.dataDrug = null;
      }
    } else {
      Swal.fire('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้!', '', 'error');
    }
  }

  public async dataCharts(data: any) {
    this.chartOptions = {
      series: [
        {
          name: 'Average',
          data: data.AVGT,
        },
        {
          name: 'Low',
          data: [10, 10],
        },
        {
          name: 'High',
          data: [26, 26],
        },
      ],
      chart: {
        height: 350,
        type: 'line',
        zoom: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'straight',
      },
      title: {
        text: this.dataDrug[0].name,
        align: 'left',
      },
      grid: {
        row: {
          colors: ['#f3f3f3', 'transparent'], // takes an array which will be repeated on columns
          opacity: 0.5,
        },
      },
      xaxis: {
        categories: data.TIME,
      },
    };
  }
}
