import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { Post } from '../models/post';
import { Comment } from '../models/comment';
import { DomSanitizer } from '@angular/platform-browser';
import { EmbedVideoService } from 'ngx-embed-video';
import { PostService } from '../services/post.service';
import { CommentService } from '../services/comment.service';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {

  constructor(private dom: DomSanitizer, private embedService: EmbedVideoService,
              private postService: PostService, private snackBar: MatSnackBar,
              private router: Router, private formBuilder: FormBuilder,
              private commentService: CommentService) { }

  @Input() post: Post;
  image: string;
  video: string;
  audio: string;
  @ViewChild('videoPlayer', { static: false }) videoplayer: ElementRef;
  @Output() delete: EventEmitter<Post> = new EventEmitter();
  isPlay = false;
  addCommentForm: FormGroup;
  commentsView = false;
  comments: Comment[];

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

    this.createCommentForm();
  }

  createCommentForm() {
    this.addCommentForm = this.formBuilder.group({
      body: ['', [Validators.maxLength(250), Validators.required]]
    });
  }

  get body() { return this.addCommentForm.controls.body.value as string; }

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

  goToProfile(username: string) {
    this.router.navigate(['/profile/' + username]);
  }

  commentsBtnClick() {
    this.commentsView = true;

    this.loadComments();
  }

  hideCommentsBtnClick() {
    this.commentsView = false;
  }

  loadComments() {
    this.commentService.getComments(this.post.id).subscribe(
      (response => {
        if (response === null) {
          this.comments = [];
        } else {
          this.comments = response;
        }
      }),
      (error => {
        console.log('err');
        console.log(error);
      })
    );
  }

  onAddCommentSubmit() {
    const newComment = new Comment(this.body);
    newComment.postID = this.post.id;

    this.commentService.addComment(newComment).subscribe(
      (response => {
        this.comments.push(response);
        this.createCommentForm();
      })
    );

  }

  likeBtnClick() {
    this.postService.likePost(this.post.id).subscribe(
      (response => {
        const jwt = localStorage.getItem('jwt');
        const pt = JSON.parse(window.atob(jwt.split('.')[1]));
        this.post.likes.push(pt.username);
      })
    );
  }

  unlikeBtnClick() {
    this.postService.unlikePost(this.post.id).subscribe(
      (response => {
        const jwt = localStorage.getItem('jwt');
        const pt = JSON.parse(window.atob(jwt.split('.')[1]));
        this.post.likes.splice(this.post.likes.indexOf(pt.username), 1);
      })
    );
  }

  checkIfLiked() {
    const jwt = localStorage.getItem('jwt');

    if (jwt === null) {
      return false;
    }

    const pt = JSON.parse(window.atob(jwt.split('.')[1]));

    if (this.post.likes.includes(pt.username)) {
      return true;
    }

    return false;
  }

}
