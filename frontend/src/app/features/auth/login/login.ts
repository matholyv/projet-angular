import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const credentials = this.loginForm.value;
      
      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('Connexion réussie, Token reçu:', response);
          // On redirige vers la recherche ou le profil
          this.router.navigate(['/search']);
        },
        error: (error) => {
          console.error('Erreur de connexion', error);
          // On pourrait afficher un joli message d'erreur en rouge sous le formulaire à l'avenir
          alert('Email ou mot de passe incorrect.');
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
