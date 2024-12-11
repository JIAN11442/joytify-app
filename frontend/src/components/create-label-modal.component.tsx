import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";

import { OptionType } from "./multi-select-input-box.component";
import OptionCreateModal from "./option-create-modal.component";

import {
  CreateLabelForm,
  defaultCreateLabelData,
} from "../constants/form.constant";
import LabelOptions from "../constants/label.constant";
import { MutationKey } from "../constants/query-client-key.constant";
import useUploadModalState from "../states/upload-modal.state";
import { timeoutForDelay } from "../lib/timeout.lib";
import { createLabel } from "../fetchs/label.fetch";

const CreateLabelModal = () => {
  const { activeCreateLabelModal, setActiveCreateLabelModal } =
    useUploadModalState();
  const { type, active, options, labelRefetch } = activeCreateLabelModal;

  // handle close modal
  const handleCloseModal = () => {
    timeoutForDelay(() => {
      setActiveCreateLabelModal({
        type: LabelOptions.NULL,
        active: false,
        options: null,
        labelRefetch: null,
      });
      reset();
    });
  };

  // create label mutation
  const { mutate: createUserLabel } = useMutation({
    mutationKey: [MutationKey.CREATE_LABEL_OPTION],
    mutationFn: createLabel,
    onSuccess: (data) => {
      const { label, type } = data;

      // refetch label query
      if (labelRefetch) {
        labelRefetch();
      }

      // close modal
      handleCloseModal();

      // display success message
      toast.success(`"${label}" ${type} is created`);
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
  } = useForm<CreateLabelForm>({
    defaultValues: { ...defaultCreateLabelData },
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<CreateLabelForm> = async (value) => {
    const { label } = value;

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
