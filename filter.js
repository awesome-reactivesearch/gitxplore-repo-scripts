const fs = require('fs');
const fetch = require('node-fetch');
const RateLimiter = require('limiter').RateLimiter;

const limiter = new RateLimiter(30, 'minute');
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

const fixNull = (value) => {
  let result = value;
  if (Array.isArray(value) && value.length === 0 || !value) {
    result = '';
  }
  return result;
};

const fixSlash = (value) => {
  let result = value;
  return result.replace('/', '~');
};

const headers = {
  'Authorization': 'token YOUR_AUTH_TOKEN'
}

// const throttledFetch = (url) => {
//   limiter.removeTokens(1, function(err, remainingRequests) {
//   // err will only be set if we request more than the maximum number of
//   // requests we set in the constructor
//
//   // remainingRequests tells us how many additional requests could be sent
//   // right this moment
//   console.log('remaining', remainingRequests);
//
//   callMyRequestSendingFunction(...);
//   });
// }

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

const altFetch = altThrottle(fetch, 1, 1000); // 5k per hour

const fetchData = async (item) => {
  let up = {
    name: item.name,
    owner: item.owner.login,
    fullname: fixSlash(item.full_name),
    description: fixNull(item.description),
    avatar: item.owner.avatar_url,
    url: item.html_url,
    pushed: item.pushed_at,
    created: item.created_at,
    size: item.size,
    stars: item.stargazers_count,
    forks: item.forks_count,
    topics: item.topics,
    language: fixNull(item.language)
  };
  await altFetch(`https://api.github.com/repos/${up.owner}/${up.name}`, {method: 'GET', headers: headers})
    .then(res => res.json())
    .then(json => {
      up.watchers = json.subscribers_count;
      console.log('watchers', up.watchers);
    })
    .catch(err => console.log(err))
  return up;
}

// const filtered = async (data) => {
//   let output = []
//   for (let i = 0; i < data.length; i++) {
//     console.log('processing', i);
//     const item = await fetchData(data[i]);
//     output.push(item);
//   }
//   return output;
// };

const filtered = (data) => {
  const promises = data.map(async (item) => {
    let up = {
      name: item.name,
      owner: item.owner.login,
      fullname: fixSlash(item.full_name),
      description: fixNull(item.description),
      avatar: item.owner.avatar_url,
      url: item.html_url,
      pushed: item.pushed_at,
      created: item.created_at,
      size: item.size,
      stars: item.stargazers_count,
      forks: item.forks_count,
      topics: item.topics,
      language: fixNull(item.language)
    };
    await altFetch(`https://api.github.com/repos/${up.owner}/${up.name}`, {method: 'GET', headers: headers})
      .then(res => res.json())
      .then(json => {
        up.watchers = json.subscribers_count;
        console.log('watchers', up.watchers);
      })
    return up;
  });
  return Promise.all(promises);
};

(async function () {
  for (let i = 0; i < endpoints.length; i += 1) {
    const file = require(`./filter-data/${endpoints[i].start}_${endpoints[i].end}.json`);
    // const data = JSON.parse(file);
    console.log(`starting for ${endpoints[i].start} to ${endpoints[i].end}`);
    await filtered(file)
      .then(d => {
        console.log(`writing ${d.length} results`)
        fs.writeFileSync(`./filtered-data/${endpoints[i].start}_${endpoints[i].end}.json`, JSON.stringify(d))
      })
  }
})();
