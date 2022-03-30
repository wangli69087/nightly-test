# Nightly-test

Nightly-test is an auto test framework to download Webnn-native nightly build from build host server, then run Unit Tests/End2End Tests/Examples with nightly build, and generate report files and log files.

## Set configuration

Configure [./config.json](./config.json) on demand.

```js
{
  "build_url": "http:///project/webnn-native/nightly/",
  "target_commitId": "latest",
  "target_backend": ["null", "openvino"],
  "test_device": {
    "name": "",
    "os": "linux",
    "cpu": "x64"
  },
  "report_server": {
    "user_host": "",
    "dir": "/home/webnn/project/nightly_reports"
  },
  "log_level": "info"
}
```
* build_url: URL of nightly build.
* target_commitId: Target test build commit Id, default is "latest", could be specified by released build commit Id.
* target_backend: A list of target backend. For Linux platform, it could be ["null", "openvino"], for Windows platform, it could be ["null", "openvino", "dml"].
* test_device: Test device information. "name" likes "TGLi7-1165G7_ASUS_ZenBookFlipS", "ICLi5-1035G4_ACER_Swift3", etc.. "os" likes "linux" or "win". "cpu" likes "x64".
* report_server: Report server settings. "user_host" likes user@host. "dir" is a directory to host report files and log files.
* log_level: Log level. Default "info". Values:
  - "info"
  - "warn"
  - "error"
  - "debug"

## Test

### Setup

```sh
> npm install
```

### Run

```sh
> npm test
```

**Notes**:
 * For OpenVINO backend, please [install 2021.2 version](https://docs.openvinotoolkit.org/2021.2/openvino_docs_install_guides_installing_openvino_linux.html#install-openvino) and [set the environment variables](https://docs.openvinotoolkit.org/2021.2/openvino_docs_install_guides_installing_openvino_linux.html#set-the-environment-variables) before running tests.


 ### Lint

```sh
> npm run lint
```