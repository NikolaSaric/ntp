import { Injectable } from '@angular/core';
import { Constants } from './constants';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Token } from '../models/token';
import { RegisterInfo } from '../models/register-info';
import { ChangePasswordInfo } from '../models/change-password-info';
import { User } from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient, private constants: Constants) { }

  public logIn(credentials: string): Observable<Token> {
    const headers: HttpHeaders = new HttpHeaders({
      Authorization: 'Basic ' + credentials
    });

    return this.http.get<Token>(this.constants.userPort + '/auth/log-in', { headers });
  }

  public register(registerInfo: RegisterInfo): Observable<string> {

    return this.http.post<string>(this.constants.userPort + '/auth/register', registerInfo);
  }

  public changePassword(changePasswordInfo: ChangePasswordInfo, jwt: string): Observable<string> {
    const headers: HttpHeaders = new HttpHeaders({
      jwt
    });

    return this.http.post<string>(this.constants.userPort + '/user/change-password', changePasswordInfo, { headers });
  }

  public getUser(username: string): Observable<User> {

    return this.http.get<User>(this.constants.userPort + '/user?username=' + username);
  }

  public followUser(username: string, follow: boolean): Observable<string> {
    const headers: HttpHeaders = new HttpHeaders({
      jwt: localStorage.getItem('jwt')
    });
    headers.set('Content-Type', 'text/plain; charset=utf-8');

    return this.http.put<string>(this.constants.userPort + '/user/follow', {username, follow}, { headers, responseType: 'text' as 'json' });
  }

  public getFollowing(): Observable<string[]> {
    const headers: HttpHeaders = new HttpHeaders({
      jwt: localStorage.getItem('jwt')
    });

    return this.http.get<string[]>(this.constants.userPort + '/user/follow', { headers });

  }
}
