import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Category from '../models/Category';
import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';


interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}


class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category }: Request): Promise<Transaction> {

      const transactionsRepository = getCustomRepository(TransactionsRepository);
      const categoriesRepository = getRepository(Category);

      if (type === 'outcome') {
        const balance = await transactionsRepository.getBalance();

        if (value > balance.total) {
          throw new AppError('Insufficient funds for this transaction');
        }
      }

      const findCategory = await categoriesRepository.findOne({
        where: { title: category }
      });

      let category_id;
      if (!findCategory) {
        const categoryToCreate = categoriesRepository.create({
          title: category
        });

        await categoriesRepository.save( categoryToCreate );

        category_id = categoryToCreate.id;
      } else {

        category_id = findCategory.id;

      }

      const transaction = transactionsRepository.create({
        title,
        value,
        type,
        category_id
      })

      await transactionsRepository.save(transaction);

      return transaction;
  }
}

export default CreateTransactionService;
