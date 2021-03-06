import { Component, OnInit, Input } from '@angular/core';
import { Post } from '../models/post';
import { SearchData } from '../models/search-data';
import { PostService } from '../services/post.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Constants } from '../services/constants';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit {

  constructor(private postService: PostService, private formBuilder: FormBuilder,
              private constants: Constants, private userService: UserService) { }

  @Input() searchData: SearchData;
  page = 0;
  perPage = this.constants.perPage;
  posts: Post[];
  searchWindow = false;
  searchBtn = true;
  searchForm: FormGroup;
  types = ['', 'Audio', 'Video', 'Text', 'Image', 'Link'];


  ngOnInit() {
      this.searchData.following = 'false';
      this.searchData.followingList = [];
      this.getAllPosts();
      this.createSearchForm();
  }

  createSearchForm() {
    this.searchForm =  this.formBuilder.group({
      type: [''],
      username: [''],
      title: [''],
      following: [false]
    });
  }

  get title() { return this.searchForm.controls.title.value as string; }
  get username() { return this.searchForm.controls.username.value as string; }
  get type() { return this.searchForm.controls.type.value as string; }
  get following() { return this.searchForm.controls.following.value as string; }

  getAllPosts() {
    this.postService.getAllPosts(this.page.toString(), this.perPage.toString(), this.searchData).subscribe(
      (response => {
        this.posts = response;
      })
    );
  }

  loadMorePosts() {
    this.page += 1;

    this.postService.getAllPosts(this.page.toString(), this.perPage.toString(), this.searchData).subscribe(
      (response => {
        this.posts = this.posts.concat(response);
      })
    );
  }

  deletePost(post: Post) {
    this.posts = this.posts.filter(x => x !== post);
  }

  searchBtnClick() {
    if (!this.searchWindow) {
      this.searchWindow = true;
      this.searchBtn = false;
    }
  }

  cancelSearchdBtnClick() {
    this.searchBtn = true;
    this.searchWindow = false;
  }

  resetSearchBtnClick() {
    this.createSearchForm();
  }

  onSearchSubmit() {
    this.searchData.title = this.title;
    this.searchData.type = this.type;
    this.searchData.username = this.username;
    this.searchData.following = this.following;

    if (this.following) {
      this.userService.getFollowing().subscribe(
        (response => {
          this.searchData.followingList = response;

          this.page = 0;
          this.perPage = 2;

          this.getAllPosts();
        })
      );
    } else {
      this.searchData.followingList = [];

      this.page = 0;
      this.perPage = 2;

      this.getAllPosts();
    }
  }

}
