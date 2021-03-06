/* eslint promise/prefer-await-to-then: 0 */

import UnlockJs from '@unlock-protocol/unlock-js'
import { startLoading, doneLoading } from '../actions/loading'
import { SET_ACCOUNT, updateAccount } from '../actions/accounts'
import { updateLock, addLock } from '../actions/lock'
import { addTransaction, updateTransaction } from '../actions/transaction'
import { SET_PROVIDER } from '../actions/provider'
import { SET_NETWORK } from '../actions/network'
import { setError } from '../actions/error'
import { transactionTypeMapping } from '../utils/types'
import { lockRoute } from '../utils/routes'

const { Web3Service } = UnlockJs

// This middleware listen to redux events and invokes the web3Service API.
// It also listen to events from web3Service and dispatches corresponding actions
const web3Middleware = config => {
  const {
    readOnlyProvider,
    unlockAddress,
    blockTime,
    requiredConfirmations,
  } = config
  return ({ dispatch, getState }) => {
    const web3Service = new Web3Service({
      readOnlyProvider,
      unlockAddress,
      blockTime,
      requiredConfirmations,
    })

    web3Service.on('error', error => {
      dispatch(setError(error.message))
    })

    web3Service.on('account.updated', (account, update) => {
      dispatch(updateAccount(update))
    })

    web3Service.on('transaction.new', transactionHash => {
      dispatch(
        addTransaction({
          hash: transactionHash,
          network: getState().network.name,
        })
      )
    })

    web3Service.on('transaction.updated', (transactionHash, update) => {
      // Mapping the transaction type
      if (update.type) {
        update.type = transactionTypeMapping(update.type)
      }
      dispatch(updateTransaction(transactionHash, update))
    })

    web3Service.on('lock.updated', (address, update) => {
      const lock = getState().locks[address]
      if (lock) {
        dispatch(updateLock(address, update))
      } else {
        dispatch(addLock(address, update))
      }
    })

    return function(next) {
      return function(action) {
        next(action)

        // note: this needs to be after the reducer has seen it, because refreshAccountBalance
        // triggers 'account.update' which dispatches UPDATE_ACCOUNT. The reducer assumes that
        // ADD_ACCOUNT has reached it first, and throws an exception. Putting it after the
        // reducer has a chance to populate state removes this race condition.
        if (action.type === SET_ACCOUNT) {
          // TODO: when the account has been updated we should reset web3Service and remove all listeners
          // So that pending API calls do not interract with our "new" state.
          web3Service.refreshAccountBalance(action.account)
          dispatch(startLoading())
          // TODO: only do that when on the page to create events because we do not need the list of locks for other users.
          web3Service
            .getPastLockCreationsTransactionsForUser(action.account.address)
            .then(lockCreations => {
              dispatch(doneLoading())
              lockCreations.forEach(lockCreation => {
                web3Service.getTransaction(lockCreation.transactionHash)
              })
            })
        }

        const {
          router: {
            location: { pathname, hash },
          },
        } = getState()
        const { lockAddress } = lockRoute(pathname + hash)

        if (action.type === SET_PROVIDER || action.type === SET_NETWORK) {
          // for both of these actions, the lock state is invalid, and must be refreshed.
          if (lockAddress) {
            web3Service.getLock(lockAddress)
          }
        }
      }
    }
  }
}

export default web3Middleware
