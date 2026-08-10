const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

async function main() {
  const keyPath = path.join(__dirname, '..', 'ga-credentials.json');
  
  if (!fs.existsSync(keyPath)) {
    console.error('ERROR: ga-credentials.json がプロジェクト直下に存在しません。');
    process.exit(1);
  }

  const credentials = JSON.parse(fs.readFileSync(keyPath, 'utf8'));
  console.log('✅ ga-credentials.json を検出しました！');
  console.log('   サービスアカウント:', credentials.client_email);

  // JWT Token Generation for Google Auth
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
  const signature = signer.sign(credentials.private_key, 'base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const jwt = `${signatureInput}.${signature}`;

  console.log('🔄 Google OAuth 認証（アクセストークン取得）...');
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt
    })
  });

  const tokenData = await tokenRes.json();

  if (!tokenRes.ok) {
    console.error('❌ OAuth トークン取得失敗:', tokenData);
    process.exit(1);
  }

  console.log('✅ 認証成功！アクセストークンを取得しました。');
  const accessToken = tokenData.access_token;

  // 引数または環境変数からプロパティIDを取得
  let propertyId = process.argv[2] || process.env.GA4_PROPERTY_ID;

  if (!propertyId) {
    console.log('🔄 プロパティIDが指定されていないため、自動検索を試みます...');
    const summariesRes = await fetch('https://analyticsadmin.googleapis.com/v1beta/accountSummaries', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const summariesData = await summariesRes.json();

    if (summariesRes.ok && summariesData.accountSummaries && summariesData.accountSummaries.length > 0) {
      const propertySummaries = summariesData.accountSummaries[0].propertySummaries || [];
      if (propertySummaries.length > 0) {
        propertyId = propertySummaries[0].property.replace('properties/', '');
        console.log(`✅ GA4プロパティを発見: ${propertySummaries[0].displayName} (ID: ${propertyId})`);
      }
    }
  }

  if (!propertyId) {
    console.log('\n------------------------------------------------------------');
    console.log('💡 【テスト完了（認証確認完了）】');
    console.log('サービスアカウントキーは正常に動作しています！');
    console.log('GA4のレポートを取得するには、GA4の「プロパティID（数字9桁程度）」が必要です。');
    console.log('GA4画面の「管理（歯車）」＞「プロパティの詳細」の右上にある「プロパティID」をご確認ください。');
    console.log('------------------------------------------------------------\n');
    process.exit(0);
  }

  // 過去7日間のレポート取得試行
  console.log(`🔄 GA4 Data API からレポートを取得中 (Property: ${propertyId})...`);
  const reportRes = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'activeUsers' },
        { name: 'eventCount' }
      ]
    })
  });

  const reportData = await reportRes.json();

  if (!reportRes.ok) {
    console.error('❌ レポート取得失敗:', reportData);
    process.exit(1);
  }

  console.log('\n🎉🎉🎉 【テスト大成功！】 GA4からのリアルタイムレポート取得に成功しました！');
  const values = reportData.rows && reportData.rows[0] ? reportData.rows[0].metricValues : null;
  if (values) {
    console.log('📊 直近7日間のアクセス統計:');
    console.log(`   ・ページビュー数 (PV): ${values[0].value} PV`);
    console.log(`   ・アクティブユーザー数: ${values[1].value} 人`);
    console.log(`   ・総イベント数: ${values[2].value} 回`);
  } else {
    console.log('📊 直近7日間のアクセスデータ: まだPVデータが記録されていません（計測開始直後のため）。');
  }
}

main().catch(err => {
  console.error('エラー:', err);
});
