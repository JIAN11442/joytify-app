import { useIntl } from "react-intl";
import { useState, useEffect } from "react";
import { MdEmail } from "react-icons/md";
import {
  useForm,
  UseFormReturn,
  FieldErrors,
  UseFormSetFocus,
  UseFormRegister,
  UseFormReset,
} from "react-hook-form";
import { FaUserCircle } from "react-icons/fa";
import { GoInfo } from "react-icons/go";

import Loader from "../components/loader.component";
import InputBox from "../components/input-box.component";
import ImageLabel from "../components/image-label.component";
import Icon, { IconName } from "../components/react-icons.component";
import { useUpdateUserMutation } from "../hooks/user-mutate.hook";
import { UploadFolder } from "@joytify/shared-types/constants";
import { RefactorProfileUserResponse } from "@joytify/shared-types/types";
import useSidebarState from "../states/sidebar.state";
import { emailRegex } from "../utils/regex.util";
import toast from "../lib/toast.lib";

type FieldName = "username" | "email";

type FormData<T extends FieldName> = {
  [K in T]: string;
};

type AccountItem<T extends FieldName> = {
  title: string;
  name: T;
  defaultValue: string;
  icon: IconName;
  activeState: {
    active: boolean;
    setActive: (value: boolean) => void;
  };
  form: UseFormReturn<FormData<T>>;
  disabled: boolean;
};

type AccountProfileCardProps = {
  profileUser: RefactorProfileUserResponse;
};

const AccountProfileCard: React.FC<AccountProfileCardProps> = ({ profileUser }) => {
  const { auth_for_third_party: isThirdPartyUser } = profileUser;

  const intl = useIntl();
  const [editEmail, setEditEmail] = useState(false);
  const [editUsername, setEditUsername] = useState(false);
  const { collapseSideBarState } = useSidebarState();
  const { isCollapsed } = collapseSideBarState;

  const { mutate: updateUserInfoFn, isPending } = useUpdateUserMutation();

  // initialize form methods
  const useForms = {
    username: useForm<FormData<"username">>({
      defaultValues: { username: "" },
      mode: "onChange",
    }),
    email: useForm<FormData<"email">>({
      defaultValues: { email: "" },
      mode: "onChange",
    }),
  };

  // update form value when profile user change
  useEffect(() => {
    if (profileUser) {
      const { username, email } = profileUser as RefactorProfileUserResponse;
      const generateUsername = username?.split("?nanoid=")[0];

      useForms.username.reset({ username: generateUsername });
      useForms.email.reset({ email });
    }
  }, [profileUser]);

  // submit form
  const onSubmit = (fieldName: FieldName) => (data: Record<string, string>) => {
    updateUserInfoFn({ [fieldName]: data[fieldName] });
  };

  // if no profile user, show loading
  if (!profileUser) {
    return <Loader className={{ container: "h-full" }} />;
  }

  const { username, email, profile_img, paletee } = profileUser as RefactorProfileUserResponse;
  const generateUsername = username?.split("?nanoid=")[0];
  const inputUsername = useForms.username.watch("username");

  const accountItems: (AccountItem<"username"> | AccountItem<"email">)[] = [
    {
      title: "Username",
      name: "username",
      defaultValue: generateUsername,
      icon: FaUserCircle,
      activeState: {
        active: editUsername,
        setActive: setEditUsername,
      },
      form: useForms.username,
      disabled: false,
    },
    {
      title: "Email",
      name: "email",
      defaultValue: email,
      icon: MdEmail,
      activeState: {
        active: editEmail,
        setActive: setEditEmail,
      },
      form: useForms.email,
      disabled: !!isThirdPartyUser,
    },
  ];

  return (
    <div
      className={`
      ${
        !isCollapsed
          ? `
              max-lg:flex
              max-lg:flex-col-reverse
              lg:grid
              lg:grid-cols-2
              lg:items-center
            `
          : `
              max-md:flex 
              max-md:flex-col-reverse
              md:grid
              md:grid-cols-2
              md:items-center
            `
      }
      w-full
      gap-10
      justify-between
    `}
    >
      {/* profile input */}
      <div className={`flex flex-col gap-y-4`}>
        {accountItems.map((item) => {
          const { name, defaultValue, icon, activeState, form, disabled } = item;
          const { active, setActive } = activeState;

          const {
            register,
            handleSubmit,
            setFocus,
            reset,
            formState: { dirtyFields, errors },
          } = form;

          const fieldErrors = errors as FieldErrors<FormData<typeof name>>;
          const fieldDirty = dirtyFields as Partial<Record<typeof name, boolean>>;
          const isFieldValid = !fieldErrors[name];
          const isFieldDirty = fieldDirty[name];
          const isFormValid = isFieldDirty && isFieldValid;

          const itemRegister = register as UseFormRegister<FormData<typeof name>>;
          const itemSetFocus = setFocus as UseFormSetFocus<FormData<typeof name>>;
          const itemReset = reset as UseFormReset<FormData<typeof name>>;

          const isIconHighlight = isFieldDirty ? (isFieldValid ? "success" : "error") : undefined;

          return (
            <form
              key={`settings-account-${name}`}
              className={`
                flex 
                gap-3 
                items-end 
                justify-center
              `}
              onSubmit={handleSubmit(onSubmit(name))}
            >
              <InputBox
                icon={{ name: icon }}
                defaultValue={defaultValue}
                readOnly={!active}
                iconHighlight={isIconHighlight}
                className={`${!active && "opacity-60"}`}
                tw={{ title: "text-md" }}
                {...itemRegister(name, {
                  validate: (value: string) => {
                    if (name === "username") {
                      return (
                        (value.length > 0 && value !== generateUsername) ||
                        "Username must be different from current username"
                      );
                    } else if (name === "email") {
                      return (
                        (value !== email && emailRegex.test(value)) ||
                        "Email must be valid and different from current email"
                      );
                    }
                    return true;
                  },
                  onBlur: () => {
                    if (active && !isFormValid) {
                      setActive(false);
                      itemReset({ [name]: defaultValue }, { keepDirty: false });
                    }
                  },
                })}
              />

              {disabled ? (
                <button
                  onClick={() => {
                    toast.warning(
                      intl.formatMessage({ id: "toast.settings.account.thirdParty.warning" })
                    );
                  }}
                  className={`profile-card-content-box`}
                >
                  <Icon
                    name={GoInfo}
                    className={`
                      text-xl
                      text-orange-300/50
                      hover:text-orange-300
                      transition-all
                    `}
                  />
                </button>
              ) : isFormValid ? (
                !isPending ? (
                  <button
                    type="submit"
                    className={`
                      profile-card-content-box
                      bg-green-600
                      hover:bg-green-500
                      disabled:no-hover
                    `}
                  >
                    {intl.formatMessage({ id: "settings.account.profile.card.button.save" })}
                  </button>
                ) : (
                  <Loader
                    loader={{ size: 20 }}
                    className={{ container: "profile-card-content-box" }}
                  />
                )
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setActive(true);
                    itemSetFocus(name);
                  }}
                  disabled={active}
                  className={`
                    profile-card-content-box 
                    bg-neutral-700/50
                    hover:bg-neutral-600/50
                  `}
                >
                  {intl.formatMessage({ id: "settings.account.profile.card.button.edit" })}
                </button>
              )}
            </form>
          );
        })}
      </div>

      {/* preview */}
      <div
        style={{
          backgroundImage: `linear-gradient(
          to bottom,
          ${paletee?.lightMuted} 0%,
          ${paletee?.muted} 15%,
          ${paletee?.darkMuted} 40%,
          #171717 70%`,
        }}
        className={`rounded-md`}
      >
        {/* profile image */}
        <div
          className={`
            flex
            w-fit
            m-5
            gap-5
            items-end
          `}
        >
          {/* profile image */}
          <div className={`relative`}>
            <ImageLabel
              src={profile_img}
              subfolder={UploadFolder.USERS_IMAGE}
              updateConfig={{
                updateImgFn: (profile_img) => updateUserInfoFn({ profile_img }),
                isPending,
              }}
              visibleHoverText={false}
              tw={{
                label: "w-20 h-20",
                mask: "rounded-full",
                img: "shadow-[0px_0px_0px_6px] shadow-neutral-900",
              }}
            />

            {/* active state */}
            <div
              className={`
                absolute
                bottom-1
                right-1
                p-[6px]
                rounded-full
                bg-green-500
                shadow-[0px_0px_0px_6px]
                shadow-neutral-900
              `}
            />
          </div>

          {/* username */}
          <p className={`info-title text-3xl`}>
            {inputUsername && inputUsername.length > 0 ? inputUsername : generateUsername}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AccountProfileCard;
