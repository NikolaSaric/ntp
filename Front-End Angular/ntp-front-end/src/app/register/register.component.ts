import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { RegisterInfo } from '../models/register-info';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  registerForm: FormGroup;
  hide = true;

  constructor(private formBuilder: FormBuilder, private userService: UserService,
              private snackBar: MatSnackBar, private router: Router) { }

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.min(3)]],
      full_name: ['', [Validators.required, Validators.min(3)]],
      password: ['', [Validators.required, Validators.min(3)]],
      repeatedPassword: ['', [Validators.required, Validators.min(3)]],
      email: ['', [Validators.required, Validators.min(3)]],
      description: ['', [Validators.maxLength(250)]]
    });
  }

  get username() { return this.registerForm.controls.username.value as string; }
  get full_name() { return this.registerForm.controls.full_name.value as string; }
  get password() { return this.registerForm.controls.password.value as string; }
  get repeatedPassword() { return this.registerForm.controls.repeatedPassword.value as string; }
  get email() { return this.registerForm.controls.email.value as string; }
  get description() { return this.registerForm.controls.description.value as string; }

  onRegisterSubmit() {
    if (this.password !== this.repeatedPassword) {
      this.snackBar.open('Password and reapeated password do not match');
      return;
    }

    const registerInfo = new RegisterInfo(this.username, this.password,
       this.repeatedPassword, this.full_name, this.email, this.description);

    this.userService.register(registerInfo).subscribe(
      (response => {
        if (response != null) {
          this.snackBar.open(response);
        }
      }),
      (error => {
        if (error.error.text.includes('1062 (23000): Duplicate entry')) {
          this.snackBar.open('Username: ' + this.username + ' is taken');
        } else {
          this.snackBar.open(error.error.text);
        }
      }));
  }
}
