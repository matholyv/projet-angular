import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ad } from './entities/ad.entity';

@Injectable()
export class AdsService {
  constructor(
    @InjectRepository(Ad)
    private readonly adsRepository: Repository<Ad>,
  ) {}

  /**
   * Récupère toutes les annonces avec leurs relations (catégorie et auteur)
   */
  async findAll(): Promise<Ad[]> {
    return this.adsRepository.find({
      relations: ['category', 'user'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Récupère une annonce spécifique par son ID
   */
  async findOne(id: string): Promise<Ad> {
    const ad = await this.adsRepository.findOne({
      where: { id },
      relations: ['category', 'user'],
    });

    if (!ad) {
      throw new NotFoundException(`L'annonce avec l'ID ${id} n'existe pas.`);
    }

    return ad;
  }

  /**
   * Crée une nouvelle annonce
   */
  async create(adData: Partial<Ad>): Promise<Ad> {
    const newAd = this.adsRepository.create(adData);
    return this.adsRepository.save(newAd);
  }

  /**
   * Met à jour une annonce
   */
  async update(id: string, adData: Partial<Ad>): Promise<Ad> {
    const ad = await this.findOne(id);
    Object.assign(ad, adData);
    return this.adsRepository.save(ad);
  }

  /**
   * Filtrer les annonces par catégorie et prix
   */
  async findFiltered(categoryId?: number, minPrice?: number, maxPrice?: number): Promise<Ad[]> {
    const query = this.adsRepository.createQueryBuilder('ad')
      .leftJoinAndSelect('ad.category', 'category')
      .leftJoinAndSelect('ad.user', 'user');

    if (categoryId) {
      query.andWhere('ad.categoryId = :categoryId', { categoryId });
    }
    if (minPrice !== undefined) {
      query.andWhere('ad.price >= :minPrice', { minPrice });
    }
    if (maxPrice !== undefined) {
      query.andWhere('ad.price <= :maxPrice', { maxPrice });
    }

    query.orderBy('ad.created_at', 'DESC');
    return query.getMany();
  }

  /**
   * Supprime une annonce
   */
  async remove(id: string): Promise<void> {
    const result = await this.adsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Impossible de supprimer : l'annonce ${id} est introuvable.`);
    }
  }
}
