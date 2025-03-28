import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms'; // Reactive form imports
import * as emailjs from 'emailjs-com'; // EmailJS SDK import
import { environment } from '../../../environments/environment'; // Environment configuration for EmailJS

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css'],
  standalone: true, // Standalone component
  imports: [CommonModule, ReactiveFormsModule], // Import necessary modules
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup; // Declare the reactive form group

  constructor(private fb: FormBuilder) {
    // Initialize the reactive form with form controls and validation
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]], // Name field with validation
      email: ['', [Validators.required, Validators.email]], // Email field with validation
      message: ['', [Validators.required, Validators.minLength(10)]], // Message field with validation
    });
  }

  ngOnInit(): void {}

  // Function to handle form submission
  onSubmit(): void {
    if (this.contactForm.valid) {
      const formData = this.contactForm.value; // Get the form data

      // Call function to send the email using EmailJS
      this.sendEmail(formData);
    } else {
      alert('Please fill out all fields correctly.'); // Alert if the form is invalid
    }
  }

  // Function to send the email using EmailJS
  sendEmail(formData: any): void {
    const serviceId = environment.emailjs.serviceId; // Get the service ID from environment
    const templateId = environment.emailjs.templateId; // Get the template ID from environment
    const userId = environment.emailjs.userId; // Get the user ID from environment

    // Set the parameters to send to EmailJS template
    const templateParams = {
      from_name: formData.name,
      from_email: formData.email,
      message: formData.message,
    };

    // Send the email using the EmailJS SDK
    emailjs.send(serviceId, templateId, templateParams, userId).then(
      (response) => {
        console.log('Email sent successfully:', response);
        alert('Thank you for contacting us!'); // Show success message
        this.contactForm.reset(); // Reset form after successful submission
      },
      (error) => {
        console.error('Email sending error:', error);
        alert('Something went wrong. Please try again.'); // Show error message
      }
    );
  }
}
