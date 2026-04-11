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
          alert('Erreur serveur (vérifiez que Docker et NestJS tournent).');
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
