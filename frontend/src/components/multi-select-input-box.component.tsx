import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { UseFormSetValue } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { AiOutlinePlus } from "react-icons/ai";
import { IoIosClose } from "react-icons/io";

import Icon from "./react-icons.component";
import AnimationWrapper from "./animation-wrapper.component";

import LabelOptions, { LabelType } from "../constants/label-type.constant";
import { MutationKey } from "../constants/query-client-key.constant";
import { Label, reqUpload } from "../constants/data-type.constant";
import { DefaultsSongType } from "../constants/form-default-data.constant";
import mergeRefs from "../lib/merge-refs.lib";
import { timeoutForDelay, timeoutForEventListener } from "../lib/timeout.lib";
import useUploadModalState from "../states/upload-modal.state";
import { deleteLabel } from "../fetchs/label.fetch";
import { useGetLabel } from "../hooks/label.hook";

export type OptionType = {
  type: LabelType;
  labels: { defaults: Label[]; created: Label[] };
};

interface MultiSelectInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  title?: string;
  options: OptionType | OptionType[];
  autoCloseMenuFn?: boolean;
  formValueState: {
    name: reqUpload;
    setFormValue: UseFormSetValue<DefaultsSongType>;
  };
}

const MultiSelectInputBox = forwardRef<HTMLInputElement, MultiSelectInputProps>(
  (
    {
      id,
      title,
      options,
      placeholder,
      autoCloseMenuFn = true,
      formValueState,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    // useImperativeHandle allows us to customize the instance value
    // that is exposed to parent components when using ref
    useImperativeHandle(ref, () => {
      return inputRef.current as HTMLInputElement;
    });

    const [activeMenu, setActiveMenu] = useState<boolean>(false);
    const [selectedOpts, setSelectedOpts] = useState<Label[]>([]);
    const [inputVal, setInputVal] = useState<string>("");
    const [labelToDeleted, setLabelToDeleted] = useState<string>("");

    const { setActiveCreateLabelModal } = useUploadModalState();

    // handle option menu onchange
    const handleOptMenuOnChange = (
      opt: Label,
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const checked = e.target.checked;

      if (checked) {
        setSelectedOpts((prev) => [...prev, opt]);
      } else {
        setSelectedOpts((prev) =>
          prev.filter((existedOpt) => existedOpt !== opt)
        );
      }
    };

    // handle active create label modal
    const handleActiveCreateLabelModal = (type: LabelType) => {
      timeoutForDelay(() => {
        setActiveCreateLabelModal({ type, active: true, options });
      });
    };

    // handle delete label
    const handleDeleteLabel = (opt: Label, type: LabelType) => {
      setLabelToDeleted(opt.label);
      deleteTargetLabel({ id: opt.id, label: opt.label, type });
    };

    const { name, setFormValue } = formValueState;

    const { refetch } = useGetLabel();

    const { mutate: deleteTargetLabel } = useMutation({
      mutationKey: [MutationKey.DELETE_LABEL_OPTION],
      mutationFn: deleteLabel,
      onSuccess: () => {
        // refetch query label
        refetch();
        // display deleted successfully message
        toast.success(`${labelToDeleted} already deleted`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

    // open option menu while focus input box,
    // close option menu while option menu onBlur
    useEffect(() => {
      const handleOnFocus: EventListener = (e) => {
        if (
          !disabled &&
          inputRef.current &&
          inputRef.current.contains(e.target as Node)
        ) {
          timeoutForDelay(() => {
            setActiveMenu(true);
          });
        }
      };
      const handleOnBlur: EventListener = (e) => {
        if (
          autoCloseMenuFn &&
          menuRef.current &&
          !menuRef.current.contains(e.target as Node)
        ) {
          timeoutForDelay(() => {
            setActiveMenu(false);
          });
        }
      };

      timeoutForEventListener(document, "click", handleOnFocus);

      return timeoutForEventListener(document, "click", handleOnBlur);
    }, [autoCloseMenuFn, disabled, inputRef, menuRef]);

    useEffect(() => {
      const optIds = selectedOpts.map((opt) => opt.id);
      const optsContent = selectedOpts.map((opt) => opt.label).join(", ");

      setFormValue(name, optIds);
      setInputVal(optsContent);
    }, [selectedOpts, name]);

    return (
      <div
        className={`
        ${
          title &&
          `
            flex
            flex-col
            gap-2
          `
        }
      `}
      >
        {/* title */}
        <>
          {title && (
            <p
              className={`
                text-sm
                text-grey-custom/50
              `}
            >
              {title}
            </p>
          )}
        </>

        {/* input box && option menu */}
        <div>
          {/* input box */}
          <input
            id={id}
            ref={mergeRefs(ref, inputRef)}
            type="text"
            placeholder={placeholder}
            value={inputVal}
            disabled={disabled}
            readOnly
            className={`input-box ${activeMenu && "rounded-b-none"}`}
            {...props}
          />

          {/* Options */}
          <AnimationWrapper
            ref={menuRef}
            visible={activeMenu}
            initial={{ opacity: 0, scaleY: "0%", transformOrigin: "top" }}
            animate={{ opacity: 1, scaleY: "100%", transformOrigin: "top" }}
            transition={{ duration: 0.2 }}
            className={`
              p-2
              max-h-[150px]
              bg-neutral-900
              border
              border-neutral-700/50
              rounded-b-md
              overflow-y-auto
            `}
          >
            {/* Label options */}
            <>
              {Object.values((options as OptionType).labels).map(
                (labelType, index) => (
                  <div
                    key={index}
                    className={`
                      flex
                      flex-col
                    `}
                  >
                    {/* separate line */}
                    <hr
                      className={`
                        my-2
                        ${index === 1 ? "flex" : "hidden"}
                        border-neutral-800
                      `}
                    />

                    {/* options */}
                    <div
                      className={`
                        pb-2
                        grid
                        grid-cols-2
                      `}
                    >
                      {/* options */}
                      <>
                        {labelType.map((opt) => {
                          return (
                            <label
                              key={opt.id}
                              className={`
                                group
                                flex
                                gap-2
                                px-2
                                py-0.5
                                items-center
                              `}
                            >
                              <input
                                type="checkbox"
                                name={opt.label}
                                checked={selectedOpts.includes(opt)}
                                onChange={(e) => {
                                  handleOptMenuOnChange(opt, e);
                                }}
                              />
                              <p
                                className={`
                                  text-[14px]
                                  text-neutral-400
                                  capitalize
                                  group-hover:text-white
                                `}
                              >
                                {opt.label}
                              </p>

                              {/* delete button */}
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteLabel(
                                    opt,
                                    (options as OptionType).type
                                  )
                                }
                                className={`${index === 1 ? "flex" : "hidden"}`}
                              >
                                <Icon
                                  name={IoIosClose}
                                  opts={{ size: 18 }}
                                  className={`
                                      text-red-500
                                      p-[0.5px]
                                      rounded-full
                                      hover:bg-red-500
                                      hover:text-white
                                      transition
                                    `}
                                />
                              </button>
                            </label>
                          );
                        })}
                      </>

                      {/* create new button */}
                      <>
                        {index === 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              handleActiveCreateLabelModal(
                                LabelOptions.LANGUAGE
                              )
                            }
                            className={`
                              group
                              flex
                              gap-2
                              px-2
                              text-[14px]
                              text-green-500/50
                              hover:text-green-500
                              items-center
                              transition
                            `}
                          >
                            <Icon
                              name={AiOutlinePlus}
                              opts={{ size: 12 }}
                              className={`
                                p-0.5
                                rounded-full
                                bg-green-500/50
                                group-hover:bg-green-500
                                text-black
                              `}
                            />
                            <p>Create new</p>
                          </button>
                        )}
                      </>
                    </div>
                  </div>
                )
              )}
            </>
          </AnimationWrapper>
        </div>
      </div>
    );
  }
);

export default MultiSelectInputBox;
