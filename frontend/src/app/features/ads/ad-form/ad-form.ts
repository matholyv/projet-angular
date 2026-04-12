import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-ad-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ad-form.html',
  styleUrls: ['./ad-form.css']
})
export class AdFormComponent {
  adForm: FormGroup;
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  isDragging = false;

  // Catégories fictives pour l'instant, on les remplacera par celles de l'API
  categories = [
    { id: 1, name: 'Vêtements' },
    { id: 2, name: 'Maison' },
    { id: 3, name: 'Électronique' },
    { id: 4, name: 'Loisirs & Jeux' }
  ];

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    this.adForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      price: ['', [Validators.required, Validators.min(1)]],
      categoryId: ['', Validators.required]
    });
  }

  // --- Logique Drag & Drop ---
  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;
    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      this.handleImage(event.dataTransfer.files[0]);
    }
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.handleImage(event.target.files[0]);
    }
  }

  handleImage(file: File) {
    if (!file.type.match(/image\/*/)) {
      alert("Seuls les formats images sont supportés.");
      return;
    }
    this.selectedImage = file;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.imagePreview = reader.result as string;
      this.cdr.detectChanges(); // Force Angular à mettre à l'écran l'image
    };
  }

  removeImage() {
    this.selectedImage = null;
    this.imagePreview = null;
    this.cdr.detectChanges();
  }

  // --- Soumission ---
  onSubmit() {
    if (this.adForm.valid) {
      console.log("Annonce prete à etre envoyée au Backend :", this.adForm.value);
      alert("Composant formulaire complet !");
    } else {
      this.adForm.markAllAsTouched();
    }
  }
}
