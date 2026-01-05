import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css'],
  imports: [CommonModule],
})
export class AboutUsComponent {
  // Stats or highlights (easy to tweak)
  highlights = [
    {
      label: 'Concurrent Appointments',
      value: '5,000+',
      desc: 'Scalable scheduling engine',
    },
    {
      label: 'Hospitals & Clinics',
      value: 'Multi-tenant',
      desc: 'Supports multiple facilities',
    },
    {
      label: 'Security & Compliance',
      value: 'HIPAA-ready',
      desc: 'Encrypted data & logging',
    },
  ];

  values = [
    {
      title: 'Patient-Centric Care',
      text: 'Design every interaction to minimize friction and maximize outcomes.',
    },
    {
      title: 'Reliability',
      text: 'Consistent performance across peak loads and critical workflows.',
    },
    {
      title: 'Privacy First',
      text: 'Protect PHI via encryption, access controls, and audit trails.',
    },
    {
      title: 'Interoperability',
      text: 'REST APIs, modular services, and standards-aligned data models.',
    },
  ];

  techStack = [
    {
      title: 'Frontend',
      text: 'Angular/React for rich, responsive patient and admin dashboards.',
    },
    {
      title: 'Backend',
      text: 'RESTful services in Java (Spring Boot) and .NET (ASP.NET Core).',
    },
    {
      title: 'Database',
      text: 'MySQL/SQL Server for structured, transactional healthcare data.',
    },
    {
      title: 'Deployment',
      text: 'Cloud-first with secure APIs, observability, and compliance logging.',
    },
  ];

  modules = [
    {
      title: 'Patient Profiles',
      text: 'Register, update, and review medical history securely.',
    },
    {
      title: 'Appointments',
      text: 'Schedule based on doctor availability with reminders.',
    },
    {
      title: 'EMR',
      text: 'Diagnosis, prescriptions, and lab results for consultations.',
    },
    {
      title: 'Billing',
      text: 'Generate invoices, track payments, and statuses.',
    },
    {
      title: 'Auth & Roles',
      text: 'Role-based access for patients, doctors, and admins.',
    },
  ];
}
