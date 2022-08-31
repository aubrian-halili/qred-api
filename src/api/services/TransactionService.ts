import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import uuid from 'uuid';

import { EventDispatcher, EventDispatcherInterface } from '../../decorators/EventDispatcher';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { Transaction } from '../models/Transaction';
import { Account } from '../models/Account';
import { TransactionRepository } from '../repositories/TransactionRepository';
import { events } from '../subscribers/events';

@Service()
export class TransactionService {

    constructor(
        @OrmRepository() private transactionRepository: TransactionRepository,
        @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
        @Logger(__filename) private log: LoggerInterface
    ) { }

    public find(): Promise<Transaction[]> {
        this.log.info('Find all transactions');
        return this.transactionRepository.find();
    }

    public findByAccount(account: Account): Promise<Transaction[]> {
        this.log.info('Find all transactions of the account', account.toString());
        return this.transactionRepository.find({
            where: {
                accountId: account.id,
            },
        });
    }

    public findOne(id: string): Promise<Transaction | undefined> {
        this.log.info('Find all transactions');
        return this.transactionRepository.findOne({ id });
    }

    public async create(transaction: Transaction): Promise<Transaction> {
        this.log.info('Create a new transaction => ', transaction.toString());
        transaction.id = uuid.v1();
        const newTransaction = await this.transactionRepository.save(transaction);
        this.eventDispatcher.dispatch(events.transaction.created, newTransaction);
        return newTransaction;
    }

    public update(id: string, transaction: Transaction): Promise<Transaction> {
        this.log.info('Update a transaction');
        transaction.id = id;
        return this.transactionRepository.save(transaction);
    }

    public async delete(id: string): Promise<void> {
        this.log.info('Delete a transaction');
        await this.transactionRepository.delete(id);
        return;
    }

}
