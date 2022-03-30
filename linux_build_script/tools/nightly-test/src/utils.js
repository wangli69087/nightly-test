'use strict';

const crypto = require('crypto');
const csv = require('fast-csv');
const tar = require('tar');
const fs = require('fs-extra');
const http = require('http');
const {spawn} = require('child_process');
const url = require('url');

const utils = {
  /**
   * Download.
   * @param {object} logger - The logger.
   * @param {String} src - The download file url.
   * @param {String} dist - The save file.
   * @return {object} promise.
   */
  download(logger, src, dist) {
    return new Promise((resolve, reject) => {
      const buildUrl = new url.URL(src);
      const options = {
        host: buildUrl.host,
        path: buildUrl.pathname,
        port: 80,
      };
      const files = fs.createWriteStream(dist);
      http.get(options, (res) => {
        res.on('data', (data) => {
          files.write(data);
        });
        res.on('end', () => {
          files.end();
          resolve(files);
        });
      }).on('error', (err) => {
        logger.error(`Error: failed to download ${src}: ${err.message}`);
        reject(err);
      });
    });
  },

  /**
   * Check MD5.
   * @param {object} logger - The logger.
   * @param {String} buildFile - The checking build file.
   * @param {String} buildMD5File - The file has MD5 value for checking.
   * @return {String} check status string, value: 'SUCCEEDED' / 'FAILED'
   */
  checkMD5(logger, buildFile, buildMD5File) {
    const value = crypto.createHash('md5')
        .update(fs.readFileSync(buildFile)).digest('hex');
    const base = String(fs.readFileSync(buildMD5File));
    const status = value === base ? 'SUCCEEDED' : 'FAILED';
    logger.info(
        `Checking md5: ${value}, original md5: ${base}, status: ${status}`);
    return status;
  },

  extractBuild(logger, buildFile, unzipPath) {
    logger.info(`Extract ${buildFile} to ${unzipPath} directory`);
    tar.extract({
      file: buildFile,
      cwd: unzipPath,
      sync: true,
    });
  },

  /**
   * Update package.json for collecting test node results
   * @param {String} fileName - package.json file path
   */
  updatePackageJsonFile(fileName) {
    fs.accessSync(fileName);
    const content = JSON.parse(fs.readFileSync(fileName, 'utf8'));
    content.scripts.test =
        content.scripts.test.replace('mocha', 'mocha --reporter json');
    fs.writeJsonSync(fileName, content, {spaces: 2});
  },

  /**
   * Execute command.
   * @param {object} logger - The logger.
   * @param {String} cmd - The command string.
   * @param {array} args - The arguments array.
   * @param {String} cwd - The path string.
   * @param {object} result - The return value.
   * @param {Boolean} node - Boolean value for test node.
   * @return {object} child_process.spawn promise.
   */
  childCommand(logger, cmd, args, cwd, result, node = false) {
    logger.info(`Execute commad: ${cmd} ${[...args].join(' ')}`);
    return new Promise((resolve, reject) => {
      const child = spawn(cmd, [...args], {cwd: cwd, shell: true});

      child.stdout.on('data', (data) => {
        if (result !== undefined) {
          logger.info(data.toString());
          result.output += data.toString();
        }
      });

      child.stderr.on('data', (data) => {
        if (result !== undefined) {
          logger.info(data.toString());
          // For node test, the error messages have been involved in json ouput,
          // Here no need to dobule record error message
          if (!node) {
            result.output += data.toString();
          }
        }
      });

      child.on('close', (code) => {
        resolve(code);
      });
    });
  },

  /**
   * Save results to CSV file.
   * @param {object} logger - The logger.
   * @param {String} csvFile - The save CSV file.
   * @param {String} resultsStr - The test results string.
   * @param {String} component - The component name.
   * @param {String} example - The example name.
   */
  async saveResultsCSV(logger, csvFile, resultsStr, component, example) {
    function readyResultsData(dataStr, component, example) {
      const resultsData = [];
      if (component === 'NodeTest') {
        let status = 'PASS';
        let msg = '';
        const resultStr = dataStr.split('\n').slice(3).join('');
        const resultJson = JSON.parse(resultStr);
        for (const item in resultJson.tests) {
          if (item) {
            const tcResult = resultJson.tests[item];
            const tcNameNode = tcResult.title;
            const componentNode = component + ' / ' +
                tcResult.fullTitle.slice(0,
                    tcResult.fullTitle.lastIndexOf(tcNameNode));
            if (tcResult.duration !== undefined) {
              const errorInfo = tcResult.err;
              if (errorInfo !== undefined &&
                   Object.keys(errorInfo).length > 0) {
                status = 'FAIL';
                msg = errorInfo.stack;
              } else {
                status = 'PASS';
                msg = '';
              }
            } else {
              status = 'SKIP';
              msg = '';
            }
            resultsData.push([componentNode, tcNameNode, status, msg]);
          }
        }
      } else if (component !== 'Examples') {
        const dataArray = dataStr.split('\n');
        let tcBlockFlag = false;
        let tcErrorStartIndex;
        let tcName;
        for (let i = 1; i < dataArray.length; i++) {
          if (dataArray[i].startsWith('[ RUN      ]')) {
            tcName = dataArray[i].slice('[ RUN      ]'.length + 1);
            tcBlockFlag = true;
            tcErrorStartIndex = i + 1;
          }
          if (tcBlockFlag && dataArray[i + 1] !== undefined) {
            if (dataArray[i + 1].startsWith('[       OK ]')) {
              resultsData.push([component, tcName, 'PASS']);
              i += 1;
              tcBlockFlag = false;
            } else if (dataArray[i].startsWith('[  FAILED  ]')) {
              let msg = '';
              for (let j = tcErrorStartIndex; j < i; j++) {
                msg += dataArray[j] + '\n';
              }
              resultsData.push([component, tcName, 'FAIL', msg.trim()]);
              tcBlockFlag = false;
            }
          }
        }
        if (tcBlockFlag) {
          resultsData.push([component, tcName, 'FAIL', 'exception happened']);
          tcBlockFlag = false;
        }
      } else {
        if (resultsStr.indexOf('Done') !== -1) {
          resultsData.push([component, example, 'PASS', resultsStr.trim()]);
        } else {
          resultsData.push([component, example, 'FAIL', resultsStr.trim()]);
        }
      }
      return resultsData;
    }

    const resultsData = readyResultsData(resultsStr, component, example);

    if (!fs.existsSync(csvFile)) {
      const writeFile = await fs.createWriteStream(csvFile);
      csv.writeToStream(writeFile, resultsData,
          {headers: ['Component', 'TestCase', 'Result', 'Note']});
    } else {
      const updateFile = fs.createWriteStream(csvFile, {flags: 'a'});
      updateFile.write('\n');
      csv.writeToStream(updateFile, resultsData, {headers: false});
    }
  },

  /**
   * Upload results file.
   * @param {object} logger - The logger.
   * @param {String} result - The report csv file or log file.
   * @param {String} remoteUserHost - The remote user host.
   * @param {String} remoteDir - The remote directory.
   * @param {String} cwd - The path string.
   */
  async uploadResults(logger, result, remoteUserHost, remoteDir, cwd) {
    await this.childCommand(logger, 'ssh',
        [remoteUserHost, 'mkdir', '-p', remoteDir], cwd);
    await this.childCommand(logger, 'scp',
        [`${result} ${remoteUserHost}:${remoteDir}`], cwd);
  },
};

module.exports = utils;
