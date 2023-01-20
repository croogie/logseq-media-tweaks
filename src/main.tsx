import "@logseq/libs";

import React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

import { logseq as PL } from "../package.json";
import { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin'

// @ts-expect-error
const css = (t, ...args) => String.raw(t, ...args);

const pluginId = PL.id;
let lastAudioUsed;

const getAudioElement = () => {
  const audios = parent.document.querySelectorAll('audio')
  const audioArr = Array.prototype.slice.call(audios).filter(a => !a.paused)

  if (audioArr.length) {
    lastAudioUsed = audioArr[0]
  }

  return lastAudioUsed
}
const changeAudioTime = (mediaPlayer, by = 5) => {
  if (!mediaPlayer?.currentTime) {
    return
  }

  mediaPlayer.currentTime += by
}
function main() {
  console.info(`#${pluginId}: MAIN`);
  const root = ReactDOM.createRoot(document.getElementById("app")!);

  registerKeyboardShortcuts()

  const listenToPlayEvent = (e) => {
    lastAudioUsed = e.target
    console.log('Audio has started playing', e.target);
  }

  const audioObserver = new MutationObserver((records) => {
    records.forEach((record) => {
      if (record.addedNodes.length) {

        Array.prototype.slice.call(record.addedNodes).forEach(node => {
          const audioNodes = node.querySelectorAll('audio')

          if (audioNodes.length) {
            console.log(`Dodano ${audioNodes.length} AUDIO`);
            for (const audioNode of audioNodes) {
              audioNode.addEventListener('play', listenToPlayEvent)
            }
          }
        })
      } else if (record.removedNodes.length) {
        Array.prototype.slice.call(record.removedNodes).forEach(node => {
          const audioNodes = node.querySelectorAll('audio')

          if (audioNodes.length) {
            console.log(`Usunięto ${audioNodes.length} AUDIO`);
            for (const audioNode of audioNodes) {
              audioNode.removeEventListener(listenToPlayEvent)

              if (lastAudioUsed === audioNode) {
                lastAudioUsed = undefined;
              }
            }
          }
        })
      }
    })
  })

  audioObserver.observe(parent.document.querySelector('#main-content-container'), { subtree: true, childList: true })
  audioObserver.observe(parent.document.querySelector('#right-sidebar'), { subtree: true, childList: true })
  //

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  function createModel() {
    return {
      show() {
        logseq.showMainUI();
      },
    };
  }

  logseq.provideModel(createModel());
  // logseq.setMainUIInlineStyle({
  //   zIndex: 11,
  // });
  //
  // const openIconName = "template-plugin-open";
  //
  // logseq.provideStyle(css`
  //   .${openIconName} {
  //     opacity: 0.55;
  //     font-size: 20px;
  //     margin-top: 4px;
  //   }
  //
  //   .${openIconName}:hover {
  //     opacity: 0.9;
  //   }
  // `);
  //
  // logseq.App.registerUIItem("toolbar", {
  //   key: openIconName,
  //   template: `
  //     <div data-on-click="show" class="${openIconName}">⇢</div>
  //   `,
  // });
}

const settings: SettingSchemaDesc[] = [
  {
    key: 'smallerTimePeriod',
    title: 'Small time period movement (default 5s)',
    description: 'Smaller amount of time by which the audio will be moved backward/forward',
    type: 'number',
    default: 5,
  },
  {
    key: 'biggerTimePeriod',
    title: 'Big time period movement (default 15s)',
    description: 'Bigger amount of time by which the audio will be moved backward/forward',
    type: 'number',
    default: 15,
  },
  {
    key: 'keyboardShortcut_SmallBackward',
    title: 'Keyboard shortcut to skip backward by smaller time period',
    description: 'TODO',
    type: 'string',
    default: 'mod+shift+,'
  },
  {
    key: 'keyboardShortcut_BigBackward',
    title: 'Keyboard shortcut to skip backward by bigger time period',
    description: 'TODO',
    type: 'string',
    default: 'ctrl+mod+shift+,'
  },
  {
    key: 'keyboardShortcut_SmallForward',
    title: 'Keyboard shortcut to skip forward by smaller time period',
    description: 'TODO',
    type: 'string',
    default: 'mod+shift+.'
  },
  {
    key: 'keyboardShortcut_BigForward',
    title: 'Keyboard shortcut to skip forward by bigger time period',
    description: 'TODO',
    type: 'string',
    default: 'ctrl+mod+shift+.'
  }
]

logseq.useSettingsSchema(settings);

const registerKeyboardShortcuts = () => {
  logseq.App.registerCommandPalette({
    key: 'media_backward_by_small_period',
    label: 'seek media backwards by small period',
    keybinding: {
      mode: 'global',
      binding: logseq.settings?.keyboardShortcut_SmallBackward
    }
  }, () => {
    changeAudioTime(getAudioElement(), -logseq.settings?.smallerTimePeriod)
  })

  logseq.App.registerCommandPalette({
    key: 'media_forward_by_small_period',
    label: 'seek media forwards by small period',
    keybinding: {
      mode: 'global',
      binding: logseq.settings?.keyboardShortcut_SmallForward
    }
  }, () => {
    changeAudioTime(getAudioElement(), logseq.settings?.smallerTimePeriod)
  })

  logseq.App.registerCommandPalette({
    key: 'media_backward_by_bigger_period',
    label: 'seek media backwards by bigger period',
    keybinding: {
      mode: 'global',
      binding: logseq.settings?.keyboardShortcut_BigBackward
    }
  }, () => {
    changeAudioTime(getAudioElement(), -logseq.settings?.biggerTimePeriod)
  })

  logseq.App.registerCommandPalette({
    key: 'media_forward_by_bigger_period',
    label: 'seek media forwards by bigger period',
    keybinding: {
      mode: 'global',
      binding: logseq.settings?.keyboardShortcut_BigForward
    }
  }, () => {
    changeAudioTime(getAudioElement(), logseq.settings?.biggerTimePeriod)
  })


  logseq.App.registerCommandPalette({
    key: 'breadcrumbs',
    label: 'get breadcrumbs',
    keybinding: {
      mode: 'global',
      binding: 'mod+shift+/',
    }
  }, async () => {
    console.log( await logseq.Editor.getCurrentBlock() )
  })
}


logseq.ready(main).catch(console.error);
