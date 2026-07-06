import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: true })
  userId: string; // null means global notification

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column()
  type: string; // e.g., 'TRANSACTION', 'REVIEW', 'SYSTEM'

  @Column({ nullable: true })
  link: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
