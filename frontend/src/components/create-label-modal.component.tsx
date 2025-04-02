import { SubmitHandler, useForm } from "react-hook-form";

import { OptionType } from "./multi-select-input-box.component";
import OptionCreateModal from "./option-create-modal.component";

import { useCreateLabelMutation } from "../hooks/label-mutate.hook";
import { defaultCreateLabelData } from "../constants/form.constant";
import { DefaultCreateLabelForm } from "../types/form.type";
import useUploadModalState from "../states/upload-modal.state";
import { timeoutForDelay } from "../lib/timeout.lib";

const CreateLabelModal = () => {
  const { activeCreateLabelModal, closeCreateLabelModal } = useUploadModalState();
  const { type, active, options } = activeCreateLabelModal;

  // handle close modal
  const handleCloseModal = () => {
    timeoutForDelay(() => {
      closeCreateLabelModal();
      reset();
    });
  };

  // create label mutation
  const { mutate: createLabelFn } = useCreateLabelMutation(handleCloseModal);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<DefaultCreateLabelForm>({
    defaultValues: { ...defaultCreateLabelData },
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<DefaultCreateLabelForm> = async (value) => {
    const { label } = value;

    createLabelFn({ label, type });
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
