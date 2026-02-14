import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { DashboardMetrics } from '../../models/dashboard-metrics.interface';
import { Observable } from 'rxjs';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  metrics$!: Observable<DashboardMetrics>;

  @ViewChild('revenueChart') revenueChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('appointmentStatusChart')
  appointmentStatusChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('paymentStatusChart')
  paymentStatusChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('doctorWorkloadChart')
  doctorWorkloadChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('monthlyRevenueChart')
  monthlyRevenueChartRef!: ElementRef<HTMLCanvasElement>;

  private charts: Chart[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.metrics$ = this.adminService.getDashboardMetrics();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.initCharts();
    }, 100);
  }

  initCharts(): void {
    // Revenue Trend Chart (Last 7 Days)
    this.adminService.getRevenueData().subscribe((data) => {
      this.createLineChart(
        this.revenueChartRef.nativeElement,
        'Revenue Trend (Last 7 Days)',
        data.labels,
        data.data,
        'rgba(10, 91, 143, 0.8)',
      );
    });

    // Appointment Status Chart
    this.adminService.getAppointmentStatusData().subscribe((data) => {
      this.createDoughnutChart(
        this.appointmentStatusChartRef.nativeElement,
        'Appointment Status',
        data.labels,
        data.data,
      );
    });

    // Payment Status Chart
    this.adminService.getPaymentStatusData().subscribe((data) => {
      this.createPieChart(
        this.paymentStatusChartRef.nativeElement,
        'Payment Status',
        data.labels,
        data.data,
      );
    });

    // Doctor Workload Chart
    this.adminService.getDoctorWorkloadData().subscribe((data) => {
      this.createBarChart(
        this.doctorWorkloadChartRef.nativeElement,
        'Doctor Workload (Appointments)',
        data.labels,
        data.data,
      );
    });

    // Monthly Revenue Chart
    this.adminService.getMonthlyRevenueData().subscribe((data) => {
      this.createBarChart(
        this.monthlyRevenueChartRef.nativeElement,
        'Monthly Revenue (Last 6 Months)',
        data.labels,
        data.data,
        'rgba(61, 220, 151, 0.8)',
      );
    });
  }

  createLineChart(
    canvas: HTMLCanvasElement,
    label: string,
    labels: string[],
    data: number[],
    color: string = 'rgba(10, 91, 143, 0.8)',
  ): void {
    const chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            borderColor: color,
            backgroundColor: color.replace('0.8', '0.1'),
            borderWidth: 2,
            fill: true,
            tension: 0.4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return '₹' + value;
              },
            },
          },
        },
      },
    });
    this.charts.push(chart);
  }

  createBarChart(
    canvas: HTMLCanvasElement,
    label: string,
    labels: string[],
    data: number[],
    color: string = 'rgba(10, 91, 143, 0.8)',
  ): void {
    const chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor: color,
            borderColor: color.replace('0.8', '1'),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                if (label.includes('Revenue')) {
                  return '₹' + value;
                }
                return value;
              },
            },
          },
        },
      },
    });
    this.charts.push(chart);
  }

  createDoughnutChart(
    canvas: HTMLCanvasElement,
    label: string,
    labels: string[],
    data: number[],
  ): void {
    const chart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor: [
              'rgba(29, 78, 216, 0.8)',
              'rgba(5, 95, 70, 0.8)',
              'rgba(136, 19, 55, 0.8)',
            ],
            borderColor: [
              'rgba(29, 78, 216, 1)',
              'rgba(5, 95, 70, 1)',
              'rgba(136, 19, 55, 1)',
            ],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
          },
        },
      },
    });
    this.charts.push(chart);
  }

  createPieChart(
    canvas: HTMLCanvasElement,
    label: string,
    labels: string[],
    data: number[],
  ): void {
    const chart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor: ['rgba(5, 95, 70, 0.8)', 'rgba(185, 28, 28, 0.8)'],
            borderColor: ['rgba(5, 95, 70, 1)', 'rgba(185, 28, 28, 1)'],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'bottom',
          },
        },
      },
    });
    this.charts.push(chart);
  }

  formatCurrency(amount: number): string {
    return `₹ ${amount.toLocaleString('en-IN')}`;
  }

  ngOnDestroy(): void {
    this.charts.forEach((chart) => chart.destroy());
  }
}
