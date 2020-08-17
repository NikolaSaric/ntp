import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  loggedIn: boolean;
  token: string;
  constructor(private router: Router) { }

  ngOnInit(): void {
    this.token = localStorage.getItem('jwt');
    if (this.token !== null  && this.token !== '') {
      this.loggedIn = true;
    }
  }

  onLogOut() {
    localStorage.setItem('jwt', '');
    this.router.navigate(['/login']);
  }

  goToHome() {
    this.router.navigate(['']);
  }

  goToLogIn() {
    this.router.navigate(['/login']);
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToProfile() {
    const token = localStorage.getItem('jwt');
    const pt = JSON.parse(window.atob(token.split('.')[1]));

    this.router.navigate(['/profile/' + pt.username]);
  }


}
