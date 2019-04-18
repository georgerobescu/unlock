const Unlock = require('unlock-abi-0-1').Unlock

const { WalletService, deploy, getWeb3Provider } = require('./index')

const host = '127.0.0.1'
const port = 8545
const url = `http://${host}:${port}`

/**
 * Ti run this make sure you have ganache running locally
 */

// Deploy Unlock
return deploy(host, port, Unlock, unlockContract => {
  console.log(`Unlock is at ${unlockContract.options.address}`)
  const walletService = new WalletService({
    unlockAddress: unlockContract.options.address,
  })

  walletService.on('network.changed', id => {
    console.log(`Network id: ${id}`)

    // Next: deploy a lock!
    const account = '0xAaAdEED4c0B861cB36f4cE006a9C90BA2E43fdc2'

    walletService.on('transaction.new', (...args) => {
      console.log('new transaction')
      console.log(args)
    })

    walletService.on('lock.updated', (...args) => {
      console.log('lock updated')
      console.log(args)
    })

    const lock = {
      expirationDuration: '100000',
      keyPrice: '0.1',
      maxNumberOfKeys: '100',
    }

    // Create Lock now
    walletService.createLock(lock, account)
  })

  const provider = getWeb3Provider(url)
  walletService.connect(provider)
})

// // const configs = {
// //   // rinkeby: {
// //   //   lock: '0xbD4dAffA2D05E68675274fb636c85D380eDaF1e7',
// //   //   service: new Web3Service({
// //   //     readOnlyProvider:
// //   //       'https://eth-rinkeby.alchemyapi.io/jsonrpc/n0NXRSZ9olpkJUPDLBC00Es75jaqysyT',
// //   //     unlockAddress: '0xd8c88be5e8eb88e38e6ff5ce186d764676012b0b',
// //   //   }),
// //   // },

// //   // mainnet: {
// //   //   lock: '0x7ee1b5CBd032A6258171580484Ac3aDc63Ee130A',
// //   //   service: new Web3Service({
// //   //     readOnlyProvider:
// //   //       'https://eth-mainnet.alchemyapi.io/jsonrpc/6idtzGwDtRbzil3s6QbYHr2Q_WBfn100',
// //   //     unlockAddress: '0x3d5409cce1d45233de1d4ebdee74b8e004abdd13',
// //   //   }),
// //   // },

// //   dev: {
// //     lock: '0x7ee1b5CBd032A6258171580484Ac3aDc63Ee130A',
// //     service: new Web3Service({
// //       readOnlyProvider: 'http://0.0.0.0:8545/',
// //       unlockAddress: '0x885EF47c3439ADE0CB9b33a4D3c534C99964Db93',
// //     }),
// //   },
// // }

// // const promises = Object.keys(configs).map(network => {
// //   const service = configs[network].service
// //   // const lock = configs[network].lock

// //   const p1 = service
// //     .unlockContractAbiVersion()
// //     .then(abi => {
// //       console.log(`${network} unlock: ${abi.version}`)
// //     })
// //     .catch(error => {
// //       console.error(`${network} unlock: ${error}`)
// //     })

// //   // const p2 = service
// //   //   .lockContractAbiVersion(lock)
// //   //   .then(abi => {
// //   //     console.log(`${network} lock: ${abi.version}`)
// //   //   })
// //   //   .catch(error => {
// //   //     console.error(`${network} lock: ${error}`)
// //   //   })

// //   return Promise.all([p1]) //, p2])
// // })

// // return Promise.resolve(promises)
