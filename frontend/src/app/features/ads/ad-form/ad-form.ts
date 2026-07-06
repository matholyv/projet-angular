import { Component, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdService } from '../../../core/services/ad.service';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-ad-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatSnackBarModule],
  template: `
    <div class="page-container">
      <div class="content-wrapper">
        
        <!-- SECTION FORMULAIRE -->
        <div class="form-section">
          <h1 class="main-title">Vends ton article</h1>

          <form [formGroup]="adForm" (ngSubmit)="onSubmit()">
            
            <!-- BLOC PHOTOS -->
            <div class="card photo-card-vinted">
              <div class="photos-flex">
                 <!-- Liste des photos déjà ajoutées -->
                 <div *ngFor="let img of images; let i = index" class="photo-item-v" [class.main]="i === 0">
                    <img [src]="img">
                    <div class="badge-main" *ngIf="i === 0">Photo principale</div>
                    <button type="button" class="btn-remove" (click)="removePhoto(i, $event)">✕</button>
                    <button type="button" class="btn-top" *ngIf="i !== 0" (click)="setMain(i)">👑</button>
                 </div>

                 <!-- Zone d'ajout (dotted box) -->
                 <label class="add-photo-box" *ngIf="images.length < 6">
                    <span class="plus-icon">+</span>
                    <span class="plus-text">Ajouter une photo</span>
                    <input type="file" (change)="onFilesSelected($event)" accept="image/*" multiple style="display:none">
                 </label>
              </div>
            </div>

            <!-- BLOC TEXTE -->
            <div class="card">
              <div class="field">
                <label>Titre</label>
                <input formControlName="title" placeholder="chemise">
              </div>

              <div class="field">
                <label>Marque</label>
                <input formControlName="brand" placeholder="ex: Zara, Nike...">
              </div>

              <div class="field">
                <label>Décris ton article</label>
                <textarea formControlName="description" rows="5" placeholder="c'est une chemise"></textarea>
              </div>
            </div>

            <!-- BLOC DÉTAILS -->
            <div class="card details-grid">
              <div class="field">
                <label>Catégorie</label>
                <div class="v-select">
                  <select formControlName="category" (change)="onCategoryChange()">
                    <option value="Vêtements">Vêtements</option>
                    <option value="Chaussures">Chaussures</option>
                    <option value="Maison">Maison</option>
                    <option value="Électronique">Électronique</option>
                    <option value="Loisirs & Jeux">Loisirs & Jeux</option>
                  </select>
                </div>
              </div>

              <div class="field">
                <label>État de l'article</label>
                <div class="v-select">
                  <select formControlName="condition">
                    <option value="Neuf avec étiquette">Neuf avec étiquette</option>
                    <option value="Neuf sans étiquette">Neuf sans étiquette</option>
                    <option value="Très bon état">Très bon état</option>
                    <option value="Bon état">Bon état</option>
                    <option value="Satisfaisant">Satisfaisant</option>
                  </select>
                </div>
              </div>

              <div class="field" *ngIf="adForm.get('category')?.value === 'Vêtements' || adForm.get('category')?.value === 'Chaussures'">
                <label>Taille</label>
                <div class="v-select">
                  <select formControlName="size">
                    <option *ngFor="let s of availableSizes" [value]="s">{{ s }}</option>
                  </select>
                </div>
              </div>

              <div class="field">
                <label>Prix</label>
                <div class="v-price-input">
                  <input type="number" formControlName="price" placeholder="35">
                  <span class="v-euro">€</span>
                </div>
              </div>
            </div>

            <button type="submit" [disabled]="adForm.invalid || images.length === 0 || isSubmitting" class="vinted-cta">
              {{ isSubmitting ? 'Publication...' : 'Ajouter' }}
            </button>
          </form>
        </div>

        <!-- SECTION APERÇU -->
        <div class="preview-section">
          <h2 class="prev-title">Aperçu de ton annonce</h2>
          <div class="v-preview-card">
              <div class="v-header">
                <div class="v-avatar"></div>
                <span class="v-user">test</span>
              </div>
              <div class="v-img-box">
                <img *ngIf="images.length > 0" [src]="images[0]" class="v-main-img">
                <div *ngIf="images.length === 0" class="v-empty">Pas de photo</div>
              </div>
              <div class="v-body">
                <div class="v-price">{{ adForm.value.price || '0' }} €</div>
                <div class="v-meta">{{ adForm.value.condition?.toUpperCase() }} • {{ adForm.value.size }}</div>
                <div class="v-title">{{ adForm.value.title || 'Titre' }}</div>
              </div>
          </div>
          <p class="v-legal">C'est ce que les autres membres verront dans les résultats de recherche.</p>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host { 
      --v-purple: var(--primary); 
      --v-text: var(--text-main); 
      --v-grey: var(--text-muted); 
      --v-bg: var(--bg-main); 
      --v-card: var(--bg-card);
      --v-input-bg: var(--border-light);
    }

    .page-container { background: var(--v-bg); min-height: 100vh; padding: 60px 20px; font-family: -apple-system, sans-serif; display: flex; justify-content: center; transition: all 0.3s ease; }
    .content-wrapper { display: flex; gap: 40px; max-width: 1050px; width: 100%; }

    .form-section { flex: 1.8; }
    .preview-section { flex: 1; position: sticky; top: 60px; height: fit-content; }

    .main-title, .prev-title { font-size: 20px; font-weight: 700; color: var(--v-text); margin-bottom: 20px; }

    .card { background: var(--v-card); border-radius: 8px; padding: 25px; margin-bottom: 25px; border: 1px solid var(--border-light); }
    
    /* PHOTOS */
    .photos-flex { display: flex; gap: 12px; flex-wrap: wrap; }
    .photo-item-v { position: relative; width: 110px; height: 140px; border-radius: 4px; overflow: hidden; border: 1px solid var(--border-light); }
    .photo-item-v img { width: 100%; height: 100%; object-fit: cover; }
    .photo-item-v.main { border: 2px solid var(--v-purple); }
    .badge-main { position: absolute; bottom: 0; width: 100%; background: var(--v-purple); color: white; font-size: 10px; text-align: center; padding: 5px 0; font-weight: 600; }
    .btn-remove, .btn-top { position: absolute; top: 4px; background: rgba(0,0,0,0.6); color: white; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 10px; }
    .btn-remove { right: 4px; }
    .btn-top { left: 4px; }
    .btn-top:hover { background: var(--v-purple); }

    .add-photo-box { width: 100%; min-height: 160px; border: 1px dashed var(--v-grey); border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; color: var(--v-purple); transition: background 0.2s; }
    .add-photo-box:hover { background: var(--v-input-bg); }
    .plus-icon { font-size: 38px; font-weight: 300; line-height: 1; }
    .plus-text { font-size: 13px; font-weight: 500; color: var(--v-grey); margin-top: 5px; }

    /* INPUTS */
    .field { margin-bottom: 25px; }
    .field:last-child { margin-bottom: 0; }
    label { display: block; font-size: 13px; font-weight: 600; color: var(--v-text); margin-bottom: 8px; }
    input, textarea, select { width: 100%; background: var(--v-input-bg); border: 1px solid transparent; border-radius: 5px; padding: 12px 14px; font-size: 14px; box-sizing: border-box; color: var(--v-text); transition: all 0.2s; }
    input:focus, textarea:focus, select:focus { background: var(--v-card); border-color: var(--v-purple); outline: none; }

    .details-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; align-items: start; }
    .v-select { position: relative; }
    .v-select::after { content: '▼'; position: absolute; right: 12px; top: 14px; font-size: 9px; color: var(--v-grey); pointer-events: none; }
    select { appearance: none; padding-right: 30px; }
    
    .v-price-input { position: relative; }
    .v-euro { position: absolute; right: 15px; top: 12px; color: var(--v-grey); font-weight: 500; }

    .vinted-cta { width: 100%; padding: 16px; background: var(--v-purple); color: white; border: none; border-radius: 5px; font-size: 16px; font-weight: 700; cursor: pointer; margin-top: 10px; }
    .vinted-cta:disabled { background: var(--v-input-bg); color: var(--v-grey); cursor: not-allowed; }

    /* PREVIEW */
    .v-preview-card { background: var(--v-card); border-radius: 12px; overflow: hidden; border: 1px solid var(--border-light); }
    .v-header { padding: 12px 15px; display: flex; align-items: center; gap: 10px; font-size: 12px; color: var(--v-grey); font-weight: 500; }
    .v-avatar { width: 24px; height: 24px; background: var(--v-input-bg); border-radius: 50%; }
    .v-img-box { width: 100%; padding-top: 135%; position: relative; background: var(--v-input-bg); }
    .v-main-img { position: absolute; top:0; left:0; width:100%; height:100%; object-fit: cover; }
    .v-empty { position: absolute; top:0; left:0; width:100%; height:100%; display: flex; align-items: center; justify-content: center; color: var(--v-grey); font-size: 14px; }
    .v-body { padding: 15px; }
    .v-price { font-size: 18px; font-weight: 700; color: var(--v-text); margin-bottom: 5px; }
    .v-meta { font-size: 11px; color: var(--v-grey); text-transform: uppercase; font-weight: 600; margin-bottom: 6px; }
    .v-title { color: var(--v-text); font-size: 13px; line-height: 1.4; }
    .v-legal { font-size: 11px; color: var(--v-grey); text-align: center; margin-top: 25px; line-height: 1.5; padding: 0 40px; }

    @media (max-width: 900px) {
      .content-wrapper { flex-direction: column; }
      .details-grid { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class AdFormComponent implements OnInit, OnDestroy {
  adForm: FormGroup;
  images: string[] = [];
  isSubmitting = false;

  categoryData: any = {
    'Vêtements': ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    'Chaussures': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50'],
    'Maison': ['Petit', 'Moyen', 'Grand', 'Unique'],
    'Électronique': ['Unique'],
    'Loisirs & Jeux': ['Unique']
  };
  availableSizes: string[] = this.categoryData['Vêtements'];

  constructor(
    private fb: FormBuilder, 
    private adService: AdService, 
    private authService: AuthService,
    private router: Router, 
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar
  ) {
    this.adForm = this.fb.group({
      title: ['', Validators.required],
      brand: [''],
      price: [null, [Validators.required, Validators.min(0.5)]],
      description: ['', Validators.required],
      category: ['Vêtements'],
      condition: ['Neuf avec étiquette'],
      size: ['M']
    });
  }

  ngOnInit() {
    // 1. On recharge les textes sauvés (SESSION UNIQUEMENT)
    const savedForm = sessionStorage.getItem('draft_ad_form');
    if (savedForm) {
      const data = JSON.parse(savedForm);
      this.adForm.patchValue(data);
      this.onCategoryChange();
    }

    const savedImages = sessionStorage.getItem('draft_ad_images');
    if (savedImages) {
      this.images = JSON.parse(savedImages);
    }

    this.adForm.valueChanges.subscribe(val => {
      sessionStorage.setItem('draft_ad_form', JSON.stringify(val));
    });
  }

  // Si on quitte la page via les liens du site, on vide tout !
  ngOnDestroy() {
    sessionStorage.removeItem('draft_ad_form');
    sessionStorage.removeItem('draft_ad_images');
  }

  saveImages() {
    sessionStorage.setItem('draft_ad_images', JSON.stringify(this.images));
    this.cdr.detectChanges();
  }

  onCategoryChange() {
    const category = this.adForm.get('category')?.value;
    const isFashion = category === 'Vêtements' || category === 'Chaussures';
    
    if (isFashion) {
      this.availableSizes = this.categoryData[category] || [];
      this.adForm.patchValue({ size: this.availableSizes[0] });
    } else {
      this.availableSizes = [];
      this.adForm.patchValue({ size: '' });
    }
    this.cdr.detectChanges();
  }

  onFilesSelected(event: any) {
    const files = event.target.files;
    if (files) {
      for (let file of files) {
        if (this.images.length >= 6) break;
        const reader = new FileReader();
        reader.onload = () => {
          this.images.push(reader.result as string);
          this.saveImages(); // On sauve tout de suite la photo !
        };
        reader.readAsDataURL(file);
      }
    }
  }

  setMain(index: number) {
    const img = this.images.splice(index, 1)[0];
    this.images.unshift(img);
    this.saveImages(); // Sauvegarde du nouvel ordre des photos !
  }

  removePhoto(index: number, event: Event) {
    event.stopPropagation();
    this.images.splice(index, 1);
    this.saveImages(); // Plus de changement nécessaire ici, saveImages fait detectChanges !
  }

  // Convertit le texte Base64 (aperçu) en véritable Fichier Binaire (pour le serveur)
  dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  onSubmit() {
    if (this.adForm.valid && this.images.length > 0) {
      this.isSubmitting = true;
      
      const userStr = localStorage.getItem('currentUser');
      const user = userStr ? JSON.parse(userStr) : {};
      const ownerId = user.id || user.userId || user.sub;

      // Construction du formulaire "Multipart" (comme un vrai formulaire HTML)
      const formData = new FormData();
      formData.append('title', this.adForm.value.title);
      formData.append('brand', this.adForm.value.brand || '');
      formData.append('price', String(this.adForm.value.price));
      formData.append('description', this.adForm.value.description);
      formData.append('category', this.adForm.value.category);
      formData.append('condition', this.adForm.value.condition);
      formData.append('size', this.adForm.value.size || '');
      formData.append('ownerId', String(ownerId));

      // Ajout des fichiers binaires au paquet
      this.images.forEach((imgBase64, index) => {
         const blob = this.dataURItoBlob(imgBase64);
         formData.append('images', blob, `photo_${index}.jpg`);
      });
      
      this.adService.createAd(formData).subscribe({
        next: () => {
          this.snackBar.open("🚀 Annonce publiée avec succès !", "Génial", { duration: 4000 });
          sessionStorage.removeItem('draft_ad_form');
          sessionStorage.removeItem('draft_ad_images');
          this.router.navigate(['/']);
        },
        error: () => {
          this.isSubmitting = false;
          this.snackBar.open("Une erreur est survenue lors de la publication.", "Fermer", { duration: 4000 });
        }
      });
    }
  }
}
