import { forwardRef, useState } from "react";
import { BsFillSendFill } from "react-icons/bs";
import Modal from "./modal.component";
import InputBox from "./input-box.component";
import Icon from "./react-icons.component";

interface ModalProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type: string;
  active: boolean;
  closeModalFn: () => void;
  autoCloseModalFn?: boolean;
  autoCapitalizeFn?: boolean;
  formOnSubmit: React.FormEventHandler<HTMLFormElement>;
  registerValidState: boolean;
}

const OptionCreateModal = forwardRef<HTMLInputElement, ModalProps>(
  (
    {
      type,
      active,
      closeModalFn,
      autoCloseModalFn = true,
      autoCapitalizeFn = true,
      formOnSubmit,
      registerValidState,
      onChange,
      ...props
    },
    ref
  ) => {
    const [inputVal, setInputVal] = useState("");

    const handleInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      const generateVal = `${val.charAt(0).toUpperCase()}${val.slice(1)}`;

      setInputVal(autoCapitalizeFn ? generateVal : val);

      if (onChange) {
        onChange(e);
      }
    };

    return (
      <Modal
        title={`Create new ${type} option`}
        activeState={active}
        closeModalFn={closeModalFn}
        autoCloseModalFn={autoCloseModalFn}
      >
        <form
          onSubmit={formOnSubmit}
          className={`
            relative
            flex
            gap-3
            items-center
          `}
        >
          <InputBox
            ref={ref}
            value={inputVal}
            placeholder={`new ${type} option`}
            onChange={(e) => handleInputOnChange(e)}
            className={`pr-[3rem]`}
            {...props}
          />

          {/* submit button */}
          <button
            disabled={!registerValidState}
            className={`
              absolute
              -translate-y-1/2
              top-1/2
              right-4
              text-sm
              disabled:text-neutral-500
            `}
          >
            <Icon
              name={BsFillSendFill}
              className={`${registerValidState && " text-green-500"}`}
            />
          </button>
        </form>
      </Modal>
    );
  }
);

export default OptionCreateModal;
