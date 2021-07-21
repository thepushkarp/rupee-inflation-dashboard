// Use es6
import React from 'react';
import { Container, Nav, Form, InputGroup } from 'react-bootstrap';
import Chart from 'react-apexcharts';

import inflationData from './data/inflationData';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      startYearIndex: 0,
      endYearIndex: Object.values(inflationData).length - 1,
    };
  }

  render() {
    const years = Object.values(inflationData).map((data) => String(data.year));
    const amounts = Object.values(inflationData).map(
      (data) => (100 * inflationData[0].amount) / data.amount
    );

    let chartOptions = {
      options: {
        chart: {
          id: 'rupee-inflation-chart',
          type: 'area',
          zoom: {
            enabled: false,
          },
        },
        xaxis: {
          categories: years.slice(
            this.state.startYearIndex,
            this.state.endYearIndex + 1
          ),
          type: 'category',
          labels: {
            rotate: 0,
          },
          title: {
            text: 'Years',
          },
        },
        yaxis: {
          labels: {
            formatter: (value) => {
              return parseFloat(value.toFixed(2));
            },
          },
          title: {
            text: 'Value',
          },
        },
        dataLabels: {
          enabled: false,
        },
      },
      series: [
        {
          name: 'value',
          data: amounts
            .slice(this.state.startYearIndex, this.state.endYearIndex + 1)
            .map((amount) => (100 * amount) / amounts[this.state.startYearIndex]),
        },
      ],
    };

    return (
      <Container className="cover-container d-flex w-100 h-100 p-3 flex-column">
        <Nav className="mb-3">
          <h1 className="mb-0">Rupee Inflation Dashboard</h1>
        </Nav>

        <main className="p-3 text-center">
          <small className="text-muted mx-auto">
            Graph showing how the buying power of ₹100 has changed over the years
          </small>

          <Form>
            <InputGroup className="year-dropdown m-3">
              <Form.Control
                as="select"
                className="p-1"
                custom
                onChange={(e) => {
                  this.setState({ startYearIndex: Number(e.target.value) });
                }}
                defaultValue={this.state.startYearIndex}
              >
                {years.map((year, i) => (
                  <option
                    key={i}
                    value={i}
                    disabled={i >= this.state.endYearIndex ? true : null}
                  >
                    {year}
                  </option>
                ))}
              </Form.Control>
              to
              <Form.Control
                as="select"
                className="p-1"
                custom
                onChange={(e) => {
                  this.setState({ endYearIndex: Number(e.target.value) });
                }}
                defaultValue={this.state.endYearIndex}
              >
                {years.map((year, i) => (
                  <option
                    key={i}
                    value={i}
                    disabled={i <= this.state.startYearIndex ? true : null}
                  >
                    {year}
                  </option>
                ))}
              </Form.Control>
            </InputGroup>
          </Form>

          <Chart
            options={chartOptions.options}
            series={chartOptions.series}
            type="area"
            className="chart"
          />
        </main>

        <footer className="mt-auto d-flex flex-column">
          <small className="text-muted mx-auto">
            Data source:{' '}
            <a
              href="https://www.officialdata.org/india/inflation"
              target="_blank"
              rel="noopener noreferrer"
            >
              India Inflation Calculator: World Bank data, 1961-2021 (INR)
            </a>
          </small>
          <div>
            <a
              href="https://github.com/thepushkarp/rupee-inflation-dashboard"
              target="_blank"
              rel="noopener noreferrer"
            >
              Rupee Inflation Dashboard
            </a>
            {` created by `}
            <a
              href="https://thepushkarp.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pushkar Patel
            </a>
          </div>
        </footer>
      </Container>
    );
  }
}

export default App;
