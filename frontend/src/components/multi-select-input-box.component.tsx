import { forwardRef, useEffect, useRef, useState } from "react";
import {
  UseFormSetError,
  UseFormSetValue,
  UseFormTrigger,
} from "react-hook-form";

import CreateNewBtn from "./create-new-button.component";
import AnimationWrapper from "./animation-wrapper.component";
import OptionCheckboxItem from "./option-checkbox-item.component";

import LabelOptions, { LabelType } from "../constants/label-type.constant";
import { Label, reqUpload, resLabels } from "../constants/data-type.constant";
import { DefaultsSongType } from "../constants/form-default-data.constant";
import mergeRefs from "../lib/merge-refs.lib";
import { timeoutForDelay, timeoutForEventListener } from "../lib/timeout.lib";
import useUploadModalState, { RefetchType } from "../states/upload-modal.state";

export type OptionType = {
  type: LabelType;
  labels: { defaults: Label[]; created: Label[] };
};

interface MultiSelectInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  title?: string;
  options: OptionType | OptionType[];
  autoCloseMenuFn?: boolean;
  deleteOptFn: {
    deleteFn: (id: string) => void;
    setDeleteTitle: (title: string) => void;
  };
  queryRefetch: RefetchType<resLabels>;
  formMethods: {
    name: reqUpload;
    setFormValue: UseFormSetValue<DefaultsSongType>;
    setFormError?: UseFormSetError<DefaultsSongType>;
    trigger?: UseFormTrigger<DefaultsSongType>;
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
      deleteOptFn,
      queryRefetch,
      formMethods,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const [activeMenu, setActiveMenu] = useState<boolean>(false);
    const [selectedOpts, setSelectedOpts] = useState<Label[]>([]);
    const [inputVal, setInputVal] = useState<string>("");

    const { setActiveCreateLabelModal } = useUploadModalState();

    const { name, setFormValue } = formMethods;
    const labelOpts = Object.values((options as OptionType).labels);

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
        setActiveCreateLabelModal({
          type,
          active: true,
          options,
          labelRefetch: queryRefetch,
        });
      });
    };

    // handle delete label
    const handleDeleteLabel = (opt: Label) => {
      // deleteTargetLabel(opt.id);

      if (deleteOptFn) {
        const { deleteFn, setDeleteTitle } = deleteOptFn;

        deleteFn(opt.id);
        setDeleteTitle(opt.label);
      }
    };

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

      const cleanupOnFocusFn = timeoutForEventListener(
        document,
        "click",
        handleOnFocus
      );
      const cleanupOnBlurFn = timeoutForEventListener(
        document,
        "click",
        handleOnBlur
      );

      return () => {
        cleanupOnFocusFn();
        cleanupOnBlurFn();
      };
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

        {/* input box && options menu */}
        <div className={`relative`}>
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

          {/* Options menu*/}
          <AnimationWrapper
            ref={menuRef}
            visible={activeMenu}
            initial={{ opacity: 0, scaleY: "0%", transformOrigin: "top" }}
            animate={{ opacity: 1, scaleY: "100%", transformOrigin: "top" }}
            transition={{ duration: 0.2 }}
            className={`
              absolute
              z-10
              top-full
              w-full
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
              {labelOpts &&
                labelOpts.map((labelType, index) => (
                  <div
                    key={index}
                    className={`
                      flex
                      flex-col
                    `}
                  >
                    {/* options */}
                    <div
                      className={`
                        grid
                        grid-cols-2
                      `}
                    >
                      {/* options */}
                      <>
                        {labelType &&
                          labelType.map((opt) => {
                            return (
                              <OptionCheckboxItem
                                key={opt.id}
                                opt={opt}
                                checked={selectedOpts.includes(opt)}
                                onChange={(e) => handleOptMenuOnChange(opt, e)}
                                deleteFunc={() => handleDeleteLabel(opt)}
                                tw={{
                                  deleteBtn: `${
                                    index === 1 ? "flex" : "hidden"
                                  }`,
                                }}
                              />
                            );
                          })}
                      </>

                      {/* create new button */}
                      <CreateNewBtn
                        type="button"
                        onClick={() =>
                          handleActiveCreateLabelModal(LabelOptions.LANGUAGE)
                        }
                        className={`${index === 0 ? "flex" : "hidden"}`}
                      >
                        <p>Create new</p>
                      </CreateNewBtn>
                    </div>

                    {/* separate line */}
                    <hr
                      className={`
                        my-2
                        ${labelOpts[index + 1]?.length ?? 0 ? "flex" : "hidden"}
                        border-neutral-800
                      `}
                    />
                  </div>
                ))}
            </>
          </AnimationWrapper>
        </div>
      </div>
    );
  }
);

export default MultiSelectInputBox;
