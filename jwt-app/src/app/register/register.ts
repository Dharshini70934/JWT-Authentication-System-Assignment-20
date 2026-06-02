import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
   styleUrl: './register.css'
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  message = '';

  constructor(private authService: AuthService, private router: Router) {}

  register() {
    this.authService.register({ name: this.name, email: this.email, password: this.password })
      .subscribe({
        next: (res: any) => {
          this.message = res.message;
          setTimeout(() => this.router.navigate(['/login']), 1000);
        },
        error: (err) => this.message = err.error.message
      });
  }
}