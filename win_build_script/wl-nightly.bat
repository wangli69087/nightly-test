@echo off

set nullConfigFile=C:\workspace\UPSTREAM\webnn-native\null.json
set dmlConfigFile=C:\workspace\UPSTREAM\webnn-native\dml.json
set openvinoConfigFile=C:\workspace\UPSTREAM\webnn-native\openvino.json
set onednnConfigFile=C:\workspace\UPSTREAM\webnn-native\onednn.json
set xnnpackConfigFile=C:\workspace\UPSTREAM\webnn-native\xnnpack.json


call cd C:\workspace\UPSTREAM\webnn-native\node\examples\electron
call rmdir /s /q webnn-samples
call git stash
call cd C:\workspace\UPSTREAM\webnn-native
call git stash
call gclient sync
call git rev-parse --short HEAD > commitid
call set /p cid=<commitid

echo "Start to build with OpenVINO backend...."
call cd C:\workspace\UPSTREAM\webnn-native
call git reset %cid% --hard
echo %openvinoConfigFile%
call cd C:\workspace\UPSTREAM\webnn-native\build_script
call rmdir /s /q node_modules
call npm install
call build_webnn.bat all-node "--config=openvino.json"
call git rev-parse --short HEAD > commitid
call set /p cid=<commitid
call cd C:\workspace\UPSTREAM\webnn-native\node\examples\electron\webnn-samples
call rmdir /s /q node_modules
call npm install
call npm run package
call npm run make
call scp -r out\make\zip\win32\x64\webnn_samples-win32-x64-0.0.1.zip webnn@powerbuilder.sh.intel.com:~/project/webnn-native/nightly/%cid%/win_x64_openvino


