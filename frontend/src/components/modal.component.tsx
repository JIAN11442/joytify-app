import { useEffect, useRef } from "react";
import { twMerge } from "tailwind-merge";
import * as Dialog from "@radix-ui/react-dialog";
import { IoMdClose } from "react-icons/io";

import Icon from "./react-icons.component";

import { timeoutForEventListener } from "../lib/timeout.lib";

type ModalProps = {
  title?: string;
  description?: string;
  activeState: boolean;
  children: React.ReactNode;
  activeOnChange?: () => void;
  closeBtnDisabled?: boolean;
  closeModalFn: () => void;
  className?: {
    wrapper?: string;
    title?: string;
    description?: string;
  };
  autoCloseModalFn?: boolean;
};

const Modal: React.FC<ModalProps> = ({
  title,
  description,
  activeState,
  children,
  activeOnChange,
  closeBtnDisabled,
  closeModalFn,
  className,
  autoCloseModalFn = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // while autoCloseModalFn is true, close modal when clicked outside
  useEffect(() => {
    const handleModalOnBlur: EventListener = (e) => {
      if (
        autoCloseModalFn &&
        modalRef.current &&
        !modalRef.current.contains(e.target as Node)
      ) {
        closeModalFn();
      }
    };

    return timeoutForEventListener(document, "click", handleModalOnBlur);
  }, [autoCloseModalFn, modalRef]);

  return (
    <Dialog.Root
      open={activeState}
      defaultOpen={activeState}
      onOpenChange={activeOnChange}
    >
      <Dialog.Portal>
        <Dialog.Overlay
          className={`
            fixed
            inset-0
            bg-neutral-900/90
          `}
        />
        <Dialog.Content
          ref={modalRef}
          className={twMerge(
            `
            fixed
            -translate-x-1/2
            -translate-y-1/2
            top-1/2
            left-1/2
            min-w-[350px]
            max-sm:w-[90vw]
            sm:min-w-[500px]
            sm:max-w-[90vw]
            h-auto
            max-h-[90vh]
            overflow-y-auto
            p-[25px]
            border
            border-neutral-700
            bg-neutral-800 
            rounded-md
            outline-none
          `,
            className?.wrapper
          )}
        >
          {/* Title */}
          <Dialog.Title
            className={twMerge(
              `
                mb-4
                text-2xl
                font-bold
                text-center
                ${title ? "block" : "hidden"}
              `,
              className?.title
            )}
          >
            {title}
          </Dialog.Title>

          {/* Description */}
          <Dialog.Description
            className={twMerge(
              `
                mb-5
                text-sm
                font-light
                text-[#22c55e]
                text-center
                ${description ? "block" : "hidden"}
              `,
              className?.description
            )}
          >
            {description}
          </Dialog.Description>

          {/* Content */}
          <div>{children}</div>

          {/* Close button */}
          <Dialog.Close asChild>
            <button
              onClick={closeModalFn}
              disabled={closeBtnDisabled}
              className={`
                absolute
                group
                top-5
                right-5
                hover-btn
              `}
            >
              <Icon
                name={IoMdClose}
                className={`
                  text-neutral-400
                  group-hover:text-white
                `}
              />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Modal;
