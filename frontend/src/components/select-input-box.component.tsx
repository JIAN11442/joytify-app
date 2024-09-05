import { forwardRef, useEffect, useState } from "react";
import { FaCaretDown, FaCaretUp } from "react-icons/fa6";

import Icon from "./react-icons.component";
import AnimationWrapper from "./animation-wrapper.component";
import { timeoutForDelay } from "../lib/timeout.lib";
import { UseFormSetValue } from "react-hook-form";
import { DefaultsSongType } from "../constants/form-default-data.constant";
import { reqUpload } from "../constants/data-type.constant";

type OptionType = {
  id: string;
  title: string;
};

type SelectInputBoxProps = {
  id: string;
  title: string;
  options: OptionType[];
  formValueState: {
    name: reqUpload;
    setFormValue: UseFormSetValue<DefaultsSongType>;
  };
};

const SelectInputBox = forwardRef<HTMLButtonElement, SelectInputBoxProps>(
  ({ id, title, options, formValueState }, ref) => {
    const [value, setValue] = useState<OptionType>({
      id: options[0].id,
      title: options[0].title,
    });
    const [hoverVal, setHoverVal] = useState<string>("");
    const [activeMenu, setActiveMenu] = useState<boolean>(false);

    const { name, setFormValue } = formValueState;

    // handle active playlist options menu
    const handleActivePlaylistOptions = () => {
      timeoutForDelay(() => {
        setActiveMenu(!activeMenu);
      });
    };

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
      setValue(opt);
      setActiveMenu(false);
    };

    const OptionsIcon = activeMenu ? FaCaretUp : FaCaretDown;

    // if value change, set to form value,
    // then useForm will get the value
    useEffect(() => {
      setFormValue(name, value.id);
    }, [value]);

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
          <button
            id={id}
            ref={ref}
            type="button"
            onClick={handleActivePlaylistOptions}
            className={`
              input-box
              flex
              items-center
              justify-between
              text-white
              hover:text-grey-custom/80
            `}
          >
            <p>{hoverVal || value.title}</p>
            <Icon name={OptionsIcon} />
          </button>
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
          {options.map((opt, index) => (
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
                  opt.title === value.title &&
                  `
                    bg-green-500/80
                    hover:bg-green-500
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
