import http from 'k6/http';
import { check, sleep } from 'k6';

const TARGET_VUS = Number(__ENV.TARGET_VUS || 1000);

export const options = {
  stages: [
    // Ramp up
    { duration: '2m', target: TARGET_VUS },

    // Hold target load
    { duration: '5m', target: TARGET_VUS },

    // Ramp down
    { duration: '1m', target: 0 },
  ],

  thresholds: {
    http_req_failed: [
      {
        threshold: 'rate<0.01',
        abortOnFail: true,
        delayAbortEval: '1m',
      },
    ],

    http_req_duration: [
      {
        threshold: 'p(95)<2000',
        abortOnFail: true,
        delayAbortEval: '1m',
      },
    ],

    checks: [
      {
        threshold: 'rate>0.99',
        abortOnFail: true,
        delayAbortEval: '1m',
      },
    ],
  },
};

export default function () {
  const res = http.get('https://health-pulse.app', {
    timeout: '30s',
  });

  check(res, {
    'site responded successfully': (r) =>
      r.status >= 200 && r.status < 400,
  });

  sleep(1);
}