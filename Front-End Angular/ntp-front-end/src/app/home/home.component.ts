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

  searchByFeed = new SearchData('', '', '', '', 'false', []);
  searchBySong = new SearchData('Song', '', '', '', 'false', []);
  searchByImprove = new SearchData('Improve', '', '', '', 'false', []);
  searchByLesson = new SearchData('Lesson', '', '', '', 'false', []);
  searchByChallenge = new SearchData('Challenge', '', '', '', 'false', []);
  searchByDiscussion = new SearchData('Discussion', '', '', '', 'false', []);

  ngOnInit() {
  }


}
