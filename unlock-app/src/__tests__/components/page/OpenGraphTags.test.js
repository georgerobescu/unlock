import React from 'react'
import * as rtl from 'react-testing-library'
import {
  pageTitle,
  PAGE_DESCRIPTION,
  PAGE_DEFAULT_IMAGE,
} from '../../../constants'
import OpenGraphTags from '../../../components/page/OpenGraphTags'

describe('OpenGraphTags', () => {
  it('should render open graph tags based on default values', () => {
    expect.assertions(5)
    const tags = rtl.render(
      <OpenGraphTags
        title={null}
        description={null}
        image={null}
        canonicalPath={null}
      />
    )
    expect(
      tags.container.querySelector("meta[property='og:title']").content
    ).toBe(pageTitle())
    expect(
      tags.container.querySelector("meta[property='og:description']").content
    ).toBe(PAGE_DESCRIPTION)
    expect(
      tags.container.querySelector("meta[property='og:image']").content
    ).toBe(PAGE_DEFAULT_IMAGE)
    expect(
      tags.container.querySelector("meta[property='og:type']").content
    ).toBe('website')
    expect(
      tags.container.querySelector("meta[property='og:url']").content
    ).toBe('/')
  })

  it('should render open graph tags based on custom values', () => {
    expect.assertions(5)
    let title = 'custom title'
    let description = 'I am the very model of a model view controller'
    let image = '/some/image.png'
    let path = '/lemon'
    const tags = rtl.render(
      <OpenGraphTags
        title={title}
        description={description}
        image={image}
        canonicalPath={path}
      />
    )
    expect(
      tags.container.querySelector("meta[property='og:title']").content
    ).toBe(title)
    expect(
      tags.container.querySelector("meta[property='og:description']").content
    ).toBe(description)
    expect(
      tags.container.querySelector("meta[property='og:image']").content
    ).toBe(image)
    expect(
      tags.container.querySelector("meta[property='og:type']").content
    ).toBe('website')
    expect(
      tags.container.querySelector("meta[property='og:url']").content
    ).toBe(path)
  })
})
