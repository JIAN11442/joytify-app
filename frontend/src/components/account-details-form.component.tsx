import { useCallback, useEffect, useMemo } from "react";
import { RegisterOptions, SubmitHandler, useForm } from "react-hook-form";
import { allCountries } from "country-region-data";

import { useGetLabelsQuery } from "../hooks/label-query.hook";
import { useUpdateUserMutation } from "../hooks/user-mutate.hook";
import { InputOptionType, NO_MATCH } from "./single-select-input-box.component";
import SingleSelectInputBox from "./single-select-input-box.component";
import CalendarInputBox from "./calendar-input-box.component";
import Loader from "./loader.component";

import { LabelOptions } from "@joytify/shared-types/constants";
import { QueryKey } from "../constants/query-client-key.constant";
import { defaultAccountDetailsData } from "../constants/form.constant";
import { RefactorProfileUserResponse } from "@joytify/shared-types/types";
import { DefaultAccountDetailsForm, FormMethods } from "../types/form.type";
import { getModifiedFormData } from "../utils/get-form-data.util";
import { validateDate } from "../utils/validate-date.util";

type AccountDetailsFormProps = {
  profileUser: RefactorProfileUserResponse;
};

const AccountDetailsForm: React.FC<AccountDetailsFormProps> = ({ profileUser }) => {
  const { gender, country, date_of_birth } = profileUser.personal_info ?? {};

  const { GENDER } = LabelOptions;
  const { labels } = useGetLabelsQuery(QueryKey.GET_GENRE_LABELS, [GENDER], true);
  const genderLabels = labels?.default.gender;

  const { mutate: updateUserFn, isPending } = useUpdateUserMutation(2000);

  const genderOptions = useMemo(
    () =>
      genderLabels?.map((option) => ({
        id: option.id,
        title: option.label,
      })) || [],
    [genderLabels]
  );

  const countryOptions = useMemo(() => allCountries.map((country) => country[0]), []);

  const defaultDateOfBirth = useMemo(
    () => (date_of_birth ? new Date(date_of_birth).toISOString().slice(0, 10) : undefined),
    [date_of_birth]
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
      if (!options || !Array.isArray(options)) return errorMessage;

      const isValid =
        !!newValue &&
        newValue !== NO_MATCH &&
        options.some((opt) => (typeof opt === "string" ? opt === newValue : opt.id === newValue));

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

    console.log("submit");
  };

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
        title="Gender"
        placeholder="Click to choose your gender"
        defaultValue={gender?.label}
        formMethods={formMethods}
        options={genderOptions}
        disabled={isPending}
        {...normalizeRegister("gender", {
          validate: (val) => validateSelectInput(gender?.label, val, genderOptions),
        })}
      />

      {/* Date of birth */}
      <CalendarInputBox
        title="Date of birth"
        defaultValue={defaultDateOfBirth}
        disabled={isPending}
        {...normalizeRegister("dateOfBirth", {
          validate: (val) => {
            if (!val) return true;
            return validateDate(val);
          },
        })}
      />

      {/* Country */}
      <SingleSelectInputBox
        key={`country-${country?.label}`}
        title="Country"
        placeholder="Click to choose your country"
        defaultValue={country?.label}
        options={countryOptions}
        disabled={isPending}
        {...normalizeRegister("country", {
          validate: (val) => validateSelectInput(country?.label, val, countryOptions),
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
        {isPending ? <Loader loader={{ size: 20 }} /> : "Submit"}
      </button>
    </form>
  );
};

export default AccountDetailsForm;
