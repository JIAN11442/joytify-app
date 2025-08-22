import { FormattedMessage } from "react-intl";
import Modal from "../components/modal.component";
import { useScopedIntl } from "../hooks/intl.hook";
import { getKeyboardShortcutCategories } from "../contents/keyboard-shortcut-categories.content";
import useKeyboardShortcutModalState from "../states/keyboard-shortcut-modal.state";
import { timeoutForDelay } from "../lib/timeout.lib";

type ModalDescriptionProps = {
  prefix: string;
};

type KeyboardShortcutItemProps = {
  keys: string[];
};

const ModalDescription = ({ prefix }: ModalDescriptionProps) => (
  <FormattedMessage
    id={`${prefix}.description`}
    values={{
      macKey: "⌘ + K",
      windowsKey: "Ctrl + K",
      strong: (chunks) => (
        <strong className={`font-ubuntu font-bold text-neutral-300`}>{chunks}</strong>
      ),
    }}
  />
);

const KeyboardShortcutItem = ({ keys }: KeyboardShortcutItemProps) => {
  return (
    <div className={`flex items-center gap-2`}>
      {keys.map((key, index) => {
        return (
          <span
            key={`windows-key-${index}`}
            className={`
              py-2
              px-3
              min-w-10
              text-center
              bg-neutral-700
              rounded-md
            `}
          >
            {key}
          </span>
        );
      })}
    </div>
  );
};

const KeyboardShortcutModal = () => {
  const { fm } = useScopedIntl();

  const { activeKeyboardShortcutModal, closeKeyboardShortcutModal } =
    useKeyboardShortcutModalState();

  const handleCloseModal = () => {
    timeoutForDelay(() => {
      closeKeyboardShortcutModal();
    });
  };

  const shortcutCategories = getKeyboardShortcutCategories(fm);

  const prefix = "keyboard.shortcut.modal";
  const keyboardShortcutModalFm = fm(prefix);

  return (
    <Modal
      title={keyboardShortcutModalFm("title")}
      description={<ModalDescription prefix={prefix} />}
      activeState={activeKeyboardShortcutModal}
      closeModalFn={handleCloseModal}
      className={`w-[90%]`}
    >
      <div className={`flex flex-col gap-10`}>
        {shortcutCategories.map((category) => {
          const { id: categoryId, title, items } = category;

          return (
            <div key={categoryId} className={`flex flex-col gap-5`}>
              {/* category title */}
              <p className={`text-xl font-bold capitalize`}>{title}</p>

              {/* category items */}
              <div className={`flex flex-col gap-1 pl-2`}>
                {items.map((item) => {
                  const { id: itemId, action, macosKey, windowsKey } = item;

                  return (
                    <div
                      key={itemId}
                      className={`
                        flex
                        p-1
                        gap-5
                        w-full
                        items-center
                        justify-between
                        font-ubuntu
                        hover:bg-neutral-700/20
                        rounded-md
                        transition-all
                      `}
                    >
                      {/* action */}
                      <p className={`w-[50%]  text-neutral-400`}>{action}</p>

                      {/* keys */}
                      <div
                        className={`
                          flex
                          gap-1
                          text-sm
                          items-center
                        `}
                      >
                        {/* macos key */}
                        <KeyboardShortcutItem keys={macosKey} />

                        {/* windows key */}
                        {windowsKey && (
                          <>
                            <span className={`text-neutral-500 mx-2`}> or </span>
                            <KeyboardShortcutItem keys={windowsKey} />
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};

export default KeyboardShortcutModal;
