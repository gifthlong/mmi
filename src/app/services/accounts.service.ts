import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccountSummary, UserDetails } from '../interfaces/interfaces';
import { environment } from 'src/environments/environment';
import { retry, catchError } from 'rxjs/operators';
import { handleHttpError } from '../utilities/utilities';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  tokenResponse: any;

  constructor(
    private http: HttpClient,
    authService: AuthenticationService
  ) {
    this.tokenResponse = authService.tokenResponse;
  }

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  public accountSummary(accountNumber: number): Observable<AccountSummary> {
    const url = environment.accountDetails
      .replace('account_number', accountNumber.toString())
      .replace('idToken', this.tokenResponse.idToken);

    console.log('accountSummary', url);
    return this.http
      .get<any>(url, this.httpOptions)
      .pipe(
        retry(2),
        catchError(handleHttpError)
      );
  }

  public accountCreate(accountsDetails: UserDetails): Observable<any> {
    const url = environment.userDetail
      .replace('localId', this.tokenResponse.localId)
      .replace('idToken', this.tokenResponse.idToken);

      
    return this.http
      .put<any>(url, accountsDetails, this.httpOptions)
      .pipe(
        retry(2),
        catchError(handleHttpError)
      );
  }

  public updateAccount(account: AccountSummary): Observable<any> {
    const url = environment.accountDetails
      .replace('account_number', account.accountNumber.toString())
      .replace('idToken', this.tokenResponse.idToken);

    const accountDetails = {
      'balance': account.balance,
      'overdraft': account.overdraft
    };

    return this.http
      .put<any>(url, accountDetails, this.httpOptions)
      .pipe(
        retry(2),
        catchError(handleHttpError)
      );
  }
}
