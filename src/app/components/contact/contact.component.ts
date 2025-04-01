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
    // Check if reCAPTCHA token is missing or form is invalid
    if (this.contactForm.invalid || !this.recaptchaToken) {
      this.recaptchaFailed = !this.recaptchaToken; // Show reCAPTCHA failure message if token is missing
      alert('Please fill all the required fields and verify the reCAPTCHA.');
      return;
    }

    const formData = this.contactForm.value;

    // Send email if the form is valid
    this.sendEmail(formData);
  }

  // Function to send email by making a POST request to the backend API
  sendEmail(formData: any): void {
    // Add reCAPTCHA token to the form data
    const payload = {
      ...formData,
      recaptchaToken: this.recaptchaToken,
    };

    this.http
      .post('https://ssbgroupllc.com/send-email', payload) // Ensure this is the correct production URL
      .subscribe(
        (response) => {
          console.log('Email sent successfully:', response);
          alert('Thank you for contacting us!');
          this.contactForm.reset(); // Reset the form after success
        },
        (error) => {
          console.error('Error sending email:', error);
          alert('Something went wrong. Please try again.');
        }
      );
  }

  // This function will be called when the reCAPTCHA is successfully resolved
  resolved(captchaResponse: any): void {
    this.recaptchaToken = captchaResponse; // Store the reCAPTCHA token
    this.recaptchaFailed = false; // Reset the failure flag
  }
}
