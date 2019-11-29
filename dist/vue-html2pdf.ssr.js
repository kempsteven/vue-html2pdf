'use strict';Object.defineProperty(exports,'__esModule',{value:true});function _interopDefault(e){return(e&&(typeof e==='object')&&'default'in e)?e['default']:e}var html2pdf=_interopDefault(require('html2pdf.js'));//

var script = {
	props: {
		showLayout: {
			type: Boolean,
			default: false
		},

		splitElementsByHeight: {
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
			progress: 0
		}
	},

	watch: {
		progress: function progress (val) {
			this.$emit('progress', val);
		}
	},

	methods: {
		generatePdf: function generatePdf () {
			this.$emit('hasStartedDownload');

			this.progress = 0;
			
			this.addPageBreakBySplitElementsByHeight();
		},

		addPageBreakBySplitElementsByHeight: function addPageBreakBySplitElementsByHeight () {
			var this$1 = this;

			this.progress = 25;

			if (!this.hasAlreadyParsed) {
				var parentElement = this.$refs.pdfContent.firstChild;
				var ArrOfContentChildren = [].concat( parentElement.children );

				var childrenHeight = 0;

				/*
					Loop through Elements and add there height with childrenHeight variable.
					Once the childrenHeight is >= this.splitElementsByHeight, create a div with
					a class named 'html2pdf__page-break' and insert the element before the element
					that will be in the next page
				*/
				ArrOfContentChildren.forEach(function (childElement, index) {
					// Get Element Height
					var elementHeight = childElement.clientHeight;

					// Get Computed Margin Top and Bottom
					var elementComputedStyle = childElement.currentStyle || window.getComputedStyle(childElement);
					var elementMarginTopBottom = parseInt(elementComputedStyle.marginTop) + parseInt(elementComputedStyle.marginBottom);

					// Add Both Element Height with the Elements Margin Top and Bottom
					var elementHeightWithMargin = elementHeight + elementMarginTopBottom;

					if ((childrenHeight + elementHeight) < this$1.splitElementsByHeight) {
						childrenHeight += elementHeightWithMargin;
					} else {
						var section = document.createElement('div');
						section.classList.add('html2pdf__page-break');
						parentElement.insertBefore(section, childElement);

						// Reset Variables made the upper condition false
						childrenHeight = elementHeightWithMargin;
					}
				});

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

			// Download PDF
			await html2pdf().from(element).set(opt).save();

			this.progress = 100;

			this.$emit('hasDownloaded');
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
var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"generate-img",class:{ 'show-layout' : _vm.showLayout }},[_vm._ssrNode("<button class=\"btn\">\n\t\t\tDownload File\n\t\t</button> "),_vm._ssrNode("<section class=\"content-wrapper\">","</section>",[_vm._t("pdf-content")],2)],2)};
var __vue_staticRenderFns__ = [];

  /* style */
  var __vue_inject_styles__ = function (inject) {
    if (!inject) { return }
    inject("data-v-6619814b_0", { source: ".generate-img[data-v-6619814b]{position:fixed;width:100vw;height:100vh;left:-100vw;top:0;z-index:-9999;background:rgba(95,95,95,.8);display:flex;justify-content:center;align-items:flex-start;overflow:auto}.generate-img .btn[data-v-6619814b]{display:none}.generate-img.show-layout[data-v-6619814b]{left:0;z-index:9999}.generate-img.show-layout .btn[data-v-6619814b]{position:fixed;display:block;left:10px;top:10px;background:#657bdd;color:#fff;padding:15px 25px;border:0;border-radius:5px;cursor:pointer}", map: undefined, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__ = "data-v-6619814b";
  /* module identifier */
  var __vue_module_identifier__ = "data-v-6619814b";
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