import $ from 'jquery'

const defaults = {
  container: 'body',
  spacing: 20,
  actions: {
    next: {
      text: 'Next',
      class: ''
    },
    finish: {
      text: 'Finish',
      class: ''
    }
  },
  entries: [
    {
      selector: '#example',
      text: 'this is example',
      onEnter() { console.log('enter') },
      onExit() { console.log('exit') },
    }
  ]
}

const tooltipTemplate = `
<div class="pageintro-tooltip">
  <div class="pageintro-text"></div>
  <ul class="pageintro-nav"></ul>
  <div class="pageintro-actions"></div>
</div>
`
const holeTemplate = '<div class="pageintro-hole"></div>'
const overlayTemplate = '<div class="pageintro-overlay"></div>'

class PageIntro {
  constructor(options) {
    this.data = $.extend({}, defaults, options)
    this.$container = $(this.data.container)
    this.$hole = $(holeTemplate).hide()
    this.$overlay = $(overlayTemplate).hide()
    this.$tooltip = $(tooltipTemplate).hide()
    this.$nav = this.$tooltip.find('.pageintro-nav')
    this.$overlay.append(this.$hole, this.$tooltip)
    this.$container.append(this.$overlay)
    this.data.entries.forEach((entry, i) => {
      const $li = $('<li/>').on('click', i, (e) => this.select(e.data))
      entry.$target = $(entry.selector)
      this.$nav.append($li)
    })

    const actions = this.data.actions
    const $actions = this.$tooltip.find('.pageintro-actions')
    const $btnNext = $(`<a class="btn-next">${actions.next.text}</a>`)
    const $btnFinish = $(`<a class="btn-finish">${actions.finish.text}</a>`)

    $btnNext.addClass(actions.next.class).on('click', ()=> this.select(this.data.step + 1))
    $btnFinish.addClass(actions.finish.class).on('click', () => this.finish())
    $actions.append($btnNext, $btnFinish)
  }

  getPosition($el) {
    const position = $el.offset()
    const rootPosition = $(this.data.container).offset()

    return {
      left: position.left - rootPosition.left,
      top: position.top - rootPosition.top
    }
  }

  setTooltipPosition(position, size) {
    const $tooltip = this.$tooltip
    const selfWidth = $tooltip.outerWidth()
    const selfHeight = $tooltip.outerHeight()
    const spacing = this.data.spacing
    const methods = {
      left(force) {
        const height = Math.min($(window).height(), size.height)
        const result = {
          left: position.left - selfWidth - spacing,
          top: position.top + (height - selfHeight) / 2
        }

        if (force) {
          if (result.left < 0) {
            result.left = 0
          }
        } else {
          if (result.left < 0) {
            return false
          }
          if (result.top + selfHeight > $(window).height()) {
            return false
          }
        }

        if (result.top < 0) {
          result.top = spacing
        }

        $tooltip.css(result)
        $tooltip.addClass('direction-left')
        return true
      },
      right(force) {
        const height = Math.min($(window).height(), size.height)
        const result = {
          left: position.left + size.width + spacing,
          top: position.top + (height - selfHeight) / 2
        }

        if (force) {
          if (result.left + selfWidth > $(window).width()) {
            result.left = $(window).width() - selfWidth
          }
        } else {
          if (result.left + selfWidth > $(window).width()) {
            return false
          }
          if (result.top + selfHeight > $(window).height()) {
            return false
          }
        }
        if (result.top < 0) {
          result.top = spacing
        }
        $tooltip.css(result)
        $tooltip.addClass('direction-right')
        return true
      },
      top(force) {
        const result = {
          left: position.left + (size.width - selfWidth) / 2,
          top: position.top - selfHeight - spacing
        }

        if (force) {
          if (result.top < 0) {
            result.top = 0
          }
        } else {
          if (result.top < 0) {
            return false
          }
        }

        $tooltip.css(result)
        $tooltip.addClass('direction-top')
        return true
      },
      bottom(force) {
        const result = {
          left: position.left + (size.width - selfWidth) / 2,
          top: position.top + size.height + spacing
        }

        if (force) {
          if (result.top + selfHeight > $(window).height()) {
            result.top = $(window).height() - selfHeight
          }
        } else {
          if (result.top + selfHeight > $(window).height()) {
            return false
          }
        }

        $tooltip.css(result)
        $tooltip.addClass('direction-bottom')
        return true
      }
    }

    if (Object.keys(methods).some(key => methods[key]())) {
      return
    }
    methods.left(true)
  }

  select(num) {
    let entry

    if (typeof this.data.step !== 'undefined' && num !== this.data.step) {
      entry = this.data.entries[this.data.step]
      if (entry.onExit) {
        entry.onExit()
      }
    }
    entry = this.data.entries[num]
    if (entry.onEnter && num != this.data.step) {
      entry.onEnter()
    }
    this.data.step = num
    this.$tooltip.find('.pageintro-text').text(entry.text)
    this.$nav.find('li').eq(num).addClass('active').siblings().removeClass('active')
    if (num < this.data.entries.length - 1) {
      this.$tooltip.find('.btn-finish').hide()
      this.$tooltip.find('.btn-next').show()
    } else {
      this.$tooltip.find('.btn-finish').show()
      this.$tooltip.find('.btn-next').hide()
    }

    const position = this.getPosition(entry.$target)
    const size = {
      width: entry.$target.outerWidth(),
      height: entry.$target.outerHeight()
    }

    this.setTooltipPosition(position, size)
    this.$hole.css({ ...position, ...size })
  }

  update() {
    this.select(this.data.step)
  }

  start() {
    this.update = this.update.bind(this)
    this.$container.addClass('pageintro')
    this.$tooltip.show()
    this.$overlay.show()
    this.$hole.show()
    this.select(0)
    $(window).on('resize', this.update)
  }

  finish() {
    this.$tooltip.hide()
    this.$overlay.hide()
    this.$hole.hide()
    this.$container.removeClass('pageintro')
    $(window).off('resize', this.update)
  }
}

export default PageIntro
