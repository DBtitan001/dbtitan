import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ClientsComponent } from './components/clients/clients.component';
import { OnboardingComponent } from './components/onboarding/onboarding.component';
import { KycReviewComponent } from './components/kyc-review/kyc-review.component';
import { AlertsComponent } from './components/alerts/alerts.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'clients', component: ClientsComponent },
  { path: 'onboarding', component: OnboardingComponent },
  { path: 'kyc-review', component: KycReviewComponent },
  { path: 'alerts', component: AlertsComponent },
  { path: '**', redirectTo: 'login' }
];
