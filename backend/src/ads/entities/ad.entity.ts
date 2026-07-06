import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../auth/entities/user.entity';

@Entity('products') // Nouveau nom de table pour la sécurité !
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  brand: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'enum', enum: ['AVAILABLE', 'SOLD'], default: 'AVAILABLE' })
  status: string;

  @Column({ default: 'BON ÉTAT' })
  condition: string;

  @Column({ nullable: true })
  size: string;

  @Column({ nullable: true })
  category: string;

  @Column('longtext', { nullable: true })
  image_data: string; // On stocke l'image ici pour le test

  @Column({ nullable: true })
  ownerId: string; // On rajoute la colonne EN DUR ! ✨🚀

  @ManyToOne(() => User)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
