export PATH=/home/webnn/nightlybuild/node-v14.16.0-linux-x64/bin:/opt/intel/openvino_2021/deployment_tools/model_optimizer:/opt/intel/openvino_2021/data_processing/gstreamer/bin:/opt/intel/openvino_2021/data_processing/gstreamer/bin/gstreamer-1.0:/opt/intel/openvino_2021/deployment_tools/model_optimizer:/opt/intel/openvino_2021/data_processing/gstreamer/bin:/opt/intel/openvino_2021/data_processing/gstreamer/bin/gstreamer-1.0:/opt/intel/openvino_2021/deployment_tools/model_optimizer:/opt/intel/openvino_2021/data_processing/gstreamer/bin:/opt/intel/openvino_2021/data_processing/gstreamer/bin/gstreamer-1.0:/opt/intel/openvino_2021/deployment_tools/model_optimizer:/opt/intel/openvino_2021/data_processing/gstreamer/bin:/opt/intel/openvino_2021/data_processing/gstreamer/bin/gstreamer-1.0:/opt/intel/openvino_2021/deployment_tools/model_optimizer:/opt/intel/openvino_2021/data_processing/gstreamer/bin:/opt/intel/openvino_2021/data_processing/gstreamer/bin/gstreamer-1.0:/opt/intel/openvino_2021/deployment_tools/model_optimizer:/opt/intel/openvino_2021/data_processing/gstreamer/bin:/opt/intel/openvino_2021/data_processing/gstreamer/bin/gstreamer-1.0:/opt/intel/openvino_2021/deployment_tools/model_optimizer:/opt/intel/openvino_2021/data_processing/gstreamer/bin:/opt/intel/openvino_2021/data_processing/gstreamer/bin/gstreamer-1.0:/opt/intel/openvino_2021/deployment_tools/model_optimizer:/opt/intel/openvino_2021/data_processing/gstreamer/bin:/opt/intel/openvino_2021/data_processing/gstreamer/bin/gstreamer-1.0:/opt/intel/openvino_2021/deployment_tools/model_optimizer:/opt/intel/openvino_2021/data_processing/gstreamer/bin:/opt/intel/openvino_2021/data_processing/gstreamer/bin/gstreamer-1.0:/opt/intel/openvino_2021/deployment_tools/model_optimizer:/opt/intel/openvino_2021/data_processing/gstreamer/bin:/opt/intel/openvino_2021/data_processing/gstreamer/bin/gstreamer-1.0:/opt/intel/openvino_2021/deployment_tools/model_optimizer:/opt/intel/openvino_2021/data_processing/gstreamer/bin:/opt/intel/openvino_2021/data_processing/gstreamer/bin/gstreamer-1.0:/opt/intel/openvino_2021/deployment_tools/model_optimizer:/opt/intel/openvino_2021/data_processing/gstreamer/bin:/opt/intel/openvino_2021/data_processing/gstreamer/bin/gstreamer-1.0:/opt/intel/openvino_2021/deployment_tools/model_optimizer:/opt/intel/openvino_2021/data_processing/gstreamer/bin:/opt/intel/openvino_2021/data_processing/gstreamer/bin/gstreamer-1.0:/opt/intel/openvino_2021/deployment_tools/model_optimizer:/opt/intel/openvino_2021/data_processing/gstreamer/bin:/opt/intel/openvino_2021/data_processing/gstreamer/bin/gstreamer-1.0:/opt/intel/openvino_2021/deployment_tools/model_optimizer:/opt/intel/openvino_2021/data_processing/gstreamer/bin:/opt/intel/openvino_2021/data_processing/gstreamer/bin/gstreamer-1.0:/opt/intel/openvino_2021/deployment_tools/model_optimizer:/opt/intel/openvino_2021/data_processing/gstreamer/bin:/opt/intel/openvino_2021/data_processing/gstreamer/bin/gstreamer-1.0:/home/webnn/google-cloud-sdk/bin:/home/webnn/.nvm/versions/node/v12.18.2/bin:/home/webnn/bin:/home/webnn/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:/home/webnn/Software/node/bin:/home/webnn/nightlybuild/depot_tools:/home/webnn/Software/android-studio/bin:/usr/local/cuda-10.0/bin

echo `node -v`>/tmp/8888
cd /home/webnn/share/UPSTREAM/webnn-native/node/examples/electron; rm -rf webnn-samples; git stash;
cd /home/webnn/share/UPSTREAM/webnn-native
git stash
gclient sync
cid=`git rev-parse HEAD`
echo $cid
export http_proxy=http://child-prc.intel.com:913 https_proxy=http://child-prc.intel.com:913
cd /home/webnn/share/UPSTREAM/webnn-native/build_script; rm -rf node_modules; npm install; bash build_webnn all-node --config=/home/webnn/share/UPSTREAM/webnn-native/null.json > /home/webnn/build_log/linux_null_$(date +\%Y\%m\%d\%H\%M\%S).log 2>&1

echo $cid
cd /home/webnn/share/UPSTREAM/webnn-native
git reset $cid --hard
source /opt/intel/openvino_2021/bin/setupvars.sh
cd /home/webnn/share/UPSTREAM/webnn-native/build_script; rm -rf node_modules; npm install; bash build_webnn all-node --config=/home/webnn/share/UPSTREAM/webnn-native/openvino.json > /home/webnn/build_log/linux_openvino_$(date +\%Y\%m\%d\%H\%M\%S).log 2>&1
new_cid=`git rev-parse HEAD`
cd /home/webnn/share/UPSTREAM/webnn-native/node/examples/electron/webnn-samples; rm -rf node_modules; npm install; npm run package; npm run make; scp -r out/make/zip/linux/x64/webnn_samples-linux-x64-0.0.1.zip webnn@powerbuilder.sh.intel.com:~/project/webnn-native/nightly/${new_cid:0:7}/linux_x64_openvino/; 
