import { Component } from '@angular/core';
import { ContactComponent } from '../contact/contact.component';
import { ServicesComponent } from '../services/services.component';
import { FooterComponent } from '../footer/footer.component';
import { SectorsComponent } from '../sectors/sectors.component';
import { AboutComponent } from '../about/about.component';
import { SliderComponent } from '../slider/slider.component';
import { NavbarComponent } from "../navbar/navbar.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    ContactComponent,
    ServicesComponent,
    FooterComponent,
    SectorsComponent,
    AboutComponent,
    SliderComponent,
    NavbarComponent
],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
