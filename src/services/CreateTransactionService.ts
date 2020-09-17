import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

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
    category,
  }: Request): Promise<Transaction> {
    const transactionReposiyory = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);

    const { total } = await transactionReposiyory.getBalance();

    if (type === 'outcome' && total < value) {
      throw new AppError('You do not have enough balance');
    }

    let transactionCategory = await categoryRepository.findOne({
      where: {
        title: category,
      },
    });
    if (!transactionCategory) {
      transactionCategory = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(transactionCategory);
    }
    // Verificar se a categoria existe
    // Existe? Buscar do banco de dados e usar o ID

    // Não existe? Eu crio

    const transaction = transactionReposiyory.create({
      title,
      value,
      type,
      category: transactionCategory,
    });
    await transactionReposiyory.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
