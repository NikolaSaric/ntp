import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css']
})
export class LogInComponent implements OnInit {

  constructor(private formBuilder: FormBuilder, private userService: UserService,
              private snackBar: MatSnackBar, private router: Router) { }

  loginForm: FormGroup;
  hide = true;
  token: any;


  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  get username() { return this.loginForm.controls.username.value as string; }
  get password() { return this.loginForm.controls.password.value as string; }


  onLogInSubmit() {
    const credentials = btoa(this.username + ':' + this.password);

    this.userService.logIn(credentials).subscribe(
      (response => {
        if (response != null) {
          const jwt: JwtHelperService = new JwtHelperService();
          const info = jwt.decodeToken(response.token);
          localStorage.setItem('jwt', response.token);

          this.snackBar.open('Successfully logged in as: ' + this.username);

          this.router.navigateByUrl('/profile/' + this.username);
        }
      }),
      (error => {
        this.snackBar.open(error.error);
      }));
}

}
