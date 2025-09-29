import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

// Import RecaptchaModule (for v2)
import { RecaptchaModule } from 'ng-recaptcha';

import { environment } from '../../../environments/environment';

declare const bootstrap: any;

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    RecaptchaModule,  // <-- v2 recaptcha
  ],
})
export class ContactComponent implements OnInit, AfterViewInit {
  contactForm: FormGroup;
  siteKey: string = environment.recaptchaSiteKey;  // Your v2 site key here
  recaptchaToken: string | null = null;
  isLoading: boolean = false;

  userID: string = environment.emailjs.userId;
  serviceID: string = environment.emailjs.serviceId;
  templateID: string = environment.emailjs.templateId;

  toastMessage: string = '';
  toastClass: string = 'bg-success text-white';

  @ViewChild('toastEl', { static: false }) toastEl!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(10)]],
      recaptcha: ['', Validators.required], // <-- add form control for captcha validation
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {}

  onSubmit(): void {
    if (this.contactForm.invalid || !this.recaptchaToken) {
      this.showToast('Please fill all required fields and complete reCAPTCHA.', false);
      return;
    }
    this.isLoading = true;

    this.sendEmail(this.contactForm.value);
  }

  // When reCAPTCHA is resolved, this event triggers with the token
 onCaptchaResolved(captchaResponse: string | null): void {
  if (captchaResponse) {
    this.recaptchaToken = captchaResponse;
    this.contactForm.patchValue({ recaptcha: captchaResponse });
  } else {
    // Captcha was reset or invalidated, clear token and form control
    this.recaptchaToken = null;
    this.contactForm.patchValue({ recaptcha: '' });
  }
}


  sendEmail(formData: any): void {
    const emailData = {
      service_id: this.serviceID,
      template_id: this.templateID,
      user_id: this.userID,
      template_params: {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        'g-recaptcha-response': this.recaptchaToken,
      },
    };

    this.http
      .post('https://api.emailjs.com/api/v1.0/email/send', emailData, {
        responseType: 'text',
      })
      .subscribe(
        (response) => {
          this.isLoading = false;

          if (response.includes('OK')) {
            this.showToast('Thank you! Your message has been sent.', true);
            this.contactForm.reset();
            this.recaptchaToken = null;
          } else {
            this.showToast(
              'Failed to send message. Please try again later.',
              false
            );
          }
        },
        (error) => {
          console.error('Error sending email:', error);
          this.showToast('Something went wrong. Please try again.', false);
          this.isLoading = false;
        }
      );
  }

  showToast(message: string, isSuccess: boolean = true): void {
    this.toastMessage = message;
    this.toastClass = isSuccess
      ? 'bg-success text-white'
      : 'bg-danger text-white';

    const toastElement = this.toastEl?.nativeElement;
    if (toastElement) {
      const toast = new bootstrap.Toast(toastElement);
      toast.show();
    }
  }
}
