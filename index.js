const fetch = require('node-fetch');
const fs = require('fs');
const throttle = require('lodash.throttle');

const headers = {
  'Authorization': 'token YOUR_AUTH_TOKEN',
  'Accept': 'application/vnd.github.mercy-preview+json'
};

// const api = 'https://api.github.com/search/repositories?q=stars%3A500..520&per_page=100&page=1';

const constructApi = (start, end, page) => (
  `https://api.github.com/search/repositories?q=stars%3A${start}..${end}&per_page=100&page=${page}`
);

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

function altThrottle(f, calls, milliseconds) {

  const queue = [];
  const complete = [];
  let inflight = 0;

  const processQueue = function() {
    // Remove old complete entries.
    const now = Date.now();
    while (complete.length && complete[0] <= now - milliseconds)
      complete.shift();

    // Make calls from the queue that fit within the limit.
    while (queue.length && complete.length + inflight < calls) {
      const request = queue.shift();
      ++inflight;

      // Call the deferred function, fulfilling the wrapper Promise
      // with whatever results and logging the completion time.
      const p = f.apply(request.this, request.arguments);
      Promise.resolve(p).then((result) => {
        request.resolve(result);
      }, (error) => {
        request.reject(error);
      }).then(() => {
        --inflight;
        complete.push(Date.now());

        if (queue.length && complete.length === 1)
          setTimeout(processQueue, milliseconds);
      });
    }

    // Check the queue on the next expiration.
    if (queue.length && complete.length)
      setTimeout(processQueue, complete[0] + milliseconds - now);
  };

  return function() {
    return new Promise((resolve, reject) => {
      queue.push({
        this: this,
        arguments: arguments,
        resolve: resolve,
        reject: reject
      });

      processQueue();
    });
  };
};

const altFetch = altThrottle(fetch, 1, 2000); // 1 call per 2 sec => 30 calls per min

const getRepos = async (start, end, page) => {
  const api = constructApi(start, end, page);
  console.log(`fetching for ${start} to ${end} and page ${page}`);
  const data = await altFetch(api, {method: 'GET', headers: headers})
    .then(res => res.json())
    .then(json => {
      console.log('Got json');
      return json.items;
    })
    .catch(err => console.error('err', err))
  console.log(`got ${data.length} results for ${start} to ${end} and page ${page}`);
  if (data.length === 0) {
    console.log(`no more results for page ${page}`);
    return [];
  } else {
      if (page !== 10) {
        console.log(`more results available going to page ${page + 1}`);
        const nextData = await getRepos(start, end, page + 1)
        .then(data => data);
        console.log(`returning ${nextData.length} page results for page ${page + 1}`);
        return data.concat(nextData);
      } else {
        return data;
      }
  }
}

// github api 30 calls per minute => 1 call per 2 second max => 1 call per 2.5 second safe
// const throttled = throttle(getRepos, 2500);
// 290898 => max stars FCC
(async function () {
  for (let i = 0; i < endpoints.length; i += 1) {
    console.log(`starting for ${endpoints[i].start} to ${endpoints[i].end}`);
    await getRepos(endpoints[i].start, endpoints[i].end, 1)
      .then(d => {
        console.log(`writing total of ${d.length} results for ${endpoints[i].start}_${endpoints[i].end}.json`);
        fs.writeFileSync(`./filter-data/${endpoints[i].start}_${endpoints[i].end}.json`, JSON.stringify(d))
      })
  }
})();
