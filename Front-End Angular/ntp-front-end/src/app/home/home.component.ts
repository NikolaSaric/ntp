import { Component, OnInit } from '@angular/core';
import { PostService } from '../services/post.service';
import { Post } from '../models/post';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private postService: PostService) { }

  page = 0;
  perPage = 2;
  posts: Post[];

  ngOnInit() {
    this.getAllPosts();
  }

  getAllPosts() {
    this.postService.getAllPosts(this.page.toString(), this.perPage.toString()).subscribe(
      (response => {
        console.log(response);
        this.posts = response;
      })
    );
  }

  loadMorePosts() {
    this.page += 1;

    this.postService.getAllPosts(this.page.toString(), this.perPage.toString()).subscribe(
      (response => {
        console.log(response);
        this.posts = this.posts.concat(response);
      })
    );
    console.log(this.posts);
  }

}
