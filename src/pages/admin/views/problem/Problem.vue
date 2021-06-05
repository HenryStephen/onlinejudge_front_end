<template>
  <div class="problem">
    <Panel :title="title">
      <el-form ref="form" :model="problem" :rules="rules" label-position="top" label-width="70px">
        <el-row :gutter="20">
<!--          展示id-->
          <el-col :span="6">
            <el-form-item prop="problemDisplayId" :label="$t('m.Display_ID')"
                          :required="this.routeName === 'create-contest-problem' || this.routeName === 'edit-contest-problem'">
              <el-input :placeholder="$t('m.Display_ID')" v-model="problem.problemDisplayId"></el-input>
            </el-form-item>
          </el-col>
<!--          题目标题-->
          <el-col :span="18">
            <el-form-item prop="problemTitle" :label="$t('m.Title')" required>
              <el-input :placeholder="$t('m.Title')" v-model="problem.problemTitle"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
<!--        描述-->
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item prop="problemDescription" :label="$t('m.Description')" required>
              <Simditor v-model="problem.problemDescription"></Simditor>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
<!--          输入格式-->
          <el-col :span="24">
            <el-form-item prop="problemInputFormation" :label="$t('m.Input_Description')" required>
              <Simditor v-model="problem.problemInputFormation"></Simditor>
            </el-form-item>
          </el-col>
<!--          输出格式-->
          <el-col :span="24">
            <el-form-item prop="problemOutputFormation" :label="$t('m.Output_Description')" required>
              <Simditor v-model="problem.problemOutputFormation"></Simditor>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <!--        时间限制-->
          <el-col :span="8">
            <el-form-item :label="$t('m.Time_Limit') + ' (ms)' " required>
              <el-input type="Number" :placeholder="$t('m.Time_Limit')" v-model="problem.problemTimeLimit"></el-input>
            </el-form-item>
          </el-col>
<!--          内存限制-->
          <el-col :span="8">
            <el-form-item :label="$t('m.Memory_limit') + ' (MB)' " required>
              <el-input type="Number" :placeholder="$t('m.Memory_limit')" v-model="problem.problemMemoryLimit"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8">
<!--            题目难度-->
            <el-form-item :label="$t('m.Difficulty')">
              <el-select class="difficulty-select" size="small" :placeholder="$t('m.Difficulty')" v-model="problem.problemDifficulty">
                <el-option :label="$t('m.Low')" value="Low"></el-option>
                <el-option :label="$t('m.Mid')" value="Mid"></el-option>
                <el-option :label="$t('m.High')" value="High"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
<!--          题目可见性-->
          <el-col :span="4">
            <el-form-item :label="$t('m.Visible')">
              <el-switch
                v-model="problem.visible"
                active-text=""
                inactive-text="">
              </el-switch>
            </el-form-item>
          </el-col>
<!--          题目标签-->
          <el-col :span="8">
            <el-form-item :label="$t('m.Tag')" :error="error.tags" required>
              <span class="tags">
                <el-tag
                  v-for="tag in problem.tags"
                  :closable="true"
                  :close-transition="false"
                  :key="tag.tagId"
                  type="success"
                  @close="closeTag(tag)"
                >{{tag.tagName}}
                </el-tag>
              </span>
<!--              添加标签-->
              <el-autocomplete
                v-if="inputVisible"
                size="mini"
                class="input-new-tag"
                popper-class="problem-tag-poper"
                v-model="tagInput"
                :trigger-on-focus="false"
                @keyup.enter.native="addTag"
                @select="addTag"
                :fetch-suggestions="querySearch">
              </el-autocomplete>
<!--              添加标签-->
              <el-button class="button-new-tag" v-else size="small" @click="inputVisible = true">+ {{$t('m.New_Tag')}}</el-button>
            </el-form-item>
          </el-col>
<!--          编程语言-->
          <el-col :span="8">
            <el-form-item :label="$t('m.Languages')" :error="error.languages" required>
              <el-checkbox-group v-model="problem.languages">
                <el-tooltip class="spj-radio" v-for="lang in allLanguage.languages" :key="lang.languageName" effect="dark"
                            :content="lang.languageDescription" placement="top-start">
                  <el-checkbox :label="lang.languageName"></el-checkbox>
                </el-tooltip>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>
<!--        标准输入输出-->
        <div>
          <el-form-item v-for="(sample, index) in problem.samples" :key="'sample'+index">
            <Accordion :title="'Sample' + (index + 1)">
              <el-button type="warning" size="small" icon="el-icon-delete" slot="header" @click="deleteSample(index)">
                Delete
              </el-button>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item :label="$t('m.Input_Samples')" required>
                    <el-input
                      :rows="5"
                      type="textarea"
                      :placeholder="$t('m.Input_Samples')"
                      v-model="sample.sampleInput">
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="$t('m.Output_Samples')" required>
                    <el-input
                      :rows="5"
                      type="textarea"
                      :placeholder="$t('m.Output_Samples')"
                      v-model="sample.sampleOutput">
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </Accordion>
          </el-form-item>
        </div>
<!--        添加标准输入输出-->
        <div class="add-sample-btn">
          <button type="button" class="add-samples" @click="addSample()"><i class="el-icon-plus"></i>{{$t('m.Add_Sample')}}</button>
        </div>
<!--        提示信息-->
        <el-form-item style="margin-top: 20px" :label="$t('m.Hint')">
          <Simditor v-model="problem.problemReminder" placeholder=""></Simditor>
        </el-form-item>
        <el-row :gutter="20">
          <!--        测试类型 （ACM OI）-->
          <el-col :span="4">
            <el-form-item :label="$t('m.Type')">
              <el-radio-group v-model="problem.problemRuleType" :disabled="disableRuleType">
                <el-radio label="ACM">ACM</el-radio>
                <el-radio label="OI">OI</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
<!--          上传测试用例-->
          <el-col :span="6">
            <el-form-item :label="$t('m.TestCase')" :error="error.testcase">
              <el-upload
                action="/api/judge/testcase/"
                name="file"
                :headers="importHeaders"
                :data="{spj: problem.isSpj}"
                :show-file-list="true"
                :on-success="uploadSucceeded"
                :on-error="uploadFailed">
                <el-button size="small" type="primary" icon="el-icon-fa-upload">Choose File</el-button>
              </el-upload>
            </el-form-item>
          </el-col>
        </el-row>
<!--        题目来源-->
        <el-form-item :label="$t('m.Source')">
          <el-input :placeholder="$t('m.Source')" v-model="problem.problemSource"></el-input>
        </el-form-item>
        <save @click.native="submit()">Save</save>
      </el-form>
    </Panel>
  </div>
</template>

<script>
  import Simditor from '../../components/Simditor'
  import Accordion from '../../components/Accordion'
  import api from '../../api'
  import storage from '@/utils/storage'

  let token = storage.get('token')

  export default {
    name: 'Problem',
    components: {
      Simditor,
      Accordion
    },
    data () {
      return {
          // 验证规则
        rules: {
          problemDisplayId: {required: true, message: 'Display ID is required', trigger: 'blur'},
          problemTitle: {required: true, message: 'Title is required', trigger: 'blur'},
          problemInputFormation: {required: true, message: 'Input Description is required', trigger: 'blur'},
          problemOutputFormation: {required: true, message: 'Output Description is required', trigger: 'blur'}
        },
        mode: '',
        contest: {},
        problem: {
          languages: []
        },
        reProblem: {
          languages: []
        },
        testCaseUploaded: false,
        allLanguage: {},
        inputVisible: false,
        tagInput: '',
        title: '',
        disableRuleType: false,
        routeName: '',
        error: {
          tags: '',
          languages: '',
          testCase: ''
        },
        importHeaders: {Authorization: 'Bearer ' + token}
      }
    },
    mounted () {
      this.routeName = this.$route.name
        // 切换模式
      if (this.routeName === 'edit-problem' || this.routeName === 'edit-contest-problem') {
        // 编辑
        this.mode = 'edit'
      } else {
        // 添加
        this.mode = 'add'
      }
      // 获取所有的编程语言
      api.getLanguages().then(res => {
        this.problem = this.reProblem = {
          problemDisplayId: '',
          problemTitle: '',
          problemDescription: '',
          problemInputFormation: '',
          problemOutputFormation: '',
          problemTimeLimit: 1000,
          problemMemoryLimit: 256,
          problemDifficulty: 'Low',
          visible: true,
          tags: [],
          languages: [],
          samples: [{sampleInput: '', sampleOutput: ''}],
          isSpj: false,
            // 测试用例id
          problemTestcaseId: '',
          problemRuleType: 'ACM',
          problemReminder: '',
          problemSource: ''
        }
        // 获取竞赛id
        let contestID = this.$route.params.contestId
        // 如果是竞赛题目
        if (contestID) {
          this.problem.contestId = this.reProblem.contestId = contestID
          this.disableRuleType = true
          // 获取具体竞赛
          api.getContest(contestID).then(res => {
            this.problem.problemRuleType = this.reProblem.problemRuleType = res.data.data.competitionRuleType
            this.contest = res.data.data
          })
        }
        // 所有的编程语言
        let allLanguage = res.data.data
        this.allLanguage = allLanguage

        // get problem after getting languages list to avoid find undefined value in `watch problem.languages`
        if (this.mode === 'edit') {
            // 编辑题目
          this.title = this.$i18n.t('m.Edit_Problem')
          let funcName = {'edit-problem': 'getProblem', 'edit-contest-problem': 'getContestProblem'}[this.routeName]
          api[funcName](this.$route.params.contestId, this.$route.params.problemId).then(problemRes => {
            let data = problemRes.data.data
            this.problem = data
            this.testCaseUploaded = true
          })
        } else {
            // 创建题目
          this.title = this.$i18n.t('m.Add_Problem')
          for (let item of allLanguage.languages) {
            this.problem.languages.push(item.languageName)
          }
        }
      })
    },
    watch: {
      '$route' () {
        this.$refs.form.resetFields()
        this.problem = this.reProblem
      }
    },
    methods: {
        // 远程搜索标签列表
      querySearch (queryString, cb) {
          // 获取所有标签列表
        api.getProblemTagList({ keyword: queryString }).then(res => {
          let tagList = []
          for (let tag of res.data.data) {
            tagList.push({value: tag.tagName})
          }
          cb(tagList)
        }).catch(() => {
        })
      },
        // 添加标签
      addTag () {
        let inputValue = this.tagInput
        let tag = {
          tagName: ''
        }
        if (inputValue) {
          tag.tagName = inputValue
          this.problem.tags.push(tag)
        }
        this.inputVisible = false
        this.tagInput = ''
      },
        // 删除标签
      closeTag (tag) {
        this.problem.tags.splice(this.problem.tags.indexOf(tag), 1)
      },
        // 添加标准输入输出
      addSample () {
        this.problem.samples.push({sampleInput: '', sampleOutput: ''})
      },
        // 删除标准输入输出
      deleteSample (index) {
        this.problem.samples.splice(index, 1)
      },
        // 上传测试用例成功
      uploadSucceeded (response) {
        if (response.error) {
            // 提示错误信息
          this.$error(response.data)
          return
        }
        this.testCaseUploaded = true
          // 获取题目id
        this.problem.problemTestcaseId = response.data.id
      },
        // 上传失败
      uploadFailed () {
        this.$error('Upload failed')
      },
        // 提交
      submit () {
          // 标准输入输出样例判断
        if (!this.problem.samples.length) {
          this.$error('Sample is required')
          return
        }
        for (let sample of this.problem.samples) {
          if (!sample.sampleInput || !sample.sampleOutput) {
            this.$error('Sample input and output is required')
            return
          }
        }
        // 标签判断
        if (!this.problem.tags.length) {
          this.error.tags = 'Please add at least one tag'
          this.$error(this.error.tags)
          return
        }
        // 编程语言判断
        if (!this.problem.languages.length) {
          this.error.languages = 'Please choose at least one language for problem'
          this.$error(this.error.languages)
          return
        }
        // 测试用例判断
        if (!this.testCaseUploaded) {
          this.error.testCase = 'Test case is not uploaded yet'
          this.$error(this.error.testCase)
          return
        }
        this.problem.languages = this.problem.languages.sort()
          // 获取对应接口函数
        let funcName = {
          'create-problem': 'createProblem',
          'edit-problem': 'editProblem',
          'create-contest-problem': 'createContestProblem',
          'edit-contest-problem': 'editContestProblem'
        }[this.routeName]
        // edit contest problem 时, contest_id会被后来的请求覆盖掉
        if (funcName === 'editContestProblem') {
            // 获取竞赛id
          this.problem.contestId = this.contest.competitionId
        }
        api[funcName](this.problem).then(res => {
          if (this.routeName === 'create-contest-problem' || this.routeName === 'edit-contest-problem') {
            this.$router.push({name: 'contest-problem-list', params: {contestId: this.$route.params.contestId}})
          } else {
            this.$router.push({name: 'problem-list'})
          }
        }).catch(() => {
        })
      }
    }
  }
</script>

<style lang="less" scoped>
  .problem {
    .difficulty-select {
      width: 120px;
    }
    .spj-radio {
      margin-left: 10px;
      &:last-child {
        margin-right: 20px;
      }
    }
    .input-new-tag {
      width: 78px;
    }
    .button-new-tag {
      height: 24px;
      line-height: 22px;
      padding-top: 0;
      padding-bottom: 0;
    }
    .tags {
      .el-tag {
        margin-right: 10px;
      }
    }
    .accordion {
      margin-bottom: 10px;
    }
    .add-samples {
      width: 100%;
      background-color: #fff;
      border: 1px dashed #aaa;
      outline: none;
      cursor: pointer;
      color: #666;
      height: 35px;
      font-size: 14px;
      &:hover {
        background-color: #f9fafc;
      }
      i {
        margin-right: 10px;
      }
    }
    .add-sample-btn {
      margin-bottom: 10px;
    }

  }
</style>

<style>
  .problem-tag-poper {
    width: 200px !important;
  }
  .dialog-compile-error {
    width: auto;
    max-width: 80%;
    overflow-x: scroll;
  }
</style>

