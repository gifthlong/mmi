import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../../services/authentication.service';
import { Router } from '@angular/router';
import { HomePage } from '../home/home.page';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Credentials } from 'src/app/interfaces/interfaces';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginForm: FormGroup;

  constructor(
    private auth: AuthenticationService,
    public router: Router,
    public formBuilder: FormBuilder) {

  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', Validators.compose([
        Validators.minLength(4),
        Validators.email,
        Validators.required
      ])],
      password: ['', Validators.compose([
        Validators.minLength(4),
        Validators.required
      ])]
    });
  }

  get f() { return this.loginForm.controls; }

  login() {
    if (this.loginForm.valid) {
      const credentials: Credentials = {
        email: this.loginForm.controls['email'].value,
        password: this.loginForm.controls['password'].value,
        returnSecureToken: true
      };

      this.auth.logIn(credentials).subscribe(response => {
        if (response) {
          this.auth.saveLoginResponse(response);
          this.router.navigate(['home'])
        }
      }, (err) => {
        console.error(err);
      });
    } else {
      console.log('invalid form')
    }
  }
}
