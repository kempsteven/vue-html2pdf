import html2pdf from 'html2pdf.js';

//

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
				for (var childElement of parentElement.children) {
					// Get Element Height
					var elementHeight = childElement.clientHeight;

					// Get Computed Margin Top and Bottom
					var elementComputedStyle = childElement.currentStyle || window.getComputedStyle(childElement);
					var elementMarginTopBottom = parseInt(elementComputedStyle.marginTop) + parseInt(elementComputedStyle.marginBottom);

					// Add Both Element Height with the Elements Margin Top and Bottom
					var elementHeightWithMargin = elementHeight + elementMarginTopBottom;

					if ((childrenHeight + elementHeight) < this.splitElementsByHeight) {
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

			// Download PDF
			await html2pdf().from(element).set(opt).save();

			this.progress = 100;

			this.$emit('hasDownloaded');
		}
	}
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
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
}

var isOldIE = typeof navigator !== 'undefined' &&
    /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());
function createInjector(context) {
    return function (id, style) { return addStyle(id, style); };
}
var HEAD;
var styles = {};
function addStyle(id, css) {
    var group = isOldIE ? css.media || 'default' : id;
    var style = styles[group] || (styles[group] = { ids: new Set(), styles: [] });
    if (!style.ids.has(id)) {
        style.ids.add(id);
        var code = css.source;
        if (css.map) {
            // https://developer.chrome.com/devtools/docs/javascript-debugging
            // this makes source maps inside style tags work properly in Chrome
            code += '\n/*# sourceURL=' + css.map.sources[0] + ' */';
            // http://stackoverflow.com/a/26603875
            code +=
                '\n/*# sourceMappingURL=data:application/json;base64,' +
                    btoa(unescape(encodeURIComponent(JSON.stringify(css.map)))) +
                    ' */';
        }
        if (!style.element) {
            style.element = document.createElement('style');
            style.element.type = 'text/css';
            if (css.media)
                { style.element.setAttribute('media', css.media); }
            if (HEAD === undefined) {
                HEAD = document.head || document.getElementsByTagName('head')[0];
            }
            HEAD.appendChild(style.element);
        }
        if ('styleSheet' in style.element) {
            style.styles.push(code);
            style.element.styleSheet.cssText = style.styles
                .filter(Boolean)
                .join('\n');
        }
        else {
            var index = style.ids.size - 1;
            var textNode = document.createTextNode(code);
            var nodes = style.element.childNodes;
            if (nodes[index])
                { style.element.removeChild(nodes[index]); }
            if (nodes.length)
                { style.element.insertBefore(textNode, nodes[index]); }
            else
                { style.element.appendChild(textNode); }
        }
    }
}

/* script */
var __vue_script__ = script;

/* template */
var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"generate-img",class:{ 'show-layout' : _vm.showLayout }},[_c('button',{staticClass:"btn",on:{"click":function($event){return _vm.generatePdf()}}},[_vm._v("\n\t\t\tDownload File\n\t\t")]),_vm._v(" "),_c('section',{ref:"pdfContent",staticClass:"content-wrapper"},[_vm._t("pdf-content")],2)])};
var __vue_staticRenderFns__ = [];

  /* style */
  var __vue_inject_styles__ = function (inject) {
    if (!inject) { return }
    inject("data-v-32735df0_0", { source: ".generate-img[data-v-32735df0]{position:fixed;width:100vw;height:100vh;left:-100vw;top:0;z-index:-9999;background:rgba(95,95,95,.8);display:flex;justify-content:center;align-items:flex-start;overflow:auto}.generate-img .btn[data-v-32735df0]{display:none}.generate-img.show-layout[data-v-32735df0]{left:0;z-index:9999}.generate-img.show-layout .btn[data-v-32735df0]{position:fixed;display:block;left:10px;top:10px;background:#657bdd;color:#fff;padding:15px 25px;border:0;border-radius:5px;cursor:pointer}", map: undefined, media: undefined });

  };
  /* scoped */
  var __vue_scope_id__ = "data-v-32735df0";
  /* module identifier */
  var __vue_module_identifier__ = undefined;
  /* functional template */
  var __vue_is_functional_template__ = false;
  /* style inject SSR */
  
  /* style inject shadow dom */
  

  
  var __vue_component__ = normalizeComponent(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    false,
    createInjector,
    undefined,
    undefined
  );

// Import vue component

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

export default __vue_component__;
