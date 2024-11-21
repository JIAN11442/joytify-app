/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, useEffect, useRef, useState } from "react";
import {
  UseFormSetError,
  UseFormSetValue,
  UseFormTrigger,
} from "react-hook-form";
import _ from "lodash";
import { IoIosClose } from "react-icons/io";

import Icon from "./react-icons.component";
import CreateNewBtn from "./create-new-button.component";
import AnimationWrapper from "./animation-wrapper.component";

import mergeRefs from "../lib/merge-refs.lib";
import { timeoutForDelay, timeoutForEventListener } from "../lib/timeout.lib";
import { reqUpload } from "../constants/data-type.constant";

export type InputOptionType = {
  id: string;
  title: string;
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  title?: string;
  options: InputOptionType[];
  formMethods: {
    name: reqUpload;
    setFormValue: UseFormSetValue<any>;
    setFormError: UseFormSetError<any>;
    trigger: UseFormTrigger<any>;
  };
  createNewFn?: () => void;
  deleteOptFn?: {
    deleteFn: (id: string) => void;
    setDeleteTitle: (title: string) => void;
  };
  autoCloseMenuFn?: boolean;
}

const SingleSelectInputBox = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id,
      title,
      options,
      formMethods,
      createNewFn,
      deleteOptFn,
      autoCloseMenuFn = true,
      placeholder,
      onChange,
      required,
      disabled = false,
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
    const [filterOptions, setFilterOptions] =
      useState<InputOptionType[]>(options);
    const [focusOptIndex, setFocusOptIndex] = useState(-1);
    const [selectedOptId, setSelectedOptId] = useState("");

    const { name, setFormValue, trigger } = formMethods;

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
    const handleOptionsOnClick = (opt: InputOptionType) => {
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

    // handle delete option
    const handleDeleteOption = (
      e: React.MouseEvent<HTMLButtonElement>,
      opt: InputOptionType
    ) => {
      // avoid parent elemet <div> execute onClick function
      e.stopPropagation();

      if (deleteOptFn) {
        const { deleteFn, setDeleteTitle } = deleteOptFn;

        // delete option function
        deleteFn(opt.id);

        // save deleted option title for toaster
        setDeleteTitle(opt.title);

        // clear input value after deleted option
        setValue("");
        setHoverVal("");
      }
    };

    // open or close the menu when the input is focused or blurred
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

    // renew filter options while parent options is refetch
    useEffect(() => {
      if (!_.isEqual(filterOptions, options)) {
        setFilterOptions(options);
      }
    }, [options]);

    return (
      <div
        className={`
          relative
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
            absolute
            z-10
            top-full
            w-full
            p-1
            max-h-[150px]
            bg-neutral-900
            border
            border-neutral-700/50
            rounded-b-md
            overflow-y-auto
          `}
        >
          <div>
            {/* options button */}
            <>
              {filterOptions.map((opt, index) => (
                <div
                  key={opt.id}
                  onMouseEnter={() => handleOptionsOnMouseEnter(opt.title)}
                  onMouseLeave={() => handleOptionsOnMouseLeave()}
                  onClick={() => handleOptionsOnClick(opt)}
                  className={`
                    menu-btn
                    flex
                    p-2
                    items-center
                    justify-between
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
                  {/* option title */}
                  <p>{opt.title}</p>

                  {/* option delete button */}
                  <>
                    {deleteOptFn && (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteOption(e, opt)}
                      >
                        <Icon
                          name={IoIosClose}
                          opts={{ size: 18 }}
                          className={`
                            text-red-500
                            hover:bg-red-500
                            hover:text-white
                            rounded-full
                            transition
                          `}
                        />
                      </button>
                    )}
                  </>
                </div>
              ))}
            </>

            {/* create new button */}
            <>
              {createNewFn && (
                <CreateNewBtn
                  type="button"
                  tailwindCSS={{
                    wrapper: `menu-btn p-2 rounded-sm`,
                    icon: "hidden",
                  }}
                  onClick={() => createNewFn()}
                >
                  <p className={`normal-case text-sm`}>Create new</p>
                </CreateNewBtn>
              )}
            </>
          </div>
        </AnimationWrapper>
      </div>
    );
  }
);

export default SingleSelectInputBox;
