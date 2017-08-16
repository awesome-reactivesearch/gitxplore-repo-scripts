const Appbase = require('appbase-js');

const endpoints = [
  {
    start: 500,
    end: 519
  },
  {
    start: 520,
    end: 539
  },
  {
    start: 540,
    end: 559
  },
  {
    start: 560,
    end: 579
  },
  {
    start: 580,
    end: 599
  },
  {
    start: 600,
    end: 619
  },
  {
    start: 620,
    end: 639
  },
  {
    start: 640,
    end: 659
  },
  {
    start: 660,
    end: 679
  },
  {
    start: 680,
    end: 699
  },
  {
    start: 700,
    end: 719
  },
  {
    start: 720,
    end: 739
  },
  {
    start: 740,
    end: 759
  },
  {
    start: 760,
    end: 779
  },
  {
    start: 780,
    end: 799
  },
  {
    start: 800,
    end: 819
  },
  {
    start: 820,
    end: 839
  },
  {
    start: 840,
    end: 859
  },
  {
    start: 860,
    end: 879
  },
  {
    start: 880,
    end: 899
  },
  {
    start: 900,
    end: 919
  },
  {
    start: 920,
    end: 939
  },
  {
    start: 940,
    end: 959
  },
  {
    start: 960,
    end: 979
  },
  {
    start: 980,
    end: 999
  },
  {
    start: 1000,
    end: 1049
  },
  {
    start: 1050,
    end: 1099
  },
  {
    start: 1100,
    end: 1149
  },
  {
    start: 1150,
    end: 1199
  },
  {
    start: 1200,
    end: 1249
  },
  {
    start: 1250,
    end: 1299
  },
  {
    start: 1300,
    end: 1349
  },
  {
    start: 1350,
    end: 1399
  },
  {
    start: 1400,
    end: 1449
  },
  {
    start: 1450,
    end: 1499
  },
  {
    start: 1500,
    end: 1599
  },
  {
    start: 1600,
    end: 1699
  },
  {
    start: 1700,
    end: 1799
  },
  {
    start: 1800,
    end: 1899
  },
  {
    start: 1900,
    end: 1999
  },
  {
    start: 2000,
    end: 2099
  },
  {
    start: 2100,
    end: 2199
  },
  {
    start: 2200,
    end: 2299
  },
  {
    start: 2300,
    end: 2399
  },
  {
    start: 2400,
    end: 2499
  },
  {
    start: 2500,
    end: 2999
  },
  {
    start: 2500,
    end: 2999
  },
  {
    start: 3000,
    end: 3499
  },
  {
    start: 3500,
    end: 3999
  },
  {
    start: 4000,
    end: 4999
  },
  {
    start: 5000,
    end: 5999
  },
  {
    start: 6000,
    end: 6999
  },
  {
    start: 7000,
    end: 307000
  }
];

const appbaseRef = new Appbase({
  url: "https://scalr.api.appbase.io",
  app: "YOUR_APP_NAME",
  credentials: "YOUR_CREDENTIALS"
});

let i = 0;

endpoints.forEach((item) => {
  const data = require(`./filtered-data/filtered_${item.start}_${item.end}.json`);
  const importData = [];
  console.log(`importing for filtered_${item.start}_${item.end}.json`);

  data.forEach((item) => {
    importData.push({
      index: {
        _id: item.fullname
      }
    })
    importData.push(item);
  });

  // error when selecting larger arrays
  const a = appbaseRef.bulk({
    type: "YOUR_APP_TYPE",
    body: importData
  }).on('data', function(res) {
    console.log("successful bulk: ", `for filtered_${item.start}_${item.end}.json`);
  }).on('error', function(err) {
    console.log("bulk failed: ", `for filtered_${item.start}_${item.end}.json`);
  }).on('end', function() {
    console.log(`importing for filtered_${item.start}_${item.end}.json DONE`);
    i += 1;
    if (i === endpoints.length) {
      process.exit(0);
    }
  })
})
