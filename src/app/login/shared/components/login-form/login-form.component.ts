import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-login-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss'
})
export class LoginFormComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.authService.authentication();
  }

  login() {
    this.authService.login(this.email, this.password);
    if (this.authService.errorMessage) {
      this.password = '';
    }
  }

  loginWithGoogle() {
    this.authService.loginWithGoogle();
  }

  get errorMessage(): string | null {
    return this.authService.errorMessage;
  }

}
