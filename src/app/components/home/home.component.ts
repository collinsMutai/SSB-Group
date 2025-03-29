import { Component } from '@angular/core';
import { HeroSliderComponent } from '../hero-slider/hero-slider.component';
import { ContactComponent } from "../contact/contact.component";
import { ServicesComponent } from "../services/services.component";
import { FooterComponent } from "../footer/footer.component";
import { SectorsComponent } from "../sectors/sectors.component";
import { AboutComponent } from "../about/about.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HeroSliderComponent, ContactComponent, ServicesComponent, FooterComponent, SectorsComponent, AboutComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
