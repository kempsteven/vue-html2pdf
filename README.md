# VueHTML2PDF Documentation

#### Package Github:
https://github.com/kempsteven/vue-html2pdf

Please see the demo site and demo github for easier understanding of the usage of the package.
#### Demo Site:
https://vue-html2pdf-demo.netlify.com/

#### Demo Github:
https://github.com/kempsteven/vue-html2pdf-demo


# vue-html2pdf

vue-html2pdf converts any vue component or element into PDF, vue-html2pdf is basically a vue wrapper only and uses [html2pdf.js](https://github.com/eKoopmans/html2pdf.js) behind the scenes.

## Table of contents
- [Getting started](#getting-started)
  - [NPM](#npm)
- [Usage](#usage)
  - [Using in Nuxt.js](#using-in-nuxtjs)
- [Props](#props)
- [Events](#events)
- [Slot](#slot)
- [Page Break](#page-break)
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
        :float-layout="true"
        :enable-download="true"
        :preview-modal="true"
        :paginate-elements-by-height="1400"
        filename="hee hee"
        :pdf-quality="2"
        :manual-pagination="false"
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

#### Using in Nuxtjs
```js
// plugins/vue-html2pdf.js
import Vue from 'vue'
import VueHtml2pdf from 'vue-html2pdf'
Vue.use(VueHtml2pdf)
```

```js
// nuxt.config.js
plugins: [
    { src: '@/plugins/vue-html2pdf', mode: 'client' }
],
```
```html
<!-- on-component-usage.vue -->
<!-- you should add <client-only> tag -->
<!-- more info for client-only tag: https://nuxtjs.org/api/components-client-only/ -->
...
<client-only>
    <vue-html2pdf>
        <section slot="pdf-content">
        </section>
    </vue-html2pdf>
</client-only>
...
```


## Props
This props can seen in the Usage Part

| Props                       | Options                  | Description                                                                                                         |
|-----------------------------|--------------------------|---------------------------------------------------------------------------------------------------------------------|
| show-layout                 | true, false              | Shows the pdf-content slot, using this you can see what contents will be converted to PDF.                          |
| float-layout                | true, false              | Enabled by default. If the props is set to `false` The props `show-layout` will be overridden. The layout will not float and the layout will ALWAYS show. |
| enable-download             | true, false              | Enabled by default. When enabled the pdf will be downloaded and vise-versa.                                         |
| preview-modal               | true, false              | Once you generate the pdf, PDF will be previewed on a modal, PDF will not be downloaded.                            |
| paginate-elements-by-height | Any Number               | The number inputed will be used to paginate elements, the number will be in px units only.                          |
| manual-pagination           | true, false              | When enabled, the package will NOT automatically paginate the elements. Instead the pagination process will rely on the elements        with a class "html2pdf__page-break" to know where to page break, which is automatically done by html2pdf.js |
| filename                    | Any String               | The number inputed will be used to paginate elements, the number will be in px units only.                          |
| pdf-quality                 | 0 - 2 (Can have decimal) | 2 is the highest quality and 0.1 is the lowest quality, 0 will make the PDF disappear.                              |
| pdf-format                  | a0, a1, a2, a3, a4, letter, legal, a5, a6, a7, a8, a9, a10 | This are the PDF formats (Paper Sizes)                                            |
| pdf-orientation             | portrait, landscape      | This are the PDF orientation                                                                                        |
| pdf-content-width           | Any css sizes (e.g. "800px", "65vw", "70%") | This is the PDF's content width                                                                  |
| html-to-pdf-options         | [html-to-pdf-options details here](#html-to-pdf-options) | This prop gives a way to configure the whole html2pdf.js options                    |


## html-to-pdf-options 
|Name        |Type            |Default                         |Description                                                                                                 |
|------------|----------------|--------------------------------|------------------------------------------------------------------------------------------------------------|
|margin      |number or array |0                               |PDF margin (in jsPDF units). Can be a single number, `[vMargin, hMargin]`, or `[top, left, bottom, right]`. |
|filename    |string          |'file.pdf'                      |The default filename of the exported PDF.                                                                   |
|image       |object          |`{type: 'jpeg', quality: 0.95}` |The image type and quality used to generate the PDF. See [Image type and quality](https://www.npmjs.com/package/html2pdf.js/v/0.9.0#image-type-and-quality).|
|enableLinks |boolean         | false                          |If enabled, PDF hyperlinks are automatically added ontop of all anchor tags.                                |
|html2canvas |object          |`{ }`                           |Configuration options sent directly to `html2canvas` ([see here](https://html2canvas.hertzen.com/configuration) for usage).|
|jsPDF       |object          |`{ }`                           |Configuration options sent directly to `jsPDF` ([see here](http://rawgit.com/MrRio/jsPDF/master/docs/jsPDF.html) for usage).|


#### IMPORTANT NOTE:
If you have set a value to this prop, the props below will be overridden:

`'filename'`,
`'pdf-quality'`,
`'pdf-format'`,
`'pdf-orientation'`  

Any value inputed to those props above will have no effect.

#### Sample Value of html-to-pdf-options
```javascript
htmlToPdfOptions: {
    margin: 0,

    filename: `hehehe.pdf`,

    image: {
        type: 'jpeg', 
        quality: 0.98
    },

    enableLinks: false,

    html2canvas: {
        scale: 1,
        useCORS: true
    },

    jsPDF: {
        unit: 'in',
        format: 'a4',
        orientation: 'portrait'
    }
}
```

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


## Page Break
By adding an element with a class of `html2pdf__page-break` will add page break after that element.

Usage:
This can still be used with the automatic pagination of the package or
when the prop `manual-pagination` is enabled

Sample Usage:
```html
<section slot="pdf-content">

    <section class="pdf-item">
        <h4>
            Title
        </h4>

        <span>
            Value
        </span>
    </section>

    <!--
        After this element below, the page will break and any elements after
        <div class="html2pdf__page-break"/> will go to the next page.
    -->
    <div class="html2pdf__page-break"/>

    <section class="pdf-item">
        <h4>
            Title
        </h4>

        <span>
            Value
        </span>
    </section>
</section>
```

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
        All other pdf-item will be separated in the pagination process,
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
        If you have any image with a remote source
        set html2canvas.useCORS to true, although it is set to true by default
        Ex.
        html2canvas: {
            useCORS: true
        }
    -->
    <section class="pdf-item">
        <img :src="remoteImageLink">
    </section>
</section>
```

## Known issues
As you can see on the description this package is mostly just a Vue.js wrapper for html2pdf.js, Below are known issues that comes along with html2pdf.js

1. **Rendering:** The rendering engine html2canvas isn't perfect (though it's pretty good!). If html2canvas isn't rendering your content correctly, I can't fix it.
    - You can test this with something like [this fiddle](https://jsfiddle.net/eKoopmans/z1rupL4c/), to see if there's a problem in the canvas creation itself.

2. **Node cloning (CSS etc):** The way html2pdf.js clones your content before sending to html2canvas is buggy. A fix is currently being developed - try out:
    - direct file: Go to [html2pdf.js/bugfix/clone-nodes-BUILD](/eKoopmans/html2pdf.js/tree/bugfix/clone-nodes-BUILD) and replace the files in your project with the relevant files (e.g. `dist/html2pdf.bundle.js`)
    - npm: `npm install eKoopmans/html2pdf.js#bugfix/clone-nodes-BUILD`
    - Related project: [Bugfix: Cloned nodes](https://github.com/eKoopmans/html2pdf.js/projects/9)

3. **Resizing:** Currently, html2pdf.js resizes the root element to fit onto a PDF page (causing internal content to "reflow").
    - This is often desired behaviour, but not always.
    - There are plans to add alternate behaviour (e.g. "shrink-to-page"), but nothing that's ready to test yet.
    - Related project: [Feature: Single-page PDFs](https://github.com/eKoopmans/html2pdf.js/projects/1)

4. **Rendered as image:** html2pdf.js renders all content into an image, then places that image into a PDF.
    - This means text is *not selectable or searchable*, and causes large file sizes.
    - This is currently unavoidable, however recent improvements in jsPDF mean that it may soon be possible to render straight into vector graphics.
    - Related project: [Feature: New renderer](https://github.com/eKoopmans/html2pdf.js/projects/4)

5. **Promise clashes:** html2pdf.js relies on specific Promise behaviour, and can fail when used with custom Promise libraries.
    - In the next release, Promises will be sandboxed in html2pdf.js to remove this issue.
    - Related project: [Bugfix: Sandboxed promises](https://github.com/eKoopmans/html2pdf.js/projects/11)

6. **Maximum size:** HTML5 canvases have a [maximum height/width](https://stackoverflow.com/a/11585939/4080966). Anything larger will fail to render.
    - This is a limitation of HTML5 itself, and results in large PDFs rendering completely blank in html2pdf.js.
    - The jsPDF canvas renderer (mentioned in Known Issue #4) may be able to fix this issue!
    - Related project: [Bugfix: Maximum canvas size](https://github.com/eKoopmans/html2pdf.js/projects/5)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2020 Kemp Sayson

## Browser
Package has been tested in these browsers:

Chrome Version 85.0.4183.102 (Official Build) (64-bit)

Mozilla Firefox Version 80.0.1 (64-bit)

Microsoft Edge Version 85.0.564.51 (Official build) (64-bit)

## Show your support  
  
Give a ⭐️ if this project helped you!
I get motivated if I get a star.

It's basically just like the stars we get when
we were in preschool but for grown ups lol.