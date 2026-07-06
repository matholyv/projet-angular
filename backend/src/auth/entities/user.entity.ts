import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false }) // Ne pas retourner le mot de passe par défaut
  password: string;

  @Column()
  pseudo: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ['USER', 'ADMIN'], default: 'USER' })
  role: string;

  @Column('decimal', { precision: 10, scale: 2, default: 100.00, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
  }})
  credits: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0.00, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
  }})
  pending_credits: number;

  @CreateDateColumn()
  created_at: Date;
}
