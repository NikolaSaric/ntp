import { Component, OnInit } from '@angular/core';
import { User } from '../models/user';
import { Post } from '../models/post';
import { PostService } from '../services/post.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { UserService } from '../services/user.service';
import { ChangePasswordInfo } from '../models/change-password-info';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  constructor(private postService: PostService, private formBuilder: FormBuilder,
    private snackBar: MatSnackBar, private userService: UserService) { }

  user: User;
  page = 0;
  perPage = 2;
  posts: Post[];
  changePasswordWindow: boolean;
  changePasswordForm: FormGroup;
  hide = true;

  ngOnInit() {
    this.createUser();
    this.getAllPosts();
  }

  createUser() {
    const token = localStorage.getItem('jwt');
    const pt = JSON.parse(window.atob(token.split('.')[1]));
    console.log(pt);
    this.user = new User(pt.username, pt.full_name, pt.email, pt.description, pt.admin, pt.registration_date);
    console.log(this.user);
  }

  getAllPosts() {
    this.postService.getUserPosts(this.page.toString(), this.perPage.toString(), localStorage.getItem('jwt')).subscribe(
      (response => {
        console.log(response);
        this.posts = response;
      })
    );
  }

  loadMorePosts() {
    this.page += 1;

    this.postService.getUserPosts(this.page.toString(), this.perPage.toString(), localStorage.getItem('jwt')).subscribe(
      (response => {
        console.log(response);
        this.posts = this.posts.concat(response);
      })
    );
    console.log(this.posts);
  }

  get oldPassword() { return this.changePasswordForm.controls.oldPassword.value as string; }
  get newPassword() { return this.changePasswordForm.controls.newPassword.value as string; }
  get repeatedPassword() { return this.changePasswordForm.controls.repeatedPassword.value as string; }

  changePasswordBtnClick() {
    this.changePasswordForm = this.formBuilder.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required]],
      repeatedPassword: ['', [Validators.required]]
    });
    this.changePasswordWindow = true;
  }

  cancelChangePasswordBtnClick() {
    this.changePasswordForm = null;
    this.changePasswordWindow = false;
  }

  onChangePasswordubmit() {
    console.log(this.newPassword);
    console.log(this.oldPassword);
    if (this.newPassword !== this.repeatedPassword) {
      this.snackBar.open('New password and repeated password do not much.');
      return;
    }

    const changePasswordInfo = new ChangePasswordInfo(this.oldPassword, this.newPassword, this.repeatedPassword);

    this.userService.changePassword(changePasswordInfo, localStorage.getItem('jwt')).subscribe(
      (response => {
        this.snackBar.open(response);
      }),
      (error => {
        this.snackBar.open(error.error.text);
      })
    );

    this.cancelChangePasswordBtnClick();
  }

  deletePost(post: Post) {
    this.posts = this.posts.filter(x => x !== post);
  }

}
