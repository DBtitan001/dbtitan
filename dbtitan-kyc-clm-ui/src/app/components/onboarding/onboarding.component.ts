import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent {
  currentStep = 1;

  onboardingForm = new FormGroup({
    clientType: new FormControl('Corporate', Validators.required),
    clientName: new FormControl('', Validators.required),
    dateOfIncorporation: new FormControl(''),
    countryOfIncorporation: new FormControl(''),
    registrationNumber: new FormControl(''),
    panTaxId: new FormControl('')
  });

  nextStep() { if (this.currentStep < 5) this.currentStep++; }
  prevStep() { if (this.currentStep > 1) this.currentStep--; }
}
