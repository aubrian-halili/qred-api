import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';
import {
    Body, Delete, Get, JsonController, OnUndefined, Param, Post, Put
} from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { TransactionNotFoundError } from '../errors/TransactionNotFoundError';
import { Transaction } from '../models/Transaction';
import { TransactionService } from '../services/TransactionService';
// import { AccountResponse } from './AccountController';

class BaseTransaction {
    @IsNotEmpty()
    public item: string;

    @IsNumber()
    public amount: number;
}

export class TransactionResponse extends BaseTransaction {
    @IsUUID()
    public id: string;

    @IsNotEmpty()
    public accountId: string;

    @IsNotEmpty()
    public createdAt: string;

    @IsNotEmpty()
    public updateddAt: string;
}

class CreateTransactionBody extends BaseTransaction {
    @IsUUID()
    public accountId: string;
}

@JsonController('/transactions')
@OpenAPI({ security: [{ basicAuth: [] }] })
export class TransactionController {

    constructor(
        private transactionService: TransactionService
    ) { }

    @Get()
    @ResponseSchema(TransactionResponse, { isArray: true })
    public find(): Promise<Transaction[]> {
        return this.transactionService.find();
    }

    @Get('/:id')
    @OnUndefined(TransactionNotFoundError)
    @ResponseSchema(TransactionResponse)
    public one(@Param('id') id: string): Promise<Transaction | undefined> {
        return this.transactionService.findOne(id);
    }

    @Post()
    @ResponseSchema(TransactionResponse)
    public create(@Body({ required: true }) body: CreateTransactionBody): Promise<Transaction> {
        const transaction = new Transaction();
        transaction.accountId = body.accountId;
        transaction.item = body.item;
        transaction.amount = body.amount;

        return this.transactionService.create(transaction);
    }

    @Put('/:id')
    @ResponseSchema(TransactionResponse)
    public update(@Param('id') id: string, @Body() body: BaseTransaction): Promise<Transaction> {
        const transaction = new Transaction();
        transaction.item = body.item;
        transaction.amount = body.amount;

        return this.transactionService.update(id, transaction);
    }

    @Delete('/:id')
    public delete(@Param('id') id: string): Promise<void> {
        return this.transactionService.delete(id);
    }
}
