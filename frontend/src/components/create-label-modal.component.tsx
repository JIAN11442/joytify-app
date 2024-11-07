import { useState } from "react";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";

import { OptionType } from "./multi-select-input-box.component";
import OptionCreateModal from "./option-create-modal.component";

import {
  defaultsCreateLabelData,
  DefaultsCreateLabelType,
} from "../constants/form-default-data.constant";
import { MutationKey } from "../constants/query-client-key.constant";
import LabelOptions from "../constants/label-type.constant";
import { timeoutForDelay } from "../lib/timeout.lib";
import { createLabel } from "../fetchs/label.fetch";
import { useGetLabel } from "../hooks/label.hook";
import useUploadModalState from "../states/upload-modal.state";

const CreateLabelModal = () => {
  const [formVal, setFormVal] = useState("");
  const { activeCreateLabelModal, setActiveCreateLabelModal } =
    useUploadModalState();
  const { type, active, options } = activeCreateLabelModal;

  const { refetch } = useGetLabel();

  // handle close modal
  const handleCloseModal = () => {
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
      toast.success(`"${formVal}" ${type} is created`);
      // refetch label query
      refetch();
      // close modal
      handleCloseModal();
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

    setFormVal(label);
    createUserLabel({ label, type });
  };

  return (
    <OptionCreateModal
      type="label"
      active={active}
      closeModalFn={handleCloseModal}
      autoCloseModalFn={false}
      formOnSubmit={handleSubmit(onSubmit)}
      registerValidState={isValid}
      {...register("label", {
        required: true,
        validate: (value) => {
          const labels = (options as OptionType).labels;
          const allLabels = [
            ...(labels.defaults ? labels.defaults : []),
            ...(labels.created ? labels.created : []),
          ];
          return !allLabels.some((label) => label.label === value);
        },
      })}
    />
  );
};

export default CreateLabelModal;
