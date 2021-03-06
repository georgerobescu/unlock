import Web3 from 'web3'
import * as UnlockV01 from 'unlock-abi-0-1'
import partialWithdrawFromLock from '../../v01/partialWithdrawFromLock'
import Errors from '../../errors'
import { GAS_AMOUNTS } from '../../constants'
import TransactionTypes from '../../transactionTypes'
import NockHelper from '../helpers/nockHelper'
import { prepWalletService } from '../helpers/walletServiceHelper'

const { FAILED_TO_WITHDRAW_FROM_LOCK } = Errors
const endpoint = 'http://127.0.0.1:8545'
const provider = new Web3.providers.HttpProvider(endpoint)
const nock = new NockHelper(endpoint, false /** debug */)
let unlockAddress = '0xD8C88BE5e8EB88E38E6ff5cE186d764676012B0b'

let walletService

describe('v01', () => {
  beforeEach(done => {
    nock.cleanAll()
    prepWalletService(
      unlockAddress,
      UnlockV01.Unlock,
      provider,
      nock,
      _walletService => {
        walletService = _walletService
        // bind the partialWithdrawFromLock into walletService
        walletService.partialWithdrawFromLock = partialWithdrawFromLock.bind(
          walletService
        )
        return done()
      }
    )
  })

  describe('partialWithdrawFromLock', () => {
    let lock
    let account

    beforeEach(() => {
      lock = '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b'
      account = '0xdeadbeef'
    })

    it('should invoke sendTransaction with the right params', done => {
      expect.assertions(3)
      const data = '' // mock abi data for partialWithdraw

      walletService._sendTransaction = jest.fn(() => {
        done()
      })

      const MockContractClass = class {
        constructor(abi, address) {
          expect(abi).toBe(UnlockV01.PublicLock.abi)
          expect(address).toBe(lock)
          this.methods = {
            partialWithdraw: () => this,
          }
          this.encodeABI = jest.fn(() => data)
        }
      }

      walletService.web3.eth.Contract = MockContractClass

      walletService.partialWithdrawFromLock(lock, account, '3', () => {
        done()
      })

      expect(walletService._sendTransaction).toHaveBeenCalledWith(
        {
          to: lock,
          from: account,
          data,
          gas: GAS_AMOUNTS.partialWithdrawFromLock,
          contract: UnlockV01.PublicLock,
        },
        TransactionTypes.WITHDRAWAL,
        expect.any(Function)
      )
    })

    it('should emit an error if the transaction cannot be sent', done => {
      expect.assertions(1)
      const error = {}

      walletService._sendTransaction = jest.fn((args, type, cb) => {
        return cb(error)
      })

      walletService.on('error', error => {
        expect(error.message).toBe(FAILED_TO_WITHDRAW_FROM_LOCK)
        done()
      })

      walletService.partialWithdrawFromLock(lock, account, '3', () => {})
    })

    it('should not emit an error when `error` is falsy', done => {
      expect.assertions(1)
      const error = undefined

      walletService._sendTransaction = jest.fn((args, type, cb) => {
        return cb(error)
      })

      walletService.emit = jest.fn()

      walletService.partialWithdrawFromLock(lock, account, '3', () => {
        expect(walletService.emit).not.toHaveBeenCalled()
        done()
      })
    })
  })
})
