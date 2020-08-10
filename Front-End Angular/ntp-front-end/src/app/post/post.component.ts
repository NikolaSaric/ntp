import { Component, OnInit, Input } from '@angular/core';
import { Post } from '../models/post';
import { DomSanitizer } from '@angular/platform-browser';
import { EmbedVideoService } from 'ngx-embed-video';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  constructor(private dom: DomSanitizer, private embedService: EmbedVideoService) { }

  @Input() post: Post;

  ngOnInit() {
  }

  formatTags() {
    return this.post.tags.toString().replace(',', ' | ');
  }

  embedVideo() {
    return this.embedService.embed(this.post.location);
  }

}
