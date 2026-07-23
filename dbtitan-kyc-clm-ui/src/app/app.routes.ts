import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ClientsComponent } from './components/clients/clients.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { KycReviewComponent } from './components/kyc-review/kyc-review.component';
import { AlertsComponent } from './components/alerts/alerts.component';
import { DocumentsComponent } from './components/documents/documents.component';
import { ReportsComponent } from './components/reports/reports.component';
import { AuditTrailComponent } from './components/audit-trail/audit-trail.component';
import { OffboardingComponent } from './components/offboarding/offboarding.component';
import { SettingsComponent } from './components/settings/settings.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'clients', component: ClientsComponent },
  { path: 'onboarding', component: OnboardingComponent },
  { path: 'kyc-review', component: KycReviewComponent },
  { path: 'alerts', component: AlertsComponent },
  { path: 'documents', component: DocumentsComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'audit-trail', component: AuditTrailComponent },
  { path: 'offboarding', component: OffboardingComponent },
  { path: 'settings', component: SettingsComponent },
  { path: '**', redirectTo: 'login' }
];
