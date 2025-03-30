import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-slider',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.css'],
})
export class SliderComponent implements OnInit, OnDestroy {
  slides = [
    {
      heading: 'Sourcing & Procurement',
      subheading: 'Discover the features of this amazing carousel.',
      text: 'This is the first slide with some content.',
    },
    {
      heading: 'Logistics Services',
      subheading: 'Dive deeper into the content of this carousel.',
      text: 'This slide has some more exciting content.',
    },
    {
      heading: 'Oilfield Equipment & Spare Parts',
      subheading: 'Get inspired by this slide’s design and content.',
      text: 'Another interesting slide to explore.',
    },
    {
      heading: 'Geothermal Power Plant Parts & Equipment',
      subheading: 'See what amazing things are presented in this slide.',
      text: 'This slide contains additional insights.',
    },
    {
      heading: 'Industrial Plant parts',
      subheading: 'Feel free to interact with this carousel.',
      text: 'This is the final slide of the carousel.',
    },
  ];

  currentIndex: number = 0;
  slideInterval: any;

  ngOnInit(): void {
    // Start the carousel and change the slide every 3 seconds
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 3000); // Change slide every 3 seconds
  }

  ngOnDestroy(): void {
    // Clear the interval when the component is destroyed to prevent memory leaks
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  // Move to the previous slide
  prevSlide(): void {
    if (this.currentIndex === 0) {
      this.currentIndex = this.slides.length - 1;
    } else {
      this.currentIndex--;
    }
  }

  // Move to the next slide
  nextSlide(): void {
    if (this.currentIndex === this.slides.length - 1) {
      this.currentIndex = 0;
    } else {
      this.currentIndex++;
    }
  }

  // Learn more button click handler
  onLearnMoreClick(slideIndex: number): void {
    alert(`Learn more clicked for Slide ${slideIndex + 1}`);
  }
}
