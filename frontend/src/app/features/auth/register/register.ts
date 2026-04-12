import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string | null = null; // Propriété gérant l'affichage de l'erreur interne

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      pseudo: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    this.errorMessage = null; // Reset à chaque essai
    if (this.registerForm.valid) {
      const userData = this.registerForm.value;
      
      this.authService.register(userData).subscribe({
        next: (response) => {
          console.log('Réponse du serveur:', response);
          // Redirection fluide et moderne sans popup bloquante
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Erreur lors de la création de compte', error);
          if (error.status === 409) {
            this.errorMessage = 'Cet email est déjà utilisé. Veuillez en choisir un autre ou vous connecter.';
          } else {
            this.errorMessage = 'Une erreur est survenue lors de l\'enregistrement. Veuillez réessayer plus tard.';
          }
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}

