import { forwardRef, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { twMerge } from "tailwind-merge";
import { nanoid } from "nanoid";
import { InvalidateQueryFilters, useMutation } from "@tanstack/react-query";
import { UseFormSetValue } from "react-hook-form";
import { AiFillEdit } from "react-icons/ai";

import Loader from "./loader.component";
import Icon from "./react-icons.component";

import { updatePlaylist } from "../fetchs/playlist.fetch";
import { uploadFileToAws } from "../fetchs/upload.fetch";
import { DefaultsPlaylistEditType } from "../constants/form-default-data.constant";
import { reqEditPlaylist } from "../constants/data-type.constant";
import { FileExtension, UploadFolder } from "../constants/aws-type.constant";
import { MutationKey, QueryKey } from "../constants/query-client-key.constant";
import queryClient from "../config/query-client.config";
import usePlaylistState from "../states/playlist.state";

type ImageLabelProps = {
  id?: string;
  imgSrc: string;
  playlistId: string;
  formValueState?: {
    setValue: UseFormSetValue<DefaultsPlaylistEditType>;
    name: reqEditPlaylist;
  };
  isDefault?: boolean;
  className?: string;
};

const ImageLabel = forwardRef<HTMLInputElement, ImageLabelProps>(
  ({ id, imgSrc, playlistId, formValueState, isDefault, className }, ref) => {
    const [imageUrl, setImageUrl] = useState(imgSrc);
    const [isUploading, setIsUploading] = useState(false);

    const { coverImageSrc, setCoverImageSrc } = usePlaylistState();

    // update image mutation
    const { mutate: updateUserPlaylist, isPending } = useMutation({
      mutationKey: [MutationKey.UPDATE_PLAYLIST],
      mutationFn: updatePlaylist,
      onSuccess: async (data) => {
        // Invalidate target query dependencies to refetch playlist query
        await queryClient.invalidateQueries([
          QueryKey.GET_TARGET_PLAYLIST,
        ] as InvalidateQueryFilters);

        await queryClient.invalidateQueries([
          QueryKey.GET_USER_PLAYLISTS,
        ] as InvalidateQueryFilters);

        // update client cover image
        setImageUrl(data.cover_image);

        toast.success("Playlist updated successfully");
      },
      onError: () => {
        toast.error("Failed to update playlist");
      },
    });

    // handle input onchange
    const handleInputOnChange = async (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      // start loading
      setIsUploading(true);

      // get image file
      const imgFile = e.target.files as FileList;

      // get signed url and upload image to aws
      const nanoID = nanoid();

      const awsImageUrl = await uploadFileToAws({
        subfolder: UploadFolder.PLAYLISTS_IMAGE,
        extension: FileExtension.PNG,
        file: imgFile?.[0] as File,
        nanoID,
      });

      // if form value state exist, means it will be used for form input
      if (formValueState) {
        const { name, setValue } = formValueState;

        if (awsImageUrl) {
          // then set the value to useForm
          setValue(name, awsImageUrl);

          // update cover image src from client
          setImageUrl(awsImageUrl);
        }
      }
      // if not, means it will be used for playlist cover image
      else {
        if (playlistId && awsImageUrl) {
          // then, update playlist cover image directly
          updateUserPlaylist({ playlistId, awsImageUrl });
        }
      }

      // clean loading
      setIsUploading(false);
    };

    // save change of image url to zustand
    useEffect(() => {
      setCoverImageSrc(imageUrl);
    }, [imageUrl]);

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
        <label htmlFor={id || "playlist-cover-image"}>
          <div
            className={`
              relative
              group
              w-full
              h-full
              ${!isPending || (!isDefault && "cursor-pointer")}
            `}
          >
            <img
              src={coverImageSrc}
              className={`
                w-full
                h-full
                rounded-md
                shadow-xl
                outline-none
                border-none
                object-cover
                overflow-hidden
              `}
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
                <Loader />
              ) : (
                <>
                  <Icon name={AiFillEdit} opts={{ size: 30 }} />
                  <p>Choose photo</p>
                </>
              )}
            </div>
          </div>
        </label>

        {/* input */}
        <input
          ref={ref}
          id={id || "playlist-cover-image"}
          type="file"
          accept=".png, .jpg, .jpeg"
          hidden
          disabled={isPending || isDefault}
          onChange={(e) => handleInputOnChange(e)}
          onClick={(e) => {
            // to avoid modal close automatically while clicking the input
            e.stopPropagation();
          }}
        />
      </div>
    );
  }
);

export default ImageLabel;
