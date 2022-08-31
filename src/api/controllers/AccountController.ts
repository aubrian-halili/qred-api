import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsNumber, IsUUID, ValidateNested } from 'class-validator';
import {
    Body, Delete, Get, JsonController, OnUndefined, Param, Post, Put, Req
} from 'routing-controllers';
import { OpenAPI, ResponseSchema } from 'routing-controllers-openapi';

import { AccountNotFoundError } from '../errors/AccountNotFoundError';
import { Account } from '../models/Account';
import { AccountService } from '../services/AccountService';
import { TransactionResponse } from './TransactionController';

class BaseAccount {
    @IsNotEmpty()
    public name: string;

    @IsNotEmpty()
    public cardNumber: string;

    @IsNumber()
    public limitAmount: number;

    @IsNumber()
    @IsOptional()
    public remainingAmount: number;
}

export class AccountResponse extends BaseAccount {
    @IsUUID()
    public id: string;

    @IsNotEmpty()
    public createdAt: string;

    @IsNotEmpty()
    public updateddAt: string;

    @ValidateNested({ each: true })
    @Type(() => TransactionResponse)
    public transactions: TransactionResponse[];
}

class CreateAccountBody extends BaseAccount {}

// @Authorized()
@JsonController('/accounts')
@OpenAPI({ security: [{ basicAuth: [] }] })
export class AccountController {

    constructor(
        private accountService: AccountService
    ) { }

    @Get()
    @ResponseSchema(AccountResponse, { isArray: true })
    public find(): Promise<Account[]> {
        return this.accountService.find();
    }

    @Get('/me')
    @ResponseSchema(AccountResponse, { isArray: true })
    public findMe(@Req() req: any): Promise<Account[]> {
        return req.account;
    }

    @Get('/:id')
    @OnUndefined(AccountNotFoundError)
    @ResponseSchema(AccountResponse)
    public one(@Param('id') id: string): Promise<Account | undefined> {
        return this.accountService.findOne(id);
    }

    @Post()
    @ResponseSchema(AccountResponse)
    public create(@Body() body: CreateAccountBody): Promise<Account> {
        const account = new Account();
        account.name = body.name;
        account.cardNumber = body.cardNumber;
        account.limitAmount = body.limitAmount;

        return this.accountService.create(account);
    }

    @Put('/:id')
    @ResponseSchema(AccountResponse)
    public update(@Param('id') id: string, @Body() body: BaseAccount): Promise<Account> {
        const account = new Account();
        account.name = body.name;
        account.cardNumber = body.cardNumber;
        account.limitAmount = body.limitAmount;
        account.remainingAmount = body.remainingAmount;

        return this.accountService.update(id, account);
    }

    @Delete('/:id')
    public delete(@Param('id') id: string): Promise<void> {
        return this.accountService.delete(id);
    }
}
