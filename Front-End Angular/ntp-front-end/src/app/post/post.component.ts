import { Component, OnInit, Input } from '@angular/core';
import { Post } from '../models/post';
import { DomSanitizer } from '@angular/platform-browser';
import { EmbedVideoService } from 'ngx-embed-video';
import { PostService } from '../services/post.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  constructor(private dom: DomSanitizer, private embedService: EmbedVideoService, private postService: PostService) { }

  @Input() post: Post;
  image: string;

  ngOnInit() {
    if (this.post.type === 'Image') {
      this.loadImage();
    }
  }

  formatTags() {
    return this.post.tags.toString().replace(',', ' | ');
  }

  embedVideo() {
    return this.embedService.embed(this.post.location);
  }

  loadImage() {
    this.postService.getImage(this.post.id).subscribe(
      (response => {
        console.log(response);
        this.image = response;
      })
    );
  }

}
