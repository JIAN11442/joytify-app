import { useCallback, useEffect, useMemo } from "react";
import { RegisterOptions, SubmitHandler, useForm } from "react-hook-form";
import { allCountries } from "country-region-data";

import Loader from "./loader.component";
import CalendarInputBox from "./calendar-input-box.component";
import SingleSelectInputBox from "./single-select-input-box.component";
import { InputOptionType, NO_MATCH } from "./single-select-input-box.component";
import { useGetLabelsQuery } from "../hooks/label-query.hook";
import { useUpdateUserMutation } from "../hooks/user-mutate.hook";
import { useScopedIntl } from "../hooks/intl.hook";

import { QueryKey } from "../constants/query-client-key.constant";
import { defaultAccountDetailsData } from "../constants/form.constant";
import { LabelOptions, GenderOptions } from "@joytify/shared-types/constants";
import { GenderOptionsKeys, RefactorProfileUserResponse } from "@joytify/shared-types/types";
import { DefaultAccountDetailsForm, FormMethods } from "../types/form.type";
import { getModifiedFormData } from "../utils/get-form-data.util";
import { validateDate } from "../utils/validate-date.util";

type AccountDetailsFormProps = {
  profileUser: RefactorProfileUserResponse;
};

const AccountDetailsForm: React.FC<AccountDetailsFormProps> = ({ profileUser }) => {
  const { fm, intl } = useScopedIntl();
  const genderFm = fm("gender");
  const countryFm = fm("country");
  const dateFormatFm = fm("date.format");
  const settingsAccountFm = fm("settings.account");

  const { gender, country, dateOfBirth } = profileUser.personalInfo ?? {};

  const { GENDER } = LabelOptions;
  const { labels } = useGetLabelsQuery(QueryKey.GET_GENRE_LABELS, [GENDER], true);
  const genderLabels = labels?.default.gender;

  const { mutate: updateUserFn, isPending } = useUpdateUserMutation({ delay: 2000 });

  const genderOptions = useMemo(() => {
    return (
      genderLabels?.map((option) => {
        const gender = GenderOptions[option.label as GenderOptionsKeys];

        return {
          id: option.id,
          title: genderFm(gender),
        };
      }) || []
    );
  }, [genderFm, genderLabels]);

  const enCountryOptions = useMemo(() => {
    return allCountries.map((country) => ({
      id: country[1],
      title: country[0],
    }));
  }, [allCountries]);

  const intlCountryOptions = useMemo(() => {
    return allCountries.map((country) => ({
      id: country[1],
      title: countryFm(country[1]),
    }));
  }, [countryFm, allCountries]);

  const defaultGender = useMemo(() => {
    return gender?.label ? genderFm(gender?.label.toLowerCase()) : gender?.label;
  }, [genderFm, gender]);

  const defaultCountry = useMemo(() => {
    const targetCountryObj =
      country?.label && enCountryOptions.find((opt) => opt.title === country?.label);
    return targetCountryObj ? countryFm(targetCountryObj.id) : country?.label;
  }, [countryFm, country, enCountryOptions]);

  const defaultDateOfBirth = useMemo(
    () => (dateOfBirth ? new Date(dateOfBirth).toISOString().slice(0, 10) : undefined),
    [dateOfBirth]
  );

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    trigger,
    reset,
    formState: { isValid, isDirty, dirtyFields },
  } = useForm<DefaultAccountDetailsForm>({
    defaultValues: defaultAccountDetailsData,
    mode: "onChange",
  });

  const disabled = useMemo(() => {
    // first check if the form is dirty (has been modified)
    if (!isDirty) return true;

    // if the form is dirty, check if it's valid
    return !isValid;
  }, [isDirty, isValid]);

  const formMethods: FormMethods<DefaultAccountDetailsForm> = useMemo(
    () => ({
      setFormValue: setValue,
      setFormError: setError,
      trigger,
    }),
    [setValue, setError, trigger]
  );

  const normalizeRegister = useCallback(
    (
      name: keyof DefaultAccountDetailsForm,
      options?: RegisterOptions<DefaultAccountDetailsForm>
    ) => {
      return register(name, {
        ...options,
        setValueAs: (val) => (val.length === 0 ? undefined : val),
      });
    },
    [register]
  );

  const validateSelectInput = useCallback(
    (
      defaultVal: string | undefined,
      newValue: string | undefined,
      options: InputOptionType[] | string[],
      errorMessage = "Please select a valid option."
    ) => {
      if (!Array.isArray(options)) return "Options is not valid structure";

      if (options.length === 0) return true;

      const isValid =
        !!newValue &&
        newValue !== NO_MATCH &&
        options.some((opt) =>
          typeof opt === "string" ? opt === newValue : opt.id === newValue || opt.title === newValue
        );

      if (defaultVal) {
        return !!isValid || errorMessage;
      }

      return !newValue || !!isValid || errorMessage;
    },
    []
  );

  const onSubmit: SubmitHandler<DefaultAccountDetailsForm> = (value) => {
    const modifiedValues = getModifiedFormData(value, dirtyFields);

    updateUserFn(modifiedValues);
  };

  // reset the form when the profile user changes
  useEffect(() => {
    reset({
      gender: gender?._id,
      country: country?.label,
      dateOfBirth: defaultDateOfBirth,
    });
  }, [gender, country, defaultDateOfBirth, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`flex flex-col gap-4`}>
      {/* Gender */}
      <SingleSelectInputBox
        key={`gender-${gender?.label}`}
        title={settingsAccountFm("gender.title")}
        placeholder={settingsAccountFm("gender.placeholder")}
        defaultValue={defaultGender}
        formMethods={formMethods}
        options={genderOptions}
        disabled={isPending}
        {...normalizeRegister("gender", {
          validate: (val) => validateSelectInput(gender?.label, val, genderOptions),
        })}
      />

      {/* Date of birth */}
      <CalendarInputBox
        title={settingsAccountFm("dateOfBirth.title")}
        datePlaceholder={{
          day: dateFormatFm("day"),
          month: dateFormatFm("month"),
          year: dateFormatFm("year"),
        }}
        defaultValue={defaultDateOfBirth}
        intl={intl}
        disabled={isPending}
        {...normalizeRegister("dateOfBirth", {
          validate: (val) => {
            if (!val) {
              return !defaultDateOfBirth;
            }
            return validateDate(val);
          },
        })}
      />

      {/* Country */}
      <SingleSelectInputBox
        key={`country-${country?.label}`}
        title={settingsAccountFm("country.title")}
        placeholder={settingsAccountFm("country.placeholder")}
        defaultValue={defaultCountry}
        options={intlCountryOptions}
        formMethods={formMethods}
        transformValueFn={(val) => enCountryOptions.find((opt) => opt.id === val)?.title ?? val}
        disabled={isPending}
        {...normalizeRegister("country", {
          validate: (val) => validateSelectInput(country?.label, val, enCountryOptions),
        })}
      />

      {/* button */}
      <button
        type="submit"
        disabled={disabled || isPending}
        className={`
          submit-btn
          rounded-full
          mt-5
          p-2
          text-sm
          ${disabled && "hidden"}
        `}
      >
        {isPending ? <Loader loader={{ size: 20 }} /> : settingsAccountFm("form.button.submit")}
      </button>
    </form>
  );
};

export default AccountDetailsForm;
