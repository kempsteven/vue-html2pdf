<template>
    <div class="generate-img" :class="{ 'show-layout' : showLayout }">
		<button class="btn" @click="generatePdf()">
			Download File
		</button>

		<section class="content-wrapper" ref="pdfContent">
			<slot name="pdf-content"/>
		</section>
    </div>
</template>
<script>
import html2pdf from 'html2pdf.js'

export default {
	props: {
		showLayout: {
			type: Boolean,
			default: false
		},

		previewInNewtab: {
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
			default: `${new Date().getTime()}`
		},

		pdfQuality: {
			type: Number,
			default: 2,
		},

		pdfFormat: {
			default: 'a4',
		}
	},

	data () {
		return {
			hasAlreadyParsed: false,
			progress: 0
		}
	},

	watch: {
		progress (val) {
			this.$emit('progress', val)
		}
	},

	methods: {
		generatePdf () {
			this.$emit('hasStartedDownload')

			this.progress = 0
			
			this.addPageBreakBySplitElementsByHeight()
		},

		addPageBreakBySplitElementsByHeight () {
			this.progress = 25

			if (!this.hasAlreadyParsed) {
				const parentElement = this.$refs.pdfContent.firstChild
				const ArrOfContentChildren = [...parentElement.children]

				let childrenHeight = 0

				/*
					Loop through Elements and add there height with childrenHeight variable.
					Once the childrenHeight is >= this.splitElementsByHeight, create a div with
					a class named 'html2pdf__page-break' and insert the element before the element
					that will be in the next page
				*/
				for (const childElement of parentElement.children) {
					// Get Element Height
					const elementHeight = childElement.clientHeight

					// Get Computed Margin Top and Bottom
					const elementComputedStyle = childElement.currentStyle || window.getComputedStyle(childElement)
					const elementMarginTopBottom = parseInt(elementComputedStyle.marginTop) + parseInt(elementComputedStyle.marginBottom)

					// Add Both Element Height with the Elements Margin Top and Bottom
					const elementHeightWithMargin = elementHeight + elementMarginTopBottom

					if ((childrenHeight + elementHeight) < this.splitElementsByHeight) {
						childrenHeight += elementHeightWithMargin
					} else {
						const section = document.createElement('div')
						section.classList.add('html2pdf__page-break')
						parentElement.insertBefore(section, childElement)

						// Reset Variables made the upper condition false
						childrenHeight = elementHeightWithMargin
					}
				}

				this.progress = 70

				/*
					Set to true so that if would generate again we wouldn't need
					to parse the HTML to paginate the elements
				*/
				this.hasAlreadyParsed = true
			}

			this.waitForHtmlRender()
		},

		async waitForHtmlRender () {
			// Wait for Contents to Render, while also changing
			// the progress
			let hasWaitedForRender = false

			while (!hasWaitedForRender) {
				await new Promise((resolve, reject) => {
					setTimeout(() => {
						if (this.progress < 90) {
							this.progress += 5
							resolve()
						} else {
							hasWaitedForRender = true
							resolve()
						}
					}, 300)
				})
			}

			this.downloadPdf()
		},

		async downloadPdf () {
			// Set Element and Html2pdf.js Options
			const element = this.$refs.pdfContent

			const opt = {
				margin: 0,

				filename: `${this.filename}.pdf`,

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
			}


			if (this.previewInNewtab) {
				await html2pdf().from(element).toPdf().get('pdf').then((pdf) => {
					this.openInNewTab(pdf.output('bloburl'))
				})
			} else {
				// Download PDF
				await html2pdf().from(element).set(opt).save()
			}

			this.progress = 100

			this.$emit('hasDownloaded')
		},

		openInNewTab (pdfBlobUrl) {
			const pdfWindow = window.open('')

			pdfWindow.document.write(`
				<html
					<head>
						<title>
							Vue HTML2PDF - PDF Preview
						</title>

						<style>
							body{margin: 0px;}
							iframe{border-width: 0px;}
						</style>
					</head>

					<body>
						<iframe
							width='100%'
							height='100%'
							src='${ pdfBlobUrl }'
						></iframe>
					</body>
				</html>
			`)
		}
	}
}
</script>

<style lang="scss" scoped>
.generate-img {
	position: fixed;
	width: 100vw;
	height: 100vh;
	left: -100vw;
	top: 0;
	z-index: -9999;
	background: rgba(95, 95, 95, 0.8);
	display: flex;
	justify-content: center;
	align-items: flex-start;
	overflow: auto;

	.btn {
		display: none;
	}

	&.show-layout {
		left: 0vw;
		z-index: 9999;

		.btn {
			position: fixed;
			display: block;
			left: 10px;
			top: 10px;
			background: #657bdd;
			color: #fff;
			padding: 15px 25px;
			border: 0;
			border-radius: 5px;
			cursor: pointer;
		}
	}
}
</style>
