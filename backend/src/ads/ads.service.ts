import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Product } from './entities/ad.entity';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class AdsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(data: any) {
    const newProduct = this.productRepository.create({
      title: data.title,
      brand: data.brand || null,
      description: data.description || "Pas de description",
      price: data.price || 0,
      condition: data.condition || 'BON ÉTAT',
      size: data.size || 'M',
      category: data.category || 'Vêtements',
      image_data: data.image_data, 
      ownerId: data.ownerId,
    });

    return await this.productRepository.save(newProduct);
  }

  async findAll(query?: any) {
    const where: any = {};
    
    // Par défaut, on n'affiche que les annonces disponibles (non vendues)
    // Sauf si on filtre par propriétaire (pour voir son historique sur le profil)
    if (!query?.ownerId) {
      where.status = 'AVAILABLE';
    }
    
    // Mot-clé (avec gestion basique du pluriel) 🧠
    if (query?.keyword && query.keyword.trim() !== '') {
      let kw = query.keyword.trim();
      // Si le mot fait plus de 3 lettres et fini par "s", on le retire pour chercher la racine du mot
      if (kw.length > 3 && kw.toLowerCase().endsWith('s')) {
        kw = kw.slice(0, -1);
      }
      where.title = Like(`%${kw}%`);
    }
    
    // Catégorie
    if (query?.category && query.category.trim() !== '') {
      where.category = query.category;
    }
    
    // Prix
    if (query?.minPrice || query?.maxPrice) {
      const min = Number(query.minPrice) || 0;
      const max = Number(query.maxPrice) || 999999;
      where.price = Between(min, max);
    }

    // TAILLE 🧥
    if (query?.size && query.size !== '') {
      where.size = query.size;
    }

    // ÉTAT ✨
    if (query?.condition && query.condition.trim() !== '') {
      where.condition = query.condition.trim();
    }

    // PROPRIÉTAIRE (Profil)
    if (query?.ownerId && query.ownerId.trim() !== '') {
      where.ownerId = query.ownerId;
    }

    // MARQUE
    if (query?.brand && query.brand.trim() !== '') {
      where.brand = Like(`%${query.brand.trim()}%`);
    }

    let order: any = { createdAt: 'DESC' };
    if (query?.sort === 'price_asc') {
      order = { price: 'ASC' };
    } else if (query?.sort === 'price_desc') {
      order = { price: 'DESC' };
    }

    const ads = await this.productRepository.find({
      where,
      relations: ['owner'],
      order
    });

    console.log("TAILLES TROUVÉES EN BASE :", ads.map(a => a.size));
    console.log("Résultats trouvés :", ads.length);

    return ads;
  }

  async findOne(id: number) {
    const ad = await this.productRepository.findOne({
      where: { id },
      relations: ['owner']
    });
    if (!ad) throw new Error("Annonce introuvable");
    return ad;
  }

  async remove(id: number) {
    const ad = await this.findOne(id);
    if (!ad) throw new Error("Annonce introuvable");
    if (ad.status === 'SOLD') {
      throw new Error("Impossible de supprimer une annonce vendue (transaction en cours ou finalisée).");
    }
    return this.productRepository.remove(ad);
  }
}
