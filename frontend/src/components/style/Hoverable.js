import React from 'react'

export default class Hoverable extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      isHovering: false,
    }
  }

  render() {
    const { onHoverStyle, style, children } = this.props
    const { isHovering } = this.state

    return (
      <div>
      {
        React.Children.map(children, child =>
          React.cloneElement(
            child, {
              onMouseEnter: () => this.setState({isHovering: true}),
              onMouseLeave: () => this.setState({isHovering: false}),
              style: isHovering ? { ...style, ...onHoverStyle } : style,
            }
          )
        )
      }
      </div>
    )
  }
}

