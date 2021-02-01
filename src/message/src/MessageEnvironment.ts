import { h, defineComponent, ref, onMounted, PropType } from 'vue'
import { NFadeInExpandTransition } from '../../_internal'
import NMessage from './Message'
import { messageProps } from './message-props'

export default defineComponent({
  name: 'MessageEnvironment',
  props: {
    ...messageProps,
    duration: {
      type: Number,
      default: 3000
    },
    onAfterLeave: {
      type: Function,
      default: undefined
    },
    internalKey: {
      type: String,
      required: true
    },
    // private
    onInternalAfterLeave: {
      type: Function as PropType<(key: string) => void>,
      default: undefined
    },
    // deprecated
    onHide: {
      type: Function,
      default: undefined
    },
    onAfterHide: {
      type: Function,
      default: undefined
    }
  },
  setup (props) {
    const timerIdRef = ref<number | null>(null)
    const showRef = ref<boolean>(true)
    onMounted(() => {
      const { duration } = props
      if (duration) {
        timerIdRef.value = window.setTimeout(hide, duration)
      }
    })
    function hide (): void {
      const { value: timerId } = timerIdRef
      const { onHide } = props
      showRef.value = false
      if (timerId) {
        window.clearTimeout(timerId)
      }
      // deprecated
      if (onHide) onHide()
    }
    function handleClose (): void {
      const { onClose } = props
      if (onClose) onClose()
      hide()
    }
    function handleAfterLeave (): void {
      const {
        onAfterLeave,
        onInternalAfterLeave,
        onAfterHide,
        internalKey
      } = props
      if (onAfterLeave) onAfterLeave()
      if (onInternalAfterLeave) onInternalAfterLeave(internalKey)
      // deprecated
      if (onAfterHide) onAfterHide()
    }
    // deprecated
    function deactivate (): void {
      hide()
    }
    return {
      show: showRef,
      hide,
      handleClose,
      handleAfterLeave,
      deactivate
    }
  },
  render () {
    return h(
      NFadeInExpandTransition,
      {
        appear: true,
        onAfterLeave: this.handleAfterLeave
      },
      {
        default: () => [
          this.show
            ? h(NMessage, {
              content: this.content,
              type: this.type,
              icon: this.icon,
              closable: this.closable,
              onClose: this.handleClose
            })
            : null
        ]
      }
    )
  }
})
