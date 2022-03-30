'use strict';

const fs = require('fs-extra');
const os = require('os');
const path = require('path');
const utils = require('./utils');

/** Class representing a tester. */
class Tester {
  /**
   * Create a tester.
   * @param {String} rootDir - The root directory path.
   * @param {TesterConfig} config - The testerConfig.
   */
  constructor(rootDir, config) {
    this.rootDir_ = rootDir;
    this.config_ = config;
    this.logger_ = config.logger;
    this.unzipPath_ = null;
    this.resultsCSV_ = null;
  }

  /**
   * Download build.
   * @param {String} backend - value: 'null', 'openvino', 'dml', 'onednn',
   *                                  'xnnpack'.
   * @return {String} download status: 'SUCCEEDED' / 'FAILED'
   */
  async downloadBuild(backend) {
    const buildUrl = this.config_.getBuildUrl(backend);
    const buildUrlArray = buildUrl.split('/');
    const buildName = buildUrlArray[buildUrlArray.length - 1];
    const saveDir = path.join(this.rootDir_, 'out', 'builds',
        this.config_.targetCommitId, buildUrlArray[buildUrlArray.length - 2]);

    if (fs.existsSync(saveDir)) {
      fs.removeSync(saveDir);
    }

    fs.mkdirpSync(saveDir);

    const buildFile = path.join(saveDir, buildName);
    await utils.download(this.logger_, buildUrl, buildFile);
    const buildMD5File = `${buildFile}.md5`;
    await utils.download(
        this.logger_, `${buildUrl}.md5`, buildMD5File);
    return utils.checkMD5(this.logger_, buildFile, buildMD5File);
  }

  /**
   * Run UnitTests by null backend.
   */
  async runUnitTests() {
    const result = {output: ''};
    if (this.config_.device.os === 'linux') {
      await utils.childCommand(
          this.logger_, './webnn_unittests', [], this.unzipPath_, result);
    } else if (this.config_.device.os === 'win') {
      await utils.childCommand(this.logger_, 'webnn_unittests.exe', [],
          this.unzipPath_, result);
    }
    await utils.saveResultsCSV(
        this.logger_, this.resultsCSV_, result.output, 'UnitTests');
  }

  /**
   * Run End2EndTests.
   */
  async runEnd2EndTests() {
    const result = {output: ''};
    if (this.config_.device.os === 'linux') {
      await utils.childCommand(
          this.logger_, './webnn_end2end_tests', [], this.unzipPath_, result);
    } else if (this.config_.device.os === 'win') {
      await utils.childCommand(this.logger_, 'webnn_end2end_tests.exe', [],
          this.unzipPath_, result);
    }
    await utils.saveResultsCSV(
        this.logger_, this.resultsCSV_, result.output, 'End2EndTests');
  }

  /**
   * Run LeNet example.
   */
  async runLeNetExample() {
    const result = {output: ''};
    if (this.config_.device.os === 'linux') {
      await utils.childCommand(this.logger_,
          './LeNet -m node/third_party/webnn-polyfill/test-data/models/' +
          'lenet_nchw/weights/lenet.bin -i examples/images/idx/0.idx -n 201',
          [], this.unzipPath_, result);
    } else if (this.config_.device.os === 'win') {
      await utils.childCommand(this.logger_,
          'LeNet.exe -m node\\third_party\\webnn-polyfill\\test-data\\' +
          'models\\lenet_nchw\\weights\\lenet.bin -i ' +
          'examples\\images\\idx\\0.idx -n 201',
          [], this.unzipPath_, result);
    }
    await utils.saveResultsCSV(
        this.logger_, this.resultsCSV_, result.output, 'Examples', 'LeNet');
  }

  /**
   * Run SqueezeNet example.
   */
  async runSqueezeNetExample() {
    let result = {output: ''};
    if (this.config_.device.os === 'linux') {
      // Run SqueezeNet nchw example
      await utils.childCommand(this.logger_,
          './SqueezeNet -m node/third_party/webnn-polyfill/test-data/models/' +
          'squeezenet1.1_nchw/weights/ -i examples/images/test.jpg -l nchw ' +
          '-n 201', [], this.unzipPath_, result);
      await utils.saveResultsCSV(this.logger_, this.resultsCSV_, result.output,
          'Examples', 'SqueezeNet1.1_nchw');
      // Run SqueezeNet nhwc example
      result = {output: ''};
      await utils.childCommand(this.logger_,
          './SqueezeNet -m node/third_party/webnn-polyfill/test-data/models/' +
          'squeezenet1.0_nhwc/weights/ -i examples/images/test.jpg -l nhwc ' +
          '-n 201', [], this.unzipPath_, result);
      await utils.saveResultsCSV(this.logger_, this.resultsCSV_, result.output,
          'Examples', 'SqueezeNet1.0_nhwc');
    } else if (this.config_.device.os === 'win') {
      // Run SqueezeNet nchw example
      await utils.childCommand(this.logger_,
          'SqueezeNet.exe -m node\\third_party\\webnn-polyfill\\test-data\\' +
          'models\\squeezenet1.1_nchw\\weights\\ -i examples\\images\\' +
          'test.jpg -l nchw -n 201', [], this.unzipPath_, result);
      await utils.saveResultsCSV(this.logger_, this.resultsCSV_, result.output,
          'Examples', 'SqueezeNet1.1_nchw');
      // Run SqueezeNet nhwc example
      result = {output: ''};
      await utils.childCommand(this.logger_,
          'SqueezeNet.exe -m node\\third_party\\webnn-polyfill\\test-data\\' +
          'models\\squeezenet1.0_nhwc\\weights\\ -i examples\\images\\' +
          'test.jpg -l nhwc -n 201', [], this.unzipPath_, result);
      await utils.saveResultsCSV(this.logger_, this.resultsCSV_, result.output,
          'Examples', 'SqueezeNet1.0_nhwc');
    }
  }

  /**
   * Run MobileNetv2 example.
   */
  async runMobileNetv2Example() {
    let result = {output: ''};
    if (this.config_.device.os === 'linux') {
      // Run MobileNetv2 nchw example
      await utils.childCommand(this.logger_,
          './MobileNetV2 -m node/third_party/webnn-polyfill/test-data/models/' +
          'mobilenetv2_nchw/weights/ -i examples/images/test.jpg -l nchw ' +
          '-n 201', [], this.unzipPath_, result);
      await utils.saveResultsCSV(this.logger_, this.resultsCSV_, result.output,
          'Examples', 'MobileNetv2_nchw');
      // Run MobileNetv2 nhwc example
      result = {output: ''};
      await utils.childCommand(this.logger_,
          './MobileNetV2 -m node/third_party/webnn-polyfill/test-data/models/' +
          'mobilenetv2_nhwc/weights/ -i examples/images/test.jpg -l nhwc ' +
          '-n 201', [], this.unzipPath_, result);
      await utils.saveResultsCSV(this.logger_, this.resultsCSV_, result.output,
          'Examples', 'MobileNetv2_nhwc');
    } else if (this.config_.device.os === 'win') {
      // Run MobileNetv2 nchw example
      await utils.childCommand(this.logger_,
          'MobileNetV2.exe -m node\\third_party\\webnn-polyfill\\test-data\\' +
          'models\\mobilenetv2_nchw\\weights\\ -i examples\\images\\test.jpg ' +
          '-l nchw -n 201', [], this.unzipPath_, result);
      await utils.saveResultsCSV(this.logger_, this.resultsCSV_, result.output,
          'Examples', 'MobileNetv2_nchw');
      // Run MobileNetv2 nhwc example
      result = {output: ''};
      await utils.childCommand(this.logger_,
          'MobileNetV2.exe -m node\\third_party\\webnn-polyfill\\test-data\\' +
          'models\\mobilenetv2_nhwc\\weights\\ -i examples\\images\\test.jpg ' +
          '-l nhwc -n 201', [], this.unzipPath_, result);
      await utils.saveResultsCSV(this.logger_, this.resultsCSV_, result.output,
          'Examples', 'MobileNetv2_nhwc');
    }
  }

  async runTestsByNode() {
    await utils.childCommand(
        this.logger_, 'npm', ['install'], path.join(this.unzipPath_, 'node'));

    if (this.config_.device.os === 'linux') {
      process.env.LD_LIBRARY_PATH =
          this.unzipPath_ + ':' + process.env.LD_LIBRARY_PATH;
    } else if (this.config_.device.os === 'win') {
      process.env.PATH = this.unzipPath_ + ';' + process.env.PATH;
    }

    utils.updatePackageJsonFile(
        path.join(this.unzipPath_, 'node', 'package.json'));
    const result = {output: ''};
    try {
      await utils.childCommand(
          this.logger_, 'npm', ['test'], path.join(this.unzipPath_, 'node'),
          result, true);
      await utils.saveResultsCSV(this.logger_, this.resultsCSV_, result.output,
          'NodeTest');
    } catch (e) {
      this.logger_.error('Error: Fail to run node test, please check it.');
    }
  }
  /**
   * Run build.
   * @param {String} backend - value: 'null', 'openvino', 'dml', 'onednn',
   *                                  'xnnpack'.
   */
  async run(backend) {
    // Extract build .tgz package
    const buildFile = path.join(this.rootDir_, 'out', 'builds',
        this.config_.targetCommitId,
        `${this.config_.device.os}_${this.config_.device.cpu}_${backend}`,
        `webnn-${this.config_.device.os}-${this.config_.device.cpu}-` +
        `${backend}.tgz`,
    );
    this.unzipPath_ = path.join(os.tmpdir(),
        `${this.config_.targetCommitId}_${backend}`);

    if (fs.existsSync(this.unzipPath_)) {
      fs.removeSync(this.unzipPath_);
    }

    fs.mkdirpSync(this.unzipPath_);

    utils.extractBuild(this.logger_, buildFile, this.unzipPath_);

    // Run tests and save results into csv files
    this.resultsCSV_ = path.join(this.config_.resultsDir,
        `webnn-${backend}-${this.config_.device.os}-` +
        `${this.config_.device.cpu}-${this.config_.targetCommitId}_` +
        `${this.config_.device.name}.csv`);

    if (backend === 'null') {
      await this.runUnitTests();
    } else {
      if (backend === 'onednn') {
        process.env.LD_LIBRARY_PATH = this.unzipPath_;
      }
      await this.runEnd2EndTests();
      await this.runLeNetExample();
      await this.runSqueezeNetExample();
      await this.runMobileNetv2Example();
      await this.runTestsByNode();
    }
    // Upload results CSV file onto Reports Server
    await utils.uploadResults(
        this.logger_, this.resultsCSV_, this.config_.userHost,
        this.config_.remoteDir, this.config_.resultsDir);
    fs.removeSync(this.unzipPath_);
  }

  /** Upload log file. */
  async uploadLogFile() {
    await utils.uploadResults(this.logger_, this.config_.logFile,
        this.config_.userHost, this.config_.remoteDir, this.config_.resultsDir);
  }
}

module.exports = {Tester};
