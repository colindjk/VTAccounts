import React from 'react'
import { connect } from 'react-redux'

import { connectSettings } from 'actions/settings'
import { getPayPeriodRange } from 'util/date'
import { FundPaymentSelector } from 'selectors/date-records'

import * as d3 from "d3"

class BarChart extends React.Component {
  componentDidMount() {
    this.drawChart();
  }
  componentDidUpdate() {
    this.drawChart();
  }

  // TODO: Make a line chart for fund balance
  drawChart() {
    const {
      id,
      data,
    } = this.props

    const w = 600, h = 400
    const maxValue = Math.max(...data)

    const svg = d3.select("#" + id)
      .append("svg")
      .attr("width", w)
      .attr("height", h)
      .style("margin-left", 100);

    svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * 70)
      .attr("y", (d, i) => h - ((d / maxValue) * h))
      .attr("width", 65)
      .attr("height", (d, i) => d * 10)
      .attr("fill", "green")

    svg.selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .text(d => Math.round(d))
      .attr("x", (d, i) => i * 70)
      .attr("y", (d, i) => h - ((d / maxValue) * h) + 15)
  }

  render() {
    return (
      <div id={this.props.id}>

      </div>
    )
  }
}

class Dashboard extends React.Component {
  render() {
    const {
      globalSettings: { startDate, endDate },
      settings: { fund },
      fundPaymentSelector,
    } = this.props

    // TODO: Add proper line chart
    //const dateSelector = fundPaymentSelector(fund)
    //const values = startDate && endDate ? getPayPeriodRange(startDate, endDate)
      //.map(date => dateSelector(date).paid) : []
    //return <BarChart data={values} id={"barchart"}/>
    
    return <h1>Welcome to VT Accounts</h1>
  }
}

// TODO: Get fund proxy
const mapStateToProps = state => ({
  fundPaymentSelector:
    fund => date => FundPaymentSelector(fund).selectDate(state, 1500, date)
})

export default connect(mapStateToProps)(connectSettings(Dashboard))
