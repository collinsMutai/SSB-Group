import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms'; // Reactive form imports
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RecaptchaModule } from 'ng-recaptcha';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  standalone: true, // Standalone component
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RecaptchaModule,
    HttpClientModule,
  ], // Import necessary modules
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup; // Declare the reactive form group
  siteKey: string = environment.recaptchaSiteKey; // Use your actual reCAPTCHA site key
  recaptchaToken: string | null = null;
  recaptchaFailed = false;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    // Initialize the reactive form with form controls and validation
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]], // Name field with validation
      email: ['', [Validators.required, Validators.email]], // Email field with validation
      message: ['', [Validators.required, Validators.minLength(10)]], // Message field with validation
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.contactForm.valid) {
      const formData = this.contactForm.value;

      // Send the form data to the backend server
      this.sendEmail(formData);
    }
  }

  // Function to send email by making a POST request to the backend API
  sendEmail(formData: any): void {
    this.http
      .post('https://www.ssbgroupllc.com/send-email', formData) // Ensure this is the correct production URL
      .subscribe(
        (response) => {
          console.log('Email sent successfully:', response);
          alert('Thank you for contacting us!');
        },
        (error) => {
          console.error('Error sending email:', error);
          alert('Something went wrong. Please try again.');
        }
      );
  }

  resolved(captchaResponse: any) {
    this.recaptchaToken = captchaResponse;
    this.recaptchaFailed = false;
  }
}
