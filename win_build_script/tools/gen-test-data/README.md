# Generate Test Data Tool
This tool contains two python scripts to generate test data for testing WebNN API.

* **gen_nchw_test_data.py** is used for converting `.pb` sample test data files of nchw ONNX models to `.npy` test data files.

* **gen_nhwc_test_data.py** is copied from [tensorflow/lite/examples/python/label_image.py](https://github.com/tensorflow/tensorflow/tree/master/tensorflow/lite/examples/python/) with some modification for generating `.npy` test data files by given `.tflite` model files and labels file with input image files.

# Run
## Precondition
* python3 is requried
* Prepare sample test data `.pb` files: download Image Classification models with sample test data from [ONNX Model Zoo](https://github.com/onnx/models), then extract them for running gen_nchw_test_data.py script
* [Install TensorFlow Lite for Python](https://www.tensorflow.org/lite/guide/python#install_tensorflow_lite_for_python), and prepare labels file, input image fils for running gen_nhwc_test_data.py script

```sh
  $ echo "deb https://packages.cloud.google.com/apt coral-edgetpu-stable main" | sudo tee /etc/apt/sources.list.d/coral-edgetpu.list
  $ curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key add -
  $ sudo apt-get update
  $ sudo apt-get install python3-tflite-runtime
```

## Commands
$ python3 gen_nchw_test_data.py -d \<test_data_set parent dir\> -n \<model name\>, for example:

```sh
$ python3 gen_nchw_test_data.py -d /home/test/resnet50v2 -n resnet50v2
# generated test data files 'input_0.npy' and 'output_0.npy' are under out/resnet50v2_nchw/test_data_set/0, 1, 2
```

$ python3 gen_nhwc_test_data.py -m \<.tflite model file\> -l \<labels file\> -i \<input image\> -o \<sub dir name\> -n \<model name\>, for example:

```sh
$ python3 gen_nhwc_test_data.py -m /home/test/resnet_v2_101_299.tflite -l /home/test/labels1001.txt -i /home/test/test.jpg -o 1 -n resnet101v2
# generated test data files 'input_0.npy' and 'output_0.npy' are under out/resnet101v2_nhwc/test_data_set/1/
```
