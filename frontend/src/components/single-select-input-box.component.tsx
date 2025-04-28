/* eslint-disable @typescript-eslint/no-explicit-any */
import { twMerge } from "tailwind-merge";
import { forwardRef, useEffect, useRef, useState, useCallback, useMemo, memo } from "react";
import { FieldValues } from "react-hook-form";
import { IoIosClose } from "react-icons/io";

import Icon from "./react-icons.component";
import CreateNewBtn from "./create-new-button.component";
import AnimationWrapper from "./animation-wrapper.component";
import { FormMethods } from "../types/form.type";
import { timeoutForDelay } from "../lib/timeout.lib";

export type InputOptionType = {
  id: string;
  title: string;
};

interface BaseInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  title?: string;
  autoCloseMenuFn?: boolean;
  filterMode?: "contains" | "starts-with";
  tw?: {
    title?: string;
    input?: string;
    menu?: string;
    option?: string;
  };
}

type SelectInputBoxWithFormMethodsProps<T extends FieldValues = any> = BaseInputProps & {
  formMethods: FormMethods<T>;
  options: InputOptionType[];
  createNewFn?: () => void;
  deleteOptFn?: (id: string) => void;
};

type SelectInputBoxWithoutFormMethodsProps = BaseInputProps & {
  formMethods?: never;
  options: string[];
  createNewFn?: never;
  deleteOptFn?: never;
};

type SelectInputBoxProps =
  | SelectInputBoxWithFormMethodsProps
  | SelectInputBoxWithoutFormMethodsProps;

export const NO_MATCH = "__NO_MATCH__";

const SelectInputBox = forwardRef<HTMLInputElement, SelectInputBoxProps>(
  (
    {
      title,
      placeholder,
      defaultValue,
      disabled,
      required,
      onChange,
      name,
      formMethods,
      createNewFn,
      deleteOptFn,
      autoCloseMenuFn = true,
      filterMode = "contains",
      options,
      tw,
      ...props
    },
    ref
  ) => {
    const menuRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [activeMenu, setActiveMenu] = useState<boolean>(false);
    const [inputVal, setInputVal] = useState<string | null>(null);
    const [hoverVal, setHoverVal] = useState<string | null>(null);
    const [isError, setIsError] = useState<boolean>(false);
    const [filterOptions, setFilterOptions] = useState<typeof options>(options);

    const showOptionsMenu = useMemo(() => activeMenu && !isError, [activeMenu, isError]);

    const getFilterOptions = useCallback(
      (value: string) => {
        if (!value?.length) return options;

        return options.filter((opt) => {
          const optionValue = (typeof opt === "string" ? opt : opt.title).toLowerCase();
          const inputValue = value.toLowerCase();

          return filterMode === "contains"
            ? optionValue.includes(inputValue)
            : optionValue.startsWith(inputValue);
        });
      },
      [options, filterMode]
    );

    const getReturnValue = useCallback(
      (value: string) => {
        if (value) {
          const option = options.find((opt) => {
            const generatedOpt = typeof opt === "string" ? opt : opt.title;
            return generatedOpt.toLowerCase() === value.toLowerCase();
          });

          if (option) {
            return typeof option === "string" ? option : (option as InputOptionType).id;
          }

          return NO_MATCH;
        }
      },
      [options]
    );

    const handleSetFormValue = useCallback(
      (value: string, e?: React.ChangeEvent<HTMLInputElement>) => {
        const returnValue = getReturnValue(value);

        if (name && formMethods) {
          formMethods.setFormValue(name, returnValue);
        }

        if (value.length > 0) {
          onChange?.({
            target: {
              name,
              value: returnValue,
            },
          } as React.ChangeEvent<HTMLInputElement>);
        } else if (e) {
          onChange?.(e);
        }
      },
      [getReturnValue, onChange, name, formMethods]
    );

    const handleInputOnChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        // active menu if it's not active
        if (!activeMenu) {
          setActiveMenu(true);
        }

        const value = e.target.value;
        const newFilterOptions = getFilterOptions(value);

        setHoverVal(null);
        setInputVal(value);
        setFilterOptions(newFilterOptions as typeof options);
        setIsError(filterOptions.length !== 0 && newFilterOptions.length === 0);

        handleSetFormValue(value, e);
      },
      [activeMenu, filterOptions, onChange, handleSetFormValue]
    );

    const handleInputOnKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showOptionsMenu) return;

        const titles = filterOptions.map((opt) => (typeof opt === "string" ? opt : opt.title));
        const currentIndex = titles.findIndex((title) => title === hoverVal);

        // find next valid index that doesn't match defaultValue
        const findNextValidIndex = (startIndex: number, direction: number) => {
          let nextIndex = startIndex;
          let attempts = 0;

          // loop through all options to find next valid one
          while (attempts < titles.length) {
            nextIndex = (nextIndex + direction + titles.length) % titles.length;
            if (titles[nextIndex] !== defaultValue) {
              return nextIndex;
            }
            attempts++;
          }

          // if all options match defaultValue, return current index
          return startIndex;
        };

        if (e.key === "ArrowDown") {
          e.preventDefault();
          const nextIndex = findNextValidIndex(currentIndex, 1);
          setHoverVal(titles[nextIndex]);
        }

        if (e.key === "ArrowUp") {
          e.preventDefault();
          const nextIndex = findNextValidIndex(currentIndex, -1);
          setHoverVal(titles[nextIndex]);
        }

        if (e.key === "Enter" && hoverVal) {
          e.preventDefault();
          setInputVal(hoverVal);
          setActiveMenu(false);
          handleSetFormValue(hoverVal);
        }

        if (e.key === "Escape") {
          setActiveMenu(false);
        }
      },
      [filterOptions, hoverVal, showOptionsMenu, handleSetFormValue, defaultValue]
    );

    const handleInputOnBlur = useCallback(() => {
      if ((!inputVal || !hoverVal) && defaultValue) {
        setInputVal(defaultValue as string);
      }
    }, [inputVal, hoverVal, defaultValue]);

    const handleOptionOnMouseEnter = useCallback(
      (opt: string) => {
        if (opt === defaultValue) return;
        setHoverVal(opt);
      },
      [inputVal]
    );

    const handleOptionOnMouseLeave = useCallback(() => {
      setHoverVal(null);
    }, []);

    const handleOptionOnClick = useCallback(
      (option: string) => {
        setInputVal(option);
        setActiveMenu(false);
        setHoverVal(null);

        handleSetFormValue(option);
      },
      [handleSetFormValue]
    );

    const handleDeleteOption = useCallback(
      (e: React.MouseEvent<HTMLButtonElement>, opt: InputOptionType) => {
        e.stopPropagation();

        setHoverVal(null);

        // if delete option is the same as the input value,
        // set input value and onChange value to null
        if (inputVal === opt.title) {
          setInputVal(null);

          if (name && formMethods) {
            formMethods.setFormValue(name, "");
          }
        }

        deleteOptFn?.((opt as InputOptionType).id);
      },
      [deleteOptFn, inputVal]
    );

    // handle menu open or close(though click or keyboard)
    useEffect(() => {
      const inputEl = inputRef.current;

      const isInside = (node: Node | null) =>
        inputRef.current?.contains(node) || menuRef.current?.contains(node);

      const openMenu = () => {
        if (!disabled && !isError) {
          timeoutForDelay(() => setActiveMenu(true));
        }
      };

      const closeMenu = () => {
        if (autoCloseMenuFn) {
          timeoutForDelay(() => setActiveMenu(false));
        }
      };

      const handleFocus = openMenu;

      const handleBlur = (e: FocusEvent) => {
        const next = e.relatedTarget as Node | null;
        if (!isInside(next)) {
          closeMenu();
        }
      };

      const handleClick = (e: MouseEvent) => {
        const target = e.target as Node;
        if (inputRef.current?.contains(target)) {
          if (!activeMenu) openMenu();
        } else if (!menuRef.current?.contains(target)) {
          closeMenu();
        }
      };

      inputEl?.addEventListener("focus", handleFocus);
      inputEl?.addEventListener("blur", handleBlur);
      document.addEventListener("click", handleClick);

      return () => {
        inputEl?.removeEventListener("focus", handleFocus);
        inputEl?.removeEventListener("blur", handleBlur);
        document.removeEventListener("click", handleClick);
      };
    }, [activeMenu, autoCloseMenuFn, disabled, isError]);

    // update filterOptions when options change
    useEffect(() => {
      setFilterOptions(options);
    }, [options]);

    return (
      <div className={`relative flex flex-col w-full gap-2`}>
        <p
          className={twMerge(
            `
            text-sm
            text-grey-custom/50
            ${title ? "block" : "hidden"}
          `,
            tw?.title
          )}
        >
          {title}
          {required && <span className={`text-red-500`}> *</span>}
        </p>

        <input
          ref={inputRef}
          type="text"
          name={name}
          value={hoverVal ?? inputVal ?? defaultValue ?? ""}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          onChange={handleInputOnChange}
          onKeyDown={handleInputOnKeyDown}
          onBlur={handleInputOnBlur}
          autoComplete="off"
          className={twMerge(
            `
            input-box 
            capitalize
            placeholder:normal-case
            ${showOptionsMenu && "rounded-b-none"}
            ${
              isError &&
              `
              shadow-[0_0_2px_2px]
              shadow-red-500/50
              bg-red-500/10
            `
            }
          `,
            tw?.input
          )}
        />

        <input
          ref={ref}
          type="hidden"
          name={name}
          tabIndex={-1}
          readOnly
          {...props}
          className={`w-full`}
        />

        <AnimationWrapper
          ref={menuRef}
          visible={showOptionsMenu}
          initial={{ opacity: 0, scaleY: "0%", transformOrigin: "top" }}
          animate={{ opacity: 1, scaleY: "100%", transformOrigin: "top" }}
          transition={{ duration: 0.2 }}
          tabIndex={-1}
          className={twMerge(
            `
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
          `,
            tw?.menu
          )}
        >
          {filterOptions.map((option) => {
            const content = typeof option === "string" ? option : option.title;
            return (
              <div
                key={content}
                onMouseEnter={() => handleOptionOnMouseEnter(content)}
                onMouseLeave={handleOptionOnMouseLeave}
                onClick={() => handleOptionOnClick(content)}
                className={twMerge(
                  `
                  menu-btn
                  flex
                  p-2
                  items-center
                  justify-between
                  rounded-sm
                  ${hoverVal === content && "bg-neutral-800"}
                  ${content === defaultValue && "no-hover opacity-50"}
                `,
                  tw?.option
                )}
              >
                {content}

                {/* option delete button */}
                {deleteOptFn && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteOption(e, option as InputOptionType)}
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
              </div>
            );
          })}

          {/* create new button */}
          {createNewFn && (
            <CreateNewBtn
              type="button"
              onClick={createNewFn}
              className={`menu-btn p-2 rounded-sm`}
              tw={{ icon: `hidden` }}
            >
              <p className={`normal-case text-sm`}>Create new</p>
            </CreateNewBtn>
          )}
        </AnimationWrapper>
      </div>
    );
  }
);

export default memo(SelectInputBox);
