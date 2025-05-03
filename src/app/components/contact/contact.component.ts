import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RecaptchaModule } from 'ng-recaptcha';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RecaptchaModule,
    HttpClientModule,
  ],
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  siteKey: string = environment.recaptchaSiteKey;
  recaptchaToken: string | null = null;
  recaptchaFailed = false;

  // EmailJS credentials
  userID: string = environment.emailjs.userId;
  serviceID: string = environment.emailjs.serviceId;
  templateID: string = environment.emailjs.templateId;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.contactForm.invalid || !this.recaptchaToken) {
      this.recaptchaFailed = !this.recaptchaToken;
      alert('Please fill all the required fields and verify the reCAPTCHA.');
      return;
    }

    const formData = this.contactForm.value;
    this.sendEmail(formData);
  }

  sendEmail(formData: any): void {
    const emailData = {
      service_id: this.serviceID,
      template_id: this.templateID,
      user_id: this.userID,
      template_params: {
        from_name: formData.name,
        from_email: formData.email,
        message: formData.message,
        // Optional: Include reCAPTCHA token if needed by your backend or EmailJS function
        'g-recaptcha-response': this.recaptchaToken,
      },
    };

    this.http
      .post('https://api.emailjs.com/api/v1.0/email/send', emailData, {
        responseType: 'text',
      })
      .subscribe(
        (response) => {
          if (response.includes('OK')) {
            alert('Thank you! Your message has been sent.');
            this.contactForm.reset();
            this.recaptchaToken = null;
          } else {
            console.error('EmailJS response error:', response);
            alert('Failed to send message. Please try again later.');
          }
        },
        (error) => {
          console.error('Error sending email:', error);
          alert('Something went wrong. Please try again.');
        }
      );
  }

  resolved(captchaResponse: any): void {
    this.recaptchaToken = captchaResponse;
    this.recaptchaFailed = false;
  }
}
