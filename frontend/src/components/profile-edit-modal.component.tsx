import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

import Modal from "./modal.component";
import Loader from "./loader.component";
import InputBox from "./input-box.component";
import ImageLabel from "./image-label.component";

import { deleteFileFromAws } from "../fetchs/aws.fetch";
import { useUpdateUserMutation } from "../hooks/user-mutate.hook";
import { UploadFolder } from "@joytify/shared-types/constants";
import { RefactorProfileUserResponse } from "@joytify/shared-types/types";
import { DefaultEditProfileForm, FormMethods } from "../types/form.type";
import useUserState from "../states/user.state";
import { timeoutForDelay } from "../lib/timeout.lib";
import { getModifiedFormData } from "../utils/get-form-data.util";

const ProfileEditModal = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [closeModalPending, setCloseModalPending] = useState<boolean>(false);

  const { activeProfileEditModal, closeProfileEditModal } = useUserState();
  const { active, profileUser } = activeProfileEditModal;

  const { profile_img, username } = (profileUser as RefactorProfileUserResponse) ?? {};
  const generateUsername = username.split("?nanoid=")[0];

  // handle close modal
  const handleCloseModal = () => {
    timeoutForDelay(async () => {
      // start pending
      setCloseModalPending(true);

      // while profileImage is changed but not submitted,
      // delete that file store in AWS
      if (!isSubmitted && watch("profileImage") && watch("profileImage") !== profile_img) {
        try {
          await deleteFileFromAws(watch("profileImage"));
        } catch (error) {
          console.log("Failed to deleting file from AWS", error);
        }
      }

      // close modal
      closeProfileEditModal();

      // end pending
      setCloseModalPending(false);

      // reset form
      reset();
    });
  };

  const { mutate: updateUserFn, isPending } = useUpdateUserMutation(0, handleCloseModal);

  // form state
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    trigger,
    watch,
    reset,
    formState: { dirtyFields },
  } = useForm<DefaultEditProfileForm>({
    defaultValues: { username: generateUsername },
    mode: "onChange",
  });

  // check form if is modified
  const isModified = Object.keys(dirtyFields).length > 0;

  // form methods
  const formMethods: FormMethods<DefaultEditProfileForm> = {
    setFormValue: setValue,
    setFormError: setError,
    trigger,
  };

  // submit form
  const onSubmit: SubmitHandler<DefaultEditProfileForm> = (value) => {
    const { profileImage, ...rest } = getModifiedFormData(value, dirtyFields);

    updateUserFn({ profile_img: profileImage, ...rest });

    setIsSubmitted(true);
  };

  return (
    <Modal
      title="Edit profile"
      activeState={active}
      closeModalFn={handleCloseModal}
      loading={closeModalPending}
      className={`w-[500px]`}
      tw={{ title: "text-left" }}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className={`
          flex
          flex-col
          gap-5
          w-full
          h-fit
          items-center
          jusitfy-center
        `}
      >
        {/* profile image */}
        <ImageLabel
          src={profileImage ?? profile_img}
          subfolder={UploadFolder.USERS_IMAGE}
          formMethods={formMethods}
          setImgSrc={setProfileImage}
          tw={{ label: "w-[15rem] h-[15rem]", mask: "rounded-full" }}
          {...register("profileImage")}
        />

        {/* username */}
        <InputBox
          type="text"
          title="Username"
          placeholder="Username"
          defaultValue={generateUsername}
          formMethods={formMethods}
          disabled={isPending}
          autoFocus
          {...register("username")}
        />

        {/* submit button */}
        <button
          type="submit"
          disabled={!isModified || isPending}
          className={`
            mt-2
            submit-btn
            py-2
            capitalize
            text-sm
            rounded-full
            outline-none
          `}
        >
          {isPending ? <Loader loader={{ size: 20 }} /> : "Save Changes"}
        </button>
      </form>
    </Modal>
  );
};

export default ProfileEditModal;
