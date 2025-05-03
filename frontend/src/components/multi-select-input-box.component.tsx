/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, useEffect, useRef, useState } from "react";
import { FieldValues } from "react-hook-form";

import CreateNewBtn from "./create-new-button.component";
import AnimationWrapper from "./animation-wrapper.component";
import OptionCheckboxItem from "./option-checkbox-item.component";

import { FormMethods } from "../types/form.type";
import { Label, LabelOptionsType, RefactorLabelResponse } from "@joytify/shared-types/types";
import useUploadModalState, { RefetchType } from "../states/upload-modal.state";
import { timeoutForDelay, timeoutForEventListener } from "../lib/timeout.lib";
import mergeRefs from "../lib/merge-refs.lib";

export type OptionType = {
  type: LabelOptionsType;
  labels: { defaults: Label[]; created: Label[] };
};

interface MultiSelectInputProps<T extends FieldValues = any>
  extends React.InputHTMLAttributes<HTMLInputElement> {
  title?: string;
  options: OptionType;
  formMethods: FormMethods<T>;
  autoCloseMenu?: boolean;
  deleteOptFn?: (id: string) => void;
  queryRefetch: RefetchType<RefactorLabelResponse>;
}

const MultiSelectInputBox = forwardRef<HTMLInputElement, MultiSelectInputProps>(
  (
    {
      title,
      options,
      autoCloseMenu = true,
      deleteOptFn,
      queryRefetch,
      formMethods,
      name,
      placeholder,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const { setFormValue, trigger } = formMethods;

    const inputRef = useRef<HTMLInputElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const [activeMenu, setActiveMenu] = useState<boolean>(false);
    const [selectedOpts, setSelectedOpts] = useState<Label[]>([]);
    const [inputVal, setInputVal] = useState<string>("");

    const { setActiveCreateLabelModal } = useUploadModalState();

    const labelOpts = Object.values((options as OptionType).labels);

    // handle option menu onchange
    const handleOptMenuOnChange = (opt: Label, e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;

      if (checked) {
        setSelectedOpts((prev) => [...prev, opt]);
      } else {
        setSelectedOpts((prev) => prev.filter((existedOpt) => existedOpt !== opt));
      }
    };

    // handle active create label modal
    const handleActiveCreateLabelModal = () => {
      timeoutForDelay(() => {
        setActiveCreateLabelModal({
          active: true,
          options,
          labelRefetch: queryRefetch,
        });
      });
    };

    // handle delete label
    const handleDeleteLabel = (opt: Label) => {
      if (deleteOptFn) {
        deleteOptFn(opt.id);
      }
    };

    // auto close menu on focus and blur
    useEffect(() => {
      const handleOnFocus: EventListener = (e) => {
        if (!disabled && inputRef.current && inputRef.current.contains(e.target as Node)) {
          timeoutForDelay(() => {
            setActiveMenu(true);
          });
        }
      };
      const handleOnBlur: EventListener = (e) => {
        if (autoCloseMenu && menuRef.current && !menuRef.current.contains(e.target as Node)) {
          timeoutForDelay(() => {
            setActiveMenu(false);
          });
        }
      };

      const cleanupOnFocusFn = timeoutForEventListener(document, "click", handleOnFocus);
      const cleanupOnBlurFn = timeoutForEventListener(document, "click", handleOnBlur);

      return () => {
        cleanupOnFocusFn();
        cleanupOnBlurFn();
      };
    }, [autoCloseMenu, disabled, inputRef, menuRef]);

    // while selected options change, set form value and trigger
    useEffect(() => {
      const optIds = selectedOpts.map((opt) => opt.id);
      const optsContent = selectedOpts.map((opt) => opt.label).join(", ");

      if (name) {
        setFormValue(name, optIds);
        trigger(name);
      }

      setInputVal(optsContent);
    }, [selectedOpts, name, setFormValue]);

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

        {/* input box && options menu */}
        <div className={`relative`}>
          {/* input box */}
          <input
            name={name}
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
            tabIndex={-1}
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
            {labelOpts &&
              labelOpts.map((labelType, index) => (
                <div
                  key={`label-type-${index}`}
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
                    {labelType &&
                      labelType.map((opt) => {
                        return (
                          <OptionCheckboxItem
                            key={`label-type-item-${opt.id}`}
                            opt={opt}
                            checked={selectedOpts.includes(opt)}
                            onChange={(e) => handleOptMenuOnChange(opt, e)}
                            deleteFunc={() => handleDeleteLabel(opt)}
                            tw={{
                              deleteBtn: `${index === 1 ? "flex" : "hidden"}`,
                            }}
                          />
                        );
                      })}

                    {/* create new button */}
                    <CreateNewBtn
                      type="button"
                      onClick={handleActiveCreateLabelModal}
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
          </AnimationWrapper>
        </div>
      </div>
    );
  }
);

export default MultiSelectInputBox;
