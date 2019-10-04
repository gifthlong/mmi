import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, retry, catchError } from 'rxjs/operators';
import { Router } from '@angular/router'
import { Storage } from '@ionic/storage';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from 'src/environments/environment';
import { TokenResponse, UserDetails } from '../interfaces/interfaces';
import { handleHttpError } from '../utilities/utilities';



@Injectable({
  providedIn: 'root'
})

export class AuthenticationService {
  public tokenResponse: TokenResponse;

  constructor(
    private http: HttpClient,
    private router: Router,
    private storage: Storage,
    public jwtHelper: JwtHelperService
  ) { }

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  public logIn(data): Observable<any> {
    return this.http
      .post<any>(environment.tokenUrl, data, this.httpOptions)
      .pipe(
        retry(2),
        catchError(handleHttpError)
      );
  }

  public saveLoginResponse(tokenResponse: TokenResponse): void {
    this.storage.set('idToken', tokenResponse);
    this.tokenResponse = tokenResponse;
    console.log('save login', tokenResponse)
  }

  public logOut(): void {
    this.tokenResponse = null;
    this.storage.remove('idToken').then((val) =>
      this.router.navigateByUrl('/')
    );
  }

  public isLoggedIn(): boolean {
    if(this.tokenResponse && this.tokenResponse){
      return true;
    }else {
      return false;
    }
  }

  public userDetails(): Observable<UserDetails> {
    const url = environment.userDetail
      .replace('localId', this.tokenResponse.localId)
      .replace('idToken', this.tokenResponse.idToken);

    return this.http
      .get<any>(url, this.httpOptions)
      .pipe(
        retry(2),
        catchError(handleHttpError)
      );
  }
}