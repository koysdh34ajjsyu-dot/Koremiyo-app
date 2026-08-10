const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// .env.local 読み込み
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';
      if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) value = value.substring(1, value.length - 1);
      process.env[key] = value;
    }
  });
}

async function getAccessToken(credentials) {
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const claim = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  function base64url(str) {
    return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  }

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedClaim = base64url(JSON.stringify(claim));
  const signatureInput = `${encodedHeader}.${encodedClaim}`;

  const signer = crypto.createSign('RSA-SHA256');
  signer.update(signatureInput);
  const signature = signer.sign(credentials.private_key, 'base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const jwt = `${signatureInput}.${signature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok) throw new Error('OAuth token error: ' + JSON.stringify(tokenData));
  return tokenData.access_token;
}

async function runReport(propertyId, accessToken, requestBody) {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });
  return await res.json();
}

async function main() {
  const keyPath = path.join(__dirname, '..', 'ga-credentials.json');
  if (!fs.existsSync(keyPath)) {
    console.error('ERROR: ga-credentials.json が存在しません。');
    process.exit(1);
  }

  const credentials = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  const propertyId = process.env.GA4_PROPERTY_ID || process.argv[2];

  if (!propertyId) {
    console.error('ERROR: GA4_PROPERTY_ID が指定されていません。');
    process.exit(1);
  }

  const accessToken = await getAccessToken(credentials);

  // 1. 全体概要レポート (過去30日間)
  const overviewReport = await runReport(propertyId, accessToken, {
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'activeUsers' },
      { name: 'newUsers' },
      { name: 'averageSessionDuration' }
    ]
  });

  // 2. ページ別アクセスレポート (過去30日間)
  const pageReport = await runReport(propertyId, accessToken, {
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'screenPageViews' }, { name: 'activeUsers' }],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 10
  });

  // 3. 流入元チャネル別レポート
  const channelReport = await runReport(propertyId, accessToken, {
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'sessionDefaultChannelGroup' }],
    metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }],
    orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }]
  });

  // 4. デバイス別レポート
  const deviceReport = await runReport(propertyId, accessToken, {
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'deviceCategory' }],
    metrics: [{ name: 'activeUsers' }]
  });

  console.log('====================================================');
  console.log('📈 【次コレ】 Google Analytics 4 (GA4) アクセス解析レポート');
  console.log('====================================================');

  const ov = overviewReport.rows && overviewReport.rows[0] ? overviewReport.rows[0].metricValues : null;
  if (ov) {
    console.log('\n【1. 直近30日間の全体概要】');
    console.log(`   ・総ページビュー数 (PV): ${ov[0].value} PV`);
    console.log(`   ・アクティブユーザー数  : ${ov[1].value} 人`);
    console.log(`   ・新規ユーザー数        : ${ov[2].value} 人`);
    console.log(`   ・平均滞在時間          : ${Math.round(parseFloat(ov[3].value))} 秒`);
  } else {
    console.log('\n【1. 直近30日間の全体概要】 データがまだ蓄積されていません。');
  }

  console.log('\n【2. 人気ページランキング (トップ10)】');
  if (pageReport.rows && pageReport.rows.length > 0) {
    pageReport.rows.forEach((row, i) => {
      console.log(`   ${i + 1}. ${row.dimensionValues[0].value.padEnd(30)} : ${row.metricValues[0].value} PV (${row.metricValues[1].value} ユーザー)`);
    });
  } else {
    console.log('   データなし');
  }

  console.log('\n【3. 流入チャネル（どこから来ているか）】');
  if (channelReport.rows && channelReport.rows.length > 0) {
    channelReport.rows.forEach(row => {
      console.log(`   ・${row.dimensionValues[0].value.padEnd(20)} : ${row.metricValues[0].value} ユーザー (${row.metricValues[1].value} PV)`);
    });
  } else {
    console.log('   データなし');
  }

  console.log('\n【4. 利用デバイス割合】');
  if (deviceReport.rows && deviceReport.rows.length > 0) {
    deviceReport.rows.forEach(row => {
      console.log(`   ・${row.dimensionValues[0].value.padEnd(15)} : ${row.metricValues[0].value} ユーザー`);
    });
  } else {
    console.log('   データなし');
  }

  console.log('\n====================================================\n');
}

main().catch(err => console.error('エラー:', err));
