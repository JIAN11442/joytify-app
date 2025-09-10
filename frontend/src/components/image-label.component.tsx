/* eslint-disable @typescript-eslint/no-explicit-any */
import { nanoid } from "nanoid";
import { forwardRef, useState } from "react";
import { FieldValues } from "react-hook-form";
import { twMerge } from "tailwind-merge";
import { MdEdit } from "react-icons/md";

import Loader from "./loader.component";
import Icon from "./react-icons.component";

import { uploadFileToAws } from "../fetchs/aws.fetch";
import { FileExtension } from "@joytify/types/constants";
import { UploadFolderType } from "@joytify/types/types";
import { FormMethods } from "../types/form.type";
import { useScopedIntl } from "../hooks/intl.hook";

interface ImageLabelProps<T extends FieldValues = any>
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  subfolder: UploadFolderType;
  name?: Extract<keyof T, string>;
  formMethods?: FormMethods<T>;
  isDefault?: boolean;
  updateConfig?: {
    updateImgFn: (awsImageUrl: string) => void;
    isPending: boolean;
  };
  visibleHoverText?: boolean;
  setImgSrc?: (src: string) => void;
  tw?: {
    mask?: string;
    label?: string;
    img?: string;
    upload?: string;
    loader?: { container?: string; text?: string };
    icon?: string;
    input?: string;
  };
}

const ImageLabel = forwardRef<HTMLImageElement, ImageLabelProps>(
  (
    {
      subfolder,
      name,
      src,
      formMethods,
      updateConfig,
      isDefault,
      visibleHoverText = true,
      setImgSrc,
      className,
      tw = {
        mask: "rounded-md",
      },
      ...props
    },
    ref
  ) => {
    const { intl } = useScopedIntl();
    const { updateImgFn, isPending } = updateConfig ?? {};

    const [isUploading, setIsUploading] = useState(false);

    // upload file to AWS and get signed URL
    const getImageUrlFromAWS = async (file: FileList) => {
      if (file.length) {
        setIsUploading(true);

        const nanoID = nanoid();

        // get signed url and upload image to AWS
        const awsImageUrl = await uploadFileToAws({
          subfolder: subfolder,
          extension: FileExtension.PNG,
          file: file?.[0] as File,
          nanoID,
        });

        setIsUploading(false);

        return awsImageUrl;
      }
    };

    // handle input onChange
    const handleInputOnChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const imgFile = e.target.files as FileList;
      const awsImageUrl = await getImageUrlFromAWS(imgFile);

      if (awsImageUrl) {
        if (formMethods && name) {
          const { setFormValue, trigger } = formMethods;

          // return value to useForm
          setFormValue(name, awsImageUrl, { shouldDirty: true });
          // validate specified field manually
          trigger(name);
        } else {
          // update img directly(eg. playlist, user, etc.)
          if (updateImgFn) {
            updateImgFn(awsImageUrl);
          }
        }

        if (setImgSrc) {
          setImgSrc(awsImageUrl);
        }
      }
    };

    // handle input onClick
    const handleInputOnClick = async (e: React.MouseEvent<HTMLInputElement>) => {
      e.stopPropagation();
    };

    return (
      <div className={twMerge(className, tw?.mask)}>
        {/* label */}
        <label>
          <div
            className={twMerge(
              `
                relative
                group
                w-[165px]
                h-[165px]
                max-sm:w-[140px]
                max-sm:h-[140px]
              `,
              tw?.label
            )}
          >
            <img
              ref={ref}
              src={src}
              className={twMerge(
                `
                w-full
                h-full
                shadow-[0px_0px_25px_2px]
                shadow-black/30
                outline-none
                border-none
                object-cover
                overflow-hidden
              `,
                tw?.img,
                tw?.mask
              )}
              {...props}
            />

            {/* input */}
            <input
              type="file"
              accept=".png, .jpg, .jpeg"
              disabled={isPending || isUploading || isDefault}
              onChange={handleInputOnChange}
              onClick={handleInputOnClick}
              hidden
              className={tw?.input}
            />

            {/* Upload content */}
            <div
              className={twMerge(
                `
                absolute
                top-0
                left-0
                w-full
                h-full
                ${isDefault ? "hidden" : "flex"}
                items-center
                justify-center
                bg-black/60
                ${
                  isPending || isUploading
                    ? ""
                    : `
                        flex-col
                        gap-2
                        text-sm
                        text-white
                        opacity-0
                        group-hover:opacity-100
                      `
                }
                transition  
              `,
                tw?.upload,
                tw?.mask
              )}
            >
              {isPending || isUploading ? (
                <Loader
                  loader={{ name: "BeatLoader", size: 10, color: "white" }}
                  className={tw?.loader}
                />
              ) : (
                <>
                  <Icon name={MdEdit} opts={{ size: 30 }} className={tw?.icon} />
                  {visibleHoverText && (
                    <p>{intl.formatMessage({ id: "image.label.hover.text" })}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </label>
      </div>
    );
  }
);

export default ImageLabel;
