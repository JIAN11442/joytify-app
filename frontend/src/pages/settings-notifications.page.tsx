import { useEffect } from "react";
import { IoNotificationsOutline } from "react-icons/io5";
import { Controller, SubmitHandler, useForm } from "react-hook-form";

import Icon from "../components/react-icons.component";
import AnimationWrapper from "../components/animation-wrapper.component";
import ToggleSwitchButton from "../components/toggle-switch-button.component";
import SettingSectionTitle from "../components/settings-section-title.component";
import { SquareDualLineSkeleton } from "../components/skeleton-loading.component";

import { useScopedIntl } from "../hooks/intl.hook";
import { useUpdateUserMutation } from "../hooks/user-mutate.hook";
import { getSettingsNotificationsFields } from "../contents/settings-notifications.content";
import { defaultNotificationPreferencesData } from "../constants/form.constant";
import { RefactorProfileUserResponse } from "@joytify/shared-types/types";
import { DefaultNotificationPreferencesForm } from "../types/form.type";
import useUserState from "../states/user.state";
import { getModifiedFormData } from "../utils/get-form-data.util";

const SettingsNotificationsPage = () => {
  const { fm } = useScopedIntl();
  const { profileUser, setProfileUser } = useUserState();
  const { mutate: updateUserFn } = useUpdateUserMutation({
    refetchRelatedQueries: false,
    onSuccessFn: (data) => {
      // update profile user's userPreferences object
      const updatedProfileUser = {
        ...profileUser,
        userPreferences: data.userPreferences,
      } as RefactorProfileUserResponse;

      setProfileUser(updatedProfileUser);
    },
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { dirtyFields },
  } = useForm<DefaultNotificationPreferencesForm>({
    defaultValues: defaultNotificationPreferencesData,
  });

  const onSubmit: SubmitHandler<DefaultNotificationPreferencesForm> = (value) => {
    const modifiedValues = getModifiedFormData(value, dirtyFields);

    updateUserFn(modifiedValues);
  };

  const settingsNotificationsFm = fm("settings.notifications");
  const notificationsFields = getSettingsNotificationsFields(fm);

  // intialize and reset default form values while profile user change
  useEffect(() => {
    if (profileUser) {
      reset(profileUser.userPreferences.notifications);
    }
  }, [profileUser, reset]);

  return (
    <div className={`settings-page-container`}>
      {/* title */}
      <AnimationWrapper initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <SettingSectionTitle
          icon={{ name: IoNotificationsOutline }}
          title={settingsNotificationsFm("title")}
          description={settingsNotificationsFm("description")}
        />
      </AnimationWrapper>

      {/* options */}
      <AnimationWrapper initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {profileUser ? (
          <form
            className={`
              flex
              flex-col
              gap-5
            `}
          >
            {notificationsFields.map((field) => {
              const { id, name, icon, title, description } = field;

              return (
                <div
                  key={id}
                  className={`
                    flex 
                    w-full
                    p-5
                    gap-10
                    bg-neutral-800/50
                    items-center 
                    justify-between
                    rounded-md
                `}
                >
                  {/* left contents */}
                  <div
                    className={`
                      flex
                      w-fit
                      max-w-[80%]
                      gap-5
                      items-center
                      justify-center
                    `}
                  >
                    <Icon
                      name={icon.name}
                      opts={{ size: icon.size }}
                      className={`${icon.color} shrink-0`}
                    />
                    <div className={`flex flex-col gap-1`}>
                      <h1 className={`text-base font-bold line-clamp-1`}>{title}</h1>
                      <p className={`text-sm text-neutral-500`}>{description}</p>
                    </div>
                  </div>

                  {/* right contents */}
                  <Controller
                    key={id}
                    name={name}
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <ToggleSwitchButton
                        checked={!!value}
                        track={{ size: { height: 28 } }}
                        onChange={(e) => {
                          onChange(e.target.checked);
                          handleSubmit(onSubmit)();
                        }}
                      />
                    )}
                  />
                </div>
              );
            })}
          </form>
        ) : (
          <SquareDualLineSkeleton
            count={3}
            className={`gap-5`}
            tw={{ container: "p-6 bg-neutral-800/50 rounded-md", square: "w-10 h-10" }}
          />
        )}
      </AnimationWrapper>
    </div>
  );
};

export default SettingsNotificationsPage;
