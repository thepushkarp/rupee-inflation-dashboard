import type { HistoricalEvent } from '@/types/inflation';

const history = {
  label: 'RBI: monetary policy history',
  url: 'https://www.rbi.org.in/commonperson/English/Scripts/speeches.aspx?Id=3161',
};
const review2008 = {
  label: 'RBI: 2008–09 economic review',
  url: 'https://rbi.org.in/scripts/AnnualReportPublications.aspx?Id=896',
};
const policy2017 = {
  label: 'RBI: monetary policy statement',
  url: 'https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=40823',
};

export const historicalEvents: HistoricalEvent[] = [
  {
    year: 1966,
    label: 'Rupee devaluation',
    impact:
      'The rupee was devalued in June, increasing the rupee cost of foreign currency. This changed import costs; the exchange-rate change is not itself a measure of domestic inflation.',
    sources: [
      { label: 'RBI: chronology', url: 'https://www.rbi.org.in/history/Brief_Chro1960to1971.html' },
    ],
  },
  {
    year: 1971,
    label: 'India–Pakistan war',
    impact:
      'War added to inflationary pressures during a period of fiscal expansion. RBI identifies it among the shocks affecting prices in the 1970s.',
    sources: [history],
  },
  {
    year: 1973,
    label: 'First oil shock',
    impact:
      'The global oil-price shock raised energy and import costs. Drought also strained supply, adding to inflationary pressure in India.',
    sources: [history],
  },
  {
    year: 1979,
    label: 'Second oil shock',
    impact:
      'Another global oil-price shock added to India’s inflation pressures. A severe drought in 1979–80 also weakened domestic supply.',
    sources: [history, review2008],
  },
  {
    year: 1991,
    label: 'Balance-of-payments crisis',
    impact:
      'The crisis brought devaluation and major economic reforms. Higher oil prices and the exchange-rate adjustment increased import costs during an already inflationary period.',
    sources: [
      {
        label: 'World Bank: India economic memorandum',
        url: 'https://documents1.worldbank.org/curated/en/343411468267290299/pdf/multi0page.pdf',
      },
    ],
  },
  {
    year: 2008,
    label: 'Commodity surge and financial crisis',
    impact:
      'Oil and food prices rose sharply before the global crisis. Commodity prices then fell as demand weakened, so the year contained opposing price pressures.',
    sources: [review2008],
  },
  {
    year: 2009,
    label: 'Drought and food prices',
    impact:
      'A weak monsoon, drought and supply bottlenecks pushed up food prices even as non-food inflation remained relatively subdued.',
    sources: [
      {
        label: 'Economic Survey 2009–10',
        url: 'https://www.pib.gov.in/newsite/erelcontent.aspx?lang=2&reg=48&relid=58337',
      },
    ],
  },
  {
    year: 2016,
    label: 'Demonetisation',
    impact:
      'Cash shortages and distress sales contributed to lower prices for some perishables. RBI described the effects as temporary and intertwined with seasonal and excess-supply conditions.',
    sources: [policy2017],
  },
  {
    year: 2017,
    label: 'Goods and Services Tax',
    impact:
      'GST changed indirect taxes across goods and services. Before implementation, RBI expected no material effect on overall inflation; price effects varied by category.',
    sources: [policy2017],
  },
  {
    year: 2020,
    label: 'Pandemic and lockdown',
    impact:
      'Lockdown disrupted supply and distribution, adding pressure to food prices even as economic activity and demand contracted.',
    sources: [
      {
        label: 'RBI: May 2020 policy statement',
        url: 'https://www.rbi.org.in/commonman/Upload/English/PressRelease/PDFs/PR2459ML.pdf',
      },
    ],
  },
  {
    year: 2022,
    label: 'War and commodity prices',
    impact:
      'The war in Ukraine raised global food, energy and other commodity prices. These shocks added sustained price pressure in India alongside domestic supply conditions.',
    sources: [
      {
        label: 'RBI: 2022–23 economic review',
        url: 'https://www.rbi.org.in/scripts/AnnualReportPublications.aspx?Id=1373',
      },
    ],
  },
  {
    year: 2023,
    label: 'Food-price spike',
    impact:
      'Rain-related supply disruptions drove a sharp rise in vegetable prices, especially tomatoes, during July and August. Prices eased as market arrivals improved.',
    sources: [
      {
        label: 'RBI: October 2023 monetary policy report',
        url: 'https://www.rbi.org.in/scripts/BS_ViewBulletin.aspx?Id=22120',
      },
    ],
  },
];
