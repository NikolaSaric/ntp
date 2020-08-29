import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Constants } from './constants';
import { Observable } from 'rxjs';
import { Comment } from '../models/comment';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  constructor(private http: HttpClient, private constants: Constants) { }

  public addComment(comment: Comment, jwt: string): Observable<Comment> {
    const headers: HttpHeaders = new HttpHeaders({
      jwt
    });

    return this.http.post<Comment>(this.constants.commentPort + '/comment', comment, { headers });
  }

  public getComments(postID: string): Observable<Comment[]> {

    return this.http.get<Comment[]>(this.constants.commentPort + '/comment/post/' + postID);
  }
}
