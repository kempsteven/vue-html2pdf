'use strict';Object.defineProperty(exports,'__esModule',{value:true});function _interopDefault(e){return(e&&(typeof e==='object')&&'default'in e)?e['default']:e}var html2pdf=_interopDefault(require('html2pdf.js'));//

var script = {
	props: {
		showLayout: {
			type: Boolean,
			default: false
		},

		previewInNewtab: {
			type: Boolean,
			default: false
		},

		paginateElementsByHeight: {
			type: Number,
			default: 0,
			required: true
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
		}
	},

	data: function data () {
		return {
			hasAlreadyParsed: false,
			progress: 0,
			pdfWindow: null
		}
	},

	watch: {
		progress: function progress (val) {
			this.$emit('progress', val);
		},

		paginateElementsByHeight: function paginateElementsByHeight () {
			this.resetPagination();
		}
	},

	methods: {
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
			this.$emit('hasStartedDownload');

			this.progress = 0;
			
			this.paginationOfElements();
		},

		paginationOfElements: function paginationOfElements () {
			this.progress = 25;

			if (!this.hasAlreadyParsed) {
				var parentElement = this.$refs.pdfContent.firstChild;
				var ArrOfContentChildren = [].concat( parentElement.children );

				var childrenHeight = 0;

				/*
					Loop through Elements and add there height with childrenHeight variable.
					Once the childrenHeight is >= this.paginateElementsByHeight, create a div with
					a class named 'html2pdf__page-break' and insert the element before the element
					that will be in the next page
				*/
				for (var childElement of parentElement.children) {
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

				this.progress = 70;

				/*
					Set to true so that if would generate again we wouldn't need
					to parse the HTML to paginate the elements
				*/
				this.hasAlreadyParsed = true;
			}

			this.waitForHtmlRender();
		},

		waitForHtmlRender: async function waitForHtmlRender () {
			var this$1 = this;

			// Wait for Contents to Render, while also changing
			// the progress
			var hasWaitedForRender = false;

			while (!hasWaitedForRender) {
				await new Promise(function (resolve, reject) {
					setTimeout(function () {
						if (this$1.progress < 90) {
							this$1.progress += 5;
							resolve();
						} else {
							hasWaitedForRender = true;
							resolve();
						}
					}, 300);
				});
			}

			this.downloadPdf();
		},

		downloadPdf: async function downloadPdf () {
			// Set Element and Html2pdf.js Options
			var element = this.$refs.pdfContent;

			var opt = {
				margin: 0,

				filename: ((this.filename) + ".pdf"),

				image: {
					type: 'jpeg', 
					quality: 0.98
				},

				html2canvas: {
					scale: this.pdfQuality
				},

				jsPDF: {
					unit: 'in',
					format: this.pdfFormat,
					orientation: 'portrait'
				}
			};


			if (this.previewInNewtab) {
				this.setNewTab();

				var pdfBlobUrl = await html2pdf().set(opt).from(element).output('bloburl');

				this.setPdfInNewTab(pdfBlobUrl);
			} else {
				// Download PDF
				await html2pdf().set(opt).from(element).save();
			}

			this.progress = 100;

			this.$emit('hasDownloaded');
		},

		setNewTab: function setNewTab () {
			this.pdfWindow = window.open('', '_blank');

			this.pdfWindow.document.write("\n\t\t\t\t<html>\n\t\t\t\t\t<head>\n\t\t\t\t\t\t<title>\n\t\t\t\t\t\t\tVue HTML2PDF - PDF Preview\n\t\t\t\t\t\t</title>\n\n\t\t\t\t\t\t<style>\n\t\t\t\t\t\t\t@keyframes animate-rotate {\n\t\t\t\t\t\t\t\t0% {\n\t\t\t\t\t\t\t\t\ttransform: rotate(0deg);\n\t\t\t\t\t\t\t\t}\n\n\t\t\t\t\t\t\t\t50% {\n\t\t\t\t\t\t\t\t\ttransform: rotate(180deg);\n\t\t\t\t\t\t\t\t\topacity: .35;\n\t\t\t\t\t\t\t\t}\n\n\t\t\t\t\t\t\t\t100% {\n\t\t\t\t\t\t\t\t\ttransform: rotate(360deg);\n\t\t\t\t\t\t\t\t}   \n\t\t\t\t\t\t\t}\n\n\t\t\t\t\t\t\t@keyframes appear {\n\t\t\t\t\t\t\t\t0% {\n\t\t\t\t\t\t\t\t\topacity: 0;\n\t\t\t\t\t\t\t\t}\n\n\t\t\t\t\t\t\t\t100% {\n\t\t\t\t\t\t\t\t\topacity: 1;\n\t\t\t\t\t\t\t\t}   \n\t\t\t\t\t\t\t}\n\n\t\t\t\t\t\t\tbody {\n\t\t\t\t\t\t\t\tmargin: 0px;\n\t\t\t\t\t\t\t\tdisplay: flex;\n\t\t\t\t\t\t\t\tjustify-content: center;\n\t\t\t\t\t\t\t\talign-items: center;\n\t\t\t\t\t\t\t\tbackground: #555;\n\t\t\t\t\t\t\t\tcolor: #fff;\n\t\t\t\t\t\t\t\toverflow: hidden;\n\t\t\t\t\t\t\t\tfont-family: 'Avenir', Helvetica, Arial, sans-serif;\n\t\t\t\t\t\t\t}\n\n\t\t\t\t\t\t\th3 {\n\t\t\t\t\t\t\t\tmargin: 0;\n\t\t\t\t\t\t\t\tdisplay: flex;\n\t\t\t\t\t\t\t\talign-items: center;\n\t\t\t\t\t\t\t}\n\n\t\t\t\t\t\t\th3 .loading {\n\t\t\t\t\t\t\t\tborder-radius: 50%;\n\t\t\t\t\t\t\t\twidth: 27px;\n\t\t\t\t\t\t\t\theight: 27px;\n\t\t\t\t\t\t\t\tborder-top: 10px solid rgba(131, 220, 202,0.1);\n\t\t\t\t\t\t\t\tborder-right: 10px solid rgba(131, 220, 202,0.3);\n\t\t\t\t\t\t\t\tborder-bottom: 10px solid rgba(131, 220, 202,0.5);\n\t\t\t\t\t\t\t\tborder-left: 10px solid rgba(131, 220, 202,0.8);;\n\t\t\t\t\t\t\t\tanimation: animate-rotate infinite linear 1s;\n\t\t\t\t\t\t\t\tmargin-right: 15px;\n\t\t\t\t\t\t\t}\n\n\t\t\t\t\t\t\tiframe {\n\t\t\t\t\t\t\t\twidth: 100vw;\n\t\t\t\t\t\t\t\theight: 100vh;\n\t\t\t\t\t\t\t\tborder: 0;\n\t\t\t\t\t\t\t\topacity: 0;\n\t\t\t\t\t\t\t\tanimation: appear 0.5s forwards 0.4s;\n\t\t\t\t\t\t\t}\n\t\t\t\t\t\t</style>\n\t\t\t\t\t</head>\n\n\t\t\t\t\t<body>\n\t\t\t\t\t\t<h3>\n\t\t\t\t\t\t\t<div class=\"loading\"></div>\n\n\t\t\t\t\t\t\tPreview Loading ...\n\t\t\t\t\t\t</h3>\n\t\t\t\t\t</body>\n\t\t\t\t</html>\n\t\t\t");
		},

		setPdfInNewTab: function setPdfInNewTab (pdfBlobUrl) {
			// Remove Loading Label
			this.pdfWindow.document.getElementsByTagName("h3")[0].remove();

			this.pdfWindow.document.write(("\n\t\t\t\t<iframe\n\t\t\t\t\twidth='100%'\n\t\t\t\t\theight='100%'\n\t\t\t\t\tsrc='" + pdfBlobUrl + "'\n\t\t\t\t></iframe>\n\t\t\t"));
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
var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"generate-img",class:{
			'show-layout' : _vm.showLayout
		}},[_vm._ssrNode("<section class=\"content-wrapper\">","</section>",[_vm._t("pdf-content")],2)])};
var __vue_staticRenderFns__ = [];

  /* style */
  var __vue_inject_styles__ = function (inject) {
    if (!inject) { return }
    inject("data-v-fc6fb1b0_0", { source: ".generate-img[data-v-fc6fb1b0]{position:fixed;width:100vw;height:100vh;left:-100vw;top:0;z-index:-9999;background:rgba(95,95,95,.8);display:flex;justify-content:center;align-items:flex-start;overflow:auto}.generate-img.show-layout[data-v-fc6fb1b0]{left:0;z-index:9999}", map: undefined, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__ = "data-v-fc6fb1b0";
  /* module identifier */
  var __vue_module_identifier__ = "data-v-fc6fb1b0";
  /* functional template */
  var __vue_is_functional_template__ = false;
  /* style inject shadow dom */
  

  
  var __vue_component__ = normalizeComponent(
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