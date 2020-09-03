import { Component, OnInit } from '@angular/core';
import { User } from '../models/user';
import { Post } from '../models/post';
import { PostService } from '../services/post.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { UserService } from '../services/user.service';
import { ChangePasswordInfo } from '../models/change-password-info';
import { Constants } from '../services/constants';
import { ActivatedRoute } from '@angular/router';
import { SearchData } from '../models/search-data';
import { ThrowStmt } from '@angular/compiler';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  constructor(private postService: PostService, private formBuilder: FormBuilder,
              private snackBar: MatSnackBar, private userService: UserService,
              private constants: Constants, private route: ActivatedRoute) { }

  user: User;
  page = 0;
  perPage = this.constants.perPage;
  posts: Post[];
  changePasswordWindow: boolean;
  changePasswordForm: FormGroup;
  hide = true;
  following: boolean;

  ngOnInit() {
    this.route.params.subscribe(routeParams => {
      this.getUser();
    });
    this.checkIfFollowing();
  }

  getUser() {
    this.userService.getUser(this.route.snapshot.paramMap.get('username')).subscribe(
      (response => {
        this.user = response;
        this.getAllPosts();
      })
    );
  }

  getAllPosts() {
    const searchData = new SearchData('', this.user.username, '', '');
    this.postService.getAllPosts(this.page.toString(), this.perPage.toString(), searchData).subscribe(
      (response => {
        this.posts = response;
      })
    );
  }

  loadMorePosts() {
    this.page += 1;
    const searchData = new SearchData('', this.user.username, '', '');
    this.postService.getAllPosts(this.page.toString(), this.perPage.toString(), searchData).subscribe(
      (response => {
        this.posts = this.posts.concat(response);
      })
    );
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

  checkAuthor() {
    const jwt = localStorage.getItem('jwt');

    if (jwt === null) {
      return false;
    }

    const pt = JSON.parse(window.atob(jwt.split('.')[1]));

    if (pt.username === this.user.username) {
      return true;
    }

    return false;
  }

  followBtnClick() {
    this.userService.followUser(this.user.username, true).subscribe(
      (response => {
        this.checkIfFollowing();
        this.snackBar.open(response);
      }),
      (error => {
        console.log('err');
        console.log(error);
      })
    );
  }

  unfollowBtnClick() {
    this.userService.followUser(this.user.username, false).subscribe(
      (response => {
        this.checkIfFollowing();
        this.snackBar.open(response);
      }),
      (error => {
        console.log('err');
        console.log(error);
      })
    );
  }

  checkIfFollowing() {
    this.userService.getFollowing().subscribe(
      (response => {
        if (response.includes(this.route.snapshot.paramMap.get('username'))) {
          this.following = true;
        } else {
          this.following = false;
        }
        return;
      }),
      (error => {
        console.log('err');
        console.log(error);
        return false;
      })
    );
  }
}
