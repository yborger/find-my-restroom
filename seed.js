const https = require('https');

const getData = (page) => new Promise((res) => {
  https.get(
    'https://www.refugerestrooms.org/api/v1/restrooms?page=' + page + '&per_page=50',
    (r) => {
      let d = '';
      r.on('data', (c) => d += c);
      r.on('end', () => {
        try { res(JSON.parse(d)); } catch(e) { res([]); }
      });
    }
  ).on('error', () => res([]));
});

(async () => {
  const rows = [];
  for (let p = 1; p <= 4; p++) {
    console.log('Fetching page', p);
    const data = await getData(p);
    if (!Array.isArray(data)) continue;
    for (const r of data) {
      if (!r.latitude || !r.longitude) continue;
      const name = (r.name || 'Public Restroom').replace(/'/g, "''").replace(/\\/g, '');
      const addr = ((r.street || '') + ', ' + (r.city || '') + ', ' + (r.state || '')).replace(/'/g, "''");
      rows.push('(' + [
        'gen_random_uuid()',
        "'" + name.substring(0, 100) + "'",
        "'" + addr.substring(0, 200) + "'",
        'ST_MakePoint(' + r.longitude + ', ' + r.latitude + ')::geography',
        r.latitude,
        r.longitude,
        "'free'",
        r.accessible ? 'true' : 'false',
        'NULL', 'NULL', '0', 'true'
      ].join(',') + ')');
    }
    await new Promise((r) => setTimeout(r, 500));
  }

  const sql =
    'INSERT INTO restrooms (id,name,address,location,lat,lng,access_type,is_accessible,hours,avg_cleanliness,review_count,is_approved) VALUES\n' +
    rows.join(',\n') +
    '\nON CONFLICT DO NOTHING;';

  require('fs').writeFileSync('seed.sql', sql);
  console.log('Done:', rows.length, 'restrooms written to seed.sql');
})();