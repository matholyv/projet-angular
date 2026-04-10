import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Ad } from './ad.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  icon: string;

  @OneToMany(() => Ad, ad => ad.category)
  ads: Ad[];
}
