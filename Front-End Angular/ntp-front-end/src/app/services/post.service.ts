import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Constants } from './constants';
import { Observable } from 'rxjs';
import { Post } from '../models/post';
import { SearchData } from '../models/search-data';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(private http: HttpClient, private constants: Constants) { }

  public getAllPosts(page: string, perPage: string, searchData: SearchData): Observable<Post[]> {
    const headers: HttpHeaders = new HttpHeaders({
      page,
      perPage
    });

    return this.http.get<Post[]>(this.constants.searchPostPort + '/post/api?category=' + searchData.category
    + '&username=' + searchData.username + '&type=' + searchData.type + '&title=' + searchData.title, { headers });
  }

  public getUserPosts(page: string, perPage: string, jwt: string): Observable<Post[]> {
    const headers: HttpHeaders = new HttpHeaders({
      page,
      perPage,
      jwt
    });

    return this.http.get<Post[]>(this.constants.searchPostPort + '/post/api/user-posts', { headers });
  }

  public addPost(post: Post): Observable<Post> {
    const headers: HttpHeaders = new HttpHeaders({
      jwt: localStorage.getItem('jwt')
    });

    return this.http.post<Post>(this.constants.postPort + '/post/api/', post, { headers });
  }

  public deletePost(id: string): Observable<string> {
    const headers: HttpHeaders = new HttpHeaders({
      jwt: localStorage.getItem('jwt')
    });

    return this.http.delete<string>(this.constants.postPort + '/post/api/' + id, { headers });
  }

  public uploadFile(data: FormData): Observable<void> {
    const headers: HttpHeaders = new HttpHeaders({
      jwt: localStorage.getItem('jwt')
    });

    return this.http.post<void>(this.constants.postPort + '/post/api/file', data, { headers });
  }

  public getImage(id: string) {

    return this.http.get(this.constants.postPort + '/post/api/image/' + id, { responseType: 'text' });
  }

  public getVideo(id: string): string {

    return this.constants.postPort + '/post/api/video/' + id;
  }

  public getAudio(id: string): string {

    return this.constants.postPort + '/post/api/audio/' + id;
  }
}
