import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const balance = transactions.reduce((balance: Balance, transaction: Transaction) => {
      balance[transaction.type] += transaction.value;

      if (transaction.type === 'outcome')
        balance.total = balance.total - transaction.value
      else
        balance.total = balance.total + transaction.value

      return balance
    }, { income: 0, outcome: 0, total: 0 });

    return balance;
  }

  public async findWithJoin(): Promise<Transaction[]> {
    const transactions = await this.createQueryBuilder("transactions")
      .leftJoinAndSelect("transactions.category", "category")
      .getMany();

    return transactions
  }
}

export default TransactionsRepository;
