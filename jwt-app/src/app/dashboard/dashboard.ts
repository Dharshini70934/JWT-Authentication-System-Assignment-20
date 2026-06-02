import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgIf } from '@angular/common';
import { AuthService } from '../auth';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  imports: [NgIf],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent implements OnInit {

  profileData: any = null;
  message = '';
  name = '';
  email = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    const token = this.authService.getToken();

    console.log('Token:', token);

    const headers = new HttpHeaders({
      authorization: token || ''
    });

    this.http.get<any>('http://localhost:3000/profile', { headers })
      .subscribe({
        next: (res) => {

          console.log('Profile Response:', res);

          this.message = res.message;
          this.name = res.user.name;
          this.email = res.user.email;
          this.profileData = res;

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Profile Error:', err);
          this.router.navigate(['/login']);
        }
      });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}