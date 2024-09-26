import { useState } from "react";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { BsFillSendFill } from "react-icons/bs";

import Modal from "./modal.component";
import InputBox from "./input-box.component";
import Icon from "./react-icons.component";
import { OptionType } from "./multi-select-input-box.component";

import useUploadModalState from "../states/upload-modal.state";
import {
  defaultsCreateLabelData,
  DefaultsCreateLabelType,
} from "../constants/form-default-data.constant";
import { MutationKey } from "../constants/query-client-key.constant";
import LabelOptions from "../constants/label-type.constant";
import { timeoutForDelay } from "../lib/timeout.lib";
import { createLabel } from "../fetchs/label.fetch";
import { useGetLabel } from "../hooks/label.hook";

const CreateLabelModal = () => {
  const [formLabel, setFormLabel] = useState("");
  const { activeCreateLabelModal, setActiveCreateLabelModal } =
    useUploadModalState();
  const { type, active, options } = activeCreateLabelModal;

  const { refetch } = useGetLabel();

  // handle close modal
  const closeLabelModal = () => {
    timeoutForDelay(() => {
      setActiveCreateLabelModal({
        type: LabelOptions.NULL,
        active: false,
        options: null,
      });
      reset();
    });
  };

  // create label mutation
  const { mutate: createUserLabel } = useMutation({
    mutationKey: [MutationKey.CREATE_LABEL_OPTION],
    mutationFn: createLabel,
    onSuccess: () => {
      // display success message
      toast.success(`${formLabel} label is created`);
      // refetch label query
      refetch();
      // close modal
      closeLabelModal();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<DefaultsCreateLabelType>({
    defaultValues: { ...defaultsCreateLabelData },
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<DefaultsCreateLabelType> = async (value) => {
    const { label } = value;

    setFormLabel(label);
    createUserLabel({ label, type });
  };

  return (
    <Modal
      title={`Create new ${type} option`}
      activeState={active}
      closeModalFn={closeLabelModal}
      autoCloseModalFn={false}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`
          relative
          flex
          gap-3
          items-center
        `}
      >
        {/* input box */}
        <InputBox
          id="label"
          placeholder={`new ${type} option`}
          {...register("label", {
            required: true,
            validate: (value) => {
              const labels = (options as OptionType).labels;
              const allLabels = [
                ...labels.defaults,
                ...(labels.created ? labels.created : []),
              ];
              return !allLabels.some((label) => label.label === value);
            },
          })}
          className={`capitalize pr-[3rem]`}
        />

        {/* submit button */}
        <button
          disabled={!isValid}
          className={`
            absolute
            -translate-y-1/2
            top-1/2
            right-4
            text-[14px]
            disabled:text-neutral-500
          `}
        >
          <Icon
            name={BsFillSendFill}
            className={`${
              isValid &&
              `
                text-green-500
              `
            }`}
          />
        </button>
      </form>
    </Modal>
  );
};

export default CreateLabelModal;
