import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import uuid from 'uuid';

import { EventDispatcher, EventDispatcherInterface } from '../../decorators/EventDispatcher';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { Account } from '../models/Account';
import { AccountRepository } from '../repositories/AccountRepository';
import { events } from '../subscribers/events';

@Service()
export class AccountService {

    constructor(
        @OrmRepository() private accountRepository: AccountRepository,
        @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
        @Logger(__filename) private log: LoggerInterface
    ) { }

    public find(): Promise<Account[]> {
        this.log.info('Find all accounts');
        return this.accountRepository.find({ relations: ['transactions'] });
    }

    public findOne(id: string): Promise<Account | undefined> {
        this.log.info('Find one account');
        return this.accountRepository.findOne({ id });
    }

    public async create(account: Account): Promise<Account> {
        this.log.info('Create a new account => ', account.toString());
        account.id = uuid.v1();
        const newAccount = await this.accountRepository.save(account);
        this.eventDispatcher.dispatch(events.account.created, newAccount);
        return newAccount;
    }

    public update(id: string, account: Account): Promise<Account> {
        this.log.info('Update a account');
        account.id = id;
        return this.accountRepository.save(account);
    }

    public async delete(id: string): Promise<void> {
        this.log.info('Delete a account');
        await this.accountRepository.delete(id);
        return;
    }
}
