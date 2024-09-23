import { forwardRef, useEffect, useRef, useState } from "react";
import { UseFormSetValue } from "react-hook-form";

import AnimationWrapper from "./animation-wrapper.component";

import { timeoutForDelay, timeoutForEventListener } from "../lib/timeout.lib";
import { DefaultsSongType } from "../constants/form-default-data.constant";
import { reqUpload } from "../constants/data-type.constant";

type OptionType = {
  id: string;
  title: string;
};

interface SelectInputBoxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  title: string;
  options: OptionType[];
  formValueState: {
    name: reqUpload;
    setFormValue: UseFormSetValue<DefaultsSongType>;
  };
  submitBtnRef?: React.RefObject<HTMLButtonElement>;
}

const SelectInputBox = forwardRef<HTMLInputElement, SelectInputBoxProps>(
  (
    { id, title, options, formValueState, placeholder, onChange, ...props },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const hiddenInputRef = useRef<HTMLInputElement | null>(null);

    const [value, setValue] = useState("");
    const [hoverVal, setHoverVal] = useState<string>("");
    const [activeMenu, setActiveMenu] = useState<boolean>(false);
    const [filterOptions, setFilterOptions] = useState<OptionType[]>(options);
    const [focusOptIndex, setFocusOptIndex] = useState(-1);
    const [selectedOptId, setSelectedOptId] = useState("");

    const { name, setFormValue } = formValueState;

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
      timeoutForDelay(() => {
        setFormValue(name, opt.id);
        setSelectedOptId(opt.id);
        setValue(opt.title);
        setActiveMenu(false);

        if (onChange) {
          const syntheticEvent = {
            target: {
              name,
              value: opt.id,
            },
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent);
        }
      });
    };

    // handle input onChange
    const handleInputOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const eValue = e.target.value;

      setValue(eValue);

      if (eValue.length) {
        const newFilterOptions = options.filter((opt) =>
          opt.title.toLowerCase().includes(eValue.toLowerCase())
        );

        setFilterOptions(newFilterOptions);
      } else {
        setFilterOptions(options);
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
        if (inputRef.current && inputRef.current.contains(e.target as Node)) {
          if (!activeMenu) {
            setActiveMenu(true);
          }
        }
      };

      timeoutForEventListener(window, "click", handleOnFocus);
    }, [inputRef]);

    return (
      <div
        className={`
          flex
          flex-col
          gap-2
          mt-2
        `}
      >
        <p
          className={`
            text-sm
            text-grey-custom/50
          `}
        >
          {title}
        </p>

        <div
          className={`
            relative
            group
          `}
        >
          {/* display input value */}
          <input
            ref={(node) => {
              inputRef.current = node;
              if (typeof ref === "function") {
                ref(node);
              } else if (ref) {
                (
                  ref as React.MutableRefObject<HTMLInputElement | null>
                ).current = node;
              }
            }}
            type="text"
            value={value || hoverVal}
            placeholder={placeholder}
            onChange={(e) => handleInputOnChange(e)}
            onKeyDown={(e) => handleOnKeyDown(e)}
            className={`
              input-box
              capitalize
              placeholder:normal-case
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
              key={index}
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

export default SelectInputBox;
