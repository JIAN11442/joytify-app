import { useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";

import Icon from "./react-icons.component";
import { IoMdClose } from "react-icons/io";

type ModalProps = {
  title: string;
  description: string;
  activeState: boolean;
  children: React.ReactNode;
  activeOnChange?: () => void;
  closeBtnDisabled?: boolean;
  closeModalFn: () => void;
};

const Modal: React.FC<ModalProps> = ({
  title,
  description,
  activeState,
  children,
  activeOnChange,
  closeBtnDisabled,
  closeModalFn,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicked outside
  useEffect(() => {
    const handleModalOnBlur = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        closeModalFn();
      }
    };

    const timeout = setTimeout(() => {
      document.addEventListener("click", handleModalOnBlur);
    }, 0);

    return () => {
      clearTimeout(timeout);
      document.removeEventListener("click", handleModalOnBlur);
    };
  }, []);

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
          className={`
            fixed
            -translate-x-1/2
            -translate-y-1/2
            top-1/2
            left-1/2
            min-w-[450px]
            max-w-[90vw]
            h-auto
            p-[25px]
            border
            border-neutral-700
            bg-neutral-800 
            rounded-md
            outline-none
          `}
        >
          {/* Title */}
          <Dialog.Title
            className={`
              text-2xl
              font-bold
              text-center
              mb-4
            `}
          >
            {title}
          </Dialog.Title>

          {/* Description */}
          <Dialog.Description
            className={`
              text-sm
              font-light
              text-[#22c55e]
              text-center
              mb-5
            `}
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
                outline-none
                p-2
                rounded-full
                hover:bg-neutral-700/50
                transition
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
