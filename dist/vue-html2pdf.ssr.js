'use strict';Object.defineProperty(exports,'__esModule',{value:true});function _interopDefault(e){return(e&&(typeof e==='object')&&'default'in e)?e['default']:e}var html2pdf=_interopDefault(require('html2pdf.js'));//

var script = {
	props: {
		showLayout: {
			type: Boolean,
			default: false
		},

		floatLayout: {
			type: Boolean,
			default: true
		},

		enableDownload: {
			type: Boolean,
			default: true
		},

		previewModal: {
			type: Boolean,
			default: false
		},

		paginateElementsByHeight: {
			type: Number
		},

		filename: {
			type: String,
			default: ("" + (new Date().getTime()))
		},

		pdfQuality: {
			type: Number,
			default: 2,
		},

		pdfFormat: {
			default: 'a4',
		},

		pdfOrientation: {
			type: String,
			default: 'portrait'
		},

		pdfContentWidth: {
			default: '800px'
		},

		htmlToPdfOptions: {
			type: Object
		},

		manualPagination: {
			type: Boolean,
			default: false
		}
	},

	data: function data () {
		return {
			hasAlreadyParsed: false,
			progress: 0,
			pdfWindow: null,
			pdfFile: null
		}
	},

	watch: {
		progress: function progress (val) {
			this.$emit('progress', val);
		},

		paginateElementsByHeight: function paginateElementsByHeight () {
			this.resetPagination();
		},

		$props: {
			handler: function handler () {
				this.validateProps();
			},

			deep: true,
			immediate: true
		}
	},

	methods: {
		validateProps: function validateProps () {
			// If manual-pagination is false, paginate-elements-by-height props is required
			if (!this.manualPagination) {
				if (this.paginateElementsByHeight === undefined) {
					console.error('Error: paginate-elements-by-height is required if manual-pagination is false');
				}
			}
		},

		resetPagination: function resetPagination () {
			var parentElement = this.$refs.pdfContent.firstChild;
			var pageBreaks = parentElement.getElementsByClassName('html2pdf__page-break');
			var pageBreakLength = pageBreaks.length - 1;
			
			if (pageBreakLength === -1) { return }

			this.hasAlreadyParsed = false;

			// Remove All Page Break (For Pagination)
			for (var x = pageBreakLength; x >= 0; x--) {
				pageBreaks[x].parentNode.removeChild(pageBreaks[x]);
			}
		},

		generatePdf: function generatePdf () {
			this.$emit('startPagination');
			this.progress = 0;
			this.paginationOfElements();
		},

		paginationOfElements: function paginationOfElements () {
			this.progress = 25;

			/*
				When this props is true, 
				the props paginate-elements-by-height will not be used.
				Instead the pagination process will rely on the elements with a class "html2pdf__page-break"
				to know where to page break, which is automatically done by html2pdf.js
			*/
			if (this.manualPagination) {
				this.progress = 70;
				this.$emit('hasPaginated');
				this.downloadPdf();
				return
			}

			if (!this.hasAlreadyParsed) {
				var parentElement = this.$refs.pdfContent.firstChild;
				var ArrOfContentChildren = Array.from(parentElement.children);
				var childrenHeight = 0;

				/*
					Loop through Elements and add there height with childrenHeight variable.
					Once the childrenHeight is >= this.paginateElementsByHeight, create a div with
					a class named 'html2pdf__page-break' and insert the element before the element
					that will be in the next page
				*/
				for (var childElement of ArrOfContentChildren) {
					// Get The First Class of the element
					var elementFirstClass = childElement.classList[0];
					var isPageBreakClass = elementFirstClass === 'html2pdf__page-break';
					if (isPageBreakClass) {
						childrenHeight = 0;
					} else {
						// Get Element Height
						var elementHeight = childElement.clientHeight;

						// Get Computed Margin Top and Bottom
						var elementComputedStyle = childElement.currentStyle || window.getComputedStyle(childElement);
						var elementMarginTopBottom = parseInt(elementComputedStyle.marginTop) + parseInt(elementComputedStyle.marginBottom);

						// Add Both Element Height with the Elements Margin Top and Bottom
						var elementHeightWithMargin = elementHeight + elementMarginTopBottom;

						if ((childrenHeight + elementHeight) < this.paginateElementsByHeight) {
							childrenHeight += elementHeightWithMargin;
						} else {
							var section = document.createElement('div');
							section.classList.add('html2pdf__page-break');
							parentElement.insertBefore(section, childElement);

							// Reset Variables made the upper condition false
							childrenHeight = elementHeightWithMargin;
						}
					}
				}

				this.progress = 70;

				/*
					Set to true so that if would generate again we wouldn't need
					to parse the HTML to paginate the elements
				*/
				this.hasAlreadyParsed = true;
			} else {
				this.progress = 70;
			}

			this.$emit('hasPaginated');
			this.downloadPdf();
		},

		downloadPdf: async function downloadPdf () {
			// Set Element and Html2pdf.js Options
			var pdfContent = this.$refs.pdfContent;
			var options = this.setOptions();

			this.$emit('beforeDownload', { html2pdf: html2pdf, options: options, pdfContent: pdfContent });

			var html2PdfSetup = html2pdf().set(options).from(pdfContent);
			var pdfBlobUrl = null;

			if (this.previewModal) {
				this.pdfFile = await html2PdfSetup.output('bloburl');
				pdfBlobUrl = this.pdfFile;
			}

			if (this.enableDownload) {
				pdfBlobUrl = await html2PdfSetup.save().output('bloburl');
			}

			if (pdfBlobUrl) {
				var res = await fetch(pdfBlobUrl);
				var blobFile = await res.blob();
				this.$emit('hasDownloaded', blobFile);
			}

			this.progress = 100;
		},

		setOptions: function setOptions () {
			if (this.htmlToPdfOptions !== undefined && this.htmlToPdfOptions !== null) {
				return this.htmlToPdfOptions
			}

			return {
				margin: 0,

				filename: ((this.filename) + ".pdf"),

				image: {
					type: 'jpeg', 
					quality: 0.98
				},

				enableLinks: false,

				html2canvas: {
					scale: this.pdfQuality,
					useCORS: true
				},

				jsPDF: {
					unit: 'in',
					format: this.pdfFormat,
					orientation: this.pdfOrientation
				}
			}
		},

		closePreview: function closePreview () {
			this.pdfFile = null;
		}
	}
};function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    var options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    var hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            var originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            var existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}function createInjectorSSR(context) {
    if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
    }
    if (!context)
        { return function () { }; }
    if (!('styles' in context)) {
        context._styles = context._styles || {};
        Object.defineProperty(context, 'styles', {
            enumerable: true,
            get: function () { return context._renderStyles(context._styles); }
        });
        context._renderStyles = context._renderStyles || renderStyles;
    }
    return function (id, style) { return addStyle(id, style, context); };
}
function addStyle(id, css, context) {
    var group =  css.media || 'default' ;
    var style = context._styles[group] || (context._styles[group] = { ids: [], css: '' });
    if (!style.ids.includes(id)) {
        style.media = css.media;
        style.ids.push(id);
        var code = css.source;
        style.css += code + '\n';
    }
}
function renderStyles(styles) {
    var css = '';
    for (var key in styles) {
        var style = styles[key];
        css +=
            '<style data-vue-ssr-id="' +
                Array.from(style.ids).join(' ') +
                '"' +
                (style.media ? ' media="' + style.media + '"' : '') +
                '>' +
                style.css +
                '</style>';
    }
    return css;
}/* script */
var __vue_script__ = script;

/* template */
var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"vue-html2pdf"},[_vm._ssrNode("<section"+(_vm._ssrClass("layout-container",{
				'show-layout' : _vm.showLayout,
				'unset-all' : !_vm.floatLayout
			}))+">","</section>",[_vm._ssrNode("<section class=\"content-wrapper\""+(_vm._ssrStyle(null,("width: " + _vm.pdfContentWidth + ";"), null))+">","</section>",[_vm._t("pdf-content")],2)]),_vm._ssrNode(" "),_c('transition',{attrs:{"name":"transition-anim"}},[(_vm.pdfFile)?_c('section',{staticClass:"pdf-preview"},[_c('button',{on:{"click":function($event){if($event.target !== $event.currentTarget){ return null; }return _vm.closePreview()}}},[_vm._v("\n\t\t\t\t\t×\n\t\t\t\t")]),_vm._v(" "),_c('iframe',{attrs:{"src":_vm.pdfFile,"width":"100%","height":"100%"}})]):_vm._e()])],2)};
var __vue_staticRenderFns__ = [];

  /* style */
  var __vue_inject_styles__ = function (inject) {
    if (!inject) { return }
    inject("data-v-1fd3ad26_0", { source: ".vue-html2pdf .layout-container[data-v-1fd3ad26]{position:fixed;width:100vw;height:100vh;left:-100vw;top:0;z-index:-9999;background:rgba(95,95,95,.8);display:flex;justify-content:center;align-items:flex-start;overflow:auto}.vue-html2pdf .layout-container.show-layout[data-v-1fd3ad26]{left:0;z-index:9999}.vue-html2pdf .layout-container.unset-all[data-v-1fd3ad26]{all:unset;width:auto;height:auto}.vue-html2pdf .pdf-preview[data-v-1fd3ad26]{position:fixed;width:65%;min-width:600px;height:80vh;top:100px;z-index:9999999;left:50%;transform:translateX(-50%);border-radius:5px;box-shadow:0 0 10px #00000048}.vue-html2pdf .pdf-preview button[data-v-1fd3ad26]{position:absolute;top:-20px;left:-15px;width:35px;height:35px;background:#555;border:0;box-shadow:0 0 10px #00000048;border-radius:50%;color:#fff;display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer}.vue-html2pdf .pdf-preview iframe[data-v-1fd3ad26]{border:0}.vue-html2pdf .transition-anim-enter-active[data-v-1fd3ad26],.vue-html2pdf .transition-anim-leave-active[data-v-1fd3ad26]{transition:opacity .3s ease-in}.vue-html2pdf .transition-anim-enter[data-v-1fd3ad26],.vue-html2pdf .transition-anim-leave-to[data-v-1fd3ad26]{opacity:0}", map: undefined, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__ = "data-v-1fd3ad26";
  /* module identifier */
  var __vue_module_identifier__ = "data-v-1fd3ad26";
  /* functional template */
  var __vue_is_functional_template__ = false;
  /* style inject shadow dom */
  

  
  var __vue_component__ = /*#__PURE__*/normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    undefined,
    createInjectorSSR,
    undefined
  );// Import vue component

// install function executed by Vue.use()
function install(Vue) {
  if (install.installed) { return; }
  install.installed = true;
  Vue.component('VueHtml2pdf', __vue_component__);
}

// Create module definition for Vue.use()
var plugin = {
  install: install,
};

// To auto-install when vue is found
/* global window global */
var GlobalVue = null;
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}
if (GlobalVue) {
  GlobalVue.use(plugin);
}

// Inject install function into component - allows component
// to be registered via Vue.use() as well as Vue.component()
__vue_component__.install = install;

// It's possible to expose named exports when writing components that can
// also be used as directives, etc. - eg. import { RollupDemoDirective } from 'rollup-demo';
// export const RollupDemoDirective = component;
exports.default=__vue_component__;