import { Component, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdCardComponent } from '../../../shared/components/ad-card/ad-card';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-ad-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AdCardComponent],
  templateUrl: './ad-form.html',
  styleUrls: ['./ad-form.css']
})
export class AdFormComponent implements OnInit {
  adForm: FormGroup;
  selectedImages: File[] = [];
  imagePreviews: string[] = [];
  isDragging = false;
  currentUser: any = null;

  categories = [
    { id: 1, name: 'Vêtements' },
    { id: 2, name: 'Maison' },
    { id: 3, name: 'Électronique' },
    { id: 4, name: 'Loisirs & Jeux' }
  ];

  constructor(
    private fb: FormBuilder, 
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {
    this.adForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.maxLength(500)]],
      price: ['', [Validators.required, Validators.min(1)]],
      categoryId: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
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
      this.handleFiles(event.dataTransfer.files);
    }
  }

  onFileSelected(event: any) {
    if (event.target.files && event.target.files.length > 0) {
      this.handleFiles(event.target.files);
    }
  }

  handleFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.match(/image\/*/)) continue;
      
      this.selectedImages.push(file);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.imagePreviews.push(reader.result as string);
        this.cdr.detectChanges();
      };
    }
  }

  removeImage(index: number) {
    this.selectedImages.splice(index, 1);
    this.imagePreviews.splice(index, 1);
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
