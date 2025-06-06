import { forwardRef, useState } from "react";
import { BsFillSendFill } from "react-icons/bs";
import Modal from "./modal.component";
import Icon from "./react-icons.component";
import InputBox from "./input-box.component";
import { useScopedIntl } from "../hooks/intl.hook";

interface ModalProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type: string;
  active: boolean;
  closeModalFn: () => void;
  autoCloseModal?: boolean;
  formOnSubmit: React.FormEventHandler<HTMLFormElement>;
  registerValidState: boolean;
}

const CreateOptionModal = forwardRef<HTMLInputElement, ModalProps>(
  (
    {
      type,
      active,
      closeModalFn,
      autoCloseModal = true,
      autoCapitalize = false,
      formOnSubmit,
      registerValidState,
      onChange,
      ...props
    },
    ref
  ) => {
    const { fm } = useScopedIntl();
    const createOptionFm = fm("song.create.option");

    const [inputVal, setInputVal] = useState("");

    const handleInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      const generateVal = `${val.charAt(0).toUpperCase()}${val.slice(1)}`;

      setInputVal(autoCapitalize ? generateVal : val);

      onChange?.(e);
    };

    return (
      <Modal
        title={createOptionFm("modal.title", { type })}
        activeState={active}
        closeModalFn={closeModalFn}
        autoCloseModal={autoCloseModal}
      >
        <form
          onSubmit={formOnSubmit}
          className={`
            relative
            flex
            flex-col
            gap-3
            items-center
          `}
        >
          <InputBox
            ref={ref}
            value={inputVal}
            placeholder={createOptionFm("modal.placeholder", { type })}
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
            <Icon name={BsFillSendFill} className={`${registerValidState && " text-green-500"}`} />
          </button>
        </form>
      </Modal>
    );
  }
);

export default CreateOptionModal;
