import { Component } from '@angular/core';
import { TaskComponent } from './task/task';

@Component({
  selector: 'app-root',
  imports: [TaskComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'My Task Manager';
}