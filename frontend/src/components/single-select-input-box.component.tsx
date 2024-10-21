/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, useEffect, useRef, useState } from "react";
import {
  UseFormSetError,
  UseFormSetValue,
  UseFormTrigger,
} from "react-hook-form";

import AnimationWrapper from "./animation-wrapper.component";

import { timeoutForDelay, timeoutForEventListener } from "../lib/timeout.lib";
import { reqUpload } from "../constants/data-type.constant";
import mergeRefs from "../lib/merge-refs.lib";

type OptionType = {
  id: string;
  title: string;
};

interface SingleSelectInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  title?: string;
  options: OptionType[];
  formValueState: {
    name: reqUpload;
    setFormValue: UseFormSetValue<any>;
    setFormError: UseFormSetError<any>;
    trigger: UseFormTrigger<any>;
  };
  submitBtnRef?: React.RefObject<HTMLButtonElement>;
}

const SingleSelectInputBox = forwardRef<
  HTMLInputElement,
  SingleSelectInputProps
>(
  (
    {
      id,
      title,
      options,
      formValueState,
      placeholder,
      onChange,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const hiddenInputRef = useRef<HTMLInputElement | null>(null);

    const [value, setValue] = useState("");
    const [hoverVal, setHoverVal] = useState<string>("");
    const [activeMenu, setActiveMenu] = useState<boolean>(false);
    const [filterOptions, setFilterOptions] = useState<OptionType[]>(options);
    const [focusOptIndex, setFocusOptIndex] = useState(-1);
    const [selectedOptId, setSelectedOptId] = useState("");

    const { name, setFormValue, trigger } = formValueState;

    // handle options onMouseEnter
    const handleOptionsOnMouseEnter = (opt: string) => {
      timeoutForDelay(() => {
        setHoverVal(opt);
      });
    };

    // handle options onMouseLeave
    const handleOptionsOnMouseLeave = () => {
      timeoutForDelay(() => {
        setHoverVal("");
      });
    };

    // handle options onClick
    const handleOptionsOnClick = (opt: OptionType) => {
      setFormValue(name, opt.id);
      setSelectedOptId(opt.id);
      setValue(opt.title);
      setActiveMenu(false);

      trigger(name);
    };

    // handle input onChange
    const handleInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const eValue = e.target.value;
      const inputOptionId =
        options.filter((opt) => opt.title === eValue)[0]?.id || "";

      // setting input value
      setValue(eValue);
      setHoverVal("");

      // setting form submit value
      setFormValue(name, inputOptionId);

      // validate form value
      trigger(name);

      // find query options
      if (eValue.length) {
        // according input value to filter options
        const newFilterOptions = options.filter((opt) =>
          opt.title.toLowerCase().includes(eValue.toLowerCase())
        );

        setFilterOptions(newFilterOptions);
      } else {
        setFilterOptions(options);
      }

      if (onChange) {
        onChange(e);
      }
    };

    const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (activeMenu) {
        const ekey = e.key;

        if (ekey === "ArrowDown" || ekey === "ArrowUp") {
          e.preventDefault();

          const newFocusOptIndex =
            ekey === "ArrowDown"
              ? Math.min(focusOptIndex + 1, options.length - 1)
              : Math.max(focusOptIndex - 1, 0);

          setFocusOptIndex(newFocusOptIndex);
        } else if (ekey === "Enter") {
          const targetOpt = options[focusOptIndex >= 0 ? focusOptIndex : 0];
          handleOptionsOnClick({ id: targetOpt.id, title: targetOpt.title });
        }
      }
    };

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
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
          timeoutForDelay(() => {
            setActiveMenu(false);
          });
        }
      };

      return () => {
        timeoutForEventListener(document, "click", handleOnFocus);
        timeoutForEventListener(document, "click", handleOnBlur);
      };
    }, [disabled, inputRef, menuRef]);

    return (
      <div
        className={`
          flex
          flex-col
          gap-2
        `}
      >
        <p
          className={`
            text-sm
            text-grey-custom/50
            ${title ? "block" : "hidden"}
          `}
        >
          {title}
          {required && <span className={`text-red-500`}> *</span>}
        </p>

        <div
          className={`
            relative
            group
          `}
        >
          {/* display input value */}
          <input
            ref={mergeRefs(ref, inputRef)}
            type="text"
            value={value || hoverVal}
            placeholder={placeholder}
            onChange={(e) => handleInputOnChange(e)}
            onKeyDown={(e) => handleOnKeyDown(e)}
            required={required}
            disabled={disabled}
            className={`
              input-box
              capitalize
              placeholder:normal-case
              ${activeMenu && "rounded-b-none"}
            `}
          />

          {/* submit selected playlist id to useForm */}
          <input
            id={id}
            ref={hiddenInputRef}
            type="hidden"
            value={selectedOptId}
            readOnly
            {...props}
          />
        </div>

        <AnimationWrapper
          ref={menuRef}
          visible={activeMenu}
          initial={{ opacity: 0, scaleY: "0%", transformOrigin: "top" }}
          animate={{ opacity: 1, scaleY: "100%", transformOrigin: "top" }}
          transition={{ duration: 0.2 }}
          className={`
            -mt-3
            p-1
            max-h-[150px]
            bg-neutral-900
            border
            border-neutral-700/50
            rounded-b-md
            overflow-y-auto
          `}
        >
          {filterOptions.map((opt, index) => (
            <button
              key={opt.id}
              type="button"
              onMouseEnter={() => handleOptionsOnMouseEnter(opt.title)}
              onMouseLeave={() => handleOptionsOnMouseLeave()}
              onClick={() => handleOptionsOnClick(opt)}
              className={`
                menu-btn
                p-2
                rounded-sm
                ${
                  index === focusOptIndex &&
                  !hoverVal &&
                  `
                    bg-neutral-800/50
                    text-white
                  `
                }
            `}
            >
              {opt.title}
            </button>
          ))}
        </AnimationWrapper>
      </div>
    );
  }
);

export default SingleSelectInputBox;
