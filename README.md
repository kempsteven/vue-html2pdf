# VueHTML2PDF Documentation

Package Github: https://github.com/kempsteven/vue-html2pdf

Please see the demo site and demo github for easier understanding of the usage of the package.
Demo Site: https://vue-html2pdf-demo.netlify.com/

Demo Github: https://github.com/kempsteven/vue-html2pdf-demo


# vue-html2pdf

vue-html2pdf converts any vue component or element into PDF, vue-html2pdf is basically a vue wrapper only and uses [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) behind the scenes.

## Table of contents
- [Getting started](#getting-started)
  - [NPM](#npm)
- [Usage](#usage)
- [Props](#props)
- [Events](#events)
- [Slot](#slot)

## Getting started
#### NPM

Install vue-html2pdf and its dependencies using NPM with `npm i vue-html2pdf`

## Usage
```js
import VueHtml2pdf from 'vue-html2pdf'

export default {
    methods: {
        /*
            Generate Report using refs and calling the
            refs function generatePdf()
        */
        generateReport () {
            this.$refs.html2Pdf.generatePdf()
        }
    },

    components: {
        VueHtml2pdf
    }
}
```

To use it in the template
```vue
<template>
   <div>
     <vue-html2pdf
        :show-layout="false"
        :preview-in-newtab="false"
        :paginate-elements-by-height="1400"
        :filename="'heehee'"
        :pdf-quality="2"
        :pdf-format="'a4'"
        @progress="onProgress($event)"
        @hasStartedGeneration="hasStartedGeneration()"
        @hasGenerated="hasGenerated()"
        ref="html2Pdf"
    >
        <section slot="pdf-content">
            <!-- PDF Contents Here -->
        </section>
    </vue-html2pdf>
   </div>
</template>
```

## Props
This props can seen in the Usage Part

| Props                       | Options                  | Description                                                                                                         |
|-----------------------------|--------------------------|---------------------------------------------------------------------------------------------------------------------|
| show-layout                 | true, false              | Shows the pdf-content slot, using this you can see what contents will be converted to PDF.                          |
| preview-in-newtab           | true, false              | Once you generate the pdf, a new tab will be created and the pdf will be previewed, PDF the will not be downloaded. |
| paginate-elements-by-height | Any Number               | The number inputed will be used to paginate elements, the number will be in px units only.                          |
| filename                    | Any String               | The number inputed will be used to paginate elements, the number will be in px units only.                          |
| pdf-quality                 | 0 - 2 (Can have decimal) | 2 is the highest quality and 0.1 is the lowest quality, 0 will make the PDF disappear.                              |
| pdf-format                  | a0, a1, a2, a3, a4, letter, legal, a5, a6, a7, a8, a9, a10 | This are the PDF formats (Paper Sizes)                                            |

## Events
This events can seen in the Usage Part

| Events                     | Description                                                                                                         |
|----------------------------|---------------------------------------------------------------------------------------------------------------------|
| progress                   | This will return the progress of the PDF Generation.                                                                |
| hasStartedGeneration       | This only be triggered on start of the generation of the PDF.                                                       |
| hasGenerated               | This will be triggered after the generation of the PDF.                                                             |

## Slot
This slot can seen in the Usage Part

| Slot                     | Description                                                                                                         |
|--------------------------|---------------------------------------------------------------------------------------------------------------------|
| pdf-content              | Use this slot to insert you component or element that will be converted to PDF                                     |