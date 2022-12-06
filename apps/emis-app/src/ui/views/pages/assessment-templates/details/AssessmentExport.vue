<!-- This is for extraction to a docx file.  Keep the html as simple as possible and integrate styling in it -->
<!-- eslint is disabled because we purposefully decided to inject html in this -->
<!-- eslint-disable -->
<template>
  <div id="assessmentexport" :style="{ 'margin-left': level * 10 + 'px'}">
    <div v-if="extractedData.type == 'survey'">
      <h1>{{ extractedData.title }}</h1>
      <h2 v-if="extractedData.description">{{ extractedData.description }}</h2>
    </div>
    <div v-else-if="extractedData.type == 'page' || extractedData.type == 'panel'">
      <hr v-if="extractedData.type == 'page'">
      <h3>{{ extractedData.title }} <span v-if="extractedData.isRequired" style="color:red">*</span></h3>
      <small>
        ({{ $t('assessmentTemplate.extract.identifier') }}: <i>{{ extractedData.identifier }}</i> - 
          {{ $t('assessmentTemplate.extract.type') }}: <i>{{ extractedData.type }}</i>)
      </small><br/>
      <h4 v-if="extractedData.description">{{ extractedData.description }}</h4>
    </div>
    <div v-else>
      <span style="font-weight: bold" v-html="extractedData.title"></span> <span v-if="extractedData.isRequired" style="color:red">*</span>
      <small>
        ({{ $t('assessmentTemplate.extract.identifier') }}: <i>{{ extractedData.identifier }}</i> - 
          {{ $t('assessmentTemplate.extract.type') }}: <i>{{ extractedData.type }}</i>)
      </small><br/>
      <div v-if="extractedData.description"><div v-html="extractedData.description"></div></div>
      <ul v-if="extractedData.choices && extractedData.choices.length">
        <li v-for="(choice, $index) in extractedData.choices" :key="$index">
          {{ choice.text }} 
          <small>
            ({{ $t('assessmentTemplate.extract.identifier') }}: <i>{{ choice.value }}</i>
            <span v-if="choice.score"> - {{ $t('assessmentTemplate.extract.score') }}: <i>{{ choice.score }}</i></span>)
          </small>
        </li>
      </ul>
      <div v-else-if="extractedData.type != 'image' && extractedData.type != 'html' && !extractedData.elements.length">[___________________________________]</div>
      <div v-if="extractedData.validators && extractedData.validators.length" style="margin: 24px; padding: 6px; border: 1px solid purple">
        <b>{{ $t('assessmentTemplate.extract.validators') }}</b>
        <small>
          <div v-for="(validator, $index) in extractedData.validators" :key="$index">
            <b>{{ validator.typename }}</b>:
            <span v-for="(property, $propindex) in validator.properties" :key="$propindex">
              <br/>{{ property.name }}: {{ property.value }}
            </span>
          </div>
        </small>
      </div>
    </div>
    <assessment-export v-for="(item, $index) in extractedData.elements" :key="$index" :extractedData="item" :level="level + 1"></assessment-export>
    <div v-if="extractedData.logic && extractedData.logic.length" style="margin: 24px; padding: 6px; border: 1px solid purple">
      {{ $t('assessmentTemplate.extract.logic') }}
      <div v-for="(logic, $index) in extractedData.logic" :key="$index">
        {{ logic }}
      </div>
    </div>
  </div>
</template>
<!-- eslint-enable -->

<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */

import Vue from 'vue';
import { IExtractedSurveyObject } from '@libs/shared-lib/plugins/surveyJs/SurveyJsTextExtractor';

export default Vue.extend({
  name: 'AssessmentExport',

  props: {
    extractedData: {
      type: Object as () => IExtractedSurveyObject,
      required: true,
    },
    level: {
      type: Number,
      default: 1,
    },
  },
});
</script>
