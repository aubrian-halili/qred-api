import { EntityRepository, Repository } from 'typeorm';

import { Transaction } from '../models/Transaction';

@EntityRepository(Transaction)
export class TransactionRepository extends Repository<Transaction> {

    /**
     * Find by account_id is used for our data-loader to get all needed transactions in one query.
     */
    public findByAccountIds(ids: string[]): Promise<Transaction[]> {
        return this.createQueryBuilder()
            .select()
            .where(`transaction.account_id IN (${ids.map(id => `'${id}'`).join(', ')})`)
            .getMany();
    }

}
