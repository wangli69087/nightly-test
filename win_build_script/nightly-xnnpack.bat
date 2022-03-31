@echo off

set nullConfigFile=C:\workspace\webnn-native\null.json
set dmlConfigFile=C:\workspace\webnn-native\dml.json
set openvinoConfigFile=C:\workspace\webnn-native\openvino.json
set onednnConfigFile=C:\workspace\webnn-native\onednn.json
set xnnpackConfigFile=C:\workspace\webnn-native\xnnpack.json

call cd C:\workspace\webnn-native
call gclient sync
call git rev-parse HEAD > commitid
call set /p cid=<commitid

echo "Start to build with null backend...."
echo %nullConfigFile%
call cd C:\workspace\webnn-native\build_script
call rmdir /s /q node_modules
call npm install
call build_webnn.bat all "--config=null.json"


echo "Start to build with DML backend...."
call cd C:\workspace\webnn-native
call git reset %cid% --hard
echo %dmlConfigFile%
call cd C:\workspace\webnn-native\build_script
call rmdir /s /q node_modules
call npm install
call build_webnn.bat all "--config=dml.json"

echo "Start to build with OpenVINO backend...."
call cd C:\workspace\webnn-native
call git reset %cid% --hard
echo %openvinoConfigFile%
call cd C:\workspace\webnn-native\build_script
call rmdir /s /q node_modules
call npm install
call build_webnn.bat all "--config=openvino.json"

echo "Start to build with oneDNN backend...."
call cd C:\workspace\webnn-native
call git reset %cid% --hard
echo %onednnConfigFile%
call cd C:\workspace\webnn-native\build_script
call rmdir /s /q node_modules
call npm install
call build_webnn.bat all "--config=onednn.json"

echo "Start to build with XNNPACK backend...."
call cd C:\workspace\webnn-native
call git reset %cid% --hard
echo %xnnpackConfigFile%
call cd C:\workspace\webnn-native\build_script
call rmdir /s /q node_modules
call npm install
call build_webnn.bat all "--config=xnnpack.json"