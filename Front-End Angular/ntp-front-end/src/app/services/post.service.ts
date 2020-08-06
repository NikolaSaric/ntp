import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Constants } from './constants';
import { Observable } from 'rxjs';
import { Post } from '../models/post';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(private http: HttpClient, private constants: Constants) { }

  public getAllPosts(page: string, perPage: string): Observable<Post[]> {
    const headers: HttpHeaders = new HttpHeaders({
      page,
      perPage
    });

    return this.http.get<Post[]>(this.constants.postPort + '/post/api/', { headers });
  }

  public addPost(post: Post): Observable<Post> {
    const headers: HttpHeaders = new HttpHeaders({
      jwt: localStorage.getItem('jwt')
    });

    return this.http.post<Post>(this.constants.postPort + '/post/api/', post, { headers });
  }
}
