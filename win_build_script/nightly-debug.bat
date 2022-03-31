@echo off

set nullConfigFile=C:\workspace\webnn-native\null.json
set dmlConfigFile=C:\workspace\webnn-native\dml.json
set openvinoConfigFile=C:\workspace\webnn-native\openvino.json
set onednnConfigFile=C:\workspace\webnn-native\onednn.json
set xnnpackConfigFile=C:\workspace\webnn-native\xnnpack.json

call cd C:\workspace\webnn-native
call git rev-parse HEAD > commitid
call set /p cid=<commitid

echo "Start to build with null backend...."
echo %nullConfigFile%
call cd C:\workspace\webnn-native\build_script
call rmdir /s /q node_modules
call npm install
call build_webnn.bat all-node "--config=null.json"


echo "Start to build with DML backend...."
call cd C:\workspace\webnn-native
echo %dmlConfigFile%
call cd C:\workspace\webnn-native\build_script
call rmdir /s /q node_modules
call npm install
call build_webnn.bat all-node "--config=dml.json"

