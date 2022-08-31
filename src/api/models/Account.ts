import { IsNotEmpty, IsNumber } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryColumn } from 'typeorm';

import { Transaction } from './Transaction';

@Entity()
export class Account {
    @PrimaryColumn('uuid')
    public id: string;

    @IsNotEmpty()
    public name: string;

    @IsNumber()
    @Column({ name: 'limit_amount' })
    public limitAmount: number;

    @IsNumber()
    @Column({ name: 'remaining_amount' })
    public remainingAmount: number;

    @IsNotEmpty()
    @Column({ name: 'card_number' })
    public cardNumber: string;

    @IsNotEmpty()
    @Column({ name: 'created_at' })
    public createdAt: string;

    @IsNotEmpty()
    @Column({ name: 'updated_at' })
    public updatedAt: string;

    @OneToMany(type => Transaction, transaction => transaction.account)
    public transactions: Transaction[];

    public toString(): string {
        return `${this.name}`;
    }
}
