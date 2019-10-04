import { Component } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { UserDetails, AccountSummary } from 'src/app/interfaces/interfaces';
import { AccountsService } from 'src/app/services/accounts.service';
import { Observable, forkJoin } from 'rxjs';
import { mergeMap, tap, switchMap, map } from 'rxjs/operators';
import { NavigationExtras, Router } from '@angular/router';
import { AccountAction } from 'src/app/enums/enums';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  userDetails: UserDetails;
  accountSummaryList: AccountSummary[];

  constructor(
    private authService: AuthenticationService,
    private accountService: AccountsService,
    private router: Router
  ) { }

  ngOnInit() {

    this.authService.userDetails()
      .pipe(
        tap(results => {
          console.log(' this.details', results);
          this.userDetails = results;
        }),
        switchMap(results => {
          const observables = results.accounts.map(accountNumber => this.accountService.accountSummary(accountNumber)
            .pipe(map(results => { return { accountNumber, ...results } })));
          return forkJoin(observables);
        })).subscribe(summary => {
          this.accountSummaryList = summary;
        });
  }

  getAccountSummary(account: number): AccountSummary {
    return this.accountSummaryList.find(summary => summary.accountNumber === account);
  }

  accountWithdraw(account) {
    let navigationExtras: NavigationExtras = {
      state: {
        accountDetails: account,
        action: AccountAction.Withdraw
      }
    };
    this.router.navigate(['account'], navigationExtras);
  }

  accountDeposit(account) {
    let navigationExtras: NavigationExtras = {
      state: {
        accountDetails: account,
        action: AccountAction.Deposit
      }
    };
    this.router.navigate(['account'], navigationExtras);
  }

  accountCreate() {
    let navigationExtras: NavigationExtras = {
      state: {
        accountDetails: {
          balance: 0,
          overdraft: 0,
          accountNumber: Math.floor(Math.random() * 10000000)
        },
        action: AccountAction.Create,
        userDetails: this.userDetails
      }
    };
    this.router.navigate(['account'], navigationExtras);
  }

  accountDetails(account) {
    let navigationExtras: NavigationExtras = {
      state: {
        accountDetails: account,
        action: AccountAction.View
      }
    };
    this.router.navigate(['account'], navigationExtras);
  }
}