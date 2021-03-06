import { Transaction } from '../models/transaction'

const ethJsUtil = require('ethereumjs-util')
const Sequelize = require('sequelize')

const Op = Sequelize.Op

/**
 * Finds a transaction by its hash or creates it
 * @param {*} transaction
 */
export const findOrCreateTransaction = async (transaction: Transaction) => {
  return await Transaction.findOrCreate({
    where: {
      transactionHash: transaction.transactionHash,
    },
    defaults: {
      transactionHash: transaction.transactionHash,
      sender: ethJsUtil.toChecksumAddress(transaction.sender),
      recipient: ethJsUtil.toChecksumAddress(transaction.recipient),
      chain: transaction.chain,
    },
  })
}

/**
 * get all the transactions sent by a given address
 * @param {*} _sender
 */
export const getTransactionsBySender = async (_sender: string) => {
  const sender = ethJsUtil.toChecksumAddress(_sender)
  return await Transaction.findAll({
    where: {
      sender: { [Op.eq]: sender },
    },
  })
}
