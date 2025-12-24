import { Component } from '@angular/core';
import { ContactViewComponent } from '../contact-view/contact-view.component';

@Component({
  selector: 'app-home',
  imports: [ContactViewComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
}