<template>
  <div>
    <div style="display: flex; justify-content: space-between">
      <v-container style="width: 50%" :class="editorClass">
        <textarea ref="editor"></textarea>
      </v-container>
      <v-container style="width: 50%">
        <textarea ref="target"></textarea>
      </v-container>
    </div>
  </div>
</template>

<script>

import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/monokai.css';
import 'codemirror/mode/clike/clike';
import 'codemirror/mode/python/python';
import 'codemirror/addon/scroll/scrollpastend';

export default {
  name: 'EditorArea',
  props: ['targetText', 'isTyping', 'lang'],
  data() {
    return {
      cpm: 0,
      acc: 1,
      typing: this.isTyping,
      updateTimer: null,
      startTime: 0,
      mark: null,
      editorClass: '',
      cursorDefault: null,
      isBad: null,
      finished: false,
      oneskip: false,
    };
  },
  methods: {
    switchTyping() {
      if (!this.typing) {
        this.editor.setValue('');
        this.editor.focus();
        this.startTime = new Date();
        this.isBad = new Array(0);
        this.isBadSum = 0;
      } else {
        this.typing = false;
        this.updateStats();
        clearInterval(this.updateTimer);
      }
    },
    onChange() {
      const lcp = this.getLCP(this.editor.getValue(), this.target.getValue());
      for (let i = Math.max(lcp, this.editor.getValue().length - 1);
        i < this.editor.getValue().length; i += 1) {
        if (!(i in this.isBad)) {
          this.isBad[i] = 0;
        }
        this.isBadSum += 1 - this.isBad[i];
        this.isBad[i] = 1;
      }
      this.updateMark();
      if (this.editor.getValue() === this.target.getValue()) {
        this.typing = false;
        this.finished = true;
        this.updateStats();
        clearInterval(this.updateTimer);
      }
      this.scrollIntoMiddle();
    },
    updateStats() {
      const lcp = this.getLCP(this.editor.getValue(), this.target.getValue());
      this.updateCPM(lcp);
      this.updateAcc();
    },
    beforeChange(...[, changeObj]) {
      if (this.oneskip) {
        this.oneskip = false;
        return;
      }
      if (changeObj.origin === 'paste') {
        changeObj.cancel();
        return;
      }
      if (!this.typing) {
        this.typing = true;
        this.finished = false;
        this.updateTimer = setInterval(this.updateStats, 333);
        this.startTime = new Date();
        this.isBad = new Array(0);
        this.editor.setValue('');
        this.isBadSum = 0;
      }
    },
    scrollIntoMiddle() {
      const cursorPos = this.editor.cursorCoords(false, 'local');
      const defPos = this.editor.cursorCoords({ line: 0, ch: 0 }, 'local');
      const winInfo = this.editor.getScrollInfo();
      const top = (cursorPos.top - defPos.top) - winInfo.clientHeight / 2;
      this.editor.scrollTo(null, top);
      this.target.scrollTo(null, top);
    },
    getLCP(s1, s2) {
      let ans = 0;
      while (ans < s1.length && ans < s2.length && s1[ans] === s2[ans]) {
        ans += 1;
      }
      return ans;
    },
    getLineCh(n) {
      let curLine = 0;
      let curPos = 0;
      const code = this.editor.getValue();
      for (let i = 0; i < n; i += 1) {
        if (code[i] === '\n') {
          curLine += 1;
          curPos = 0;
        } else {
          curPos += 1;
        }
      }
      return { line: curLine, ch: curPos };
    },
    updateMark() {
      if (this.mark !== null) {
        this.mark.clear();
      }
      const length = this.getLCP(this.editor.getValue(), this.target.getValue());
      this.mark = this.editor.markText(this.getLineCh(length),
        this.getLineCh(this.editor.getValue().length),
        { className: 'redbg' });
      if (this.editor.getValue() === this.target.getValue()) {
        this.editorClass = 'greenbg';
      } else {
        this.editorClass = '';
      }
    },
    updateCPM(lcp) {
      const curTime = new Date();
      if ((curTime - this.startTime) > 1) {
        this.cpm = (lcp * 1000 * 60) / (curTime - this.startTime);
      }
    },
    updateAcc() {
      const len = Math.max(this.editor.getValue().length, this.isBad.length);
      if (len === 0) {
        this.acc = 1;
        return;
      }
      this.acc = (len - this.isBadSum) / len;
    },
    init() {
      this.cpm = 0;
      this.acc = 0;
      this.startTime = 0;
      this.oneskip = true;
      this.editor.setValue('');
      this.target.setValue(this.targetText);
      this.$emit('setCPM', this.cpm);
      this.$emit('setACC', this.acc);
      this.finished = false;
    },
    getMode() {
      if (this.lang === 'c++') {
        return 'text/x-c++src';
      }
      if (this.lang === 'python') {
        return 'text/x-python';
      }
      return undefined;
    },
  },
  watch: {
    typing() {
      this.$emit('setTyping', this.typing);
    },
    cpm() {
      this.$emit('setCPM', this.cpm);
    },
    acc() {
      this.$emit('setACC', this.acc);
    },
    targetText() {
      this.target.setValue(this.targetText);
    },
    lang() {
      this.oneskip = true;
      this.editor.setOption('mode', this.getMode());
      this.editor.setValue('');
      this.target.setOption('mode', this.getMode());
    },
  },
  mounted() {
    const cmOptions = {
      mode: this.getMode(),
      theme: 'monokai',
      tabSize: 4,
      indentWithTabs: true, // change to false in case we switch to spaces again
      smartIndent: true,
      indentUnit: 4,
      scrollPastEnd: true,
      lineNumbers: true,
    };
    this.editor = CodeMirror.fromTextArea(this.$refs.editor, cmOptions);
    this.editor.on('beforeChange', this.beforeChange);
    this.editor.on('change', this.onChange);
    cmOptions.readOnly = true;
    this.target = CodeMirror.fromTextArea(this.$refs.target, cmOptions);
    this.init();
  },
};
</script>

<style>

.redbg {
  background-color: #a01f1f;
}

.greenbg .CodeMirror, .greenbg .CodeMirror-gutter {
  background-color: #005a00 !important;
}

.CodeMirror {
  height: 65vh;
}

.CodeMirror-vscrollbar {
  display: block !important;
  z-index: 3;
  bottom: 0;
}

.CodeMirror-linenumber {
  font-size: 0.85rem;
  padding-top: 2px;
  margin-left: -3px;
}

.CodeMirror-linenumbers {
  min-width: 35px !important;
}

</style>
