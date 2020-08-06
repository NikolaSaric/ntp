import { Component, OnInit } from '@angular/core';
import { PostService } from '../services/post.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private postService: PostService) { }

  page = 1;
  perPage = 3;

  ngOnInit() {
    this.getAllPosts();
  }

  getAllPosts() {
    this.postService.getAllPosts(this.page.toString(), this.perPage.toString()).subscribe(
      (response => {
        console.log(response);
      })
    );
  }

}
