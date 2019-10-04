import { Component, OnInit } from '@angular/core';
import { AccountsService } from 'src/app/services/accounts.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountAction } from 'src/app/enums/enums';
import { AccountSummary, UserDetails } from 'src/app/interfaces/interfaces';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {
  accountDetails: AccountSummary;
  accountChanges: AccountSummary;
  action: AccountAction;
  userDetails: UserDetails;

  pageTitle: string;
  pageActionTitle: string;

  totalBalance: number;
  amount = new FormControl('');

  constructor(
    private accountService: AccountsService,
    private router: Router,
    private route: ActivatedRoute,
    public formBuilder: FormBuilder
  ) {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.accountDetails = this.router.getCurrentNavigation().extras.state.accountDetails;
        this.action = this.router.getCurrentNavigation().extras.state.action;
        this.userDetails = this.router.getCurrentNavigation().extras.state.userDetails;

        this.totalBalance = this.accountDetails.balance + this.accountDetails.overdraft;
        this.accountChanges = this.router.getCurrentNavigation().extras.state.accountDetails;
      }
    });
  }

  ngOnInit() {
    this.setPageDetail();
    this.amount.valueChanges.subscribe(val => {
      this.transact(val);
    });
  }

  setPageDetail() {
    switch (this.action) {
      case AccountAction.Create:
        this.pageTitle = "Create";
        this.pageActionTitle = "Create new account";

        break;

      case AccountAction.Withdraw:
        this.pageTitle = "Withdraw";
        this.pageActionTitle = "Withdraw from account";

        this.amount.setValidators([Validators.required, Validators.minLength(1), Validators.max(this.totalBalance)]);

        break;

      case AccountAction.Deposit:
        this.pageTitle = "Deposit";
        this.pageActionTitle = "Deposit into account";

        this.amount.setValidators([Validators.required, Validators.minLength(1), Validators.min(0)]);

        break;

      default:
        this.pageTitle = "Details";
        break;
    }
  }

  goTransact(transactionType: AccountAction) {
    this.action = transactionType;
    this.setPageDetail();
  }

  transact(val: number) {
    let accountTransaction: AccountSummary = {
      accountNumber: this.accountDetails.accountNumber,
      balance: this.accountDetails.balance,
      overdraft: this.accountDetails.overdraft
    };

    if (!this.amount) {
      return;
    }

    if (this.action === AccountAction.Deposit) {
      this.doDeposit(accountTransaction);
    } else if (this.action === AccountAction.Withdraw) {
      this.doWithdrawal(accountTransaction);
    }
  }

  private doDeposit(accountTransaction: AccountSummary) {
    accountTransaction.balance = this.accountDetails.balance + this.amount.value;
    this.accountChanges = accountTransaction;
  }

  private doWithdrawal(accountTransaction: AccountSummary) {
    let transactionTotal = this.totalBalance - this.amount.value;
    if (this.totalBalance > transactionTotal) {
      if (this.accountDetails.balance >= this.amount.value) {
        accountTransaction.balance = this.accountDetails.balance - this.amount.value;
      } else if (this.accountDetails.balance < this.amount.value) {
        const overdraftUse = this.totalBalance - this.amount.value;
        accountTransaction.balance = 0;
        accountTransaction.overdraft = overdraftUse;
      }
      this.accountChanges = accountTransaction;
    }
  }

  updateAccount() {
    if (this.action === AccountAction.Create) {
      this.userDetails.accounts.push(this.accountDetails.accountNumber);

      this.accountService.accountCreate(this.userDetails)
        .pipe(
          mergeMap(response => this.accountService.updateAccount(this.accountChanges))
        )
        .subscribe(results => console.log('res', results));
    } else {
      this.accountService.updateAccount(this.accountChanges).subscribe(response => {
        if (response) {
          console.log('update response', response);
        }
      }, (err) => {
        console.error(err);
      });
    }
  }
}
