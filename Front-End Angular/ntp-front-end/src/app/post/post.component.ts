import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
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
  video: string;
  audio: string;
  @ViewChild("videoPlayer", { static: false }) videoplayer: ElementRef;
  isPlay: boolean = false;

  toggleVideo() {
    this.videoplayer.nativeElement.play();
  }

  ngOnInit() {
    if (this.post.type === 'Image') {
      this.loadImage();
    } else if (this.post.type === 'Video') {
      this.video = this.postService.getVideo(this.post.id);
    } else if (this.post.type === 'Audio') {
      this.audio = this.postService.getAudio(this.post.id);
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
        this.image = response;
      })
    );
  }

}
