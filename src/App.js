// Use es6
import React from 'react';
import { Container, Nav, Form, InputGroup } from 'react-bootstrap';
import Chart from 'react-apexcharts';

import inflationData from './data/inflationData';
import './App.css';

class App extends React.Component {
  render() {
    const years = Object.values(inflationData).map((data) => String(data.year));
    const first_amount = inflationData[0].amount;
    const amounts = Object.values(inflationData).map(
      (data) => (100 * first_amount) / data.amount
    );

    const state = {
      options: {
        chart: {
          id: 'rupee-inflation',
          type: 'area',
          zoom: {
            enabled: false,
          },
        },
        xaxis: {
          categories: years,
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
        fill: {
          opacity: 0.9,
          type: 'image',
          image: {
            src: ['./assets/hundred.png'],
            width: 852,
            height: 396,
          },
        },
      },
      series: [
        {
          name: 'value',
          data: amounts,
        },
      ],
    };

    return (
      <Container className="cover-container d-flex w-100 h-100 p-3 mx-auto flex-column">
        <Nav className="mb-3">
          <h1 className="mb-0">Rupee Inflation</h1>
        </Nav>

        <main className="p-3 text-center">
          <small className="text-muted mx-auto">
            Graph showing how the buying power of ₹100 has changed over the years
          </small>

          <Form>
            <InputGroup className="yearDropdown m-3">
              <Form.Control as="select" className="p-1" custom>
                <option>Start year</option>
                {years.map((year) => (
                  <option key={year}>{year}</option>
                ))}
                <option default>Test</option>
              </Form.Control>
              <Form.Control as="select" className="p-1" custom>
                <option>End year</option>
                {years.map((year) => (
                  <option key={year}>{year}</option>
                ))}
              </Form.Control>
            </InputGroup>
          </Form>

          <Chart
            options={state.options}
            series={state.series}
            type="area"
            width={852}
            height={396}
          />
        </main>

        <footer className="mt-auto text-white-50">
          <a
            href="https://github.com/thepushkarp/rupee-inflation"
            className="text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            Rupee Inflation
          </a>
          {` created by `}
          <a
            href="https://thepushkarp.com"
            className="text-white"
            target="_blank"
            rel="noopener noreferrer"
          >
            Pushkar Patel
          </a>
        </footer>
      </Container>
    );
  }
}

export default App;
