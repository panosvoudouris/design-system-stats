const chalk = require('chalk');
const https = require('https');
const path = require('path');
const fs = require('fs-extra');
const { execSync } = require('child_process');

require('dotenv').config();

const log = console.log;

const CONFIG = {
  REPO_URL: '',
  ACCESS_TOKEN: process.env.REPO_ACCESS_TOKEN,
  ACCESS_USERNAME: process.env.REPO_ACCESS_USERNAME,
  API_ENDPOINT: process.env.REPO_SEARCH_API_ENDPOINT,
  ORG_NAME: process.env.REPO_ORG_NAME
};

function getCodeInFileStats(searchTerm, fileExtension) {
  return new Promise((resolve, reject) => {
    const searchQuery = `${CONFIG.API_ENDPOINT}/code?q=${searchTerm}+in:file+language:${fileExtension}+user:${CONFIG.ORG_NAME}`;

    const options = {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': CONFIG.ACCESS_USERNAME,
        Authorization: `Basic ${Buffer.from(
          `username:${CONFIG.ACCESS_TOKEN}`
        ).toString('base64')}`
      }
    };

    https
      .get(searchQuery, options, res => {
        res.setEncoding('utf8');
        const data = [];

        res.on('data', chunk => {
          data.push(chunk);
        });
        res.on('end', () => {
          const result = JSON.parse(data.join(''));
          resolve(result);
        });
      })
      .on('error', err => {
        reject(err.message);
      });
  });
}

async function run() {
  const scssSearchResults = await getCodeInFileStats('@import', 'scss').catch(
    err => {
      log(chalk.red(`Error: ${err}`));
    }
  );
  log(chalk.blue(`Found ${scssSearchResults.total_count} results`));
  log(chalk.red(scssSearchResults.items.length));
}

run();
