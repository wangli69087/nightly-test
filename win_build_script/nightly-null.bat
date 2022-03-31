@echo off

set nullConfigFile=C:\workspace\UPSTREAM\webnn-native\null.json
set dmlConfigFile=C:\workspace\UPSTREAM\webnn-native\dml.json
set openvinoConfigFile=C:\workspace\UPSTREAM\webnn-native\openvino.json
set onednnConfigFile=C:\workspace\UPSTREAM\webnn-native\onednn.json
set xnnpackConfigFile=C:\workspace\UPSTREAM\webnn-native\xnnpack.json

call cd C:\workspace\UPSTREAM\webnn-native
call git stash
call gclient sync
call git rev-parse HEAD > commitid
call set /p cid=<commitid

echo "Start to build with null backend...."
echo %nullConfigFile%
call cd C:\workspace\UPSTREAM\webnn-native\build_script
call rmdir /s /q node_modules
call npm install
call build_webnn.bat all-node "--config=null.json"


