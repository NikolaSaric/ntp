import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Constants {
  userPort = 'http://localhost:8080';
  postPort = 'http://localhost:8081';
}
