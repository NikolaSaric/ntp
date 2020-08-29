import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Comment } from '../models/comment';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {

  constructor(private router: Router) { }

  @Input() comment: Comment;


  ngOnInit(): void {
  }

  goToProfile(username: string) {
    this.router.navigate(['/profile/' + username]);
  }

}
