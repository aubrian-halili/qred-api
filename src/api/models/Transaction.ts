import { IsNotEmpty, IsNumber } from 'class-validator';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';

import { Account } from './Account';

@Entity()
export class Transaction {

    @PrimaryColumn('uuid')
    public id: string;

    @IsNotEmpty()
    @Column()
    public item: string;

    @IsNumber()
    @Column()
    public amount: number;

    @IsNotEmpty()
    @Column({ name: 'created_at' })
    public createdAt: string;

    @IsNotEmpty()
    @Column({ name: 'updated_at' })
    public updatedAt: string;

    @Column({
        name: 'account_id',
        nullable: true,
    })
    public accountId: string;

    @ManyToOne(type => Account, account => account.transactions)
    @JoinColumn({ name: 'account_id' })
    public account: Account;

    public toString(): string {
        return `${this.item} ${this.amount}`;
    }
}
