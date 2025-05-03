import { forwardRef, memo, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { twMerge } from "tailwind-merge";
import * as Dialog from "@radix-ui/react-dialog";
import { IoMdClose } from "react-icons/io";

import Loader from "./loader.component";
import Icon from "./react-icons.component";

import { timeoutForDelay, timeoutForEventListener } from "../lib/timeout.lib";
import mergeRefs from "../lib/merge-refs.lib";

type ModalProps = {
  title?: string;
  description?: string;
  activeState: boolean;
  children: React.ReactNode;
  activeOnChange?: () => void;
  closeModalFn?: () => void;
  autoCloseModal?: boolean;
  switchPage?: { initialPage: string; currentPage: string };
  loading?: boolean;
  className?: string;
  tw?: {
    overlay?: string;
    title?: string;
    description?: string;
  };
};

const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      title,
      description,
      activeState,
      children,
      activeOnChange,
      closeModalFn,
      autoCloseModal = true,
      switchPage,
      loading = false,
      className,
      tw,
    },
    ref
  ) => {
    const modalRef = useRef<HTMLDivElement>(null);

    const { initialPage, currentPage } = switchPage || {};

    const direction = currentPage === initialPage ? -1 : 1;

    const handleCloseModal = () => {
      timeoutForDelay(() => {
        closeModalFn?.();
      });
    };

    // auto close modal while click outside
    useEffect(() => {
      const handleModalOnBlur: EventListener = (e) => {
        if (autoCloseModal && modalRef.current && !modalRef.current.contains(e.target as Node)) {
          closeModalFn?.();
        }
      };

      return timeoutForEventListener(document, "click", handleModalOnBlur);
    }, [autoCloseModal, modalRef]);

    const modalContent = (
      <>
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
            tw?.title
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
            tw?.description
          )}
        >
          {description}
        </Dialog.Description>

        {/* Content */}
        <div>{children}</div>
      </>
    );

    return (
      <Dialog.Root open={activeState} defaultOpen={activeState} onOpenChange={activeOnChange}>
        <Dialog.Portal>
          <Dialog.Overlay
            className={twMerge(
              `
                fixed
                inset-0
                bg-neutral-900/90
              `,
              tw?.overlay
            )}
          />

          <Dialog.Content
            ref={mergeRefs(modalRef, ref)}
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
              p-[25px]
              border
              border-neutral-700
              bg-neutral-800 
              rounded-md
              outline-none
              overflow-y-auto
              overflow-x-hidden
            `,
              className
            )}
          >
            <>
              {loading && (
                <div
                  className={`
                    absolute
                    inset-0
                    flex
                    items-center
                    justify-center
                    bg-neutral-900/50
                    z-10
                  `}
                >
                  <Loader />
                </div>
              )}
            </>

            <>
              {switchPage ? (
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={switchPage.currentPage}
                    initial={{ x: direction * 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: direction * 50, opacity: 0 }}
                    transition={{ type: "tween", duration: 0.1 }}
                  >
                    {modalContent}
                  </motion.div>
                </AnimatePresence>
              ) : (
                modalContent
              )}
            </>

            {/* Close button */}
            <Dialog.Close asChild>
              <button
                onClick={handleCloseModal}
                disabled={!closeModalFn}
                className={`
                  absolute
                  group
                  top-5
                  right-5
                  hover-btn
                  ${!closeModalFn && "no-hover hidden"}
                `}
              >
                <Icon
                  name={IoMdClose}
                  className={`
                    text-neutral-400
                    ${closeModalFn && "group-hover:text-white"}
                  `}
                />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }
);

export default memo(Modal);
