import { SubmitHandler, useForm } from "react-hook-form";

import { OptionType } from "./multi-select-input-box.component";
import CreateOptionModal from "./create-option-modal.component";
import { useCreateLabelMutation } from "../hooks/label-mutate.hook";
import { defaultCreateLabelData } from "../constants/form.constant";
import { DefaultCreateLabelForm } from "../types/form.type";
import useUploadModalState from "../states/upload-modal.state";
import { timeoutForDelay } from "../lib/timeout.lib";
import { useScopedIntl } from "../hooks/intl.hook";

const CreateLabelModal = () => {
  const { fm } = useScopedIntl();
  const createOptionTypeFm = fm("song.create.option.type");

  const { activeCreateLabelModal, closeCreateLabelModal } = useUploadModalState();
  const { active, options } = activeCreateLabelModal;
  const { type } = options as OptionType;

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
    <CreateOptionModal
      type={createOptionTypeFm("label")}
      active={active}
      closeModalFn={handleCloseModal}
      autoCloseModal={false}
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
