export interface DashboardMetrics {
  totalPatients: number;
  totalAppointments: number;
  todayAppointments: number;
  pendingAppointments: number;
  totalRevenue: number;
  todayRevenue: number;
  pendingPayments: number;
  activeDoctors: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: number;
  type:
    | 'PATIENT_REGISTERED'
    | 'APPOINTMENT_CREATED'
    | 'APPOINTMENT_COMPLETED'
    | 'PAYMENT_RECEIVED'
    | 'INVOICE_GENERATED';
  description: string;
  timestamp: string;
  userId?: number;
  userName?: string;
}
