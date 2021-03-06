import React from 'react'
import { connect } from 'react-redux'
import Head from 'next/head'
import BrowserOnly from '../helpers/BrowserOnly'
import UnlockPropTypes from '../../propTypes'
import GlobalErrorConsumer from '../interface/GlobalErrorConsumer'
import DeveloperOverlay from '../developer/DeveloperOverlay'
import Layout from '../interface/Layout'
import Account from '../interface/Account'
import { pageTitle } from '../../constants'
import AuthenticationPrompt from '../interface/AuthenticationPrompt'
import SignUp from '../interface/SignUp'
import FinishSignup from '../interface/FinishSignup'

export class KeyChainContent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      // TODO: Add method to toggle signUp and pass it to subcomponents, so that
      // we can switch back and forth between views for logging in and signing
      // up.
      signUp: true,
    }
  }

  render() {
    const { account, network, router } = this.props
    const { signUp } = this.state
    const { hash } = router.location
    const emailAddress = hash.slice(1) // trim off leading '#'

    return (
      <GlobalErrorConsumer>
        <Layout title="Key Chain">
          <Head>
            <title>{pageTitle('Key Chain')}</title>
          </Head>
          {account && (
            <BrowserOnly>
              <Account network={network} account={account} />
              <DeveloperOverlay />
            </BrowserOnly>
          )}
          {!account && !signUp && (
            <BrowserOnly>
              <AuthenticationPrompt />
            </BrowserOnly>
          )}
          {!account && signUp && !emailAddress && (
            <BrowserOnly>
              <SignUp />
            </BrowserOnly>
          )}
          {!account && signUp && emailAddress && (
            <BrowserOnly>
              <FinishSignup emailAddress={emailAddress} />
            </BrowserOnly>
          )}
        </Layout>
      </GlobalErrorConsumer>
    )
  }
}

KeyChainContent.propTypes = {
  account: UnlockPropTypes.account,
  network: UnlockPropTypes.network.isRequired,
  router: UnlockPropTypes.router.isRequired,
}

KeyChainContent.defaultProps = {
  account: null,
}

export const mapStateToProps = ({ account, network, router }) => {
  return {
    account,
    network,
    router,
  }
}

export default connect(mapStateToProps)(KeyChainContent)
