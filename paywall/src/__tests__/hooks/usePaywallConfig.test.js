import React from 'react'
import * as rtl from 'react-testing-library'
import usePaywallConfig from '../../hooks/usePaywallConfig'
import { WindowContext } from '../../hooks/browser/useWindow'
import { ConfigContext } from '../../utils/withConfig'
import {
  POST_MESSAGE_READY,
  POST_MESSAGE_CONFIG,
} from '../../paywall-builder/constants'

describe('usePaywallConfig hook', () => {
  let fakeWindow
  let config
  const lock = '0x1234567890123456789012345678901234567890'

  function MockPaywallConfig() {
    const paywallConfig = usePaywallConfig()

    return <div data-testid="config">{JSON.stringify(paywallConfig)}</div>
  }

  function Wrapper() {
    return (
      <WindowContext.Provider value={fakeWindow}>
        <ConfigContext.Provider value={config}>
          <MockPaywallConfig />
        </ConfigContext.Provider>
      </WindowContext.Provider>
    )
  }

  function getListener() {
    return fakeWindow.addEventListener.mock.calls[0][1]
  }

  beforeEach(() => {
    config = {
      isInIframe: true,
      isServer: false,
    }
    fakeWindow = {
      location: {
        pathname: `/${lock}`,
        search: '?origin=origin',
        hash: '',
      },
      parent: {
        postMessage: jest.fn(),
      },
      addEventListener: jest.fn(),
      removeEventListener: () => {},
    }
    fakeWindow.self = fakeWindow
    fakeWindow.top = {}
  })

  it('sends POST_MESSAGE_READY on startup', () => {
    expect.assertions(1)

    rtl.render(<Wrapper />)

    expect(fakeWindow.parent.postMessage).toHaveBeenCalledWith(
      POST_MESSAGE_READY,
      'origin'
    )
  })

  it('does not send POST_MESSAGE_STARTUP more than once', () => {
    expect.assertions(1)

    const { rerender } = rtl.render(<Wrapper />)

    rerender(<Wrapper foo="bar" />)

    expect(fakeWindow.parent.postMessage).toHaveBeenCalledTimes(1)
  })

  it('listens for POST_MESSAGE_CONFIG', () => {
    expect.assertions(1)

    let wrapper
    rtl.act(() => {
      wrapper = rtl.render(<Wrapper />)
    })

    const listener = getListener()

    rtl.act(() => {
      listener({
        source: fakeWindow.parent,
        origin: 'origin',
        data: {
          type: POST_MESSAGE_CONFIG,
          payload: { wow: 'it worked!' },
        },
      })
    })

    expect(wrapper.getByTestId('config')).toHaveTextContent(
      JSON.stringify({ wow: 'it worked!' })
    )
  })
})
