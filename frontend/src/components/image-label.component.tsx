/* eslint-disable @typescript-eslint/no-explicit-any */
import { forwardRef, useState } from "react";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";
import { nanoid } from "nanoid";
import { useMutation } from "@tanstack/react-query";
import { FieldValues } from "react-hook-form";
import { AiFillEdit } from "react-icons/ai";

import Loader from "./loader.component";
import Icon from "./react-icons.component";

import { updatePlaylist } from "../fetchs/playlist.fetch";
import { uploadFileToAws } from "../fetchs/aws.fetch";
import { FormMethods } from "../constants/form.constant";
import { FileExtension, UploadFolder } from "../constants/aws.constant";
import { MutationKey } from "../constants/query-client-key.constant";
import { usePlaylistById, usePlaylists } from "../hooks/playlist.hook";

interface ImageLabelProps<T extends FieldValues = any>
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  name?: Extract<keyof T, string>;
  playlistId: string;
  formMethods?: FormMethods<T>;
  isDefault?: boolean;
  tw?: {
    label?: string;
    img?: string;
    loader?: { container?: string; text?: string };
    icon?: string;
    input?: string;
  };
}

const ImageLabel = forwardRef<HTMLImageElement, ImageLabelProps>(
  (
    { name, src, playlistId, formMethods, isDefault, className, tw, ...props },
    ref
  ) => {
    const [isUploading, setIsUploading] = useState(false);

    const { refetch: playlistsRefetch } = usePlaylists();
    const { refetch: targetPlaylistRefetch } = usePlaylistById(playlistId);

    // update image mutation
    const { mutate: updateUserPlaylist, isPending } = useMutation({
      mutationKey: [MutationKey.UPDATE_PLAYLIST],
      mutationFn: updatePlaylist,
      onSuccess: async () => {
        // refetch user playlists query
        playlistsRefetch();
        // refetch target playlist query
        targetPlaylistRefetch();

        toast.success("Playlist updated successfully");
      },
      onError: () => {
        toast.error("Failed to update playlist");
      },
    });

    // upload file to AWS and get signed URL
    const getImageUrlFromAWS = async (file: FileList) => {
      if (file.length) {
        setIsUploading(true);

        const nanoID = nanoid();

        // get signed url and upload image to AWS
        const awsImageUrl = await uploadFileToAws({
          subfolder: UploadFolder.PLAYLISTS_IMAGE,
          extension: FileExtension.PNG,
          file: file?.[0] as File,
          nanoID,
        });

        setIsUploading(false);

        return awsImageUrl;
      }
    };

    // handle input onChange
    const handleInputOnChange = async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const imgFile = e.target.files as FileList;
      const awsImageUrl = await getImageUrlFromAWS(imgFile);

      if (awsImageUrl) {
        if (formMethods && name) {
          const { setFormValue, trigger } = formMethods;

          // return value to useForm
          setFormValue(name, awsImageUrl);

          // validate specified field manually
          trigger(name);
        } else {
          // update target playlist directly
          updateUserPlaylist({ playlistId, awsImageUrl });
        }
      }
    };

    // handle input onClick
    const handleInputOnClick = async (
      e: React.MouseEvent<HTMLInputElement>
    ) => {
      e.stopPropagation();
    };

    return (
      <div
        className={twMerge(
          `
            w-[9rem]
            h-[9rem]
            min-w-[9rem]
            min-h-[9rem]
            lg:w-[10rem]
            lg:h-[10rem]
          `,
          className
        )}
      >
        {/* label */}
        <label className={tw?.label}>
          <div
            className={`
              relative
              group
              w-full
              h-full
            `}
          >
            <img
              ref={ref}
              src={src}
              className={twMerge(
                `
                w-full
                h-full
                rounded-md
                shadow-xl
                outline-none
                border-none
                object-cover
                overflow-hidden
              `,
                tw?.img
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
              className={`
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
                rounded-md
                transition  
              `}
            >
              {isPending || isUploading ? (
                <Loader className={tw?.loader} />
              ) : (
                <>
                  <Icon
                    name={AiFillEdit}
                    opts={{ size: 30 }}
                    className={tw?.icon}
                  />
                  <p>Choose photo</p>
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
