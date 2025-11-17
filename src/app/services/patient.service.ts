import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Medication {
  name: string;
  dose: string;
  frequency: string;
}

export interface CheckResult {
  title: string;
  status: 'pass' | 'fail';
  details?: string;
}

export interface Patient {
  id: string;
  name: string;
  gender: string;
  age: number;
  citizenId: string;
  address: string;
  medications: Medication[];
  checks: CheckResult[];
}

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  scanPatient(id: string): Observable<Patient> {
    const patient: Patient = {
      id,
      name: 'นายสมชาย ใจดี',
      gender: 'ชาย',
      age: 35,
      citizenId: '1234567890123',
      address: '123 หมู่ 5 ถนนสุขสวัสดิ์ เขตบางรัก กรุงเทพฯ',
      medications: [
        { name: 'Paracetamol', dose: '500mg', frequency: '2x/day' },
        { name: 'Amoxicillin', dose: '250mg', frequency: '3x/day' },
      ],
      checks: [
        { title: 'ตรวจแพ้ยา', status: 'pass' },
        {
          title: 'เช็คยาซ้ำซ้อน',
          status: 'fail',
          details: 'Amoxicillin ซ้ำกับรายการก่อนหน้า',
        },
        { title: 'ตรวจค่าแลป', status: 'pass' },
      ],
    };
    return of(patient);
  }
}
