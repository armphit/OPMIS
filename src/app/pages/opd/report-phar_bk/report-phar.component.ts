import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpService } from 'src/app/services/http.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-report-phar',
  templateUrl: './report-phar.component.html',
  styleUrls: ['./report-phar.component.scss'],
})
export class ReportPharComponent implements OnInit {
  public listData: Array<any> = [];
  public listStaff: Array<any> = [];
  public dataInfo: Array<any> = [];
  public sumOders: Array<any> = [];
  public sumItems: Array<any> = [];
  public sumTime: Array<any> = [];
  public avgTime: Array<any> = [];
  public n: Array<any> = [];
  public allSumOrder: any;
  public allSumItem: any;
  public allSumTime: any;
  public allSumAvg: any;
  public time = new Date();
  public firstTime: any;
  public arrItem8: Array<any> = [];
  public arrItem83: Array<any> = [];
  public arrItem9: Array<any> = [];
  public arrItem93: Array<any> = [];
  public arrItem10: Array<any> = [];
  public arrItem103: Array<any> = [];
  public arrItem11: Array<any> = [];
  public arrItem113: Array<any> = [];
  public arrItem12: Array<any> = [];
  public arrItem123: Array<any> = [];
  public arrItem13: Array<any> = [];
  public arrItem133: Array<any> = [];
  public arrItem14: Array<any> = [];
  public arrItem143: Array<any> = [];
  public arrItem15: Array<any> = [];
  public arrItem153: Array<any> = [];
  public maxMood: Array<any> = [];
  public minMood: Array<any> = [];
  public nameFile: any;

  @ViewChild('table') table!: ElementRef;

  constructor(public services: HttpService, private http: HttpClient) {}

  ngOnInit(): void {
    setInterval(() => {
      this.time = new Date();
    }, 1000);
    this.getFirstTime();
    this.getData();
    // setInterval(() => {
    //   this.getFirstTime();
    //   this.getData();
    // }, 60000);
  }

  fireEvent() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(
      this.table.nativeElement
    );
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    let datestring =
      this.time.getDate() +
      '-' +
      (this.time.getMonth() + 1) +
      '-' +
      this.time.getFullYear();
    /* save to file */
    XLSX.utils.book_append_sheet(wb, ws, datestring);
    XLSX.writeFile(wb, 'รายงานผู้จัดยา ' + datestring + '.xlsx');
  }

  public getFirstTime() {
    let times = this.time.toLocaleTimeString();
    this.firstTime = parseInt(times.split(':')[0] + times.split(':')[1]);
  }

  public getData = async () => {
    this.listData = [];
    this.listStaff = [];
    this.dataInfo = [];
    this.sumOders = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.sumItems = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.sumTime = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.avgTime = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.n = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.allSumOrder = 0;
    this.allSumItem = 0;
    this.allSumTime = 0;
    this.allSumAvg = [];
    this.maxMood = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.minMood = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.http
      .get(`${environment.apiUrl}repPharToHour`)
      .toPromise()
      .then((val: any) => {
        // console.log(val);
        if (val['rowCount'] > 0) {
          this.listData = val['result'];
          // console.log(this.listData);
          this.listData.forEach((el, i) => {
            this.listData[i]['createdDT'] = this.dateToInt(
              this.listData[i]['createdDT']
            );
            this.listStaff.push(this.listData[i]['staffCode']);
          });
          this.listStaff = [...new Set(this.listStaff)];
          // console.log(this.listStaff);
          this.listStaff.forEach((ei, i) => {
            // console.log(this.listStaff[i]);
            let gruop: Array<any> = [];
            this.listData.forEach((ej, j) => {
              if (this.listStaff[i] == this.listData[j]['staffCode']) {
                gruop.push(this.listData[j]);
              }
            });
            // console.log(gruop);
            let m = 0;
            let data = {
              staffCode: gruop[0]['staffCode'],
              staffName: gruop[0]['staffName'],
              order_8: ' ',
              order_83: ' ',
              item_8: ' ',
              item_83: ' ',
              avg_8: ' ',
              avg_83: ' ',
              order_9: ' ',
              order_93: ' ',
              item_9: ' ',
              item_93: ' ',
              avg_9: ' ',
              avg_93: ' ',
              order_10: ' ',
              order_103: ' ',
              item_10: ' ',
              item_103: ' ',
              avg_10: ' ',
              avg_103: ' ',
              order_11: ' ',
              order_113: ' ',
              item_11: ' ',
              item_113: ' ',
              avg_11: ' ',
              avg_113: ' ',
              order_12: ' ',
              order_123: ' ',
              item_12: ' ',
              item_123: ' ',
              avg_12: ' ',
              avg_123: ' ',
              order_13: ' ',
              order_133: ' ',
              item_13: ' ',
              item_133: ' ',
              avg_13: ' ',
              avg_133: ' ',
              order_14: ' ',
              order_143: ' ',
              item_14: ' ',
              item_143: ' ',
              avg_14: ' ',
              avg_143: ' ',
              order_15: ' ',
              order_153: ' ',
              item_15: ' ',
              item_153: ' ',
              avg_15: ' ',
              avg_153: ' ',
              order_sum: 0,
              item_sum: 0,
              time_sum: 0,
              avg_sum: '',
            };
            gruop.forEach((ek, k) => {
              if (gruop[k]['createdDT'] <= 830) {
                data.order_8 = gruop[k]['numOrders'];
                data.item_8 = gruop[k]['numItem'];
                data.avg_8 = gruop[k]['waitTime'];
                data.order_sum += parseInt(gruop[k]['numOrders']);
                data.item_sum += parseInt(gruop[k]['numItem']);
                data.time_sum += this.timeToSec(gruop[k]['waitTime']);
                this.sumOders[0] += parseInt(gruop[k]['numOrders']);
                this.sumItems[0] += parseInt(gruop[k]['numItem']);
                this.sumTime[0] += this.timeToSec(gruop[k]['waitTime']);
                this.arrItem8.push(parseInt(gruop[k]['numItem']));
                this.n[0]++;
                m++;
              } else if (gruop[k]['createdDT'] <= 900) {
                data.order_83 = gruop[k]['numOrders'];
                data.item_83 = gruop[k]['numItem'];
                data.avg_83 = gruop[k]['waitTime'];
                data.order_sum += parseInt(gruop[k]['numOrders']);
                data.item_sum += parseInt(gruop[k]['numItem']);
                data.time_sum += this.timeToSec(gruop[k]['waitTime']);
                this.sumOders[1] += parseInt(gruop[k]['numOrders']);
                this.sumItems[1] += parseInt(gruop[k]['numItem']);
                this.sumTime[1] += this.timeToSec(gruop[k]['waitTime']);
                this.arrItem83.push(parseInt(gruop[k]['numItem']));
                this.n[1]++;
                m++;
              } else if (gruop[k]['createdDT'] <= 930) {
                data.order_9 = gruop[k]['numOrders'];
                data.item_9 = gruop[k]['numItem'];
                data.avg_9 = gruop[k]['waitTime'];
                data.order_sum += parseInt(gruop[k]['numOrders']);
                data.item_sum += parseInt(gruop[k]['numItem']);
                data.time_sum += this.timeToSec(gruop[k]['waitTime']);
                this.sumOders[2] += parseInt(gruop[k]['numOrders']);
                this.sumItems[2] += parseInt(gruop[k]['numItem']);
                this.sumTime[2] += this.timeToSec(gruop[k]['waitTime']);
                this.arrItem9.push(parseInt(gruop[k]['numItem']));
                this.n[2]++;
                m++;
              } else if (gruop[k]['createdDT'] <= 1000) {
                data.order_93 = gruop[k]['numOrders'];
                data.item_93 = gruop[k]['numItem'];
                data.avg_93 = gruop[k]['waitTime'];
                data.order_sum += parseInt(gruop[k]['numOrders']);
                data.item_sum += parseInt(gruop[k]['numItem']);
                data.time_sum += this.timeToSec(gruop[k]['waitTime']);
                this.sumOders[3] += parseInt(gruop[k]['numOrders']);
                this.sumItems[3] += parseInt(gruop[k]['numItem']);
                this.sumTime[3] += this.timeToSec(gruop[k]['waitTime']);
                this.arrItem93.push(parseInt(gruop[k]['numItem']));
                this.n[3]++;
                m++;
              } else if (gruop[k]['createdDT'] <= 1030) {
                data.order_10 = gruop[k]['numOrders'];
                data.item_10 = gruop[k]['numItem'];
                data.avg_10 = gruop[k]['waitTime'];
                data.order_sum += parseInt(gruop[k]['numOrders']);
                data.item_sum += parseInt(gruop[k]['numItem']);
                data.time_sum += this.timeToSec(gruop[k]['waitTime']);
                this.sumOders[4] += parseInt(gruop[k]['numOrders']);
                this.sumItems[4] += parseInt(gruop[k]['numItem']);
                this.sumTime[4] += this.timeToSec(gruop[k]['waitTime']);
                this.arrItem10.push(parseInt(gruop[k]['numItem']));
                this.n[4]++;
                m++;
              } else if (gruop[k]['createdDT'] <= 1100) {
                data.order_103 = gruop[k]['numOrders'];
                data.item_103 = gruop[k]['numItem'];
                data.avg_103 = gruop[k]['waitTime'];
                data.order_sum += parseInt(gruop[k]['numOrders']);
                data.item_sum += parseInt(gruop[k]['numItem']);
                data.time_sum += this.timeToSec(gruop[k]['waitTime']);
                this.sumOders[5] += parseInt(gruop[k]['numOrders']);
                this.sumItems[5] += parseInt(gruop[k]['numItem']);
                this.sumTime[5] += this.timeToSec(gruop[k]['waitTime']);
                this.arrItem103.push(parseInt(gruop[k]['numItem']));
                this.n[5]++;
                m++;
              } else if (gruop[k]['createdDT'] <= 1130) {
                data.order_11 = gruop[k]['numOrders'];
                data.item_11 = gruop[k]['numItem'];
                data.avg_11 = gruop[k]['waitTime'];
                data.order_sum += parseInt(gruop[k]['numOrders']);
                data.item_sum += parseInt(gruop[k]['numItem']);
                data.time_sum += this.timeToSec(gruop[k]['waitTime']);
                this.sumOders[6] += parseInt(gruop[k]['numOrders']);
                this.sumItems[6] += parseInt(gruop[k]['numItem']);
                this.sumTime[6] += this.timeToSec(gruop[k]['waitTime']);
                this.arrItem11.push(parseInt(gruop[k]['numItem']));
                this.n[6]++;
                m++;
              } else if (gruop[k]['createdDT'] <= 1200) {
                data.order_113 = gruop[k]['numOrders'];
                data.item_113 = gruop[k]['numItem'];
                data.avg_113 = gruop[k]['waitTime'];
                data.order_sum += parseInt(gruop[k]['numOrders']);
                data.item_sum += parseInt(gruop[k]['numItem']);
                data.time_sum += this.timeToSec(gruop[k]['waitTime']);
                this.sumOders[7] += parseInt(gruop[k]['numOrders']);
                this.sumItems[7] += parseInt(gruop[k]['numItem']);
                this.sumTime[7] += this.timeToSec(gruop[k]['waitTime']);
                this.arrItem113.push(parseInt(gruop[k]['numItem']));
                this.n[7]++;
                m++;
              } else if (gruop[k]['createdDT'] <= 1230) {
                data.order_12 = gruop[k]['numOrders'];
                data.item_12 = gruop[k]['numItem'];
                data.avg_12 = gruop[k]['waitTime'];
                data.order_sum += parseInt(gruop[k]['numOrders']);
                data.item_sum += parseInt(gruop[k]['numItem']);
                data.time_sum += this.timeToSec(gruop[k]['waitTime']);
                this.sumOders[8] += parseInt(gruop[k]['numOrders']);
                this.sumItems[8] += parseInt(gruop[k]['numItem']);
                this.sumTime[8] += this.timeToSec(gruop[k]['waitTime']);
                this.arrItem12.push(parseInt(gruop[k]['numItem']));
                this.n[8]++;
                m++;
              } else if (gruop[k]['createdDT'] <= 1300) {
                data.order_123 = gruop[k]['numOrders'];
                data.item_123 = gruop[k]['numItem'];
                data.avg_123 = gruop[k]['waitTime'];
                data.order_sum += parseInt(gruop[k]['numOrders']);
                data.item_sum += parseInt(gruop[k]['numItem']);
                data.time_sum += this.timeToSec(gruop[k]['waitTime']);
                this.sumOders[9] += parseInt(gruop[k]['numOrders']);
                this.sumItems[9] += parseInt(gruop[k]['numItem']);
                this.sumTime[9] += this.timeToSec(gruop[k]['waitTime']);
                this.arrItem123.push(parseInt(gruop[k]['numItem']));
                this.n[9]++;
                m++;
              } else if (gruop[k]['createdDT'] <= 1330) {
                data.order_13 = gruop[k]['numOrders'];
                data.item_13 = gruop[k]['numItem'];
                data.avg_13 = gruop[k]['waitTime'];
                data.order_sum += parseInt(gruop[k]['numOrders']);
                data.item_sum += parseInt(gruop[k]['numItem']);
                data.time_sum += this.timeToSec(gruop[k]['waitTime']);
                this.sumOders[10] += parseInt(gruop[k]['numOrders']);
                this.sumItems[10] += parseInt(gruop[k]['numItem']);
                this.sumTime[10] += this.timeToSec(gruop[k]['waitTime']);
                this.arrItem13.push(parseInt(gruop[k]['numItem']));
                this.n[10]++;
                m++;
              } else if (gruop[k]['createdDT'] <= 1400) {
                data.order_133 = gruop[k]['numOrders'];
                data.item_133 = gruop[k]['numItem'];
                data.avg_133 = gruop[k]['waitTime'];
                data.order_sum += parseInt(gruop[k]['numOrders']);
                data.item_sum += parseInt(gruop[k]['numItem']);
                data.time_sum += this.timeToSec(gruop[k]['waitTime']);
                this.sumOders[11] += parseInt(gruop[k]['numOrders']);
                this.sumItems[11] += parseInt(gruop[k]['numItem']);
                this.sumTime[11] += this.timeToSec(gruop[k]['waitTime']);
                this.arrItem133.push(parseInt(gruop[k]['numItem']));
                this.n[11]++;
                m++;
              } else if (gruop[k]['createdDT'] <= 1430) {
                data.order_14 = gruop[k]['numOrders'];
                data.item_14 = gruop[k]['numItem'];
                data.avg_14 = gruop[k]['waitTime'];
                data.order_sum += parseInt(gruop[k]['numOrders']);
                data.item_sum += parseInt(gruop[k]['numItem']);
                data.time_sum += this.timeToSec(gruop[k]['waitTime']);
                this.sumOders[12] += parseInt(gruop[k]['numOrders']);
                this.sumItems[12] += parseInt(gruop[k]['numItem']);
                this.sumTime[12] += this.timeToSec(gruop[k]['waitTime']);
                this.arrItem14.push(parseInt(gruop[k]['numItem']));
                this.n[12]++;
                m++;
              } else if (gruop[k]['createdDT'] <= 1500) {
                data.order_143 = gruop[k]['numOrders'];
                data.item_143 = gruop[k]['numItem'];
                data.avg_143 = gruop[k]['waitTime'];
                data.order_sum += parseInt(gruop[k]['numOrders']);
                data.item_sum += parseInt(gruop[k]['numItem']);
                data.time_sum += this.timeToSec(gruop[k]['waitTime']);
                this.sumOders[13] += parseInt(gruop[k]['numOrders']);
                this.sumItems[13] += parseInt(gruop[k]['numItem']);
                this.sumTime[13] += this.timeToSec(gruop[k]['waitTime']);
                this.arrItem143.push(parseInt(gruop[k]['numItem']));
                this.n[13]++;
                m++;
              } else if (gruop[k]['createdDT'] <= 1530) {
                data.order_15 = gruop[k]['numOrders'];
                data.item_15 = gruop[k]['numItem'];
                data.avg_15 = gruop[k]['waitTime'];
                data.order_sum += parseInt(gruop[k]['numOrders']);
                data.item_sum += parseInt(gruop[k]['numItem']);
                data.time_sum += this.timeToSec(gruop[k]['waitTime']);
                this.sumOders[14] += parseInt(gruop[k]['numOrders']);
                this.sumItems[14] += parseInt(gruop[k]['numItem']);
                this.sumTime[14] += this.timeToSec(gruop[k]['waitTime']);
                this.arrItem15.push(parseInt(gruop[k]['numItem']));
                this.n[14]++;
                m++;
              } else if (gruop[k]['createdDT'] <= 1600) {
                data.order_153 = gruop[k]['numOrders'];
                data.item_153 = gruop[k]['numItem'];
                data.avg_153 = gruop[k]['waitTime'];
                data.order_sum += parseInt(gruop[k]['numOrders']);
                data.item_sum += parseInt(gruop[k]['numItem']);
                data.time_sum += this.timeToSec(gruop[k]['waitTime']);
                this.sumOders[15] += parseInt(gruop[k]['numOrders']);
                this.sumItems[15] += parseInt(gruop[k]['numItem']);
                this.sumTime[15] += this.timeToSec(gruop[k]['waitTime']);
                this.arrItem153.push(parseInt(gruop[k]['numItem']));
                this.n[15]++;
                m++;
              }
            });
            data.avg_sum = this.secToTime(data.time_sum, m);
            this.dataInfo.push(data);
            this.allSumOrder += data.order_sum;
            this.allSumItem += data.item_sum;
            this.allSumTime += this.timeToSec(data.avg_sum);
          });
          // console.log(this.dataInfo);
          this.sumTime.forEach((el, i) => {
            if (this.sumTime[i] != 0) {
              this.avgTime[i] = this.secToTime(this.sumTime[i], this.n[i]);
            }
          });
          // console.log(this.allSumTime);
          this.allSumAvg = this.secToTime(
            this.allSumTime,
            this.listStaff.length
          );
          this.findMood(this.arrItem8, this.n[0], 0);
          this.findMood(this.arrItem83, this.n[1], 1);
          this.findMood(this.arrItem9, this.n[2], 2);
          this.findMood(this.arrItem93, this.n[3], 3);
          this.findMood(this.arrItem10, this.n[4], 4);
          this.findMood(this.arrItem103, this.n[5], 5);
          this.findMood(this.arrItem11, this.n[6], 6);
          this.findMood(this.arrItem113, this.n[7], 7);
          this.findMood(this.arrItem12, this.n[8], 8);
          this.findMood(this.arrItem123, this.n[9], 9);
          this.findMood(this.arrItem13, this.n[10], 10);
          this.findMood(this.arrItem133, this.n[11], 11);
          this.findMood(this.arrItem14, this.n[12], 12);
          this.findMood(this.arrItem143, this.n[13], 13);
          this.findMood(this.arrItem15, this.n[14], 14);
          this.findMood(this.arrItem153, this.n[15], 15);
        }
      })
      .catch((reason) => {
        console.log(reason);
        // this.services.alert('error', 'ไม่สามารถเชื่อมต่อเชิฟเวอร์ได้');
      })
      .finally(() => {});
  };

  public dateToInt = (data: any) => {
    // console.log(data);
    // console.log(data.split(':')[0]+data.split(':')[1]);
    return parseInt(data.split(':')[0] + data.split(':')[1]);
  };

  public findMood = (data: any, n: any, i: any) => {
    if (data.length > 0) {
      // console.log(data);
      let maxItem = 0;
      let minItem = 0;
      let range = 0;
      let wide = 0;
      maxItem = Math.max(...data);
      minItem = Math.min(...data);
      range = maxItem - minItem;
      wide = Math.ceil(range / n);

      let f = new Array();
      let mood = new Array();
      let top = new Array();
      let bot = new Array();
      data.forEach((el: any, l: any) => {
        f.push(0);
        mood.push(0);
        top.push(0);
        bot.push(0);
      });
      data.forEach((el: any, l: any) => {
        for (let i = minItem + 1, j = 0; i <= maxItem; i = i + wide, j++) {
          if (data[l] >= i - 1 && data[l] <= i - 2 + wide) {
            f[j] = f[j] + 1;
            top[j] = i - 2 + wide;
            bot[j] = i - 1;
            // console.log(i - 1 + ' - ' + (i - 2 + wide));
            // console.log(data[l] + ' = ' + f[j]);
          }
        }
      });

      this.maxMood[i] = top[f.indexOf(Math.max(...f))];
      this.minMood[i] = bot[f.indexOf(Math.max(...f))];
    }
  };

  public timeToSec = (data: any) => {
    let Hour = 0;
    let Minute = 0;
    let Sec = 0;
    Hour += parseInt(data.split(':')[0]);
    Minute += parseInt(data.split(':')[1]);
    Sec += parseInt(data.split(':')[2]);
    return Hour * 60 * 60 + Minute * 60 + Sec;
  };

  public secToTime = (data: any, m: any) => {
    // console.log(data + ' ' + m);
    data = data / m;
    // console.log(data);
    let Hour = 0;
    let Minute = 0;
    let Sec = 0;
    Minute = Math.floor(data / 60);
    Sec = Math.floor(data - 60 * Minute);
    Hour = Math.floor(Minute / 60);
    return (
      ('0' + Hour).slice(-2) +
      ':' +
      ('0' + Minute).slice(-2) +
      ':' +
      ('0' + Sec).slice(-2)
    );
  };
}
