const fs = require('fs');
const path = require('path');
const axios = require('axios');
const neo4j = require('neo4j-driver');

// Read and parse .env manually
const envPath = path.resolve('.env');
console.log('Reading .env from:', envPath);
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (e) {
  console.error('Error reading .env:', e);
  process.exit(1);
}

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)\s*$/);
  if (match) {
    const key = match[1].trim();
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val;
  }
});

console.log('Parsed env keys:', Object.keys(env));

const base44Url = env.EXPO_PUBLIC_BASE44_API_URL || 'https://api.base44.app/v1';
const neo4jUri = env.EXPO_PUBLIC_NEO4J_URI;
const neo4jUser = env.EXPO_PUBLIC_NEO4J_USERNAME;
const neo4jPassword = env.EXPO_PUBLIC_NEO4J_PASSWORD;

async function testBase44() {
  const urls = [
    base44Url,
    'https://skill-graph-earn.base44.app/api/gigs',
    'https://skill-graph-earn.base44.app/api/v1/gigs',
    'https://skill-graph-earn.base44.app/gigs',
    'https://api.base44.app/v1/gigs'
  ];
  for (const url of urls) {
    console.log(`\n--- Testing Base44 API at: ${url} ---`);
    try {
      const res = await axios.get(url, { 
        headers: { 'Accept': 'application/json' },
        timeout: 3000 
      });
      console.log('Success for url:', url);
      console.log('Status:', res.status);
      console.log('Content-Type:', res.headers['content-type']);
      console.log('Data sample:', JSON.stringify(res.data).substring(0, 200));
    } catch (err) {
      console.log('Failed for url:', url, 'Message:', err.message);
    }
  }
}

async function testNeo4j() {
  console.log(`\n--- Testing Neo4j Database at: ${neo4jUri} ---`);
  if (!neo4jUri || !neo4jUser || !neo4jPassword) {
    console.error('Neo4j environment variables are missing!');
    return;
  }
  const driver = neo4j.driver(neo4jUri, neo4j.auth.basic(neo4jUser, neo4jPassword));
  const session = driver.session();
  try {
    const result = await session.run('RETURN 1 AS val');
    console.log('Neo4j response query result:', result.records[0].get('val').toNumber());
    console.log('Neo4j connection successful!');
  } catch (err) {
    console.error('Neo4j connection failed:', err.message || err);
  } finally {
    await session.close();
    await driver.close();
  }
}

async function run() {
  await testBase44();
  await testNeo4j();
}

run();
