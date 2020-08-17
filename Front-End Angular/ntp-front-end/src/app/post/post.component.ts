import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { Post } from '../models/post';
import { DomSanitizer } from '@angular/platform-browser';
import { EmbedVideoService } from 'ngx-embed-video';
import { PostService } from '../services/post.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  constructor(private dom: DomSanitizer, private embedService: EmbedVideoService,
              private postService: PostService, private snackBar: MatSnackBar) { }

  @Input() post: Post;
  image: string;
  video: string;
  audio: string;
  @ViewChild('videoPlayer', { static: false }) videoplayer: ElementRef;
  @Output() delete: EventEmitter<Post> = new EventEmitter();
  isPlay = false;

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

  checkAuthor() {
    const jwt = localStorage.getItem('jwt');

    if (jwt === null) {
      return false;
    }

    const pt = JSON.parse(window.atob(jwt.split('.')[1]));

    if (pt.username === this.post.username) {
      return true;
    }

    return false;
  }

  deletePost() {
    this.postService.deletePost(this.post.id).subscribe(
      (response => {
        console.log('res');
        this.snackBar.open(response);
        this.delete.emit(this.post);
      }),
      (error => {
        console.log('err');
        this.snackBar.open(error.error.text);
        this.delete.emit(this.post);
      })
    );
  }

}
