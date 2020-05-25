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
- [Guide](#guide)
- [Browser](#browser)

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
```html
<template>
   <div>
     <vue-html2pdf
        :show-layout="false"
        :enable-download="true"
        :preview-modal="true"
        :paginate-elements-by-height="1400"
        filename="hee hee"
        :pdf-quality="2"
        pdf-format="a4"
        pdf-orientation="landscape"
        pdf-content-width="800px"

        @progress="onProgress($event)"
        @hasStartedGeneration="hasStartedGeneration()"
        @hasGenerated="hasGenerated($event)"
        ref="html2Pdf"
    >
        <section slot="pdf-content">
            <!-- PDF Content Here -->
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
| enable-download             | true, false              | Enabled by default. When enabled the pdf will be downloaded and vise-versa.                                         |
| preview-modal               | true, false              | Once you generate the pdf, PDF will be previewed on a modal, PDF will not be downloaded.                            |
| paginate-elements-by-height | Any Number               | The number inputed will be used to paginate elements, the number will be in px units only.                          |
| filename                    | Any String               | The number inputed will be used to paginate elements, the number will be in px units only.                          |
| pdf-quality                 | 0 - 2 (Can have decimal) | 2 is the highest quality and 0.1 is the lowest quality, 0 will make the PDF disappear.                              |
| pdf-format                  | a0, a1, a2, a3, a4, letter, legal, a5, a6, a7, a8, a9, a10 | This are the PDF formats (Paper Sizes)                                            |
| pdf-orientation             | portrait, landscape      | This are the PDF orientation                                                                                        |
| pdf-content-width           | Any css sizes (e.g. "800px", "65vw", "70%") | This is the PDF's content width                                                                  |


## Events
This events can seen in the Usage Part

| Events                     | Description                                                                                                            |
|----------------------------|------------------------------------------------------------------------------------------------------------------------|
| progress                   | This will return the progress of the PDF Generation.                                                                   |
| hasStartedGeneration       | This only be triggered on start of the generation of the PDF.                                                          |
| hasGenerated               | This will be triggered after the generation of the PDF, will emit a Blob File of the PDF, can be retrived using $event.|


## Slot
This slot can seen in the Usage Part

| Slot                     | Description                                                                                                         |
|--------------------------|---------------------------------------------------------------------------------------------------------------------|
| pdf-content              | Use this slot to insert you component or element that will be converted to PDF                                      |


## Guide
The recommended format for the pdf-content

```html
<section slot="pdf-content">
    <!--
        Divide your content into section, this pdf-item will
        be the element that it's content will not be separated
        in the paginating process. ex. <h4> and <span> wont be separated.
    -->
    <section class="pdf-item">
        <h4>
            Title
        </h4>

        <span>
            Value
        </span>
    </section>

    <!--
        All other pdf-item will could be separated in pagination process,
        depending on paginate-elements-by-height prop.
    -->
    <section class="pdf-item">
        <h4>
            Title
        </h4>

        <span>
            Value
        </span>
    </section>

    <!--
        Any image with a remote link will not be converted to PDF,
        the remote image should be downloaded locally first, before generation.
    -->
    <section class="pdf-item">
        <img :src="remoteImageLink">
    </section>
</section>
```

## Browser
Package has been tested in these browsers:

Chrome Version 78.0.3904.108

Mozilla Firefox Version 70.0.1

Microsoft Edge Version 44.17763.1.0