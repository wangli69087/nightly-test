import os
import sys
import csv
import glob
from jinja2 import Environment, FileSystemLoader

current_path = os.getcwd()
sys.path.append(current_path)

class ReportHandler():
    """
    This class is used for analyzing and processing data.
    """

    def csvFileReader(self, commit_id_path_name):
        """
        This mehtod is used for reading data from csv file.
        :return: failure list of all backends
        """
        self.backend_os_result_count_list = list()
        self.result_count_dic = dict()
        self.backend_os_fail_dic = dict()
        self.backend_os_fail_list = list()
        self.commit_id_path_name = commit_id_path_name
        self.all_csv_files_list = glob.glob(
            self.commit_id_path_name + "/*.csv")
        self.dir_name = self.commit_id_path_name.split('/')[-1]
        for csv_file_name in self.all_csv_files_list:
            self.file_name = csv_file_name.split('/')[-1].split('.')[0]
            self.test_backend = self.file_name.split('-')[1]
            self.test_os = self.file_name.split('-')[2]
            if self.file_name.startswith("webnn-" + self.test_backend + "-" + self.test_os):
                with open(csv_file_name, newline='', encoding='utf-8') as f:
                    data_reader = csv.reader(f)
                    self.result_count_dic.update({
                        '{}_{}_pass_result_count'.format(self.test_backend, self.test_os): 0,
                        '{}_{}_total_result_count'.format(self.test_backend, self.test_os): 0,
                        '{}_{}_examples_pass_result_count'.format(self.test_backend, self.test_os): 0,
                        '{}_{}_examples_total_result_count'.format(self.test_backend, self.test_os): 0,
                        '{}_{}_nodetest_pass_result_count'.format(self.test_backend, self.test_os): 0,
                        '{}_{}_nodetest_total_result_count'.format(self.test_backend, self.test_os): 0,
                    })
                    try:
                        for data_row in data_reader:
                            if data_reader.line_num == 1:
                                continue
                            if ('UnitTests' in data_row):
                                self.result_count_dic['{}_{}_total_result_count'.format(
                                    self.test_backend, self.test_os)] += 1
                            elif ('End2EndTests' in data_row):
                                self.result_count_dic['{}_{}_total_result_count'.format(
                                    self.test_backend, self.test_os)] += 1
                            elif 'Examples' in data_row:
                                self.result_count_dic['{}_{}_examples_total_result_count'.format(
                                    self.test_backend, self.test_os)] += 1
                            elif any("NodeTest" in data_row_ele for data_row_ele in data_row):
                                self.result_count_dic['{}_{}_nodetest_total_result_count'.format(
                                    self.test_backend, self.test_os)] += 1
                            else:
                                print("Unknown total result count!")
                                return
                            if ('PASS' in data_row) and (('UnitTests' in data_row) or ('End2EndTests' in data_row)):
                                self.result_count_dic['{}_{}_pass_result_count'.format(
                                    self.test_backend, self.test_os)] += 1
                            elif 'PASS' in data_row and 'Examples' in data_row:
                                self.result_count_dic['{}_{}_examples_pass_result_count'.format(
                                    self.test_backend, self.test_os)] += 1
                            elif ('PASS' in data_row) and (any("NodeTest" in data_row_ele for data_row_ele in data_row)):
                                self.result_count_dic['{}_{}_nodetest_pass_result_count'.format(
                                    self.test_backend, self.test_os)] += 1
                            elif 'FAIL' in data_row:
                                self.backend_os_fail_dic = {'component_html': data_row[0],
                                                            'test_case_html': data_row[1],
                                                            'note_html': data_row[3]}
                                self.backend_os_fail_list.append({'{}_{}_fail_dic'.format(
                                    self.test_backend, self.test_os): self.backend_os_fail_dic})
                            else:
                                print("Unknown pass result count!")
                                return
                    except csv.Error as e:
                        sys.exit('file {}, line {}: {}'.format(
                            self.file_name, data_reader.line_num, e))
                backend_os_result_count_html = str(self.result_count_dic['{}_{}_pass_result_count'.format(self.test_backend, self.test_os)]) + '/' + str(
                    self.result_count_dic['{}_{}_total_result_count'.format(self.test_backend, self.test_os)])
                backend_os_examples_result_count_html = str(
                    self.result_count_dic['{}_{}_examples_pass_result_count'.format(self.test_backend, self.test_os)]) + '/' + str(self.result_count_dic['{}_{}_examples_total_result_count'.format(self.test_backend, self.test_os)])
                backend_os_nodetest_result_count_html = str(
                    self.result_count_dic['{}_{}_nodetest_pass_result_count'.format(self.test_backend, self.test_os)]) + '/' + str(self.result_count_dic['{}_{}_nodetest_total_result_count'.format(self.test_backend, self.test_os)])
                self.backend_os_result_count_list.append(
                    {'{}_{}_result_count_html'.format(self.test_backend, self.test_os): backend_os_result_count_html})
                self.backend_os_result_count_list.append(
                    {'{}_{}_examples_result_count_html'.format(self.test_backend, self.test_os): backend_os_examples_result_count_html})
                self.backend_os_result_count_list.append(
                    {'{}_{}_nodetest_result_count_html'.format(self.test_backend, self.test_os): backend_os_nodetest_result_count_html})
            else:
                print('Unknown file name! %s' % self.file_name)
                return
            continue
        file_name_processer = self.file_name.split('_')
        self.device_information = file_name_processer[1]+'_' + \
            file_name_processer[2]+'_'+file_name_processer[3]
        self.href_info = r"https://github.com/otcshare/webnn-native/commit/" + self.dir_name

    def generateHtml(self):
        """
        This method is used for generating HTML report page.
        :return: report_name
        """
        self.env = Environment(loader=FileSystemLoader('./'))
        self.template = self.env.get_template(
            r'./templates/report_template.html')
        self.report_name = self.commit_id_path_name + '/' + \
            'report_' + self.dir_name + '.html'
        with open(self.report_name, 'w+') as fout:
            html_content = self.template.render(
                commit_id_html=self.dir_name,
                href_info_html=self.href_info,
                device_information=self.device_information,
                backend_os_result_count_list_html=self.
                backend_os_result_count_list,
                body_backend_os_fail_list_html=self.backend_os_fail_list)
            fout.write(html_content)
        return self.report_name

def main(commit_id_path_name):
    """
    This function is used for executing all workflow.
    """
    if commit_id_path_name[-1] == '/':
        commit_id_path_name = commit_id_path_name[:-1]
    report_handler_obj = ReportHandler()
    report_handler_obj.csvFileReader(commit_id_path_name)
    report_handler_obj.generateHtml()

if __name__ == '__main__':
    commit_id_path_name = sys.argv[1]
    main(commit_id_path_name)
