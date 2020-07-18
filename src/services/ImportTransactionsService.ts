import { getCustomRepository, getRepository } from 'typeorm';
import csv from 'csvtojson';
import path from 'path';
import fs from 'fs';

import uploadConfig from '../config/upload';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';


class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();

    const csvFilePath = path.resolve(uploadConfig.directory, filename);

    if (!fs.existsSync(csvFilePath)) {
      throw new AppError('CSV File does not exists!');
    }

    const transactionList = await csv().fromFile(csvFilePath);
    const transactions = []

    for (const { title, value, type, category } of transactionList) {
      const transaction = await createTransaction.execute({
        title,
        value,
        type,
        category
      });

      transactions.push(transaction);
    }

    return transactions;

  }
}

export default ImportTransactionsService;
