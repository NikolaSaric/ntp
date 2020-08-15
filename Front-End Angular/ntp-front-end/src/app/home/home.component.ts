import { Component, OnInit } from '@angular/core';
import { PostService } from '../services/post.service';
import { Post } from '../models/post';
import { SearchData } from '../models/search-data';

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

  searchByFeed = new SearchData('', '', '', '');
  searchBySong = new SearchData('Song', '', '', '');
  searchByImprove = new SearchData('Improve', '', '', '');
  searchByLesson = new SearchData('Lesson', '', '', '');
  searchByChallenge = new SearchData('Challenge', '', '', '');
  searchByDiscussion = new SearchData('Discussion', '', '', '');

  ngOnInit() {
  }


}
