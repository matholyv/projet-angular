import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 5, scale: 2, default: 5.00, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
  }})
  feePercentage: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0.50, transformer: {
    to: (value: number) => value,
    from: (value: string) => parseFloat(value)
  }})
  feeFixed: number;
}
