<template>
    <div
		class="generate-img"
		:class="{
			'show-layout' : showLayout
		}"
	>
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

		paginateElementsByHeight: {
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
			progress: 0,
			pdfWindow: null
		}
	},

	watch: {
		progress (val) {
			this.$emit('progress', val)
		},

		paginateElementsByHeight () {
			this.resetPagination()
		}
	},

	methods: {
		resetPagination () {
			const parentElement = this.$refs.pdfContent.firstChild
			const pageBreaks = parentElement.getElementsByClassName('html2pdf__page-break')
			const pageBreakLength = pageBreaks.length - 1
			
			if (pageBreakLength === -1) return

			this.hasAlreadyParsed = false

			// Remove All Page Break (For Pagination)
			for (let x = pageBreakLength; x >= 0; x--) {
				pageBreaks[x].parentNode.removeChild(pageBreaks[x])
			}
		},

		generatePdf () {
			this.$emit('hasStartedDownload')

			this.progress = 0
			
			this.paginationOfElements()
		},

		paginationOfElements () {
			this.progress = 25

			if (!this.hasAlreadyParsed) {
				const parentElement = this.$refs.pdfContent.firstChild
				const ArrOfContentChildren = [...parentElement.children]

				let childrenHeight = 0

				/*
					Loop through Elements and add there height with childrenHeight variable.
					Once the childrenHeight is >= this.paginateElementsByHeight, create a div with
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

					if ((childrenHeight + elementHeight) < this.paginateElementsByHeight) {
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
				this.setNewTab()

				const pdfBlobUrl = await html2pdf().set(opt).from(element).output('bloburl')

				this.setPdfInNewTab(pdfBlobUrl)
			} else {
				// Download PDF
				await html2pdf().set(opt).from(element).save()
			}

			this.progress = 100

			this.$emit('hasDownloaded')
		},

		setNewTab () {
			this.pdfWindow = window.open('', '_blank')

			this.pdfWindow.document.write(`
				<html>
					<head>
						<title>
							Vue HTML2PDF - PDF Preview
						</title>

						<style>
							@keyframes animate-rotate {
								0% {
									transform: rotate(0deg);
								}

								50% {
									transform: rotate(180deg);
									opacity: .35;
								}

								100% {
									transform: rotate(360deg);
								}   
							}

							@keyframes appear {
								0% {
									opacity: 0;
								}

								100% {
									opacity: 1;
								}   
							}

							body {
								margin: 0px;
								display: flex;
								justify-content: center;
								align-items: center;
								background: #555;
								color: #fff;
								overflow: hidden;
								font-family: 'Avenir', Helvetica, Arial, sans-serif;
							}

							h3 {
								margin: 0;
								display: flex;
								align-items: center;
							}

							h3 .loading {
								border-radius: 50%;
								width: 27px;
								height: 27px;
								border-top: 10px solid rgba(131, 220, 202,0.1);
								border-right: 10px solid rgba(131, 220, 202,0.3);
								border-bottom: 10px solid rgba(131, 220, 202,0.5);
								border-left: 10px solid rgba(131, 220, 202,0.8);;
								animation: animate-rotate infinite linear 1s;
								margin-right: 15px;
							}

							iframe {
								width: 100vw;
								height: 100vh;
								border: 0;
								opacity: 0;
								animation: appear 0.5s forwards 0.4s;
							}
						</style>
					</head>

					<body>
						<h3>
							<div class="loading"></div>

							Preview Loading ...
						</h3>
					</body>
				</html>
			`)
		},

		setPdfInNewTab (pdfBlobUrl) {
			// Remove Loading Label
			this.pdfWindow.document.getElementsByTagName("h3")[0].remove()

			this.pdfWindow.document.write(`
				<iframe
					width='100%'
					height='100%'
					src='${ pdfBlobUrl }'
				></iframe>
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

	&.show-layout {
		left: 0vw;
		z-index: 9999;
	}
}
</style>
