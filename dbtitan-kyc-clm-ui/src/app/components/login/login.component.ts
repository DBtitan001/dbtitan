import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  isLoginMode = true;
  isForgotPasswordMode = false; // New state for Forgot Password view
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  private readonly API_URL = 'https://dbtitan-backend-406358130353.asia-south1.run.app/api/auth';

  loginForm = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });

  signupForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  forgotPasswordForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email])
  });

  constructor(private http: HttpClient, private router: Router) {}

  toggleMode(login: boolean) {
    this.isLoginMode = login;
    this.isForgotPasswordMode = false;
    this.errorMessage = '';
    this.successMessage = '';
  }

  openForgotPassword(event: Event) {
    event.preventDefault();
    this.isForgotPasswordMode = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  onLoginSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      this.http.post<any>(`${this.API_URL}/login`, this.loginForm.value).subscribe({
        next: (res) => {
          this.isLoading = false;
          localStorage.setItem('user', JSON.stringify(res));
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Invalid username or password.';
        }
      });
    }
  }

  onSignupSubmit() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.http.post<any>(`${this.API_URL}/signup`, this.signupForm.value).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.successMessage = res.message || 'Registration successful! You can now sign in.';
          this.signupForm.reset();
          setTimeout(() => this.toggleMode(true), 1500);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Sign up failed. Please try again.';
        }
      });
    }
  }

onForgotPasswordSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      this.http.post<any>(`${this.API_URL}/reset-password-request`, this.forgotPasswordForm.value).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.successMessage = res.message || 'Password reset link sent to your email!';
          this.forgotPasswordForm.reset();
        },
        error: (err) => {
          this.isLoading = false;
          // Display the backend error ("Account does not exist with this email address!")
          this.errorMessage = err.error?.message || 'Account does not exist or request failed.';
        }
      });
    }
  }

  onSSOLogin() {
    alert('SSO Authentication initialized');
  }
}
